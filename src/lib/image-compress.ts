// 图片自动压缩（基于 sharp）
import path from "path";
import sharp from "sharp";

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 85;
const WEBP_QUALITY = 85;

type CompressResult = { buffer: Buffer; ext: string; mimeType: string };

/** 压缩图片并返回优化后的缓冲与扩展名 */
export async function compressImage(
  input: Buffer,
  mimeType: string,
  filename: string
): Promise<CompressResult> {
  const fileExt = path.extname(filename).toLowerCase();
  if (fileExt === ".gif" || fileExt === ".svg") {
    return { buffer: input, ext: fileExt, mimeType };
  }

  let pipeline = sharp(input).rotate();
  const meta = await pipeline.metadata();
  if ((meta.width ?? 0) > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, undefined, { withoutEnlargement: true });
  }

  const hasAlpha = meta.hasAlpha;
  if (mimeType === "image/webp" || fileExt === ".webp") {
    const buffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
    return { buffer, ext: ".webp", mimeType: "image/webp" };
  }
  if (mimeType === "image/png" && hasAlpha) {
    const buffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    return { buffer, ext: ".png", mimeType: "image/png" };
  }
  const buffer = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  return { buffer, ext: ".jpg", mimeType: "image/jpeg" };
}

/** 判断文件是否应进行图片压缩 */
export function shouldCompressImage(mimeType: string, filename: string): boolean {
  if (!mimeType.startsWith("image/") && !/\.(jpe?g|png|webp)$/i.test(filename)) {
    return false;
  }
  return !filename.toLowerCase().endsWith(".gif") && !filename.toLowerCase().endsWith(".svg");
}
