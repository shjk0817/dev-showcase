// 附件类型判断工具（客户端/服务端通用）
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** 判断附件是否为图片 */
export function isImageAttachment(mimeType: string, name: string): boolean {
  if (IMAGE_TYPES.includes(mimeType)) return true;
  return /\.(jpe?g|png|webp|gif)$/i.test(name);
}

/** 格式化文件大小 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
