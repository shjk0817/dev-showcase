// NextAuth 认证配置，仅管理员凭据登录
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth-password";
import { checkLoginRateLimit } from "@/lib/rate-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      /** 校验管理员账号密码 */
      authorize: async (credentials, request) => {
        const ip =
          request?.headers?.get("cf-connecting-ip") ??
          request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (!checkLoginRateLimit(ip)) return null;

        const username = credentials?.username as string;
        const password = credentials?.password as string;
        if (username !== process.env.ADMIN_USERNAME) return null;
        if (!(await verifyPassword(password))) return null;
        return { id: "admin", name: "管理员", email: "admin@local" };
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});
