import { Database, Statement } from 'bun:sqlite';

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

    /** Initializes the static methods used for interacting with the User table */
    static initialize_statements(db: Database) {
        User.query_insert_statement = db.query(User.query_insert);
        User.query_get_statement = db.query(User.query_get);
        User.query_all_statement = db.query(User.query_all);
        User.initialized = true;
    }
    
    /** Resets the User table to an empty table */
    static reset_table(db: Database) {
        console.log(db.run(`
            drop table if exists user;
        `));
        console.log(db.run(`
            create table user (
                internal_id integer unique primary key autoincrement not null,
                unique_id text unique not null,
                public_id text not null
            );
        `));
        console.log(db.run(`
            create trigger readonly_user before update of id, public_id on user
            begin
                select raise(abort, 'user is readonly!');
            end
        `));
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

    static log_all() {
        let all_users = User.all();
        for (let i = 0; i < all_users.length; i += 1) {
            all_users[i].log();
        }
    }

}
