import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { todos } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const todoRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(todos).where(eq(todos.userId, ctx.user.id)).orderBy(desc(todos.createdAt));
  }),

  create: authedQuery
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [todo] = await db.insert(todos).values({
        userId: ctx.user.id,
        text: input.text,
      });
      return { id: Number(todo.insertId), ...input, userId: ctx.user.id, completed: false };
    }),

  toggle: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(todos)
        .where(eq(todos.id, input.id));
      if (!existing[0]) throw new Error("Todo not found");
      const newCompleted = !existing[0].completed;
      await db.update(todos).set({ completed: newCompleted })
        .where(eq(todos.id, input.id));
      return { ...existing[0], completed: newCompleted };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(todos).where(eq(todos.id, input.id));
      return true;
    }),
});
