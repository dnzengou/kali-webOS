import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { events } from "@db/schema";
import { eq, and, like } from "drizzle-orm";

export const eventRouter = createRouter({
  list: authedQuery
    .input(z.object({ month: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      return db.select().from(events).where(
        and(eq(events.userId, ctx.user.id), like(events.eventDate, `${input.month}%`))
      );
    }),

  create: authedQuery
    .input(z.object({
      title: z.string().min(1),
      eventDate: z.string(),
      eventTime: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [event] = await db.insert(events).values({
        userId: ctx.user.id,
        title: input.title,
        eventDate: new Date(input.eventDate),
        eventTime: input.eventTime || null,
      });
      return { id: Number(event.insertId), ...input, userId: ctx.user.id };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(events).where(eq(events.id, input.id));
      return true;
    }),
});
