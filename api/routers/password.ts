import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { passwords } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { encrypt, decrypt } from "../lib/crypto";

export const passwordRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select().from(passwords).where(eq(passwords.userId, ctx.user.id)).orderBy(desc(passwords.createdAt));
    return rows.map((r) => ({
      ...r,
      password: decrypt(r.password),
      username: r.username ? decrypt(r.username) : null,
      notes:    r.notes    ? decrypt(r.notes)    : null,
    }));
  }),

  create: authedQuery
    .input(z.object({
      site: z.string().min(1),
      username: z.string().optional(),
      password: z.string().min(1),
      url: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [p] = await db.insert(passwords).values({
        userId:   ctx.user.id,
        site:     input.site,
        username: input.username ? encrypt(input.username) : null,
        password: encrypt(input.password),
        url:      input.url || null,
        notes:    input.notes ? encrypt(input.notes) : null,
      });
      return { id: Number(p.insertId), ...input, userId: ctx.user.id };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(passwords).where(eq(passwords.id, input.id));
      return true;
    }),
});
