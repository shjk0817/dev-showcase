// 旧全局反馈页，重定向到首页
import { redirect } from "next/navigation";

/** 反馈已改为项目内提交，跳转首页 */
export default function FeedbackPage() {
  redirect("/");
}
