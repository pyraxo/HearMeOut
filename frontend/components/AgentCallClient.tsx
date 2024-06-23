import dynamic from "next/dynamic";

const AgentCallClient = dynamic(() => import("./AgentCall"), { ssr: false });

export default AgentCallClient;
