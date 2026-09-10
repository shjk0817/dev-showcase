// 管理后台布局
import { AdminSidebar } from "@/components/admin-sidebar";

/** 后台共享布局 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
}
