import { User } from './User';
import { Database } from 'bun:sqlite';
import { strict as assert } from 'node:assert';

const DB = new Database("./sql/data.db");

User.initialize_statements(DB);

function print_all_users() {
    console.log("Printing all users:");
    let all_users = User.all();
    for (let i = 0; i < all_users.length; i += 1) {
        all_users[i].log();
    }
}
print_all_users();
let newUser = User.create_new_user("some-unique-id", "nickname");
let existingUser = User.get_existing_user("some-unique-id");

assert.strictEqual(newUser.internal_id, existingUser.internal_id);
assert.strictEqual(newUser.public_id, existingUser.public_id);
assert.strictEqual(newUser.unique_id, existingUser.unique_id);

print_all_users();

// Notes (Oscar) If not closed data is not saved!
DB.close();
