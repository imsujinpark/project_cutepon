import { User } from './src/User';
import { Database } from 'bun:sqlite';

// behold my testing library:
let on_start: any = null;
let on_end: any = null;
let test_name: string = null;
function expect(thing: boolean) {
    if (!thing) throw new Error("Lower your expectations!");
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
    User.reset_table(db);
    User.initialize_statements(db);
}
on_end = () => {
    db.close();
}

run_tests(() => {

    test("reset table", () => {

        // Create an in memory sqlite database to not modify the original
        const db = new Database();
        User.reset_table(db);
        
        // The table should exists
        let query1 = db.query(`
            SELECT name FROM sqlite_master WHERE type = ? AND name = ?
        `);
        let result1 = query1.get(`table`, `user`);
        expect(result1.name === `user`);
        
        // There should be no users
        let query2 = db.query(`
            SELECT * FROM user
        `);
        let result2 = query2.get();
        expect(result2 === null);

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
        try {
            // This should throw since unique_id is unique
            User.create_new_user("same-id", "doesntmatter");
        }
        catch (e) {
            expect(e.message === "constraint failed");
        }
    });

});
