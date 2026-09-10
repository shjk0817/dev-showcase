// 项目详情页，Material 卡片风格
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { ProjectGallery } from "@/components/project-gallery";
import { DownloadList } from "@/components/download-list";
import { MarkdownContent } from "@/components/markdown-content";
import { VideoList } from "@/components/video-list";
import { FeedbackForm } from "@/components/feedback-form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { materialCard, materialPanel } from "@/lib/material";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

/** 项目详情页 */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await prisma.project.findFirst({
    where: { slug, status: "published" },
    include: {
      screenshots: { orderBy: { sortOrder: "asc" } },
      downloads: { orderBy: { sortOrder: "asc" } },
      tutorials: { orderBy: { sortOrder: "asc" } },
      videos: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 md:py-10">
      <div className="container mx-auto max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>
        <article className={cn(materialCard, "shadow-lg")}>
          {project.coverUrl && (
            <div className="relative aspect-video bg-slate-100">
              <Image src={project.coverUrl} alt={project.title} fill className="object-cover" />
            </div>
          )}
          <div className="p-6 md:p-8">
            <Badge className="mb-3">{project.category}</Badge>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-muted-foreground mb-6">{project.description}</p>
            <Tabs defaultValue="overview">
              <TabsList className="flex-wrap h-auto bg-muted/50 shadow-sm">
                <TabsTrigger value="overview">概览</TabsTrigger>
                <TabsTrigger value="screenshots">截图</TabsTrigger>
                <TabsTrigger value="downloads">下载</TabsTrigger>
                <TabsTrigger value="tutorials">教程</TabsTrigger>
                <TabsTrigger value="videos">视频</TabsTrigger>
                <TabsTrigger value="feedback">反馈</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6">
                <div className={materialPanel}>
                  <MarkdownContent content={project.content || "暂无详细介绍"} readme />
                </div>
              </TabsContent>
              <TabsContent value="screenshots" className="mt-6">
                <div className={materialPanel}>
                  <ProjectGallery shots={project.screenshots} />
                </div>
              </TabsContent>
              <TabsContent value="downloads" className="mt-6">
                <DownloadList items={project.downloads} />
              </TabsContent>
              <TabsContent value="tutorials" className="mt-6 space-y-6">
                {project.tutorials.length === 0 ? (
                  <div className={cn(materialPanel, "text-center text-muted-foreground py-8")}>
                    暂无教程
                  </div>
                ) : (
                  project.tutorials.map((t) => (
                    <div key={t.id} className={materialPanel}>
                      {project.tutorials.length > 1 && (
                        <h2 className="text-xl font-semibold mb-4">{t.title}</h2>
                      )}
                      <MarkdownContent content={t.content} readme />
                    </div>
                  ))
                )}
              </TabsContent>
              <TabsContent value="videos" className="mt-6">
                <div className={materialPanel}>
                  <VideoList items={project.videos} />
                </div>
              </TabsContent>
              <TabsContent value="feedback" className="mt-6">
                <div className={materialPanel}>
                  <FeedbackForm projectId={project.id} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </article>
      </div>
    </main>
  );
}
