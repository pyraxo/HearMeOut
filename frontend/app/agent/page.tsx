// src/app/peer/peer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import AgentCall from "@/components/AgentCall";

const repEmoji = ["🙂", "😊", "😄"];

const PeerPage = () => {
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const callingVideoRef = useRef<HTMLVideoElement>(null);
  const [callerId, setCallerId] = useState("");

  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [agentPlaceholder, setAgentPlaceholder] = useState<string>("");
  const [callPlaceholder, setCallPlaceholder] = useState<string>("");
  const [agentId, setagentId] = useState<string>("");
  const [idToCall, setIdToCall] = useState("");

  const generateRandomString = () => Math.random().toString(36).substring(2);

  // Here we declare a function to call the identifier and retrieve
  // its video stream.
  const handleCall = () => {
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
    setCallerId(callPlaceholder);
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

        navigator.mediaDevices
          .getUserMedia({
            video: false,
            audio: true,
          })
          .then((stream) => {
            peer.on("call", (call) => {
              call.answer(stream);
              call.on("stream", (userVideoStream) => {
                // if (callingVideoRef.current) {
                //   callingVideoRef.current.srcObject = userVideoStream;
                //   setCallerId(call.peer);
                // }
                setCallerId(call.peer);
              });
            });
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
    <div className="flex flex-col justify-center items-center p-12">
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
        className="text-black text-center"
        placeholder="call id"
        value={callPlaceholder}
        onChange={(e) => setCallPlaceholder(e.target.value)}
      />
      <button onClick={handleCall}>call</button>
      <AgentCall userId={agentId} incomingId={callerId} />
      {callerId && <span>{callerId} is calling</span>}
    </div>
  );
};

export default PeerPage;
