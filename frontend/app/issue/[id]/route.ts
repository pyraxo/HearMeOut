type Params = {
  id: string;
};

type IssuePayload = {
  messages: any[];
  summary: string;
  category: string;
};

type IssueDetails = {
  summary: string;
  category: string;
};

const issues = new Map<string, IssueDetails>();

export async function POST(request: Request, context: { params: Params }) {
  const body: IssuePayload = await request.json();
  const userId = context.params.id;
  // await fetch(`${process.env.NEXT_PUBLIC_AGREEABLE_API_URL}/messages`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     id: userId,
  //     messages,
  //   }),
  // });
  issues.set(userId, {
    summary: body.summary,
    category: body.category,
  });
  return new Response("OK", { status: 200 });
}

export async function GET(_request: Request, context: { params: Params }) {
  const userId = context.params.id;
  const issue = issues.get(userId);
  if (!issue) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(JSON.stringify(issue), { status: 200 });
}
