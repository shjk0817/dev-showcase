// 首页：简约项目卡片列表
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { ProjectCard } from "@/components/project-card";

/** 首页项目列表 */
export default async function HomePage() {
  const projects = await prisma.project.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        {projects.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">暂无项目</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p) => (
              <ProjectCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
