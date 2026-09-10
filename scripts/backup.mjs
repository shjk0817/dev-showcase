#!/usr/bin/env node
// 定时备份：PostgreSQL 数据库 + uploads 目录
import { execSync } from "child_process";
import { mkdirSync, readdirSync, statSync, unlinkSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BACKUP_DIR = process.env.BACKUP_DIR ?? path.join(ROOT, "backups");
const RETENTION_DAYS = Number(process.env.BACKUP_RETENTION_DAYS ?? 7);
const DATABASE_URL = process.env.DATABASE_URL;

/** 解析数据库连接 URL */
function parseDbUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port || "5432",
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, "").split("?")[0],
  };
}

/** 删除超过保留期的备份 */
function cleanOldBackups() {
  if (!existsSync(BACKUP_DIR)) return;
  const cutoff = Date.now() - RETENTION_DAYS * 86400000;
  for (const name of readdirSync(BACKUP_DIR)) {
    const full = path.join(BACKUP_DIR, name);
    if (statSync(full).mtimeMs < cutoff) {
      unlinkSync(full);
      console.log(`已删除过期备份: ${name}`);
    }
  }
}

/** 执行备份 */
function runBackup() {
  if (!DATABASE_URL) {
    console.error("缺少 DATABASE_URL");
    process.exit(1);
  }
  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const db = parseDbUrl(DATABASE_URL);
  const sqlFile = path.join(BACKUP_DIR, `db-${stamp}.sql.gz`);
  const uploadsFile = path.join(BACKUP_DIR, `uploads-${stamp}.tar.gz`);
  const uploadsDir = path.join(ROOT, "public/uploads");

  execSync(
    `PGPASSWORD="${db.password}" pg_dump -h ${db.host} -p ${db.port} -U ${db.user} ${db.database} | gzip > "${sqlFile}"`,
    { stdio: "inherit", shell: "/bin/bash" }
  );
  if (existsSync(uploadsDir)) {
    execSync(`tar -czf "${uploadsFile}" -C "${path.join(ROOT, "public")}" uploads`, {
      stdio: "inherit",
    });
  }
  console.log(`备份完成: ${sqlFile}`);
  if (existsSync(uploadsFile)) console.log(`备份完成: ${uploadsFile}`);
  cleanOldBackups();
}

runBackup();
