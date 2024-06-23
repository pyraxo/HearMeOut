type AgentMatchPayload = {
  id: string;
  agreeableness: number;
};

export async function GET(request: Request) {
  const { id, agreeableness }: AgentMatchPayload = await request.json();
  if (!id || !agreeableness) {
    return new Response("Invalid request", { status: 400 });
  }

  try {
    const matchResult = await fetch(
      `${process.env.NEXT_PUBLIC_MATCH_API_URL}/match`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: id,
          agreeableness,
        }),
      }
    );
    if (!matchResult.ok) {
      return new Response("Match API failed", { status: 500 });
    }
    const { match } = await matchResult.json();
    return new Response(JSON.stringify({ match }), { status: 200 });
  } catch (err) {
    console.error(err);
  }
}
