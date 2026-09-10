"use client";
// GitHub 仓库导入控件
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { GithubImportData } from "@/lib/github";

type Props = {
  defaultUrl?: string;
  onImport: (url: string, data: GithubImportData) => void;
};

/** GitHub 导入输入与按钮 */
export function ProjectGithubImport({ defaultUrl = "", onImport }: Props) {
  const [url, setUrl] = useState(defaultUrl);
  const [loading, setLoading] = useState(false);

  /** 请求后端拉取仓库信息 */
  async function handleImport() {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("请输入 GitHub 仓库地址");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "导入失败");
      onImport(trimmed, data as GithubImportData);
      toast.success("已从 GitHub 导入");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "导入失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
      <Label>GitHub 仓库</Label>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
        />
        <Button type="button" variant="secondary" onClick={handleImport} disabled={loading}>
          {loading ? "导入中…" : "从 GitHub 导入"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        自动填充 README、Release 下载链接与说明
      </p>
    </div>
  );
}
