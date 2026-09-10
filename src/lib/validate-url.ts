// 媒体与资源 URL 校验
const UPLOAD_PREFIX = "/uploads/";
const HTTPS_EMBED_HOSTS = [
  "www.bilibili.com",
  "bilibili.com",
  "player.bilibili.com",
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
];

/** 是否为本站上传路径 */
export function isUploadPath(url: string): boolean {
  return url.startsWith(UPLOAD_PREFIX) && !url.includes("..");
}

/** 是否为允许的 HTTPS 嵌入链接 */
export function isHttpsEmbedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    return HTTPS_EMBED_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/** 校验封面/截图 URL */
export function validateImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return isUploadPath(url);
}

/** 校验下载文件 URL */
export function validateDownloadUrl(url: string): boolean {
  return isUploadPath(url) || isHttpsEmbedUrl(url) || url.startsWith("https://github.com/");
}

/** 校验视频 URL */
export function validateVideoUrl(url: string, type: string): boolean {
  if (type === "upload") return isUploadPath(url);
  return isHttpsEmbedUrl(url) || isUploadPath(url);
}
