import Peer from "peerjs";
import { useEffect, useRef, useState } from "react";

export default function AgentCall({
  userId,
  incomingId,
}: {
  userId: string;
  incomingId?: string;
}) {
  const callingVideoRef = useRef<HTMLVideoElement>(null);
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);

  const handleCall = () => {
    if (!incomingId) return;
    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true,
      })
      .then((stream) => {
        const call = peerInstance?.call(incomingId, stream);
        if (call) {
          call.on("stream", (userVideoStream) => {
            if (callingVideoRef.current) {
              callingVideoRef.current.srcObject = userVideoStream;
            }
          });
        }
      });
  };

  useEffect(() => {
    if (incomingId) {
      console.log(incomingId);
      handleCall();
    }
  }, [incomingId]);

  useEffect(() => {
    if (userId) {
      let peer: Peer;
      if (typeof window !== "undefined") {
        peer = new Peer(userId, {
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
                if (callingVideoRef.current) {
                  callingVideoRef.current.srcObject = userVideoStream;
                }
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
  }, [userId]);

  return (
    <div>
      <audio ref={callingVideoRef} autoPlay />
    </div>
  );
}
