// Lists the app's accounts with their number of rows, and which one is the owner. Prints no secret.
// Usage: npm run owner:whoami
import { createClerkClient } from "@clerk/backend";
import { neon } from "@neondatabase/serverless";
import "./owner.mjs";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const { data: users } = await clerk.users.getUserList({ limit: 100 });
const owner = process.env.OWNER_GITHUB_LOGIN!.toLowerCase();
const sql = neon(process.env.DB_CONNECTION_STRING!);
for (const u of users) {
  const gh = u.externalAccounts.find((a) => a.provider.includes("github"))?.username ?? null;
  const [counts] = await sql`select
    (select count(*) from profile_facts where user_id = ${u.id}) as facts,
    (select count(*) from profile_facts where user_id = ${u.id} and validated) as validated,
    (select count(*) from sources where user_id = ${u.id}) as sources,
    (select count(*) from offers where user_id = ${u.id}) as offers,
    (select count(*) from interviews where user_id = ${u.id}) as interviews`;
  console.log(JSON.stringify({ id: u.id, github: gh, isOwner: gh?.toLowerCase() === owner, created: new Date(u.createdAt).toISOString().slice(0, 10), ...counts }));
}
