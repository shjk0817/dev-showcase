// 管理端反馈列表组件
"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FEEDBACK_STATUS, getFeedbackTypeLabel, getFeedbackStatusLabel } from "@/lib/constants";

type Feedback = {
  id: string;
  title: string;
  content: string;
  type: string;
  contact?: string | null;
  status: string;
  adminNote?: string | null;
  createdAt: string;
  projectTitle?: string;
  projectSlug?: string;
};

/** 反馈管理表格 */
export function FeedbackManager({ items }: { items: Feedback[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  /** 更新反馈状态 */
  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  /** 保存内部备注 */
  async function saveNote(id: string) {
    await fetch("/api/admin/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminNote: notes[id] ?? "" }),
    });
    router.refresh();
  }

  /** 删除反馈 */
  async function remove(id: string) {
    if (!confirm("确定删除此反馈？")) return;
    await fetch("/api/admin/feedback", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>标题</TableHead>
          <TableHead>所属项目</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>时间</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <Fragment key={item.id}>
            <TableRow>
              <TableCell>
                <button type="button" className="text-left hover:underline" onClick={() => setExpanded(expanded === item.id ? null : item.id)}>
                  {item.title}
                </button>
              </TableCell>
              <TableCell className="text-sm">{item.projectTitle ?? "-"}</TableCell>
              <TableCell>{getFeedbackTypeLabel(item.type)}</TableCell>
              <TableCell>
                <Badge variant="outline">{getFeedbackStatusLabel(item.status)}</Badge>
              </TableCell>
              <TableCell>{new Date(item.createdAt).toLocaleDateString("zh-CN")}</TableCell>
              <TableCell>
                <Select value={item.status} onValueChange={(v) => v && updateStatus(item.id, v)}>
                  <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FEEDBACK_STATUS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
            {expanded === item.id && (
              <TableRow>
                <TableCell colSpan={6} className="bg-slate-50">
                  <p className="text-sm mb-2 whitespace-pre-wrap">{item.content}</p>
                  {item.contact && <p className="text-xs text-muted-foreground mb-2">联系方式：{item.contact}</p>}
                  <Textarea
                    placeholder="内部备注"
                    defaultValue={item.adminNote ?? ""}
                    onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                    rows={2}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveNote(item.id)}>保存备注</Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>删除</Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}
