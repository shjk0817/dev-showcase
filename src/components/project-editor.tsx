"use client";
// 管理端项目创建与编辑表单
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
import { toast } from "sonner";
import type { GithubImportData } from "@/lib/github";
import { ProjectGithubImport } from "@/components/project-github-import";
import { ProjectDeleteSection } from "@/components/project-delete-section";

const DEFAULT_CATEGORIES = ["工具", "开源项目", "TypeScript", "JavaScript", "Python", "其他"];

type Project = {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  coverUrl: string | null;
  githubUrl: string | null;
  status: string;
};

type PendingMedia = Pick<GithubImportData, "downloads" | "tutorials">;

type Props = {
  project?: Project;
  categories?: string[];
};

/** 项目编辑主表单 */
export function ProjectEditor({ project, categories = DEFAULT_CATEGORIES }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [content, setContent] = useState(project?.content ?? "");
  const [category, setCategory] = useState(project?.category ?? categories[0] ?? "工具");
  const [coverUrl, setCoverUrl] = useState(project?.coverUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [status, setStatus] = useState(project?.status ?? "draft");
  const [pendingMedia, setPendingMedia] = useState<PendingMedia>({ downloads: [], tutorials: [] });
  const [saving, setSaving] = useState(false);

  /** 应用 GitHub 导入结果到表单 */
  function applyGithubImport(url: string, data: GithubImportData) {
    setTitle(data.title);
    setDescription(data.description);
    setContent(data.content);
    setCategory(data.category);
    setGithubUrl(url);
    setPendingMedia({ downloads: data.downloads, tutorials: data.tutorials });
  }

  /** 保存导入的下载与教程 */
  async function syncPendingMedia(projectId: string) {
    for (const d of pendingMedia.downloads) {
      await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          kind: "download",
          data: { name: d.name, fileUrl: d.fileUrl, version: d.version, fileSize: d.fileSize },
        }),
      });
    }
    for (const t of pendingMedia.tutorials) {
      await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          kind: "tutorial",
          data: { title: t.title, content: t.content },
        }),
      });
    }
    if (pendingMedia.downloads.length || pendingMedia.tutorials.length) {
      setPendingMedia({ downloads: [], tutorials: [] });
    }
  }

  /** 提交项目保存 */
  async function handleSave() {
    if (title.trim().length < 2) {
      toast.error("标题至少 2 个字符");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        content,
        category,
        coverUrl: coverUrl || null,
        githubUrl: githubUrl.trim() || null,
        status,
      };
      const res = await fetch("/api/admin/projects", {
        method: project ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project ? { id: project.id, ...payload } : payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "保存失败");
      await syncPendingMedia(data.id);
      toast.success("已保存");
      router.push(`/admin/projects/${data.id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <ProjectGithubImport defaultUrl={githubUrl} onImport={applyGithubImport} />
      {pendingMedia.downloads.length > 0 && (
        <p className="text-sm text-muted-foreground">
          待导入：{pendingMedia.downloads.length} 个下载、{pendingMedia.tutorials.length} 篇教程（保存后写入）
        </p>
      )}
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">标题</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="description">简介</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>
        <div>
          <Label htmlFor="content">详细介绍（Markdown）</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="font-mono text-sm"
          />
        </div>
        <div>
          <Label>分类</Label>
          <Select value={category} onValueChange={(v) => v && setCategory(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="coverUrl">封面 URL</Label>
          <Input id="coverUrl" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} />
        </div>
        <div>
          <Label>状态</Label>
          <Select value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "保存中…" : "保存"}
        </Button>
      </div>
      {project && <ProjectDeleteSection projectId={project.id} />}
    </div>
  );
}
