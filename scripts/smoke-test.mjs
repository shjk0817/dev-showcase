#!/usr/bin/env node
// 冒烟测试：验证关键页面与 API 可达
const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

const cases = [
  { path: "/", expect: 200 },
  { path: "/admin/login", expect: 200 },
  { path: "/api/admin/projects", expect: 401 },
  { path: "/uploads/images/jktac-demo-cover.png", expect: 200 },
];

let failed = 0;
for (const { path, expect } of cases) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const ok = res.status === expect;
  console.log(`${ok ? "✓" : "✗"} ${path} → ${res.status} (期望 ${expect})`);
  if (!ok) failed += 1;
}
process.exit(failed > 0 ? 1 : 0);
