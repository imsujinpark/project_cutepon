import { User } from './src/User';
import { Coupon } from './src/Coupon';
import { Database, Statement } from 'bun:sqlite';

// behold my testing library:
let on_start: any = null;
let on_end: any = null;
let test_name: string | null = null;

function expect(thing: boolean) {
    if (!thing) throw new Error("Lower your expectations!");
}

function expect_throw(f: any, expectation: (error: Error) => any) {
    
    let has_thrown = false;
    try {
        f();
    }
    catch (e) {
        has_thrown = true;
        expectation(e);
    }
    
    if (!has_thrown) throw new Error("Expected to throw, but it didn't!");
}

function success() {
    console.log("Test OK! " + test_name);
}

function failed(error: Error) {
    console.log("Test FAIL! " + test_name);
    throw error;
}

function test(name: string, testing_function: any) {
    test_name = name;
    try {
        testing_function();
        success();
    } catch (e) { failed(e); }
}

function run_tests(all_tests: any) {
    
    if (on_start != null) { on_start(); }

    try {
        all_tests();
    }
    finally {
        if (on_end != null) { on_end(); }
    }

}

let db: Database = null;

on_start = () => {
    // Always run the tests on a test database that has been reset already
    db = new Database("./sql/test_db.db");
    console.log("opened " + db);
    User.reset_table(db);
    User.initialize_statements(db);
    Coupon.reset_table(db);
    Coupon.initialize_statements(db);
}
on_end = () => {
    console.log("closing " + db);
    db.close();
}

// User tests
run_tests(() => {

    test("reset table user", () => {

        // Create an in memory sqlite database to not modify the original
        const db = new Database();
        User.reset_table(db);
        
        // The table should exists
        let query1 = db.query(`
            SELECT name FROM sqlite_master WHERE type = ? AND name = ?
        `);
        let result1 = query1.get(`table`, `user`);
        expect(result1 != null);
        expect(result1.name === `user`);
        
        // There should be no users
        let query2 = db.query(`
            SELECT * FROM user
        `);
        let result2 = query2.get();
        expect(result2 == null);

    });

    test("create user", () => {
        let newUser = User.create_new_user("some-unique-id", "nickname");
        let existingUser = User.get_existing_user("some-unique-id");
        
        expect(newUser.internal_id === existingUser.internal_id);
        expect(newUser.public_id === existingUser.public_id);
        expect(newUser.unique_id === existingUser.unique_id);
    });
    
    test("fail on duplication of unique ids", () => {
        
        User.create_new_user("same-id", "doesntmatter");
        
        expect_throw(
            () => User.create_new_user("same-id", "doesntmatter"),
            (e) => expect(e.message === "constraint failed")
        );

    });

    test("user cant have nulls", () => {
        
        expect_throw(
            () => User.create_new_user(null , null),
            (e) => expect(e.message === "constraint failed")
        );

        expect_throw(
            () => User.create_new_user("user_not_null", null),
            (e) => expect(e.message === "constraint failed")
        );

        expect_throw(
            () => User.create_new_user(null, "public name"),
            (e) => expect(e.message === "constraint failed")
        );

    });

    test("user is read only", () => {
        
        let unique_id = "user_read_only_test"
        User.create_new_user(unique_id, "doesntmatter");

        expect_throw(
            () => db.run(`update user set public_id = ? where unique_id = ?`, `new_name`, unique_id),
            (e) => expect(e.message === "constraint failed")
        );

        expect_throw(
            () => db.run(`update user set unique_id = ? where unique_id = ?`, `new_id`, unique_id),
            (e) => expect(e.message === "constraint failed")
        );

        expect_throw(
            () => db.run(`update user set internal_id = ? where unique_id = ?`, 300, unique_id),
            (e) => expect(e.message === "constraint failed")
        );
    });

});

// Coupon tests
run_tests(() => {

    test("reset table coupon", () => {

        // Create an in memory sqlite database to not modify the original
        const db = new Database();
        User.reset_table(db);
        
        // debug with select name, type from sqlite_master;
        // The table should exists
        let query1 = db.query(`
            SELECT name FROM sqlite_master WHERE type = ? AND name = ?
        `);
        let result1 = query1.get(`table`, `coupon`);
        expect(result1 != null);
        expect(result1.name === `coupon`);
        
        // There should be no users
        let query2 = db.query(`
            SELECT * FROM coupon
        `);
        let result2 = query2.get();
        expect(result2 == null);

    });

});