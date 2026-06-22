import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { scores, users } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";

export const scoreRouter = createRouter({
  create: authedQuery
    .input(z.object({
      game: z.string(),
      score: z.number(),
      difficulty: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [s] = await db.insert(scores).values({
        userId: ctx.user.id,
        game: input.game,
        score: input.score,
        difficulty: input.difficulty || "normal",
      });
      return { id: Number(s.insertId), ...input, userId: ctx.user.id };
    }),

  leaderboard: publicQuery
    .input(z.object({ game: z.string(), limit: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select({
        id: scores.id,
        game: scores.game,
        score: scores.score,
        difficulty: scores.difficulty,
        createdAt: scores.createdAt,
        userName: users.name,
      })
        .from(scores)
        .leftJoin(users, eq(scores.userId, users.id))
        .where(eq(scores.game, input.game))
        .orderBy(desc(scores.score))
        .limit(input.limit);
    }),

  myScores: authedQuery
    .input(z.object({ game: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      if (input.game) {
        return db.select().from(scores)
          .where(and(eq(scores.userId, ctx.user.id), eq(scores.game, input.game)))
          .orderBy(desc(scores.score));
      }
      return db.select().from(scores)
        .where(eq(scores.userId, ctx.user.id))
        .orderBy(desc(scores.score));
    }),
});
