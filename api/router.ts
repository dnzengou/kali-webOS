import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { fileRouter } from "./routers/file";
import { noteRouter } from "./routers/note";
import { todoRouter } from "./routers/todo";
import { eventRouter } from "./routers/event";
import { bookmarkRouter } from "./routers/bookmark";
import { contactRouter } from "./routers/contact";
import { passwordRouter } from "./routers/password";
import { scoreRouter } from "./routers/score";
import { agentRouter } from "./routers/agent";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  file: fileRouter,
  note: noteRouter,
  todo: todoRouter,
  event: eventRouter,
  bookmark: bookmarkRouter,
  contact: contactRouter,
  password: passwordRouter,
  score: scoreRouter,
  agent: agentRouter,
});

export type AppRouter = typeof appRouter;
