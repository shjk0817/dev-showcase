// 数据库种子脚本，写入示例项目与反馈
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** 写入示例数据 */
async function main() {
  await prisma.feedback.deleteMany();
  await prisma.screenshot.deleteMany();
  await prisma.download.deleteMany();
  await prisma.tutorial.deleteMany();
  await prisma.video.deleteMany();
  await prisma.project.deleteMany();

  const project = await prisma.project.create({
    data: {
      title: "智能报表工具",
      slug: "smart-report",
      description: "一键生成业务报表，支持 Excel 导出与定时推送。",
      content: "## 功能亮点\n\n- 可视化拖拽配置\n- 多数据源接入\n- 定时邮件推送\n\n## 适用场景\n\n适合各部门日常数据统计与汇报。",
      category: "效率工具",
      status: "published",
      publishedAt: new Date(),
      coverUrl: "/uploads/images/jktac-demo-cover.png",
      screenshots: {
        create: [
          { url: "/uploads/images/sample-screenshot.png", caption: "主界面", sortOrder: 0 },
        ],
      },
      downloads: {
        create: [
          { name: "Windows 安装包", fileUrl: "/uploads/files/sample.zip", version: "1.0.0", fileSize: 1024, sortOrder: 0 },
        ],
      },
      tutorials: {
        create: [
          {
            title: "快速上手",
            content: "### 第一步\n\n下载并安装客户端。\n\n### 第二步\n\n登录后选择数据源，点击「生成报表」。",
            sortOrder: 0,
          },
        ],
      },
      videos: {
        create: [
          { title: "功能演示", url: "https://www.bilibili.com/video/BV1GJ411x7h7", type: "embed", sortOrder: 0 },
        ],
      },
    },
  });

  await prisma.feedback.create({
    data: {
      title: "希望增加 PDF 导出",
      content: "目前只支持 Excel，能否增加 PDF 导出功能？",
      type: "suggestion",
      contact: "同事A",
      status: "open",
    },
  });

  console.log("Seed 完成，示例项目:", project.slug);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
