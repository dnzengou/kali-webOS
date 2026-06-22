import { getDb } from "../api/queries/connection";
import * as schema from "./schema";
void schema;

async function seed() {
  const _db = getDb();
  void _db;
  console.log("Seeding database...");

  // TODO: insert seed data, e.g.
  // await db.insert(schema.posts).values([
  //   { title: "First post", content: "Hello world" },
  // ]);

  console.log("Done.");
  process.exit(0); // close MySQL connection pool
}

seed();
