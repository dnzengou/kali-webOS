import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { contacts } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const contactRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(contacts).where(eq(contacts.userId, ctx.user.id)).orderBy(desc(contacts.createdAt));
  }),

  create: authedQuery
    .input(z.object({
      name: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      contactGroup: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [c] = await db.insert(contacts).values({
        userId: ctx.user.id,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        company: input.company || null,
        contactGroup: input.contactGroup || "other",
      });
      return { id: Number(c.insertId), ...input, userId: ctx.user.id };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(contacts).where(eq(contacts.id, input.id));
      return true;
    }),
});
