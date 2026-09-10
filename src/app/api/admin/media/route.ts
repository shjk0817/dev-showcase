// 管理端项目媒体资源接口（截图/下载/教程/视频）
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const mediaSchema = z.object({
  projectId: z.string(),
  kind: z.enum(["screenshot", "download", "tutorial", "video"]),
  data: z.record(z.string(), z.unknown()),
});

/** 添加媒体资源 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const parsed = mediaSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }
  const { projectId, kind, data } = parsed.data;
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
  return NextResponse.json(result);
}

/** 删除媒体资源 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { kind, id } = await request.json();
  if (kind === "screenshot") await prisma.screenshot.delete({ where: { id } });
  else if (kind === "download") await prisma.download.delete({ where: { id } });
  else if (kind === "tutorial") await prisma.tutorial.delete({ where: { id } });
  else if (kind === "video") await prisma.video.delete({ where: { id } });
  else return NextResponse.json({ error: "类型无效" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
