import { getIssue, IssuePayload, setIssue, updateIssue } from "@/utils/issues";

type Params = {
  id: string;
};

type AgentAssignPayload = {
  agentId: string;
};

export async function POST(request: Request, context: { params: Params }) {
  const body: IssuePayload = await request.json();
  const userId = context.params.id;

  setIssue(userId, {
    summary: body.summary,
    category: body.category,
    messages: body.messages,
  });
  return new Response(JSON.stringify({}), { status: 200 });
}

export async function GET(_request: Request, context: { params: Params }) {
  const userId = context.params.id;
  const issue = getIssue(userId);
  if (!issue) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(JSON.stringify(issue), { status: 200 });
}

export async function PATCH(request: Request, context: { params: Params }) {
  const body: AgentAssignPayload = await request.json();
  const userId = context.params.id;

  updateIssue(userId, { agentId: body.agentId });
  const issue = getIssue(userId);
  return new Response(JSON.stringify(issue), { status: 200 });
}
