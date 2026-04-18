import { cookies } from "next/headers";
import AccessGate from "./AccessGate";
import AnalyzeClient from "./AnalyzeClient";

export default async function AnalyzePage() {
  const cookieStore = await cookies();
  const hasAccess = cookieStore.get("paid-access")?.value === "ok";

  if (!hasAccess) {
    return <AccessGate />;
  }

  return <AnalyzeClient />;
}
