import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { files } from "@db/schema";
import { eq, and, isNull } from "drizzle-orm";

export const fileRouter = createRouter({
  list: authedQuery
    .input(z.object({ parentId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const parentId = input?.parentId;
      if (parentId) {
        return db.select().from(files).where(
          and(eq(files.userId, ctx.user.id), eq(files.parentId, parentId))
        );
      }
      return db.select().from(files).where(
        and(eq(files.userId, ctx.user.id), isNull(files.parentId))
      );
    }),

  create: authedQuery
    .input(z.object({
      name: z.string().min(1).max(255),
      type: z.enum(["file", "folder"]),
      parentId: z.number().optional(),
      content: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const path = input.parentId
        ? `${input.parentId}/${input.name}`
        : `/${input.name}`;
      const [file] = await db.insert(files).values({
        userId: ctx.user.id,
        name: input.name,
        type: input.type,
        parentId: input.parentId,
        content: input.content || "",
        path,
        size: input.content ? input.content.length : 0,
      });
      return { id: Number(file.insertId), ...input, userId: ctx.user.id, path, size: input.content?.length || 0 };
    }),

  read: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.select().from(files).where(
        and(eq(files.id, input.id), eq(files.userId, ctx.user.id))
      );
      return result[0] || null;
    }),

  update: authedQuery
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      content: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(files).set({
        name: input.name,
        content: input.content,
        updatedAt: new Date(),
      }).where(and(eq(files.id, input.id), eq(files.userId, ctx.user.id)));
      const { id, ...rest } = input;
      return { id, ...rest };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(files).where(
        and(eq(files.id, input.id), eq(files.userId, ctx.user.id))
      );
      return true;
    }),
});
