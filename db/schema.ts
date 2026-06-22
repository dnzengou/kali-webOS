import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  bigint,
  date,
  time,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const files = mysqlTable("files", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  content: text("content"),
  type: mysqlEnum("type", ["file", "folder"]).default("file").notNull(),
  size: int("size").default(0),
  parentId: bigint("parentId", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const notes = mysqlTable("notes", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  pinned: boolean("pinned").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const todos = mysqlTable("todos", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  text: varchar("text", { length: 500 }).notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const events = mysqlTable("events", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  eventDate: date("eventDate").notNull(),
  eventTime: time("eventTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const bookmarks = mysqlTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url").notNull(),
  folder: varchar("folder", { length: 100 }).default("uncategorized"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contacts = mysqlTable("contacts", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  contactGroup: varchar("contactGroup", { length: 100 }).default("other"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const passwords = mysqlTable("passwords", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  site: varchar("site", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  url: text("url"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const scores = mysqlTable("scores", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  game: varchar("game", { length: 50 }).notNull(),
  score: int("score").notNull(),
  difficulty: varchar("difficulty", { length: 20 }).default("normal"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agentSessions = mysqlTable("agent_sessions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  agentType: mysqlEnum("agentType", ["builder", "security", "deployer", "monitor", "optimizer"]).default("builder").notNull(),
  status: mysqlEnum("status", ["running", "paused", "completed", "failed"]).default("running").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agentRuns = mysqlTable("agent_runs", {
  id: serial("id").primaryKey(),
  sessionId: bigint("sessionId", { mode: "number", unsigned: true }).notNull(),
  stepType: mysqlEnum("stepType", ["think", "tool_call", "spawn_agent", "final_answer", "error"]).notNull(),
  content: text("content").notNull(),
  toolName: varchar("toolName", { length: 100 }),
  toolResult: text("toolResult"),
  stepOrder: int("stepOrder").notNull(),
  latencyMs: int("latencyMs").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pipelines = mysqlTable("pipelines", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  stages: text("stages").notNull(),
  status: mysqlEnum("status", ["idle", "running", "completed", "failed"]).default("idle").notNull(),
  currentStage: int("currentStage").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
