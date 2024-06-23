"use client";

import AgentCall from "@/components/AgentCall";
import { getIssue, IssuePayload } from "@/utils/issues";
import { useEffect, useState } from "react";
import SyncLoader from "react-spinners/SyncLoader";
import { PairData } from "../match/[id]/route";

export default function CustomerLobby({ params }: { params: { id: string } }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIssue = async () => {
    // const response = await fetch(`/issue/${params.id}`);
    // if (!response.ok) {
    //   return;
    // }
    // const issue = await response.json();
    const issue: IssuePayload = getIssue(params.id) ?? {
      summary: "",
      category: "",
      messages: [],
      agentId: "",
    };
    console.log(issue);
    setSummary(issue.summary);
    setCategory(issue.category);
    setAgentId(issue.agentId ?? null);
  };

  const fetchPair = async () => {
    const result = await fetch(`/customer/match/${params.id}`);
    const { pair }: PairData = await result.json();
    const [customerAgreeableness, agentBandwidth] = pair;
    console.log(customerAgreeableness, agentBandwidth);
    const { agent_id } = agentBandwidth;
    setAgentId(agent_id);
  };

  useEffect(() => {
    fetchIssue();
  }, [loading]);

  useEffect(() => {
    fetchPair();
    fetchIssue();
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
    </div>
  );
}
