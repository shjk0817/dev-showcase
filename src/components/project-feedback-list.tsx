// 项目页公开反馈列表
import { Badge } from "@/components/ui/badge";
import { getFeedbackStatusLabel, getFeedbackTypeLabel } from "@/lib/constants";
import { isImageAttachment } from "@/lib/file-utils";
import { materialPanel } from "@/lib/material";
import { cn } from "@/lib/utils";

type Attachment = {
  id: string;
  name: string;
  fileUrl: string;
  mimeType: string;
};

type FeedbackItem = {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  attachments: Attachment[];
};

/** 渲染项目公开反馈列表 */
export function ProjectFeedbackList({ items }: { items: FeedbackItem[] }) {
  if (!items.length) {
    return (
      <p className={cn(materialPanel, "text-center text-muted-foreground py-6 mt-6")}>
        暂无反馈，欢迎第一个提交
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-lg font-semibold">全部反馈（{items.length}）</h3>
      {items.map((item) => (
        <article key={item.id} className={cn(materialPanel, "shadow-sm")}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h4 className="font-medium">{item.title}</h4>
            <Badge variant="secondary">{getFeedbackTypeLabel(item.type)}</Badge>
            <Badge variant="outline">{getFeedbackStatusLabel(item.status)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2 whitespace-pre-wrap">{item.content}</p>
          <p className="text-xs text-muted-foreground mb-3">
            {new Date(item.createdAt).toLocaleString("zh-CN")}
          </p>
          {item.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.attachments.map((att) =>
                isImageAttachment(att.mimeType, att.name) ? (
                  <a key={att.id} href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                    <img src={att.fileUrl} alt={att.name} className="h-16 w-16 object-cover rounded border" />
                  </a>
                ) : (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline border rounded px-2 py-1"
                  >
                    {att.name}
                  </a>
                )
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
