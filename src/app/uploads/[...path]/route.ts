// 运行时提供 public/uploads 下动态上传的文件
import { readFile, stat } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const UPLOAD_ROOT = path.resolve(process.cwd(), "public/uploads");

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".zip": "application/zip",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

/** 读取并返回上传文件 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;
  if (!segments?.length || segments.some((s) => s.includes("..") || s.includes("\0"))) {
    return new NextResponse(null, { status: 400 });
  }
  const filePath = path.resolve(UPLOAD_ROOT, ...segments);
  if (!filePath.startsWith(UPLOAD_ROOT + path.sep)) {
    return new NextResponse(null, { status: 403 });
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new NextResponse(null, { status: 404 });
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
