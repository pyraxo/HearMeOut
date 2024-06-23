import { useVoice } from "@humeai/voice-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Phone } from "lucide-react";

export default function StartCall() {
  const { status, connect } = useVoice();

  return (
    <AnimatePresence>
      {status.value !== "connected" ? (
        <motion.div
          className={
            "fixed inset-0 p-4 flex items-center justify-center bg-background"
          }
          initial="initial"
          animate="enter"
          exit="exit"
          variants={{
            initial: { opacity: 0 },
            enter: { opacity: 1 },
            exit: { opacity: 0 },
          }}
        >
          <AnimatePresence>
            <motion.div
              variants={{
                initial: { scale: 0.5 },
                enter: { scale: 1 },
                exit: { scale: 0.5 },
              }}
            >
              <div
                className="flex flex-col justify-center items-center gap-4"
                key={"container"}
              >
                <h1 className="text-3xl font-semibold">
                  Whamazon Customer Service
                </h1>
                <h2 className="text-lg text-center pb-8">
                  Start a call with our friendly customer service team!
                </h2>
                <Button
                  className={"z-50 flex items-center gap-1.5"}
                  onClick={() => {
                    connect()
                      .then(() => {})
                      .catch(() => {})
                      .finally(() => {});
                  }}
                >
                  <span>
                    <Phone
                      className={"size-4 opacity-50"}
                      strokeWidth={2}
                      stroke={"currentColor"}
                    />
                  </span>
                  <span>Start Call</span>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
