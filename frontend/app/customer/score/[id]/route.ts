type AgreeablenessPayload = {
  id: string;
  messages: any[];
};

export async function GET(request: Request) {
  const { id, messages }: AgreeablenessPayload = await request.json();
  try {
    const agreeableResult = await fetch(
      `${process.env.NEXT_PUBLIC_AGREEABLE_API_URL}/expressions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, messages }),
      }
    );
    if (!agreeableResult.ok) {
      return new Response("Agreeable API failed", { status: 500 });
    }
    const { agreeableness } = await agreeableResult.json();
    return new Response(JSON.stringify({ agreeableness }), { status: 200 });
  } catch (err) {
    console.error(err);
  }
}
