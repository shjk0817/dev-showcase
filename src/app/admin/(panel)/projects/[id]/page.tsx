// 编辑项目页
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProjectEditor } from "@/components/project-editor";

type Props = { params: Promise<{ id: string }> };

/** 编辑已有项目 */
export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      screenshots: { orderBy: { sortOrder: "asc" } },
      downloads: { orderBy: { sortOrder: "asc" } },
      tutorials: { orderBy: { sortOrder: "asc" } },
      videos: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!project) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">编辑项目：{project.title}</h1>
      <ProjectEditor project={project} />
    </div>
  );
}
