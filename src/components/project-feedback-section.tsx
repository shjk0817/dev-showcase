// 反馈 Tab：表单 + 公开列表
"use client";

import { FeedbackForm } from "@/components/feedback-form";
import { ProjectFeedbackList } from "@/components/project-feedback-list";
import { materialPanel } from "@/lib/material";
import { cn } from "@/lib/utils";

type Attachment = {
  id: string;
  name: string;
  fileUrl: string;
  mimeType: string;
};

type FeedbackItem = {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
  attachments: Attachment[];
};

type Props = {
  projectId: string;
  feedbacks: FeedbackItem[];
};

/** 项目反馈区块（表单与列表） */
export function ProjectFeedbackSection({ projectId, feedbacks }: Props) {
  return (
    <>
      <div className={cn(materialPanel)}>
        <FeedbackForm projectId={projectId} />
      </div>
      <ProjectFeedbackList items={feedbacks} />
    </>
  );
}
