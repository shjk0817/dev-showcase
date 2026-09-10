// 反馈通知：邮件与企微 Webhook
import nodemailer from "nodemailer";
import { getFeedbackTypeLabel } from "@/lib/constants";

type FeedbackNotifyPayload = {
  title: string;
  content: string;
  type: string;
  projectTitle: string;
  contact?: string | null;
  feedbackId: string;
};

/** 构建反馈通知正文 */
function buildMessage(p: FeedbackNotifyPayload): string {
  const lines = [
    `【新反馈】${p.title}`,
    `项目：${p.projectTitle}`,
    `类型：${getFeedbackTypeLabel(p.type)}`,
    p.contact ? `联系方式：${p.contact}` : null,
    "",
    p.content.slice(0, 500) + (p.content.length > 500 ? "…" : ""),
    "",
    `反馈 ID：${p.feedbackId}`,
    `管理后台：${process.env.NEXTAUTH_URL ?? ""}/admin/feedback`,
  ];
  return lines.filter(Boolean).join("\n");
}

/** 发送企微群机器人通知 */
async function sendWechatWebhook(text: string): Promise<void> {
  const url = process.env.WECHAT_WEBHOOK_URL;
  if (!url) return;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msgtype: "text", text: { content: text } }),
  });
  if (!res.ok) throw new Error(`企微通知失败: ${res.status}`);
}

/** 发送邮件通知 */
async function sendEmail(subject: string, text: string): Promise<void> {
  const host = process.env.SMTP_HOST;
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!host || !to) return;
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
      : undefined,
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@jktac.top",
    to,
    subject,
    text,
  });
}

/** 发送新反馈通知（邮件 + 企微，配置缺失则跳过） */
export async function notifyNewFeedback(payload: FeedbackNotifyPayload): Promise<void> {
  const text = buildMessage(payload);
  const subject = `[JKTAC] 新反馈：${payload.title}`;
  const tasks: Promise<void>[] = [];
  if (process.env.WECHAT_WEBHOOK_URL) tasks.push(sendWechatWebhook(text));
  if (process.env.SMTP_HOST && process.env.NOTIFY_EMAIL_TO) {
    tasks.push(sendEmail(subject, text));
  }
  if (!tasks.length) return;
  await Promise.allSettled(tasks);
}
