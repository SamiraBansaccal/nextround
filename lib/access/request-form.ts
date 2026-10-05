import { z } from "zod";

// What the public "Request access" form may send. Pure (tests/access/access-requests.test.ts).
export const accessRequestSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  name: z.string().trim().max(80).default(""),
  message: z.string().trim().max(500).default(""),
  website: z.string().max(200).default(""), // honeypot: hidden from people, filled in by robots
});
export type AccessRequest = z.infer<typeof accessRequestSchema>;
