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
            title: "使用教程",
            content: `# 智能报表工具 · 使用教程

> 本文档采用 Markdown 编写，渲染效果类似 GitHub README。

## 快速开始

1. 下载并安装客户端
2. 使用工号登录
3. 选择数据源，点击 **生成报表**

## 功能说明

| 功能 | 说明 | 快捷键 |
|------|------|--------|
| 新建报表 | 从模板创建 | \`Ctrl+N\` |
| 导出 Excel | 导出为 .xlsx | \`Ctrl+E\` |
| 定时推送 | 设置邮件定时发送 | - |

## 代码示例

\`\`\`javascript
// 通过 API 触发报表生成
const res = await fetch('/api/report/generate', {
  method: 'POST',
  body: JSON.stringify({ templateId: 'monthly' }),
});
\`\`\`

## 常见问题

- **登录失败**：检查 VPN 是否连接
- **导出超时**：数据量过大时请缩小日期范围

> 如有其他问题，请在项目详情页的 **反馈** Tab 提交 Issue。`,
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
      projectId: project.id,
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
