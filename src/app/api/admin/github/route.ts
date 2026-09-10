// GitHub 仓库信息导入接口
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchGithubImport } from "@/lib/github";
import { z } from "zod";

const schema = z.object({ url: z.string().url().or(z.string().min(5)) });

/** 从 GitHub 获取项目信息预览 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "请提供有效的 GitHub 链接" }, { status: 400 });
  }
  try {
    const data = await fetchGithubImport(parsed.data.url);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "导入失败" },
      { status: 400 }
    );
  }
}
