// 管理端项目 CRUD 接口
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import slugify from "slugify";
import { z } from "zod";
import { verifyAdminPassword } from "@/lib/admin-auth";
import { revalidateProjectPages } from "@/lib/revalidate-project";
import { parseJsonBody, prismaErrorResponse } from "@/lib/api-utils";
import { validateImageUrl } from "@/lib/validate-url";
import { deleteUploads } from "@/lib/file-cleanup";
import { collectProjectUploadUrls } from "@/lib/project-files";
import { writeAuditLog, getClientIpFromHeaders } from "@/lib/audit-log";

const projectSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5).max(2000),
  content: z.string().max(50000).optional(),
  category: z.string().min(1).max(50),
  coverUrl: z.string().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  status: z.enum(["draft", "published"]).optional(),
  slug: z.string().max(100).optional(),
});

const deleteSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(1),
});

/** 获取全部项目（含草稿） */
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const projects = await prisma.project.findMany({
    include: { _count: { select: { screenshots: true, downloads: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(projects);
}

/** 创建新项目 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });
  const data = parsed.data;
  if (!validateImageUrl(data.coverUrl)) {
    return NextResponse.json({ error: "封面 URL 无效" }, { status: 400 });
  }
  const slug =
    data.slug ||
    slugify(data.title, { lower: true, strict: true, locale: "zh" }) ||
    `project-${Date.now()}`;
  try {
    const project = await prisma.project.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        content: data.content ?? "",
        category: data.category,
        coverUrl: data.coverUrl,
        githubUrl: data.githubUrl ?? null,
        status: data.status ?? "draft",
        publishedAt: data.status === "published" ? new Date() : null,
      },
    });
    revalidateProjectPages(project.slug);
    await writeAuditLog({
      action: "project.create",
      target: project.title,
      detail: `slug=${project.slug}`,
      operator: session.user?.name ?? "admin",
      ip: getClientIpFromHeaders(request.headers),
    });
    return NextResponse.json(project);
  } catch (err) {
    const resp = prismaErrorResponse(err);
    if (resp) return resp;
    throw err;
  }
}

/** 更新项目 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const body = await parseJsonBody<Record<string, unknown>>(request);
  if (body instanceof NextResponse) return body;
  const { id, ...rest } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "缺少项目 ID" }, { status: 400 });
  }
  const parsed = projectSchema.partial().safeParse(rest);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });
  const data = parsed.data;
  if (data.coverUrl !== undefined && !validateImageUrl(data.coverUrl)) {
    return NextResponse.json({ error: "封面 URL 无效" }, { status: 400 });
  }
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "项目不存在" }, { status: 404 });

  let publishedAt: Date | null | undefined;
  if (data.status === "published" && existing.status !== "published") {
    publishedAt = new Date();
  } else if (data.status === "draft") {
    publishedAt = null;
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data: { ...data, ...(publishedAt !== undefined && { publishedAt }) },
    });
    if (existing.coverUrl && existing.coverUrl !== project.coverUrl) {
      await deleteUploads([existing.coverUrl]);
    }
    revalidateProjectPages(project.slug);
    if (existing.slug !== project.slug) revalidateProjectPages(existing.slug);
    await writeAuditLog({
      action: "project.update",
      target: project.title,
      detail: `id=${project.id}`,
      operator: session.user?.name ?? "admin",
      ip: getClientIpFromHeaders(request.headers),
    });
    return NextResponse.json(project);
  } catch (err) {
    const resp = prismaErrorResponse(err);
    if (resp) return resp;
    throw err;
  }
}

/** 删除项目（需管理员密码二次确认） */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });
  if (!(await verifyAdminPassword(parsed.data.password))) {
    return NextResponse.json({ error: "密码错误" }, { status: 403 });
  }
  const existing = await prisma.project.findUnique({ where: { id: parsed.data.id } });
  if (!existing) return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  const urls = await collectProjectUploadUrls(parsed.data.id);
  await prisma.project.delete({ where: { id: parsed.data.id } });
  await deleteUploads(urls);
  revalidateProjectPages(existing.slug);
  await writeAuditLog({
    action: "project.delete",
    target: existing.title,
    detail: `slug=${existing.slug}`,
    operator: session.user?.name ?? "admin",
    ip: getClientIpFromHeaders(request.headers),
  });
  return NextResponse.json({ ok: true });
}
