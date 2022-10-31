import { Database } from 'bun:sqlite';
import { readFile } from 'node:fs/promises';
  
const file_content = await readFile('./sql/definition.sql', { encoding: "utf8" });
const db = new Database("data.db");
console.log(db.run(file_content));
