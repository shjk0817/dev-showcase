// 生成圆形 favicon.ico 与 PNG
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import toIco from "to-ico";

const SIZE = 256;
const INPUT = process.argv[2] || "/root/.cursor/projects/root/assets/jktac-favicon-round.png";
const ROOT = path.resolve(process.cwd());

/** 将图片裁剪为圆形 */
async function makeCirclePng(inputPath) {
  const circle = Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="#fff"/></svg>`
  );
  return sharp(inputPath)
    .resize(SIZE, SIZE, { fit: "cover" })
    .composite([{ input: circle, blend: "dest-in" }])
    .png()
    .toBuffer();
}

/** 写入 favicon 文件 */
async function main() {
  const png = await makeCirclePng(INPUT);
  const targets = [
    path.join(ROOT, "public/favicon.png"),
    path.join(ROOT, "public/favicon.ico"),
    path.join(ROOT, "src/app/icon.png"),
    path.join(ROOT, "src/app/favicon.ico"),
  ];
  const ico = await toIco([png], { sizes: [16, 32, 48, 64, 128, 256] });
  await fs.writeFile(targets[0], png);
  await fs.writeFile(targets[1], ico);
  await fs.writeFile(targets[2], png);
  await fs.writeFile(targets[3], ico);
  console.log("favicon 已生成");
}

main().catch(console.error);
