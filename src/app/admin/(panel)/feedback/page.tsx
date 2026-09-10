// 管理端反馈列表页
import { prisma } from "@/lib/db";
import { FeedbackManager } from "@/components/feedback-manager";

/** 反馈管理页 */
export default async function AdminFeedbackPage() {
  const items = await prisma.feedback.findMany({
    include: {
      project: { select: { title: true, slug: true } },
      attachments: true,
    },
    orderBy: { createdAt: "desc" },
  });
  const serialized = items.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
    projectTitle: i.project?.title ?? "未知项目",
    projectSlug: i.project?.slug ?? "",
    attachments: i.attachments.map((a) => ({
      id: a.id,
      name: a.name,
      fileUrl: a.fileUrl,
      fileSize: a.fileSize,
      mimeType: a.mimeType,
    })),
  }));
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">反馈管理</h1>
      <FeedbackManager items={serialized} />
    </div>
  );
}
