import { User } from './src/User.js';
import { Coupon } from './src/Coupon.js';
import { Tester } from './src/tester.js';
import sqlite3 from 'sqlite3';

new Tester(
    "User tests",
    async function on_start() {
        // Always run the tests on a test database that has been reset already
        const db = new sqlite3.Database("./data/test_db.db");
        console.log("opened " + "./data/test_db.db");
        await User.reset_table(db);
        await User.initialize_statements(db);
        Coupon.reset_table(db);
        Coupon.initialize_statements(db);
        return {db};
    },
    function on_end(udata) {
        console.log("closing " + udata.db.filename);
        udata.db.close();
    },
    function tests(t:Tester, udata) {

        t.test("reset table user", async () => {

            // Create an in memory sqlite database to not modify the original
            const db = new sqlite3.Database(':memory:');
            User.reset_table(db);
            
            // The table should exists
            let query1 = db.prepare(`
                SELECT name FROM sqlite_master WHERE type = ? AND name = ?
            `).get({table:`table`, user:`user`}, (err, row) => {
                t.expect(err === null);
                t.expect(row.name === `user`);
            }).finalize();
            
            // There should be no users
            let query2 = db.prepare(`
                SELECT * FROM user
            `).get((err, row) => {
                t.expect(!row);
            }).finalize();

        });

        t.test("create user", async () => {
            let newUser = await User.create_new_user("some-unique-id", "nickname");
            let existingUser = User.get_existing_user("some-unique-id");
            
            t.expect(existingUser != null);
            t.expect(newUser.internal_id === existingUser?.internal_id);
            t.expect(newUser.public_id === existingUser?.public_id);
            t.expect(newUser.unique_id === existingUser?.unique_id);
        });

        t.test("non existing user", async () => {
            let existingUser = User.get_existing_user("non-existing-user");
            t.expect(existingUser === null);
        });
        
        t.test("fail on duplication of unique ids", async () => {
            
            await User.create_new_user("same-id", "doesntmatter");
            
            t.expect_throw(
                async () => {await User.create_new_user("same-id", "doesntmatter")},
                (e) => t.expect(e.message === "constraint failed")
            );

        });

        t.test("user cant have nulls", async () => {
            
            // t.expect_throw(
            //     () => User.create_new_user(null , null),
            //     (e) => t.expect(e.message === "constraint failed")
            // );

            // t.expect_throw(
            //     () => User.create_new_user("user_not_null", null),
            //     (e) => t.expect(e.message === "constraint failed")
            // );

            // t.expect_throw(
            //     () => User.create_new_user(null, "public name"),
            //     (e) => t.expect(e.message === "constraint failed")
            // );

        });

        t.test("user is read only", async () => {
            
            let unique_id = "user_read_only_test";
            await User.create_new_user(unique_id, "doesntmatter");

            t.expect_throw(
                async () => udata.db.run(`update user set public_id = ? where unique_id = ?`, `new_name`, unique_id),
                (e) => t.expect(e.message === "constraint failed")
            );

            t.expect_throw(
                async () => udata.db.run(`update user set unique_id = ? where unique_id = ?`, `new_id`, unique_id),
                (e) => t.expect(e.message === "constraint failed")
            );

            t.expect_throw(
                async () => udata.db.run(`update user set internal_id = ? where unique_id = ?`, 300, unique_id),
                (e) => t.expect(e.message === "constraint failed")
            );
        });
    }
).run();

new Tester(
    "Coupon tests",
    async function on_start() {
        // Always run the tests on a test database that has been reset already
        const db = new sqlite3.Database("./data/test_db.db");
        console.log("opened " + "./data/test_db.db");
        await User.reset_table(db);
        await User.initialize_statements(db);
        await Coupon.reset_table(db);
        await Coupon.initialize_statements(db);
        return {db};
    },
    function on_end(udata:any) {
        console.log("closing " + udata.db.filename);
        udata.db.close();
    },
    function tests(t:Tester, udata) {

        t.test("reset table coupon", async () => {

            // Create an in memory sqlite database to not modify the original
            const db = new sqlite3.Database(':memory:');
            Coupon.reset_table(db);
            
            // debug with select name, type from sqlite_master;
            // The table should exists
            db.prepare(`
                select name from sqlite_master where type=? AND name=?
            `).get({table: `table`, coupon:`coupon`}, (err, row) => {
                t.expect(row);
                t.expect(row.name === `coupon`);
            }).finalize();
            
            // There should be no users
            let query2 = db.prepare(`
                SELECT * FROM coupon
            `).get((err, row) => {
                t.expect(!row);
            }).finalize();

        });
    }
).run();