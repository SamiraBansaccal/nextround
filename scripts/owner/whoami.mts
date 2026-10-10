// Lists the app's accounts (Neon Auth) with their providers and number of rows, and which one is the owner.
// Prints no secret and no email address. Usage: npm run owner:whoami
import { neon } from "@neondatabase/serverless";
import "./owner.mjs"; // loads the env files and checks the variables

const sql = neon((process.env.DATABASE_URL || process.env.DB_CONNECTION_STRING)!);
const users = await sql`select u.id, u."createdAt" as created,
    (select string_agg(a."providerId", ',' order by a."providerId") from neon_auth.account a where a."userId" = u.id) as providers,
    (select a."accountId" from neon_auth.account a where a."userId" = u.id and a."providerId" = 'github' limit 1) as github_id
  from neon_auth."user" u order by u."createdAt"`;
for (const u of users) {
  const [counts] = await sql`select
    (select count(*) from profile_facts where user_id = ${u.id}) as facts,
    (select count(*) from sources where user_id = ${u.id}) as sources,
    (select count(*) from offers where user_id = ${u.id}) as offers,
    (select count(*) from interviews where user_id = ${u.id}) as interviews`;
  const isOwner = !!u.github_id && u.github_id === process.env.OWNER_GITHUB_ID;
  console.log(JSON.stringify({ id: u.id, providers: u.providers, isOwner, created: new Date(u.created).toISOString().slice(0, 10), ...counts }));
}
