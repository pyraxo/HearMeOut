"use client";

import AgentCall from "@/components/AgentCall";
import { useEffect, useState } from "react";
import SyncLoader from "react-spinners/SyncLoader";

export default function CustomerLobby({ params }: { params: { id: string } }) {
  const [issue, setIssue] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);

  const getIssue = async () => {
    const response = await fetch(`/issue/${params.id}`);
    if (!response.ok) {
      return;
    }
    const issue = await response.json();
    setIssue(issue.summary);
    setCategory(issue.category);
  };

  useEffect(() => {
    if (!issue || !category) return;
  }, [issue, category]);

  useEffect(() => {
    getIssue();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center p-12">
      <SyncLoader size={16} aria-label="Loading" />
      <p>{issue ? `Issue: ${issue}` : "Loading issue..."}</p>
      <p>{category ? `Category: ${category}` : "Loading category..."}</p>
      <p>id: {params.id}</p>
      <AgentCall userId={params.id} incomingId={agentId ?? ""} />
    </div>
  );
}
