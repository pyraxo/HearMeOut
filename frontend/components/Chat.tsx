"use client";

import { generateId } from "@/utils/generateId";
import { ToolCall, VoiceProvider } from "@humeai/voice-react";
import { ComponentRef, useRef, useState } from "react";
import { z } from "zod";
import Controls from "./Controls";
import MessageDispatcher from "./MessageDispatcher";
import Messages from "./Messages";
import StartCall from "./StartCall";

export type RedirectPayload = {
  category: string | null;
  issue_summary: string | null;
};

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);
  const [redirectDept, setRedirectDept] = useState<RedirectPayload>({
    category: null,
    issue_summary: null,
  });
  const [toArchive, setToArchive] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");

  return (
    <div
      className={
        "relative grow flex flex-col mx-auto w-full overflow-hidden h-[0px]"
      }
    >
      <VoiceProvider
        auth={{ type: "accessToken", value: accessToken }}
        configId={process.env.NEXT_PUBLIC_HUME_CONFIG_ID}
        onOpen={() => setUserId(generateId())}
        onMessage={() => {
          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          timeout.current = window.setTimeout(() => {
            if (ref.current) {
              const scrollHeight = ref.current.scrollHeight;

              ref.current.scrollTo({
                top: scrollHeight,
                behavior: "smooth",
              });
            }
          }, 200);
        }}
        onToolCall={async (toolCall: ToolCall, response) => {
          if (toolCall.name === "redirect_to_agent") {
            try {
              const args = z
                .object({
                  category: z.enum([
                    "Returns and Refunds",
                    "Payment",
                    "Shipment Tracking",
                  ]),
                  issue_summary: z.string(),
                })
                .safeParse(JSON.parse(toolCall.parameters));

              if (!args.success) {
                throw new Error(
                  "Redirect tool response did not match the expected schema"
                );
              }

              const { category, issue_summary } = args.data;
              setRedirectDept({ category, issue_summary });
              setToArchive(true);
              return response.success({
                content: "[STOP]",
              });
            } catch (err) {
              return response.error({
                error: "Redirect to agent tool error",
                code: "redirect_to_agent_error",
                level: "error",
                content: "There was an error with redirecting to an agent",
              });
            }
          } else {
            return response.error({
              error: "Tool not found",
              code: "tool_not_found",
              level: "warning",
              content: "The tool you requested was not found",
            });
          }
        }}
        onClose={(event) => {
          const niceClosure = 1000;
          const code = event.code;

          if (code !== niceClosure) {
            // eslint-disable-next-line no-console
            console.error("close event was not nice", event);
          }
        }}
      >
        <MessageDispatcher
          toArchive={toArchive}
          redirectDept={redirectDept}
          userId={userId}
        />
        <Messages ref={ref} />
        <Controls />
        <StartCall />
      </VoiceProvider>
    </div>
  );
}
