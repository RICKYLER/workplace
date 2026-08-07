import { getChatGPTUser } from "../chatgpt-auth";
import WorkspaceApp from "../workspace-app";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getChatGPTUser();
  return <WorkspaceApp authenticatedName={user?.displayName ?? null} />;
}
