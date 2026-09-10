// 反馈提交表单（客户端，支持多附件）
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FEEDBACK_TYPES, getFeedbackTypeLabel } from "@/lib/constants";
import { X } from "lucide-react";

type Props = {
  projectId: string;
};

const ACCEPT =
  "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.zip";

/** 针对单个项目的匿名反馈表单 */
export function FeedbackForm({ projectId }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  /** 添加附件 */
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
    e.target.value = "";
  }

  /** 移除已选附件 */
  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  /** 提交项目反馈 */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!type) {
      setError("请选择反馈类型");
      return;
    }
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    form.set("projectId", projectId);
    form.set("type", type);
    files.forEach((file) => form.append("files", file));
    try {
      const res = await fetch("/api/feedback", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "提交失败");
      setDone(true);
      setType("");
      setFiles([]);
      e.currentTarget.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Alert>
        <AlertDescription>
          反馈已提交，感谢你的意见！
          <Button variant="link" className="px-1" onClick={() => setDone(false)}>
            继续提交
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="space-y-2">
        <Label>反馈类型</Label>
        <Select value={type} onValueChange={(v) => setType(v ?? "")}>
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="请选择类型">
              {type ? getFeedbackTypeLabel(type) : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FEEDBACK_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value} className="cursor-pointer">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">标题</Label>
        <Input id="title" name="title" required minLength={2} maxLength={200} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">详细内容</Label>
        <Textarea id="content" name="content" required minLength={5} rows={6} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact">联系方式（可选）</Label>
        <Input id="contact" name="contact" placeholder="邮箱或工号" maxLength={200} />
      </div>
      <div className="space-y-2">
        <Label>附件（可选，最多 5 个）</Label>
        <Input
          ref={fileRef}
          type="file"
          multiple
          accept={ACCEPT}
          onChange={handleFileChange}
          disabled={files.length >= 5}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground">
          支持图片、PDF、Word、Excel、PPT、TXT、ZIP 等，单个不超过 20MB
        </p>
        {files.length > 0 && (
          <ul className="space-y-1">
            {files.map((file, i) => (
              <li key={`${file.name}-${i}`} className="flex items-center justify-between text-sm border rounded px-2 py-1">
                <span className="truncate">{file.name}</span>
                <button type="button" className="cursor-pointer" onClick={() => removeFile(i)} aria-label="移除">
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? "提交中..." : "提交反馈"}
      </Button>
    </form>
  );
}
