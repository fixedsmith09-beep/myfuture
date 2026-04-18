import { cookies } from "next/headers";
import AdminClient from "./AdminClient";
import AdminLogin from "./AdminLogin";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("admin-auth")?.value === "ok";

  if (!isAuthed) {
    return <AdminLogin />;
  }

  return <AdminClient />;
}
