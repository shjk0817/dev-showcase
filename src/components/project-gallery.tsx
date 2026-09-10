// 项目截图画廊，支持灯箱预览
"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Shot = { id: string; url: string; caption?: string | null };

/** 渲染截图网格与灯箱 */
export function ProjectGallery({ shots }: { shots: Shot[] }) {
  const [active, setActive] = useState<string | null>(null);
  const current = shots.find((s) => s.url === active);
  if (!shots.length) {
    return <p className="text-muted-foreground py-8 text-center">暂无截图</p>;
  }
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {shots.map((shot) => (
          <button
            key={shot.id}
            type="button"
            className="relative aspect-video rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            onClick={() => setActive(shot.url)}
          >
            <Image src={shot.url} alt={shot.caption ?? "截图"} fill className="object-cover" />
          </button>
        ))}
      </div>
      <Dialog open={!!active} onOpenChange={() => setActive(null)}>
        <DialogContent className="max-w-4xl">
          {current && (
            <div className="relative aspect-video">
              <Image src={current.url} alt={current.caption ?? "截图"} fill className="object-contain" />
            </div>
          )}
          {current?.caption && <p className="text-sm text-center mt-2">{current.caption}</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}
