// 项目视频列表，支持嵌入与本地视频
type VideoItem = { id: string; title: string; url: string; type: string };

/** 判断是否为 B 站或 YouTube 嵌入链接 */
function getEmbedUrl(url: string): string | null {
  const bili = url.match(/bilibili\.com\/video\/(BV[\w]+)/);
  if (bili) return `//player.bilibili.com/player.html?bvid=${bili[1]}&high_quality=1`;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  return null;
}

/** 渲染视频列表 */
export function VideoList({ items }: { items: VideoItem[] }) {
  if (!items.length) {
    return <p className="text-muted-foreground py-8 text-center">暂无视频</p>;
  }
  return (
    <div className="space-y-6">
      {items.map((item) => {
        const embed = item.type === "embed" ? getEmbedUrl(item.url) : null;
        return (
          <div key={item.id}>
            <h3 className="font-medium mb-2">{item.title}</h3>
            {embed ? (
              <div className="aspect-video rounded-lg overflow-hidden border">
                <iframe src={embed} className="w-full h-full" allowFullScreen title={item.title} />
              </div>
            ) : (
              <video src={item.url} controls className="w-full rounded-lg border" />
            )}
          </div>
        );
      })}
    </div>
  );
}
