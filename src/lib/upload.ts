// 文件上传工具，校验类型与大小并保存到 public/uploads
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { compressImage, shouldCompressImage } from "@/lib/image-compress";

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const ADMIN_FILE_TYPES = [
  ...IMAGE_TYPES,
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
  "video/mp4",
  "video/webm",
];

const ADMIN_FILE_EXT = new Set([
  ...IMAGE_EXT,
  ".zip",
  ".exe",
  ".msi",
  ".dmg",
  ".deb",
  ".rpm",
  ".mp4",
  ".webm",
]);

const FEEDBACK_MIME_TYPES = [
  ...IMAGE_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
];

const FEEDBACK_EXT = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".gif",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".txt", ".md", ".csv", ".zip",
]);

/** 保存上传文件并返回公开路径 */
export async function saveUpload(
  file: File,
  subdir: string,
  maxSize: number,
  allowedTypes = ADMIN_FILE_TYPES,
  allowedExt = ADMIN_FILE_EXT
): Promise<{ url: string; size: number; mimeType: string }> {
  if (!isAllowedFile(file, allowedTypes, allowedExt)) {
    throw new Error(`不支持的文件类型：${file.name}`);
  }
  if (file.size > maxSize) {
    throw new Error(`文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  let buffer = Buffer.from(await file.arrayBuffer());
  let ext = path.extname(file.name).toLowerCase() || ".bin";
  let mimeType = file.type || "application/octet-stream";

  const compressible = subdir === "images" || subdir === "feedback";
  if (compressible && shouldCompressImage(mimeType, file.name)) {
    const compressed = await compressImage(buffer, mimeType, file.name);
    buffer = Buffer.from(compressed.buffer);
    ext = compressed.ext;
    mimeType = compressed.mimeType;
  }

  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_DIR, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return {
    url: `/uploads/${subdir}/${filename}`,
    size: buffer.length,
    mimeType,
  };
}

/** 保存反馈附件 */
export async function saveFeedbackFile(file: File) {
  return saveUpload(file, "feedback", 20 * 1024 * 1024, FEEDBACK_MIME_TYPES, FEEDBACK_EXT);
}

/** 判断是否为图片类型（含扩展名回退） */
export function isImageFile(file: File): boolean {
  if (IMAGE_TYPES.includes(file.type)) return true;
  const ext = path.extname(file.name).toLowerCase();
  return IMAGE_EXT.has(ext);
}

/** 判断是否为图片 MIME */
export function isImageType(type: string): boolean {
  return IMAGE_TYPES.includes(type);
}

/** 校验文件类型是否允许上传 */
function isAllowedFile(file: File, allowedTypes: string[], allowedExt: Set<string>): boolean {
  if (file.type && allowedTypes.includes(file.type)) return true;
  const ext = path.extname(file.name).toLowerCase();
  return allowedExt.has(ext);
}
