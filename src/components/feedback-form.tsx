// 反馈提交表单（客户端）
"use client";

import { useState } from "react";
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
import { FEEDBACK_TYPES } from "@/lib/constants";

/** 匿名反馈表单 */
export function FeedbackForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState("");

  /** 提交反馈到 API */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!type) {
      setError("请选择反馈类型");
      return;
    }
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const body = { ...Object.fromEntries(form.entries()), type };
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "提交失败");
      setDone(true);
      setType("");
      e.currentTarget.reset();
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
          反馈已提交，感谢你的意见！我们会尽快处理。
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
          <SelectTrigger>
            <SelectValue placeholder="请选择类型" />
          </SelectTrigger>
          <SelectContent>
            {FEEDBACK_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
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
      <Button type="submit" disabled={loading}>
        {loading ? "提交中..." : "提交反馈"}
      </Button>
    </form>
  );
}
