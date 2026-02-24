import { Metadata } from "next";
import { ServerStatusPanel } from "@/components/dashboard/panels/server-status/server-status-panel";

export const metadata: Metadata = {
	title: "Metrics & Traces",
};

export default function ServerStatusPage() {
	return <ServerStatusPanel />;
}
