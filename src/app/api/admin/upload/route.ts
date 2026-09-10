// 管理端文件上传接口
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUpload, isImageFile } from "@/lib/upload";

const LIMITS = { image: 5 * 1024 * 1024, file: 100 * 1024 * 1024, video: 200 * 1024 * 1024 };

/** 上传图片、安装包或视频 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file") as File | null;
  const type = String(form.get("type") ?? "image");
  if (!file) return NextResponse.json({ error: "未选择文件" }, { status: 400 });
  const subdir = type === "video" ? "videos" : type === "file" ? "files" : "images";
  const maxSize = type === "video" ? LIMITS.video : type === "file" ? LIMITS.file : LIMITS.image;
  if (type === "image" && !isImageFile(file)) {
    return NextResponse.json({ error: "请上传图片文件" }, { status: 400 });
  }
  try {
    const result = await saveUpload(file, subdir, maxSize);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "上传失败" },
      { status: 400 }
    );
  }
}
