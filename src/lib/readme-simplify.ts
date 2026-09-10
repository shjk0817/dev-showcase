// README 精简：去除代码块与冗余，保留核心说明
/** 精简 Markdown README 为展示用简介 */
export function simplifyReadme(markdown: string, maxLen = 1800): string {
  let text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "### ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const lines = text.split("\n").filter((l) => l.trim());
  const body = lines.join("\n").slice(0, maxLen);
  return body || markdown.slice(0, 500);
}

/** 生成精简后的项目介绍 Markdown */
export function buildProjectContent(title: string, description: string, readme: string): string {
  const summary = simplifyReadme(readme);
  if (!summary) {
    return `## ${title}\n\n${description}`;
  }
  return `## 项目简介\n\n${description}\n\n## 说明\n\n${summary}`;
}
