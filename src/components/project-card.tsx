// 项目卡片组件，用于首页展示
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { materialCardHover } from "@/lib/material";

type ProjectCardProps = {
  title: string;
  slug: string;
  description: string;
  category: string;
  coverUrl?: string | null;
};

/** 渲染单个项目卡片 */
export function ProjectCard({ title, slug, description, category, coverUrl }: ProjectCardProps) {
  return (
    <Link href={`/projects/${slug}`} className="group block cursor-pointer">
      <Card
        className={`h-full gap-0 py-0 ${materialCardHover} transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl`}
      >
        <div className="aspect-video bg-slate-100 relative overflow-hidden">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">暂无封面</div>
          )}
        </div>
        <CardHeader className="pb-2 pt-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1 transition-colors group-hover:text-blue-600">
              {title}
            </CardTitle>
            <Badge variant="secondary" className="cursor-pointer">
              {category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4 cursor-pointer">
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
