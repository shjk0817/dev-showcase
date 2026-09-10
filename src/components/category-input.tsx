"use client";
// 项目分类输入：可选择已有分类或输入自定义名称
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  categories: string[];
  onChange: (value: string) => void;
};

/** 分类选择/自定义输入 */
export function CategoryInput({ value, categories, onChange }: Props) {
  const listId = "project-category-options";

  return (
    <div className="space-y-1">
      <Input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="选择已有分类或输入新分类"
      />
      <datalist id={listId}>
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <p className="text-xs text-muted-foreground">可从下拉列表选择，也可直接输入自定义分类名</p>
    </div>
  );
}
