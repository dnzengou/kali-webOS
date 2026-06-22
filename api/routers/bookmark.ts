import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { bookmarks } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const bookmarkRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(bookmarks).where(eq(bookmarks.userId, ctx.user.id)).orderBy(desc(bookmarks.createdAt));
  }),

  create: authedQuery
    .input(z.object({
      title: z.string().min(1),
      url: z.string().min(1),
      folder: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [bm] = await db.insert(bookmarks).values({
        userId: ctx.user.id,
        title: input.title,
        url: input.url,
        folder: input.folder || "uncategorized",
      });
      return { id: Number(bm.insertId), ...input, userId: ctx.user.id };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(bookmarks).where(eq(bookmarks.id, input.id));
      return true;
    }),
});
