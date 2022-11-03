import { User } from './src/User';
import { Coupon } from './src/Coupon';
import { Database, Statement } from 'bun:sqlite';
import { Tester } from '../lib/tester';

new Tester(
    "User tests",
    function on_start() {
        // Always run the tests on a test database that has been reset already
        const db = new Database("./sql/test_db.db");
        console.log("opened " + db.filename);
        User.reset_table(db);
        User.initialize_statements(db);
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
            const db = new Database();
            User.reset_table(db);
            
            // The table should exists
            let query1 = db.query(`
                SELECT name FROM sqlite_master WHERE type = ? AND name = ?
            `);
            let result1 = query1.get(`table`, `user`);
            t.expect(result1 != null);
            t.expect(result1.name === `user`);
            
            // There should be no users
            let query2 = db.query(`
                SELECT * FROM user
            `);
            let result2 = query2.get();
            t.expect(result2 == null);

        });

        t.test("create user", async () => {
            let newUser = User.create_new_user("some-unique-id", "nickname");
            let existingUser = User.get_existing_user("some-unique-id");
            
            t.expect(newUser.internal_id === existingUser.internal_id);
            t.expect(newUser.public_id === existingUser.public_id);
            t.expect(newUser.unique_id === existingUser.unique_id);
        });

        t.test("non existing user", async () => {
            let existingUser = User.get_existing_user("non-existing-user");
            t.expect(existingUser === null);
        });
        
        t.test("fail on duplication of unique ids", async () => {
            
            User.create_new_user("same-id", "doesntmatter");
            
            t.expect_throw(
                () => User.create_new_user("same-id", "doesntmatter"),
                (e) => t.expect(e.message === "constraint failed")
            );

        });

        t.test("user cant have nulls", async () => {
            
            t.expect_throw(
                () => User.create_new_user(null , null),
                (e) => t.expect(e.message === "constraint failed")
            );

            t.expect_throw(
                () => User.create_new_user("user_not_null", null),
                (e) => t.expect(e.message === "constraint failed")
            );

            t.expect_throw(
                () => User.create_new_user(null, "public name"),
                (e) => t.expect(e.message === "constraint failed")
            );

        });

        t.test("user is read only", async () => {
            
            let unique_id = "user_read_only_test";
            User.create_new_user(unique_id, "doesntmatter");

            t.expect_throw(
                () => udata.db.run(`update user set public_id = ? where unique_id = ?`, `new_name`, unique_id),
                (e) => t.expect(e.message === "constraint failed")
            );

            t.expect_throw(
                () => udata.db.run(`update user set unique_id = ? where unique_id = ?`, `new_id`, unique_id),
                (e) => t.expect(e.message === "constraint failed")
            );

            t.expect_throw(
                () => udata.db.run(`update user set internal_id = ? where unique_id = ?`, 300, unique_id),
                (e) => t.expect(e.message === "constraint failed")
            );
        });
    }
).run();

new Tester(
    "Coupon tests",
    function on_start() {
        // Always run the tests on a test database that has been reset already
        const db = new Database("./sql/test_db.db");
        console.log("opened " + db.filename);
        User.reset_table(db);
        User.initialize_statements(db);
        Coupon.reset_table(db);
        Coupon.initialize_statements(db);
        return {db};
    },
    function on_end(udata:any) {
        console.log("closing " + udata.db.filename);
        udata.db.close();
    },
    function tests(t:Tester, udata) {

        t.test("reset table coupon", async () => {

            // Create an in memory sqlite database to not modify the original
            const db = new Database();
            Coupon.reset_table(db);
            
            // debug with select name, type from sqlite_master;
            // The table should exists
            let result = db.query(`select name from sqlite_master where type=? AND name=?`).get(`table`, `coupon`);
            t.expect(result != null);
            t.expect(result.name === `coupon`);
            
            // There should be no users
            let query2 = db.query(`
                SELECT * FROM coupon
            `);
            let result2 = query2.get();
            t.expect(result2 == null);

        });
    }
).run();