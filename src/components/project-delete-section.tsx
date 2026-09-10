"use client";
// 项目删除二次确认
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type Props = { projectId: string };

/** 带密码确认的项目删除区 */
export function ProjectDeleteSection({ projectId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /** 提交删除请求 */
  async function handleDelete() {
    if (!password) {
      toast.error("请输入管理员密码");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "删除失败");
      toast.success("项目已删除");
      router.push("/admin/projects");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "删除失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-destructive/30 p-4 mt-8">
      <h2 className="font-semibold text-destructive mb-2">危险操作</h2>
      <p className="text-sm text-muted-foreground mb-3">
        删除后不可恢复，关联截图、下载与反馈将一并移除。
      </p>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button type="button" variant="destructive">
            删除项目
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除项目</DialogTitle>
            <DialogDescription>请输入管理员密码以确认删除。</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="delete-password">管理员密码</Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "删除中…" : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
