import { Database } from 'bun:sqlite';
import { readFile } from 'node:fs/promises';
  
async function setup_database() {
    const file_content = await readFile('./definition.sql', { encoding: "utf8" });
    const db = new Database("data.db");
    db.run(file_content);
}
