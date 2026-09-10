"use client";
// 项目后台媒体与文件管理（截图、下载、教程、视频）
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export type ProjectMedia = {
  screenshots: { id: string; url: string; caption?: string | null }[];
  downloads: { id: string; name: string; fileUrl: string; version?: string | null }[];
  tutorials: { id: string; title: string; content: string }[];
  videos: { id: string; title: string; url: string; type: string }[];
};

type Props = {
  projectId: string;
  media: ProjectMedia;
};

/** 上传文件到管理端 */
async function uploadFile(file: File, type: string) {
  const form = new FormData();
  form.append("file", file);
  form.append("type", type);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "上传失败");
  return data as { url: string; size: number };
}

/** 项目媒体资源管理面板 */
export function ProjectMediaManager({ projectId, media }: Props) {
  const router = useRouter();

  /** 新增媒体记录 */
  async function addMedia(kind: string, data: Record<string, unknown>) {
    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, kind, data }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || "添加失败");
    }
    router.refresh();
  }

  /** 删除媒体记录 */
  async function removeMedia(kind: string, id: string) {
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error || "删除失败");
    }
    router.refresh();
  }

  /** 包装上传并提示错误 */
  async function runUpload(task: () => Promise<void>) {
    try {
      await task();
      toast.success("已更新");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "操作失败");
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <FileListSection
        title="截图"
        hint="上传截图"
        items={media.screenshots.map((s) => ({ id: s.id, label: s.url }))}
        accept="image/*"
        onUpload={(file) =>
          runUpload(async () => {
            const r = await uploadFile(file, "image");
            await addMedia("screenshot", { url: r.url });
          })
        }
        onRemove={(id) => runUpload(() => removeMedia("screenshot", id))}
      />
      <FileListSection
        title="下载文件"
        hint="上传安装包或压缩包"
        items={media.downloads.map((d) => ({ id: d.id, label: d.name }))}
        onUpload={(file) =>
          runUpload(async () => {
            const r = await uploadFile(file, "file");
            await addMedia("download", { name: file.name, fileUrl: r.url, fileSize: r.size });
          })
        }
        onRemove={(id) => runUpload(() => removeMedia("download", id))}
      />
      <TutorialSection
        items={media.tutorials}
        onAdd={(data) => runUpload(() => addMedia("tutorial", data))}
        onRemove={(id) => runUpload(() => removeMedia("tutorial", id))}
      />
      <VideoSection
        items={media.videos}
        onAdd={(data) => runUpload(() => addMedia("video", data))}
        onRemove={(id) => runUpload(() => removeMedia("video", id))}
        onUpload={async (file) => {
          const r = await uploadFile(file, "video");
          return r.url;
        }}
      />
    </div>
  );
}

/** 通用文件列表与上传区块 */
function FileListSection({
  title,
  hint,
  items,
  accept,
  onUpload,
  onRemove,
}: {
  title: string;
  hint: string;
  items: { id: string; label: string }[];
  accept?: string;
  onUpload: (file: File) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section>
      <h3 className="font-medium mb-2">{title}</h3>
      <Input
        type="file"
        accept={accept}
        className="mb-2 max-w-xs"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      <p className="text-xs text-muted-foreground mb-2">{hint}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-2 text-sm border rounded p-2">
            <span className="truncate">{item.label}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
              删除
            </Button>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">暂无{title}</p>}
      </ul>
    </section>
  );
}

/** 教程管理区块 */
function TutorialSection({
  items,
  onAdd,
  onRemove,
}: {
  items: { id: string; title: string; content: string }[];
  onAdd: (data: Record<string, string>) => Promise<void>;
  onRemove: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  /** 提交教程表单 */
  async function handleAdd() {
    if (title.trim().length < 2) return;
    await onAdd({ title: title.trim(), content });
    setTitle("");
    setContent("");
  }

  return (
    <section>
      <h3 className="font-medium mb-2">使用教程</h3>
      <div className="space-y-2 mb-3">
        <Input placeholder="教程标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          placeholder="Markdown 内容"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
        />
        <Button type="button" size="sm" onClick={handleAdd}>添加教程</Button>
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-2 text-sm border rounded p-2">
            <span>{item.title}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
              删除
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 视频管理区块 */
function VideoSection({
  items,
  onAdd,
  onRemove,
  onUpload,
}: {
  items: { id: string; title: string; url: string; type: string }[];
  onAdd: (data: Record<string, string>) => Promise<void>;
  onRemove: (id: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  /** 添加嵌入视频链接 */
  async function addEmbed() {
    if (!title.trim() || !url.trim()) return;
    await onAdd({ title: title.trim(), url: url.trim(), type: "embed" });
    setTitle("");
    setUrl("");
  }

  /** 上传本地视频文件 */
  async function addUploaded(file: File) {
    if (!title.trim()) {
      toast.error("请先填写视频标题");
      return;
    }
    const videoUrl = await onUpload(file);
    await onAdd({ title: title.trim(), url: videoUrl, type: "upload" });
    setTitle("");
  }

  return (
    <section>
      <h3 className="font-medium mb-2">教程视频</h3>
      <div className="space-y-2 mb-3">
        <Input placeholder="视频标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="嵌入链接（B站/YouTube）" value={url} onChange={(e) => setUrl(e.target.value)} />
        <div className="flex flex-wrap gap-2 items-center">
          <Button type="button" size="sm" onClick={addEmbed}>添加嵌入视频</Button>
          <Input
            type="file"
            accept="video/*"
            className="max-w-xs"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) addUploaded(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-2 text-sm border rounded p-2">
            <span>{item.title} ({item.type})</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
              删除
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
