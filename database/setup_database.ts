import { Database } from 'bun:sqlite';
import { readFile } from 'node:fs/promises';
  
const db = new Database("./sql/data.db");

// Setup database definition
const definitions = await readFile('./sql/definition.sql', { encoding: "utf8" });
console.log(definitions);
db.run(definitions);
