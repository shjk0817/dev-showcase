// 匿名反馈提交页
import { SiteHeader } from "@/components/site-header";
import { FeedbackForm } from "@/components/feedback-form";

/** 反馈页 */
export default function FeedbackPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">提交反馈</h1>
        <p className="text-muted-foreground mb-6">
          欢迎提出 Issue、改进建议或使用体验反馈，我们会认真阅读每一条意见。
        </p>
        <FeedbackForm />
      </main>
    </>
  );
}
