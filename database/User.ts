import { Database, Statement } from 'bun:sqlite';


// | js         | sqlite3            |
// |------------|--------------------|
// | string     | TEXT               |
// | number     | INTEGER or DECIMAL |
// | boolean    | INTEGER (1 or 0)   |
// | Uint8Array | BLOB               |
// | Buffer     | BLOB               |
// | bigint     | INTEGER            |
// | null       | NULL               |

export class User {

    /** The id used internally, a standard autoincrement in the db */
    readonly internal_id: number;
    /** Provided by the client, likely an oauth provided id */
    readonly unique_id: string;
    /** The public id used and visible by the users */
    readonly public_id: string;

    constructor(internal_id: number, unique_id: string, public_id: string) {
        this.internal_id = internal_id;
        this.unique_id = unique_id;
        this.public_id = public_id;
    }

    log() {
        console.log(this);
    }

    static initialize_statements(db: Database) {
        User.query_insert_statement = db.query(User.query_insert);
        User.query_get_statement = db.query(User.query_get);
        User.query_all_statement = db.query(User.query_all);
        User.initialized = true;
    }

    static initialized: boolean = false;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_insert = 'insert into user (unique_id, public_id) values (?, ?) returning internal_id';
    static query_insert_statement: Statement | null = null;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_get = 'select internal_id, public_id from user where unique_id = ?';
    static query_get_statement: Statement | null = null;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_all = 'select * from user';
    static query_all_statement: Statement | null = null;

    static parse_object(object: any): User {
        return new User(object.internal_id, object.unique_id, object.public_id);
    }

    static create_new_user(unique_id: string, public_id: string): User {
        User.require_initialized();
        let result = User.query_insert_statement.get(unique_id, public_id);
        return new User(result.internal_id, unique_id, public_id);
    }

    static get_existing_user(unique_id: string): User {
        User.require_initialized();
        let { internal_id, public_id } = User.query_get_statement.get(unique_id);
        return new User(internal_id, unique_id, public_id);
    }

    static all(): User[] {
        User.require_initialized();
        let result = User.query_all_statement.all();
        let users: Array<User> = new Array();
        for (let i = 0; i < result.length; i++) {
            users.push(User.parse_object(result[i]));
        }
        return users;
    }

    static require_initialized() {
        if (!User.initialized) throw "Not initialized!";
    }

}
