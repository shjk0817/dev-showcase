// 管理端项目 CRUD 接口
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import slugify from "slugify";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(5).max(2000),
  content: z.string().max(50000).optional(),
  category: z.string().min(1).max(50),
  coverUrl: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]).optional(),
  slug: z.string().optional(),
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
  const parsed = projectSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }
  const data = parsed.data;
  const slug =
    data.slug ||
    slugify(data.title, { lower: true, strict: true, locale: "zh" }) ||
    `project-${Date.now()}`;
  const project = await prisma.project.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      content: data.content ?? "",
      category: data.category,
      coverUrl: data.coverUrl,
      status: data.status ?? "draft",
      publishedAt: data.status === "published" ? new Date() : null,
    },
  });
  return NextResponse.json(project);
}

/** 更新项目 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const body = await request.json();
  const { id, ...rest } = body;
  if (!id) return NextResponse.json({ error: "缺少项目 ID" }, { status: 400 });
  const parsed = projectSchema.partial().safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }
  const data = parsed.data;
  const project = await prisma.project.update({
    where: { id },
    data: {
      ...data,
      publishedAt:
        data.status === "published" ? new Date() : data.status === "draft" ? null : undefined,
    },
  });
  return NextResponse.json(project);
}

/** 删除项目 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await request.json();
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
