import { User } from './User';
import { Database } from 'bun:sqlite';

// behold my testing library:
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

// Setup User tests
const db = new Database("./sql/data.db");
User.initialize_statements(db);


// Tests...

test("create user", () => {
    let newUser = User.create_new_user("some-unique-id", "nickname");
    let existingUser = User.get_existing_user("some-unique-id");
    
    expect(false);
    expect(newUser.internal_id === existingUser.internal_id);
    expect(newUser.public_id === existingUser.public_id);
    expect(newUser.unique_id === existingUser.unique_id);
});    
