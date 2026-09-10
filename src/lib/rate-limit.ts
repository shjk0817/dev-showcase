// 简单内存限流，防止反馈接口被刷
const hits = new Map<string, { count: number; resetAt: number }>();

/** 检查 IP 是否超过限流阈值 */
export function checkRateLimit(ip: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = hits.get(ip);
  if (!record || now > record.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count += 1;
  return true;
}
