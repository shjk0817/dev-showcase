// 路由守卫，保护管理后台与 API
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isLogin = path === "/admin/login";
  const needAuth =
    (path.startsWith("/admin") && !isLogin) || path.startsWith("/api/admin");
  if (needAuth && !req.auth) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
