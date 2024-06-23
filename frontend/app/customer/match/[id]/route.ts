import { postData } from "@/utils/api";
import { getIssue } from "@/utils/issues";

type Params = {
  id: string;
};

export type PairData = {
  pair: [CustomerAgreeableness, AgentBandwidth];
};

type CustomerAgreeableness = {
  call_id: string;
  agreeableness: number;
};

type AgentBandwidth = {
  agent_id: string;
  bandwidth: number;
};

export async function POST(request: Request, context: { params: Params }) {
  const id = context.params.id;
  const issue = getIssue(id);
  if (!issue) {
    return new Response("Not Found", { status: 404 });
  }
  const result = await postData(
    `${process.env.NEXT_PUBLIC_AGREEABLE_API_URL}/expressions`,
    {
      id,
      messages: issue?.messages,
    }
  );
  if (!result.ok) {
    return new Response("Agreeable API failed", { status: 500 });
  }
  const { pair }: PairData = await result.json();
  return new Response(JSON.stringify({ pair }), { status: 200 });
}
