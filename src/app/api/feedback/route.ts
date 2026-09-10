// 公开反馈提交接口（支持多附件上传）
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { saveFeedbackFile } from "@/lib/upload";
import { deleteUploads } from "@/lib/file-cleanup";

const MAX_FILES = 5;

/** 接收针对项目的匿名反馈（multipart） */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (!checkRateLimit(`feedback:${ip}`)) {
    return NextResponse.json({ error: "提交过于频繁，请稍后再试" }, { status: 429 });
  }
  const form = await request.formData();
  const website = String(form.get("website") ?? "");
  if (website) return NextResponse.json({ error: "提交内容无效" }, { status: 400 });

  const projectId = String(form.get("projectId") ?? "");
  const title = String(form.get("title") ?? "").trim();
  const content = String(form.get("content") ?? "").trim();
  const type = String(form.get("type") ?? "");
  const contact = String(form.get("contact") ?? "").trim();
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (!projectId || title.length < 2 || title.length > 200) {
    return NextResponse.json({ error: "标题长度需在 2-200 字符" }, { status: 400 });
  }
  if (content.length < 5 || content.length > 5000) {
    return NextResponse.json({ error: "内容长度需在 5-5000 字符" }, { status: 400 });
  }
  if (contact.length > 200) {
    return NextResponse.json({ error: "联系方式过长" }, { status: 400 });
  }
  if (!["issue", "suggestion", "feedback"].includes(type)) {
    return NextResponse.json({ error: "反馈类型无效" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `最多上传 ${MAX_FILES} 个附件` }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, status: "published" },
  });
  if (!project) {
    return NextResponse.json({ error: "项目不存在或未发布" }, { status: 404 });
  }

  const savedFiles: { url: string; size: number; mimeType: string }[] = [];
  try {
    for (const file of files) {
      savedFiles.push(await saveFeedbackFile(file));
    }
    const feedback = await prisma.feedback.create({
      data: {
        projectId,
        title,
        content,
        type,
        contact: contact || null,
        attachments: {
          create: savedFiles.map((f, i) => ({
            name: files[i].name,
            fileUrl: f.url,
            fileSize: f.size,
            mimeType: f.mimeType,
          })),
        },
      },
    });
    revalidatePath("/admin");
    revalidatePath("/admin/feedback");
    revalidatePath(`/projects/${project.slug}`);
    return NextResponse.json({ id: feedback.id, message: "反馈已提交，感谢你的意见！" });
  } catch (err) {
    await deleteUploads(savedFiles.map((f) => f.url));
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "提交失败" },
      { status: 400 }
    );
  }
}
