"use client";
import Peer, { MediaConnection } from "peerjs";
import { useEffect, useRef, useState } from "react";

export default function AgentCallClient({
  userId,
  incomingId,
  onStart,
  onStop,
}: {
  userId: string;
  incomingId?: string;
  onStart?: () => void;
  onStop?: () => void;
}) {
  const callingVideoRef = useRef<HTMLVideoElement>(null);
  const callRef = useRef<MediaConnection | null>(null);
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);

  const handleCall = () => {
    if (!incomingId) return;
    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true,
      })
      .then(async (stream) => {
        const RecordRTC = (await import("recordrtc")).default;
        const call = peerInstance?.call(incomingId, stream);
        if (call) {
          const recorder = new RecordRTC.RecordRTCPromisesHandler(stream, {
            type: "audio",
            recorderType: RecordRTC.StereoAudioRecorder,
          });
          call.on("stream", (userVideoStream) => {
            if (callingVideoRef.current) {
              callingVideoRef.current.srcObject = userVideoStream;
              recorder.startRecording();
            }
          });
          call.on("close", () => {
            if (callingVideoRef.current) {
              callingVideoRef.current.srcObject = null;
              callRef.current?.close();
              callRef.current = null;
              if (onStop) onStop();
              recorder.stopRecording();
              recorder.getDataURL().then((data: string) => {
                console.log(data);
              });
            }
          });
          callRef.current = call;
        }
      });
  };

  useEffect(() => {
    if (incomingId) {
      console.log(incomingId);
      handleCall();
    } else {
      if (callingVideoRef.current) {
        callingVideoRef.current.srcObject = null;
        callRef.current?.close();
        callRef.current = null;
        if (onStop) onStop();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  if (onStart) onStart();
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
