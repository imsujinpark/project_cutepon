import { Database, Statement } from './sqlite-async.js';
import * as util from './util.js';

export class User {

    /** The id used internally, a standard autoincrement in the db */
    readonly internal_id: number;
    /** Provided by the client, likely an oauth provided id */
    readonly unique_id: string;
    /** The public id used and visible by the users */
    readonly public_id: string;

    private constructor(internal_id: number, unique_id: string, public_id: string) {
        this.internal_id = internal_id;
        this.unique_id = unique_id;
        this.public_id = public_id;
    }

    log() {
        console.log(this);
    }

    /** Initializes the static methods used for interacting with the User table */
    static async initialize_statements(db: Database) {
        User.query_insert_statement = await db.prepare(User.query_insert);
        User.query_get_by_unique_statement = await db.prepare(User.query_get_by_unique);
        User.query_all_statement = await db.prepare(User.query_all);
        User.query_get_by_internal_statement = await db.prepare(User.query_get_by_internal);
        User.query_get_by_public_statement = await db.prepare(User.query_get_by_public);
        User.initialized = true;
    }
    
    /** Resets the User table to an empty table */
    static async reset_table(db: Database) {
        await db.run(`
            drop table if exists user;
        `);
        await db.run(`
            create table user (
                internal_id integer unique primary key autoincrement not null,
                unique_id text unique not null,
                public_id text not null
            );
        `);
        await db.run(`
            create trigger readonly_user before update on user
            begin
                select raise(abort, 'user is readonly!');
            end;
        `);
    }

    static async close() {
        await User.query_insert_statement?.finalize()
        await User.query_get_by_unique_statement?.finalize()
        await User.query_all_statement?.finalize()
        await User.query_get_by_internal_statement?.finalize()
        await User.query_get_by_public_statement?.finalize()
        return
    }

    static initialized: boolean = false;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_insert = 'insert into user (unique_id, public_id) values (?, ?) returning internal_id';
    static query_insert_statement: Statement | null = null;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_get_by_unique = 'select internal_id, public_id from user where unique_id = ?';
    static query_get_by_unique_statement: Statement | null = null;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_get_by_internal = 'select unique_id, public_id from user where internal_id = ?';
    static query_get_by_internal_statement: Statement | null = null;
    
    static query_get_by_public = 'select unique_id, internal_id from user where public_id = ?';
    static query_get_by_public_statement: Statement | null = null;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_all = 'select * from user';
    static query_all_statement: Statement | null = null;

    static parse_object(object: any): User {
        return new User(object.internal_id, object.unique_id, object.public_id);
    }

    static async create_new_user(unique_id: string, public_id: string): Promise<User> {
        User.require_initialized();
        try {
            let result = await User.query_insert_statement?.get(unique_id, public_id);
            const user = new User(result.internal_id, unique_id, public_id);
            console.log(`user created: ` + util.inspect(user));
            return user;
        }
        finally {
            await User.query_insert_statement?.reset();
        }
    }

    static async get_existing_user_internal(internal_id: number): Promise<User|null> {
        User.require_initialized();
        try {
            const result = await User.query_get_by_internal_statement?.get(internal_id);
            if (!result) return null;
            const user = new User(internal_id, result.unique_id, result.public_id);
            return user;
        }
        finally {
            await User.query_get_by_internal_statement?.reset();
        }
    }
    
    static async get_existing_user_unique(unique_id: string): Promise<User|null> {
        User.require_initialized();
        try {
            const result = await User.query_get_by_unique_statement?.get(unique_id);
            if (!result) return null;
            const user = new User(result.internal_id, unique_id, result.public_id);
            return user;
        }
        finally {
            await User.query_get_by_unique_statement?.reset();
        }
    }

    static async get_existing_user_public(public_id: string): Promise<User|null> {
        User.require_initialized();
        try {
            const result = await User.query_get_by_public_statement?.get(public_id);
            if (!result) return null;
            const user = new User(result.internal_id, result.unique_id, public_id);
            return user;
        }
        finally {
            await User.query_get_by_public_statement?.reset();
        }
    }

    static async all(): Promise<User[]> {
        User.require_initialized();
        try {

            let result = await User.query_all_statement?.all();
            let users: Array<User> = new Array();
            for (let i = 0; i < result.length; i++) {
                users.push(User.parse_object(result[i]));
            }
            return users;
        }
        finally {
            await User.query_all_statement?.reset();
        }
    }

    static require_initialized() {
        if (!User.initialized) throw "Not initialized!";
    }

    static async log_all() {
        let all_users = await User.all();
        for (let i = 0; i < all_users.length; i += 1) {
            all_users[i].log();
        }
    }

}
