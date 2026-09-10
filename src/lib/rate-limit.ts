// 内存限流，防止接口被刷
const hits = new Map<string, { count: number; resetAt: number }>();

/** 从请求头解析客户端 IP */
export function getClientIp(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return "unknown";
}

/** 检查是否超过限流阈值 */
export function checkRateLimit(key: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = hits.get(key);
  if (!record || now > record.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count += 1;
  return true;
}

/** 登录失败限流（每 IP 每分钟 10 次） */
export function checkLoginRateLimit(ip: string): boolean {
  return checkRateLimit(`login:${ip}`, 10, 60000);
}
