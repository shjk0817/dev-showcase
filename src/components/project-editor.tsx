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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import type { GithubImportData } from "@/lib/github";
import { ProjectGithubImport } from "@/components/project-github-import";
import { ProjectDeleteSection } from "@/components/project-delete-section";
import { ProjectMediaManager, type ProjectMedia } from "@/components/project-media-manager";
import { CategoryInput } from "@/components/category-input";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { PROJECT_STATUS, getProjectStatusLabel } from "@/lib/constants";

type Project = {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  coverUrl: string | null;
  githubUrl: string | null;
  status: string;
} & ProjectMedia;

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
    if (!category.trim()) {
      toast.error("请填写分类");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        content,
        category: category.trim(),
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

  /** 上传封面图 */
  async function uploadCover(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("type", "image");
    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "上传失败");
    setCoverUrl(data.url);
    toast.success("封面已上传");
  }

  return (
    <Tabs defaultValue="basic" className="max-w-2xl">
      <TabsList>
        <TabsTrigger value="basic">基本信息</TabsTrigger>
        {project && <TabsTrigger value="media">文件管理</TabsTrigger>}
      </TabsList>
      <TabsContent value="basic" className="mt-6 space-y-6">
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
            <CategoryInput value={category} categories={categories} onChange={setCategory} />
          </div>
          <div>
            <Label htmlFor="coverUrl">封面</Label>
            <Input
              type="file"
              accept="image/*"
              className="mb-2"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  await uploadCover(file);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "上传失败");
                }
                e.target.value = "";
              }}
            />
            <Input
              id="coverUrl"
              placeholder="或填写封面 URL"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
            />
          </div>
          <div>
            <Label>状态</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger>
                <SelectValue>{getProjectStatusLabel(status)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </Button>
        </div>
        {project && <ProjectDeleteSection projectId={project.id} />}
      </TabsContent>
      {project && (
        <TabsContent value="media" className="mt-6">
          <ProjectMediaManager
            projectId={project.id}
            media={{
              screenshots: project.screenshots,
              downloads: project.downloads,
              tutorials: project.tutorials,
              videos: project.videos,
            }}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
