// 项目详情页，含截图/下载/教程/视频/反馈 Tab
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { ProjectGallery } from "@/components/project-gallery";
import { DownloadList } from "@/components/download-list";
import { MarkdownContent } from "@/components/markdown-content";
import { VideoList } from "@/components/video-list";
import { FeedbackForm } from "@/components/feedback-form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <>
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Badge className="mb-2">{project.category}</Badge>
          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        {project.coverUrl && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8 border">
            <Image src={project.coverUrl} alt={project.title} fill className="object-cover" />
          </div>
        )}
        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="screenshots">截图</TabsTrigger>
            <TabsTrigger value="downloads">下载</TabsTrigger>
            <TabsTrigger value="tutorials">教程</TabsTrigger>
            <TabsTrigger value="videos">视频</TabsTrigger>
            <TabsTrigger value="feedback">反馈</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <MarkdownContent content={project.content || "暂无详细介绍"} readme />
          </TabsContent>
          <TabsContent value="screenshots" className="mt-6">
            <ProjectGallery shots={project.screenshots} />
          </TabsContent>
          <TabsContent value="downloads" className="mt-6">
            <DownloadList items={project.downloads} />
          </TabsContent>
          <TabsContent value="tutorials" className="mt-6 space-y-8">
            {project.tutorials.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">暂无教程</p>
            ) : (
              project.tutorials.map((t) => (
                <div key={t.id}>
                  {project.tutorials.length > 1 && (
                    <h2 className="text-xl font-semibold mb-4">{t.title}</h2>
                  )}
                  <MarkdownContent content={t.content} readme />
                </div>
              ))
            )}
          </TabsContent>
          <TabsContent value="videos" className="mt-6">
            <VideoList items={project.videos} />
          </TabsContent>
          <TabsContent value="feedback" className="mt-6">
            <FeedbackForm projectId={project.id} projectTitle={project.title} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
