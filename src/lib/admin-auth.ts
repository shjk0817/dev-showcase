// 管理端敏感操作密码校验
import { verifyPassword } from "@/lib/auth-password";

/** 校验管理员二次确认密码 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  return verifyPassword(password);
}
