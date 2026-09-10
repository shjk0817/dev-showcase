// 收集项目关联的上传文件 URL
import { prisma } from "@/lib/db";

/** 获取项目及其反馈附件的所有上传路径 */
export async function collectProjectUploadUrls(projectId: string): Promise<string[]> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      screenshots: true,
      downloads: true,
      videos: true,
      feedbacks: { include: { attachments: true } },
    },
  });
  if (!project) return [];
  const urls: string[] = [];
  if (project.coverUrl) urls.push(project.coverUrl);
  for (const s of project.screenshots) urls.push(s.url);
  for (const d of project.downloads) urls.push(d.fileUrl);
  for (const v of project.videos) {
    if (v.type === "upload") urls.push(v.url);
  }
  for (const f of project.feedbacks) {
    for (const a of f.attachments) urls.push(a.fileUrl);
  }
  return urls;
}
