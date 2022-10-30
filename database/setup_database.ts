import { Database } from "bun:sqlite";

const db = new Database("test.db");
db.run("create table students (id int, name varchar(255), age int, grade int)");
db.run("insert into students values(1, 'John', 6, 1)");
console.log(db.query("select * from students").all());