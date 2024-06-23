export type IssuePayload = {
  summary: string;
  category: string;
  messages: any[];
  agentId?: string;
};

export const issues = new Map<string, IssuePayload>();

export function getIssue(userId: string) {
  return issues.get(userId);
}

export function setIssue(userId: string, issue: IssuePayload) {
  issues.set(userId, issue);
}

export function deleteIssue(userId: string) {
  issues.delete(userId);
}

export function updateIssue(userId: string, issue: Partial<IssuePayload>) {
  const currentIssue = issues.get(userId);
  if (!currentIssue) return;
  issues.set(userId, { ...currentIssue, ...issue });
}
