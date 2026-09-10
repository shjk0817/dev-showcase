// GitHub README 风格 Markdown 渲染组件
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.min.css";
import "@/styles/markdown-github.css";

type Props = {
  content: string;
  /** 是否使用 README 文档容器样式 */
  readme?: boolean;
};

/** 渲染 Markdown，支持 GFM 语法与代码高亮 */
export function MarkdownContent({ content, readme = false }: Props) {
  const className = readme
    ? "markdown-body markdown-readme"
    : "markdown-body";

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
