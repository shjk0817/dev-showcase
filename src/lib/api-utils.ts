// API 通用工具：JSON 解析与 Prisma 错误处理
import { NextRequest, NextResponse } from "next/server";

/** 安全解析 JSON 请求体 */
export async function parseJsonBody<T>(request: NextRequest): Promise<T | NextResponse> {
  try {
    return (await request.json()) as T;
  } catch {
    return NextResponse.json({ error: "请求体无效" }, { status: 400 });
  }
}

/** 将 Prisma 常见错误转为 HTTP 响应 */
export function prismaErrorResponse(err: unknown): NextResponse | null {
  if (!err || typeof err !== "object" || !("code" in err)) return null;
  const code = (err as { code: string }).code;
  if (code === "P2002") return NextResponse.json({ error: "记录已存在（如 slug 重复）" }, { status: 409 });
  if (code === "P2025") return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  return null;
}
