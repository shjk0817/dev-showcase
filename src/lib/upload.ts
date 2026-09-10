// 文件上传工具，校验类型与大小并保存到 public/uploads
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const FILE_TYPES = [
  ...IMAGE_TYPES,
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
  "video/mp4",
  "video/webm",
];

/** 上传文件并返回公开访问路径 */
export async function saveUpload(
  file: File,
  subdir: string,
  maxSize: number
): Promise<{ url: string; size: number }> {
  if (!FILE_TYPES.includes(file.type)) {
    throw new Error("不支持的文件类型");
  }
  if (file.size > maxSize) {
    throw new Error(`文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  const ext = path.extname(file.name) || ".bin";
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_DIR, subdir);
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return { url: `/uploads/${subdir}/${filename}`, size: file.size };
}

/** 判断是否为图片类型 */
export function isImageType(type: string): boolean {
  return IMAGE_TYPES.includes(type);
}
