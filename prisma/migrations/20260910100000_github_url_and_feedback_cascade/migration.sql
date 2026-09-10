-- AlterTable: 添加 githubUrl
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "githubUrl" TEXT;

-- 删除项目时级联删除关联反馈
ALTER TABLE "Feedback" DROP CONSTRAINT IF EXISTS "Feedback_projectId_fkey";
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
