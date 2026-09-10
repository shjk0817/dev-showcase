// 删除磁盘上的上传文件
import { unlink } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.resolve(process.cwd(), "public/uploads");

/** 根据公开 URL 删除磁盘文件（忽略不存在） */
export async function deleteUploadByUrl(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/uploads/")) return;
  const rel = url.replace(/^\/uploads\//, "");
  if (rel.includes("..")) return;
  const filePath = path.join(UPLOAD_ROOT, rel);
  if (!filePath.startsWith(UPLOAD_ROOT + path.sep)) return;
  try {
    await unlink(filePath);
  } catch {
    /* 文件可能已不存在 */
  }
}

/** 批量删除上传文件 */
export async function deleteUploads(urls: (string | null | undefined)[]): Promise<void> {
  await Promise.all(urls.map(deleteUploadByUrl));
}
