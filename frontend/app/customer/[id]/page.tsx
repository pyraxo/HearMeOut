"use client";

import AgentCall from "@/components/AgentCall";
import { getIssue, IssuePayload } from "@/utils/issues";
import { useEffect, useState } from "react";
import SyncLoader from "react-spinners/SyncLoader";
import { PairData } from "../match/[id]/route";
import { getData } from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerLobby({ params }: { params: { id: string } }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const fetchIssue = async () => {
    // const response = await fetch(`/issue/${params.id}`);
    // if (!response.ok) {
    //   return;
    // }
    // const issue = await response.json();
    // const issue: IssuePayload = getIssue(params.id) ?? {
    //   summary: "",
    //   category: "",
    //   messages: [],
    //   agentId: "",
    // };
    // console.log(issue);
    // setSummary(issue.summary);
    // setCategory(issue.category);
    // setAgentId(issue.agentId ?? null);
  };

  const fetchPair = async () => {
    const issue = JSON.parse(localStorage.getItem(params.id) ?? "");
    console.log("im sending", { id: params.id, messages: issue.messages });
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_AGREEABLE_API_URL}/expressions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: params.id, messages: issue.messages }),
      }
    );
    console.log(result);
    const data = await result.json();
    console.log(data);
    const { score } = data;
    const pairResult = await fetch(
      `${process.env.NEXT_PUBLIC_MATCHING_API_URL}/match`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ call_id: params.id, agreeableness: score }),
      }
    );
    console.log("pair result", pairResult);
    const { pair } = await pairResult.json();
    console.log("pair", pair);
    const customerAgreeableness = pair[0];
    const agentBandwidth = pair[1];
    const { representative_id } = agentBandwidth;
    console.log(representative_id);
    setSummary(issue.summary);
    setCategory(issue.category);
    setAgentId(representative_id);
    setLoading(false);
    if (representative_id === "3" || representative_id === "4") {
      // router.push(`tel:+15109444998`);
      window.open("tel:+15109444998");
    } else if (representative_id === "1" || representative_id === "2") {
      // router.push(`tel:+13412379056`);
      window.open("tel:+13412379056");
    }
  };

  useEffect(() => {
    fetchIssue();
  }, [loading]);

  useEffect(() => {
    fetchIssue();
    fetchPair();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col justify-center items-center p-12 gap-4 h-screen">
      {loading && <SyncLoader size={16} aria-label="Loading" />}
      <p>{summary ? `Issue: ${summary}` : "Loading issue..."}</p>
      <p>{category ? `Category: ${category}` : "Loading category..."}</p>
      <p>id: {params.id}</p>
      {agentId && <p>Agent ID: {agentId}</p>}
      <AgentCall
        userId={params.id}
        incomingId=""
        onStart={() => setLoading(false)}
        onStop={() => setLoading(true)}
      />
      {/* {agentId && (agentId === "3" || agentId === "4") ? (
        <Link href={`tel:+15109444998`}></Link>
      ) : (
        <Link href={"tel:+13412379056"}></Link>
      )} */}
    </div>
  );
}
