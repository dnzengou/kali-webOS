import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { notes } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const noteRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(notes).where(eq(notes.userId, ctx.user.id)).orderBy(desc(notes.pinned), desc(notes.updatedAt));
  }),

  create: authedQuery
    .input(z.object({
      title: z.string().min(1),
      content: z.string().default(""),
      pinned: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [note] = await db.insert(notes).values({
        userId: ctx.user.id,
        title: input.title,
        content: input.content,
        pinned: input.pinned || false,
      });
      return { id: Number(note.insertId), ...input, userId: ctx.user.id };
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string().optional(),
      pinned: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(notes).set({ ...updates, updatedAt: new Date() })
        .where(eq(notes.id, id));
      return { id, ...updates };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(notes).where(eq(notes.id, input.id));
      return true;
    }),
});
