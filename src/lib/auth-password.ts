// 管理员密码校验（支持 bcrypt 哈希与明文过渡）
import bcrypt from "bcryptjs";

/** 校验管理员密码 */
export async function verifyPassword(input: string): Promise<boolean> {
  const stored = process.env.ADMIN_PASSWORD ?? "";
  if (!stored) return false;
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
    return bcrypt.compare(input, stored);
  }
  return input === stored;
}
