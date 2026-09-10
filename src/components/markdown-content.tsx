// Markdown 内容渲染
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** 渲染 Markdown 文本 */
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
