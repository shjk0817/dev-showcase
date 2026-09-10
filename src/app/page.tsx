// 首页：仅展示项目卡片
import { prisma } from "@/lib/db";
import { ProjectCard } from "@/components/project-card";

export const dynamic = "force-dynamic";

/** 首页项目列表 */
export default async function HomePage() {
  const projects = await prisma.project.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 md:py-10">
      {projects.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">暂无项目</p>
      ) : (
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {projects.map((p) => (
            <ProjectCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </main>
  );
}
