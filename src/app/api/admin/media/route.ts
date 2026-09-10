// 管理端项目媒体资源接口（截图/下载/教程/视频）
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidateProjectPages } from "@/lib/revalidate-project";
import { parseJsonBody } from "@/lib/api-utils";
import { validateDownloadUrl, validateImageUrl, validateVideoUrl } from "@/lib/validate-url";
import { deleteUploadByUrl } from "@/lib/file-cleanup";

const mediaSchema = z.object({
  projectId: z.string(),
  kind: z.enum(["screenshot", "download", "tutorial", "video"]),
  data: z.record(z.string(), z.unknown()),
});

/** 校验媒体数据字段 */
function validateMediaData(kind: string, data: Record<string, unknown>): string | null {
  if (kind === "screenshot" && !validateImageUrl(String(data.url ?? ""))) {
    return "截图 URL 无效";
  }
  if (kind === "download" && !validateDownloadUrl(String(data.fileUrl ?? ""))) {
    return "下载链接无效";
  }
  if (kind === "tutorial") {
    const content = String(data.content ?? "");
    if (content.length > 50000) return "教程内容过长";
    if (String(data.title ?? "").length > 200) return "教程标题过长";
  }
  if (kind === "video") {
    const type = String(data.type ?? "embed");
    if (!validateVideoUrl(String(data.url ?? ""), type)) return "视频链接无效";
  }
  return null;
}

/** 添加媒体资源 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const body = await parseJsonBody(request);
  if (body instanceof NextResponse) return body;
  const parsed = mediaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "参数无效" }, { status: 400 });
  const { projectId, kind, data } = parsed.data;
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { slug: true } });
  if (!project) return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  const errMsg = validateMediaData(kind, data);
  if (errMsg) return NextResponse.json({ error: errMsg }, { status: 400 });

  let result;
  switch (kind) {
    case "screenshot":
      result = await prisma.screenshot.create({
        data: {
          projectId,
          url: String(data.url),
          caption: data.caption ? String(data.caption) : null,
          sortOrder: Number(data.sortOrder ?? 0),
        },
      });
      break;
    case "download":
      result = await prisma.download.create({
        data: {
          projectId,
          name: String(data.name),
          fileUrl: String(data.fileUrl),
          version: data.version ? String(data.version) : null,
          fileSize: data.fileSize ? Number(data.fileSize) : null,
          sortOrder: Number(data.sortOrder ?? 0),
        },
      });
      break;
    case "tutorial":
      result = await prisma.tutorial.create({
        data: {
          projectId,
          title: String(data.title),
          content: String(data.content),
          sortOrder: Number(data.sortOrder ?? 0),
        },
      });
      break;
    case "video":
      result = await prisma.video.create({
        data: {
          projectId,
          title: String(data.title),
          url: String(data.url),
          type: String(data.type ?? "embed"),
          sortOrder: Number(data.sortOrder ?? 0),
        },
      });
      break;
  }
  revalidateProjectPages(project.slug);
  return NextResponse.json(result);
}

/** 删除媒体资源 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const body = await parseJsonBody<{ kind?: string; id?: string }>(request);
  if (body instanceof NextResponse) return body;
  const { kind, id } = body;
  if (!kind || !id) return NextResponse.json({ error: "参数无效" }, { status: 400 });

  const slugSelect = { project: { select: { slug: true } } };
  let fileUrl: string | null = null;
  const media =
    kind === "screenshot"
      ? await prisma.screenshot.findUnique({ where: { id }, select: { ...slugSelect, url: true } })
      : kind === "download"
        ? await prisma.download.findUnique({ where: { id }, select: { ...slugSelect, fileUrl: true } })
        : kind === "tutorial"
          ? await prisma.tutorial.findUnique({ where: { id }, select: slugSelect })
          : kind === "video"
            ? await prisma.video.findUnique({ where: { id }, select: { ...slugSelect, url: true, type: true } })
            : null;
  if (!media) return NextResponse.json({ error: "类型无效或资源不存在" }, { status: 400 });

  if (kind === "screenshot" && "url" in media) fileUrl = String(media.url);
  if (kind === "download" && "fileUrl" in media) fileUrl = String(media.fileUrl);
  if (kind === "video" && "url" in media && "type" in media && media.type === "upload") {
    fileUrl = String(media.url);
  }

  if (kind === "screenshot") await prisma.screenshot.delete({ where: { id } });
  else if (kind === "download") await prisma.download.delete({ where: { id } });
  else if (kind === "tutorial") await prisma.tutorial.delete({ where: { id } });
  else await prisma.video.delete({ where: { id } });

  if (fileUrl) await deleteUploadByUrl(fileUrl);
  if (media.project) revalidateProjectPages(media.project.slug);
  return NextResponse.json({ ok: true });
}
