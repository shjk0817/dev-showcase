// 管理端项目编辑表单
"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PROJECT_STATUS } from "@/lib/constants";

type Media = {
  screenshots: { id: string; url: string; caption?: string | null }[];
  downloads: { id: string; name: string; fileUrl: string; version?: string | null }[];
  tutorials: { id: string; title: string; content: string }[];
  videos: { id: string; title: string; url: string; type: string }[];
};

type Project = {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  coverUrl?: string | null;
  status: string;
} & Media;

/** 项目编辑与媒体管理表单 */
export function ProjectEditor({ project }: { project?: Project }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [status, setStatus] = useState(project?.status ?? "draft");
  const [coverUrl, setCoverUrl] = useState(project?.coverUrl ?? "");

  /** 上传文件到服务器 */
  async function uploadFile(file: File, type: string) {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "上传失败");
    return data as { url: string; size: number };
  }

  /** 保存项目基本信息 */
  async function saveProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const body = {
      id: project?.id,
      title: form.get("title"),
      description: form.get("description"),
      content: form.get("content"),
      category: form.get("category"),
      coverUrl: coverUrl || null,
      status,
    };
    const res = await fetch("/api/admin/projects", {
      method: project ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "保存失败");
      return;
    }
    router.push(`/admin/projects/${data.id}`);
    router.refresh();
  }

  /** 添加媒体资源 */
  async function addMedia(kind: string, data: Record<string, unknown>) {
    if (!project?.id) return;
    await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, kind, data }),
    });
    router.refresh();
  }

  /** 删除媒体资源 */
  async function removeMedia(kind: string, id: string) {
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id }),
    });
    router.refresh();
  }

  return (
    <Tabs defaultValue="basic">
      <TabsList>
        <TabsTrigger value="basic">基本信息</TabsTrigger>
        {project && <TabsTrigger value="media">媒体资源</TabsTrigger>}
      </TabsList>
      <TabsContent value="basic" className="mt-4">
        <form onSubmit={saveProject} className="space-y-4 max-w-2xl">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">项目名称</Label>
            <Input id="title" name="title" defaultValue={project?.title} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">分类</Label>
            <Input id="category" name="category" defaultValue={project?.category} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">简介</Label>
            <Textarea id="description" name="description" defaultValue={project?.description} required rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">详细介绍（Markdown）</Label>
            <Textarea id="content" name="content" defaultValue={project?.content} rows={10} />
          </div>
          <div className="space-y-2">
            <Label>封面图</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const result = await uploadFile(file, "image");
                  setCoverUrl(result.url);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "上传失败");
                }
              }}
            />
            {coverUrl && <p className="text-sm text-green-600">已上传：{coverUrl}</p>}
          </div>
          <div className="space-y-2">
            <Label>发布状态</Label>
            <Select value={status} onValueChange={(v) => setStatus(v ?? "draft")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROJECT_STATUS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">{project ? "保存修改" : "创建项目"}</Button>
        </form>
      </TabsContent>
      {project && (
        <TabsContent value="media" className="mt-4 space-y-8">
          <MediaSection
            title="截图"
            items={project.screenshots}
            onRemove={(id) => removeMedia("screenshot", id)}
            uploadLabel="上传截图"
            onUpload={async (file) => {
              const r = await uploadFile(file, "image");
              await addMedia("screenshot", { url: r.url });
            }}
          />
          <MediaSection
            title="下载文件"
            items={project.downloads}
            onRemove={(id) => removeMedia("download", id)}
            uploadLabel="上传安装包"
            onUpload={async (file) => {
              const r = await uploadFile(file, "file");
              await addMedia("download", { name: file.name, fileUrl: r.url, fileSize: r.size });
            }}
          />
          <TutorialSection
            items={project.tutorials}
            onAdd={(data) => addMedia("tutorial", data)}
            onRemove={(id) => removeMedia("tutorial", id)}
          />
          <VideoSection
            items={project.videos}
            onAdd={(data) => addMedia("video", data)}
            onRemove={(id) => removeMedia("video", id)}
            onUpload={async (file) => {
              const r = await uploadFile(file, "video");
              return r.url;
            }}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}

/** 通用媒体上传区块 */
function MediaSection({
  title,
  items,
  onRemove,
  uploadLabel,
  onUpload,
}: {
  title: string;
  items: { id: string; url?: string; name?: string; fileUrl?: string }[];
  onRemove: (id: string) => void;
  uploadLabel: string;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <div>
      <h3 className="font-medium mb-2">{title}</h3>
      <Input
        type="file"
        className="mb-3 max-w-xs"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await onUpload(file);
        }}
      />
      <p className="text-xs text-muted-foreground mb-2">{uploadLabel}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm border rounded p-2">
            <span>{item.name || item.url || item.fileUrl}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
              删除
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 教程添加区块 */
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
  return (
    <div>
      <h3 className="font-medium mb-2">使用教程</h3>
      <div className="space-y-2 max-w-xl mb-3">
        <Input placeholder="教程标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Markdown 内容" value={content} onChange={(e) => setContent(e.target.value)} rows={4} />
        <Button type="button" size="sm" onClick={() => { onAdd({ title, content }); setTitle(""); setContent(""); }}>
          添加教程
        </Button>
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm border rounded p-2">
            <span>{item.title}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(item.id)}>删除</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 视频添加区块 */
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
  return (
    <div>
      <h3 className="font-medium mb-2">教程视频</h3>
      <div className="space-y-2 max-w-xl mb-3">
        <Input placeholder="视频标题" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="嵌入链接（B站/YouTube）" value={url} onChange={(e) => setUrl(e.target.value)} />
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={() => { onAdd({ title, url, type: "embed" }); setTitle(""); setUrl(""); }}>
            添加嵌入视频
          </Button>
          <Input type="file" accept="video/*" className="max-w-xs" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !title) return;
            const videoUrl = await onUpload(file);
            await onAdd({ title, url: videoUrl, type: "upload" });
            setTitle("");
          }} />
        </div>
      </div>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm border rounded p-2">
            <span>{item.title} ({item.type})</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(item.id)}>删除</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
