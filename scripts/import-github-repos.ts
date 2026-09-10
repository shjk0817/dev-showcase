// 批量从 GitHub 导入 shjk0817 仓库为展示项目
import { PrismaClient } from "@prisma/client";
import { copyFile, mkdir } from "fs/promises";
import path from "path";
import slugify from "slugify";
import { fetchGithubImport } from "../src/lib/github";
import { buildProjectContent, simplifyReadme } from "../src/lib/readme-simplify";

const prisma = new PrismaClient();
const OWNER = "shjk0817";

/** 仓库展示用中文标题 */
const DISPLAY_TITLES: Record<string, string> = {
  "dev-showcase": "JKTAC 成果展示站",
  "eln-mcp": "ELN MCP Server",
  "lims-auto": "机场四期 LIMS 系统",
  ori_sheet: "环刀法压实度检测",
  review: "文档解析与审批",
  "scetia-report": "Scetia 文档扫描",
  workboard: "WorkBoard 工作台",
  elnbian: "建科助手插件",
};

/** 待导入仓库与封面映射 */
const REPOS: { repo: string; coverFile?: string }[] = [
  { repo: "dev-showcase", coverFile: "cover-dev-showcase.png" },
  { repo: "eln-mcp", coverFile: "cover-eln-mcp.png" },
  { repo: "lims-auto", coverFile: "cover-lims-auto.png" },
  { repo: "ori_sheet", coverFile: "cover-ori-sheet.png" },
  { repo: "review", coverFile: "cover-review.png" },
  { repo: "scetia-report", coverFile: "cover-scetia-report.png" },
  { repo: "workboard", coverFile: "cover-workboard.png" },
  { repo: "elnbian", coverFile: "cover-elnbian.png" },
];

const ARTIFACT_DIR =
  process.env.COVER_ARTIFACT_DIR ??
  "/tmp/cursor-0/cursor_agent_stores/bc-291225d1-ae20-4e72-8dd0-b7efd0fc0131/files/artifacts/assets";
const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/images");

/** 复制 AI 封面到 uploads 目录 */
async function installCover(slug: string, coverFile?: string): Promise<string | null> {
  if (!coverFile) return null;
  const src = path.join(ARTIFACT_DIR, coverFile);
  const destName = `cover-${slug}.png`;
  const dest = path.join(UPLOAD_DIR, destName);
  await mkdir(UPLOAD_DIR, { recursive: true });
  await copyFile(src, dest);
  return `/uploads/images/${destName}`;
}

/** 导入单个仓库 */
async function importRepo(repo: string, coverFile?: string) {
  const url = `https://github.com/${OWNER}/${repo}`;
  console.log(`导入 ${url}...`);
  const data = await fetchGithubImport(url);
  const slug = slugify(repo, { lower: true, strict: true }) || repo;
  const displayTitle = DISPLAY_TITLES[repo] ?? data.title;
  const coverUrl = await installCover(slug, coverFile);
  const content = buildProjectContent(displayTitle, data.description, data.content);
  const shortReadme = simplifyReadme(data.content, 1200);

  const existing = await prisma.project.findFirst({
    where: { OR: [{ slug }, { githubUrl: url }] },
    include: { tutorials: true, downloads: true },
  });
  const projectData = {
    title: displayTitle,
    slug,
    description: data.description.slice(0, 2000),
    content,
    category: data.category,
    coverUrl,
    githubUrl: url,
    status: "published" as const,
    publishedAt: new Date(),
  };

  let projectId: string;
  if (existing) {
    await prisma.project.update({ where: { id: existing.id }, data: projectData });
    projectId = existing.id;
    console.log(`  更新: ${slug}`);
  } else {
    const created = await prisma.project.create({ data: projectData });
    projectId = created.id;
    console.log(`  新建: ${slug}`);
  }

  if (shortReadme) {
    const hasTutorial = await prisma.tutorial.findFirst({ where: { projectId, title: "README" } });
    if (hasTutorial) {
      await prisma.tutorial.update({
        where: { id: hasTutorial.id },
        data: { content: shortReadme },
      });
    } else {
      await prisma.tutorial.create({
        data: { projectId, title: "README", content: shortReadme, sortOrder: 0 },
      });
    }
  }

  for (const [i, d] of data.downloads.entries()) {
    const exists = await prisma.download.findFirst({
      where: { projectId, fileUrl: d.fileUrl },
    });
    if (!exists) {
      await prisma.download.create({
        data: {
          projectId,
          name: d.name,
          fileUrl: d.fileUrl,
          version: d.version,
          fileSize: d.fileSize,
          sortOrder: i,
        },
      });
    }
  }
}

/** 主流程 */
async function main() {
  for (const { repo, coverFile } of REPOS) {
    try {
      await importRepo(repo, coverFile);
    } catch (e) {
      console.error(`  失败 ${repo}:`, e instanceof Error ? e.message : e);
    }
  }
  console.log("导入完成");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
