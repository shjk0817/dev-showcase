// 项目内容变更后的页面缓存刷新
import { revalidatePath } from "next/cache";

/** 刷新首页、后台与项目详情页缓存 */
export function revalidateProjectPages(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}
