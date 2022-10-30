import { Database } from 'bun:sqlite';
import { open } from 'node:fs/promises';
  
function setup_database() {
    const file = await open('./definition.sql');
    const db = new Database("data.db");
    console.log(
        db.run(file.readFile("utf8"))
    );
}
