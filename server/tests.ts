import { User } from './src/User.js';
import { Coupon } from './src/Coupon.js';
import { Database, Statement } from './src/sqlite-async.js';
import { Tester } from './src/tester.js';

async function main () {
    
    await new Tester(
        "User tests",
        async function on_start() {
            // Always run the tests on a test database that has been reset already
            const db = await Database.open("./data/test_db.db");
            console.log("opened " + db.filename);
            await User.reset_table(db);
            await User.initialize_statements(db);
            await Coupon.reset_table(db);
            await Coupon.initialize_statements(db);
            return {db};
        },
        async function on_end(udata) {
            console.log("closing " + udata.db.filename);
            await User.close();
            await Coupon.close();
            await (udata.db as Database).close();
        },
        async function tests(t:Tester, udata) {

            await t.test("reset table user", async () => {

                // Create an in memory sqlite database to not modify the original
                const db = await Database.open(':memory:');
                await User.reset_table(db);
                
                // The table should exists
                let statement:Statement = await db.prepare(`
                    SELECT name FROM sqlite_master WHERE type = ? AND name = ?
                `);
                let row = await statement.get(`table`, `user`);
                t.expect(row !== null);
                t.expect(row.name === `user`);
                await statement.finalize();
                
                // There should be no users
                let statement2 = await db.prepare(`
                    SELECT * FROM user
                `);
                let row2 = await statement2.get();
                t.expect(!row2);
                await statement2.finalize();

                await db.close();

            });

            await t.test("create user", async () => {
                let newUser = await User.create_new_user("some-unique-id", "nickname");
                let existingUser = await User.get_existing_user("some-unique-id");
                
                t.expect(newUser.internal_id === existingUser?.internal_id);
                t.expect(newUser.public_id === existingUser?.public_id);
                t.expect(newUser.unique_id === existingUser?.unique_id);
            });

            await t.test("non existing user", async () => {
                let existingUser = await User.get_existing_user("non-existing-user");
                t.expect(existingUser === null);
            });
            
            await t.test("fail on duplication of unique ids", async () => {
                
                await User.create_new_user("same-id", "doesntmatter");
                
                await t.expect_throw(
                    async () => {
                        await User.create_new_user("same-id", "doesntmatter")
                    },
                    (e) => {
                        t.expect(e.message === "SQLITE_CONSTRAINT: UNIQUE constraint failed: user.unique_id");
                    }
                );

            });

            await t.test("this test will fail on purpose!", async () => {
            
                await t.expect_throw(
                    async () => {
                        /** I do nothing */
                    },
                    (err) => {
                        console.log("I shouldn't be here!");
                        throw new Error("I shouldn't be here!");
                    }
                );

            });


            await t.test("test functions that expect throwing", async () => {

                await t.expect_throw(
                    async () => {
                        throw "hello!";
                    },
                    (err) => {
                        t.expect(err === "hello!");
                    }
                );

                await t.expect_throw(
                    async () => {
                        throw new Error("hello!");
                    },
                    (err) => {
                        t.expect((err as Error).message  === "hello!");
                    }
                );

            });

            // Skip this test since typescript's type system will be the one stopping me from making this mistake
            /*
            await t.test("user cant have nulls", async () => {
                
                await t.expect_throw(
                    async () => { await User.create_new_user(null , null) } ,
                    (e) => t.expect(e.message === "constraint failed")
                );

                await t.expect_throw(
                    async () => { await User.create_new_user("user_not_null", null) } ,
                    (e) => t.expect(e.message === "constraint failed")
                );

                await t.expect_throw(
                    async () => { await User.create_new_user(null, "public name") } ,
                    (e) => t.expect(e.message === "constraint failed")
                );

            });
            */

            await t.test("user is read only", async () => {
                
                let unique_id = "user_read_only_test";
                await User.create_new_user(unique_id, "doesntmatter");

                await t.expect_throw(
                    async () => {
                        await udata.db.run(`update user set public_id = ? where unique_id = ?`, `new_name`, unique_id)
                    },
                    (e) => {
                        t.expect(e.message === "SQLITE_CONSTRAINT: user is readonly!")
                    }
                );

                await t.expect_throw(
                    async () => {
                        await udata.db.run(`update user set unique_id = ? where unique_id = ?`, `new_id`, unique_id)
                    },
                    (e) => {
                        t.expect(e.message === "SQLITE_CONSTRAINT: user is readonly!")
                    }
                );

                await t.expect_throw(
                    async () => {
                        await udata.db.run(`update user set internal_id = ? where unique_id = ?`, 300, unique_id)
                    },
                    (e) => {
                        t.expect(e.message === "SQLITE_CONSTRAINT: user is readonly!")
                    }
                );
            });
        }
    ).run();

    await new Tester(
        "Coupon tests",
        async function on_start() {
            // Always run the tests on a test database that has been reset already
            const db = await Database.open("./data/test_db.db");
            console.log("opened " + db.filename);
            await User.reset_table(db);
            await User.initialize_statements(db);
            await Coupon.reset_table(db);
            await Coupon.initialize_statements(db);
            return {db};
        },
        async function on_end(udata:any) {
            console.log("closing " + udata.db.filename);
            await User.close();
            await Coupon.close();
            await (udata.db as Database).close();
        },
        async function tests(t:Tester, udata) {

            await t.test("reset table coupon", async () => {

                // Create an in memory sqlite database to not modify the original
                const db = await Database.open(":memory:");
                await Coupon.reset_table(db);
                
                // debug with select name, type from sqlite_master;
                // The table should exists
                let statement = await db.prepare(`select name from sqlite_master where type=? AND name=?`);
                let row = await statement.get(`table`, `coupon`);
                t.expect(row);
                t.expect(row.name === `coupon`);
                await statement.finalize();
                
                // There should be no users
                let statement2 = await db.prepare(`SELECT * FROM coupon`);
                let row2 = await statement2.get();
                t.expect(!row2);
                await statement2.finalize();

            });
        }
    ).run();
}

main();