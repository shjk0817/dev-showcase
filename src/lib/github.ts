// GitHub 仓库信息解析与导入
import { buildProjectContent, simplifyReadme } from "@/lib/readme-simplify";

const GH_API = "https://api.github.com";

type GithubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
};

type GithubRelease = {
  tag_name: string;
  name: string;
  published_at: string;
  assets: { name: string; browser_download_url: string; size: number }[];
};

export type GithubImportData = {
  owner: string;
  repo: string;
  githubUrl: string;
  title: string;
  description: string;
  content: string;
  category: string;
  downloads: { name: string; fileUrl: string; version: string; fileSize: number }[];
  tutorials: { title: string; content: string }[];
};

/** 解析 GitHub 仓库地址 */
export function parseGithubUrl(url: string): { owner: string; repo: string } | null {
  const trimmed = url.trim();
  const match = trimmed.match(/github\.com\/([^/]+)\/([^/#?]+)/i);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

/** 请求 GitHub API */
async function ghFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GH_API}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "JKTAC-DevShowcase",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`GitHub API 错误: ${res.status}`);
  return res.json() as Promise<T>;
}

/** 获取 README 文本 */
async function fetchReadme(owner: string, repo: string): Promise<string> {
  try {
    const data = await ghFetch<{ content: string; encoding: string }>(
      `/repos/${owner}/${repo}/readme`
    );
    if (data.encoding === "base64") {
      return Buffer.from(data.content, "base64").toString("utf-8");
    }
    return data.content;
  } catch {
    return "";
  }
}

/** 从 GitHub 拉取项目导入数据 */
export async function fetchGithubImport(url: string): Promise<GithubImportData> {
  const parsed = parseGithubUrl(url);
  if (!parsed) throw new Error("无效的 GitHub 链接");
  const { owner, repo } = parsed;
  const ghUrl = `https://github.com/${owner}/${repo}`;

  const [repoData, readme, releases] = await Promise.all([
    ghFetch<GithubRepo>(`/repos/${owner}/${repo}`),
    fetchReadme(owner, repo),
    ghFetch<GithubRelease[]>(`/repos/${owner}/${repo}/releases?per_page=5`).catch(() => []),
  ]);

  const downloads = releases.flatMap((r) =>
    r.assets.map((a) => ({
      name: a.name,
      fileUrl: a.browser_download_url,
      version: r.tag_name,
      fileSize: a.size,
    }))
  );

  const desc = repoData.description || `${owner}/${repo} 开源项目`;
  const rawContent = readme || `## ${repoData.name}\n\n${desc}`;
  const content = buildProjectContent(repoData.name, desc, rawContent);
  const tutorials = readme ? [{ title: "README", content: simplifyReadme(readme) }] : [];

  return {
    owner,
    repo,
    githubUrl: ghUrl,
    title: repoData.name,
    description: desc.slice(0, 2000),
    content,
    category: repoData.language || "开源项目",
    downloads,
    tutorials,
  };
}
