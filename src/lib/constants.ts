// 站点常量与标签映射
export const FEEDBACK_TYPES = [
  { value: "issue", label: "问题反馈" },
  { value: "suggestion", label: "改进建议" },
  { value: "feedback", label: "一般意见" },
] as const;

export const FEEDBACK_STATUS = [
  { value: "open", label: "待处理" },
  { value: "in_progress", label: "处理中" },
  { value: "resolved", label: "已解决" },
  { value: "closed", label: "已关闭" },
] as const;

export const PROJECT_STATUS = [
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
] as const;

/** 获取反馈类型中文标签 */
export function getFeedbackTypeLabel(type: string): string {
  return FEEDBACK_TYPES.find((t) => t.value === type)?.label ?? type;
}

/** 获取反馈状态中文标签 */
export function getFeedbackStatusLabel(status: string): string {
  return FEEDBACK_STATUS.find((s) => s.value === status)?.label ?? status;
}

/** 获取项目状态中文标签 */
export function getProjectStatusLabel(status: string): string {
  return PROJECT_STATUS.find((s) => s.value === status)?.label ?? status;
}
