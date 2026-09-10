// 项目下载列表
import { buttonVariants } from "@/components/ui/button";
import { Download } from "lucide-react";

type Item = { id: string; name: string; fileUrl: string; version?: string | null; fileSize?: number | null };

/** 格式化文件大小 */
function formatSize(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** 渲染下载项列表 */
export function DownloadList({ items }: { items: Item[] }) {
  if (!items.length) {
    return <p className="text-muted-foreground py-8 text-center">暂无下载</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between border rounded-lg p-4">
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              {item.version && `版本 ${item.version}`}
              {item.fileSize ? ` · ${formatSize(item.fileSize)}` : ""}
            </p>
          </div>
          <a href={item.fileUrl} download className={buttonVariants()}>
            <Download className="w-4 h-4 mr-2" />
            下载
          </a>
        </div>
      ))}
    </div>
  );
}
