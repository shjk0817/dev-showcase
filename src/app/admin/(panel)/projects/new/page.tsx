// 新建项目页
import { ProjectEditor } from "@/components/project-editor";
import { getProjectCategories } from "@/lib/categories";

/** 创建新项目 */
export default async function NewProjectPage() {
  const categories = await getProjectCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新建项目</h1>
      <ProjectEditor categories={categories} />
    </div>
  );
}
