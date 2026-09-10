// 首页：展示已发布的开发成果
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
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2">JKTAC 开发成果</h1>
          <p className="text-muted-foreground">
            欢迎浏览 JKTAC 的开发成果。如有问题或建议，欢迎
            <a href="/feedback" className="text-blue-600 hover:underline mx-1">
              提交反馈
            </a>
            。
          </p>
        </section>
        {projects.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">暂无已发布的项目</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <ProjectCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        JKTAC · 欢迎提出 Issue 与反馈
      </footer>
    </>
  );
}
