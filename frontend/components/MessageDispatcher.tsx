"use client";

import { useVoice } from "@humeai/voice-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RedirectPayload } from "./Chat";

const namesToRoutes: { [key: string]: string } = {
  "Returns and Refunds": "/customer/returns",
  Payment: "/customer/payment",
  "Shipment Tracking": "/customer/shipment",
};

export default function MessageDispatcher({
  userId,
  toArchive,
  redirectDept,
}: {
  userId: string;
  toArchive: boolean;
  redirectDept: RedirectPayload;
}) {
  const { disconnect, messages } = useVoice();
  const router = useRouter();

  const sendMessages = async () => {
    const messagesPayload = messages.filter(
      (message) => message.type === "user_message"
    );
    if (messagesPayload.length === 0) return;
    await fetch(`/issue/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messagesPayload,
        summary: redirectDept.issue_summary,
        category: redirectDept.category,
      }),
    });
    console.log({
      id: userId,
      messages: messagesPayload,
    });
  };

  useEffect(() => {
    const { category, issue_summary } = redirectDept;
    if (!category || !issue_summary) return;
    if (toArchive) {
      setTimeout(() => {
        disconnect();
        router.push(
          `${namesToRoutes[category]}?${new URLSearchParams({
            issue: issue_summary,
          })}`
        );
      }, 1000);
      sendMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toArchive, redirectDept]);

  return <></>;
}
