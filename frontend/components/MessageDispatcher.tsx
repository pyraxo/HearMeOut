"use client";

import { useVoice } from "@humeai/voice-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RedirectPayload } from "./Chat";
import { postData } from "@/utils/api";

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

  const createIssue = async () => {
    const messagesPayload = messages.filter(
      (message) => message.type === "user_message"
    );
    if (messagesPayload.length === 0) return;
    await postData(`/issue/${userId}`, {
      messages: messagesPayload,
      summary: redirectDept.issue_summary,
      category: redirectDept.category,
    });
  };

  useEffect(() => {
    const { category, issue_summary } = redirectDept;
    if (!category || !issue_summary) return;
    if (toArchive) {
      createIssue().then(() => {
        setTimeout(() => {
          disconnect();
          router.push(`/customer/${userId}`);
        }, 2000);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toArchive, redirectDept]);

  return <></>;
}
