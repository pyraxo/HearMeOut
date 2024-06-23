// src/app/peer/peer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import AgentCall from "@/components/AgentCall";
import { patchData } from "@/utils/api";

const repEmoji = ["🙂", "😊", "😄"];

const PeerPage = () => {
  const [callerId, setCallerId] = useState("");

  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [agentPlaceholder, setAgentPlaceholder] = useState<string>("");
  const [callPlaceholder, setCallPlaceholder] = useState<string>("");
  const [agentId, setagentId] = useState<string>("");
  const [idToCall, setIdToCall] = useState("");

  // Here we declare a function to call the identifier and retrieve
  // its video stream.
  const handleCall = async () => {
    // navigator.mediaDevices
    //   .getUserMedia({
    //     video: false,
    //     audio: true,
    //   })
    //   .then((stream) => {
    //     const call = peerInstance?.call(idToCall, stream);
    //     if (call) {
    //       call.on("stream", (userVideoStream) => {
    //         // if (callingVideoRef.current) {
    //         //   callingVideoRef.current.srcObject = userVideoStream;
    //         //   setCallerId(idToCall);
    //         // }
    //         setCallerId(idToCall);
    //       });
    //     }
    //   });
    if (!callPlaceholder) return;
    await patchData(`/issue/${callPlaceholder}`, { agentId });
    setCallerId(callPlaceholder);
  };

  const disconnectCall = async () => {
    await patchData(`/issue/${callPlaceholder}`, { agentId: null });
    setCallerId("");
  };

  useEffect(() => {
    if (agentId) {
      let peer: Peer;
      if (typeof window !== "undefined") {
        peer = new Peer(agentId, {
          host: "localhost",
          port: 9000,
          path: "/discovery",
        });

        setPeerInstance(peer);

        peer.on("call", (call) => {
          setCallerId(call.peer);
        });
        peer.on("close", () => {
          console.log("peer closed");
          setCallerId("");
        });
        peer.on("disconnected", () => {
          console.log("peer disconnected");
          setCallerId("");
        });
      }
      return () => {
        if (peer) {
          peer.destroy();
        }
      };
    }
  }, [agentId]);

  return (
    <div className="flex flex-col justify-center items-center p-12 gap-4">
      <span className="text-9xl">😊</span>
      <p>{agentId ? `your id: ${agentId}` : "no id specified"}</p>
      {/* <audio ref={myVideoRef} autoPlay /> */}
      <input
        className="text-black text-center"
        placeholder="agent name"
        value={agentPlaceholder}
        onChange={(e) => setAgentPlaceholder(e.target.value)}
      />
      <button onClick={() => setagentId(agentPlaceholder)}>set name</button>
      <input
        className="text-black text-center rounded-sm"
        placeholder="call id"
        value={callPlaceholder}
        onChange={(e) => setCallPlaceholder(e.target.value)}
      />
      <button onClick={callerId ? disconnectCall : handleCall}>
        {callerId ? "disconnect" : "connect"}
      </button>
      <AgentCall userId={agentId} incomingId={callerId} />
      {callerId && <span>{callerId} is calling</span>}
    </div>
  );
};

export default PeerPage;
