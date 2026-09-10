// 项目分类：默认选项与数据库已有分类
import { prisma } from "@/lib/db";

export const DEFAULT_CATEGORIES = [
  "工具",
  "开源项目",
  "TypeScript",
  "JavaScript",
  "Python",
  "其他",
];

/** 合并默认分类与数据库中已使用的分类 */
export async function getProjectCategories(): Promise<string[]> {
  const rows = await prisma.project.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  const merged = [...DEFAULT_CATEGORIES, ...rows.map((r) => r.category)];
  return [...new Set(merged.filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}
