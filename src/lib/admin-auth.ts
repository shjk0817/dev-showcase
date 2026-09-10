// 管理端敏感操作密码校验
/** 校验管理员二次确认密码 */
export function verifyAdminPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}
