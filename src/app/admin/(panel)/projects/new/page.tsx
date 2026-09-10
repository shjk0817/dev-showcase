// 新建项目页
import { ProjectEditor } from "@/components/project-editor";

/** 创建新项目 */
export default function NewProjectPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新建项目</h1>
      <ProjectEditor />
    </div>
  );
}
