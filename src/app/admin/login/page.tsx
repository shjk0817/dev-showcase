// 管理员登录页（不使用后台侧边栏）
import { LoginForm } from "@/components/login-form";

/** 登录页布局 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <LoginForm />
    </div>
  );
}
