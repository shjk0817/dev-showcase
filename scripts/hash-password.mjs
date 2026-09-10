#!/usr/bin/env node
// 生成 bcrypt 管理员密码哈希，写入 .env 的 ADMIN_PASSWORD
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("用法: node scripts/hash-password.mjs <密码>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("将以下值设为 ADMIN_PASSWORD:");
console.log(hash);
