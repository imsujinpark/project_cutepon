import sqlite3, { Database, Statement } from 'sqlite3';

function throw_expression(msg: string): never {
    throw new Error(msg);
}

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

    static db:Database;

    /** Initializes the static methods used for interacting with the User table */
    static async initialize_statements(db: Database): Promise<null> {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                User.db = db;
                User.query_insert_statement = db.prepare(User.query_insert);
                User.query_get_statement = db.prepare(User.query_get);
                User.query_all_statement = db.prepare(User.query_all);
                User.query_get_by_internal_statement = db.prepare(User.query_get_by_internal, (err) => {if (err) { reject(err); } resolve(null); });
                User.initialized = true;
            });
        });
    }
    
    /** Resets the User table to an empty table */
    static async reset_table(db: Database): Promise<null> {
        User.db = db;
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run(`
                    drop table if exists user;
                `, (err) => {if (err) { reject(err); }})
                .run(`
                    create table user (
                        internal_id integer unique primary key autoincrement not null,
                        unique_id text unique not null,
                        public_id text not null
                    );
                `, (err) => {if (err) { reject(err); }})
                .run(`
                    create trigger readonly_user before update on user
                    begin
                        select raise(abort, 'user is readonly!');
                    end;
                `, (err) => {if (err) { reject(err); } resolve(null); });
            });
        });
    }

    static initialized: boolean = false;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_insert = 'insert into user (unique_id, public_id) values (?, ?) returning internal_id';
    static query_insert_statement: Statement;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_get = 'select internal_id, public_id from user where unique_id = ?';
    static query_get_statement: Statement;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_get_by_internal = 'select unique_id, public_id from user where internal_id = ?';
    static query_get_by_internal_statement: Statement;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_all = 'select * from user';
    static query_all_statement: Statement;

    static parse_object(object: any): User {
        return new User(object.internal_id, object.unique_id, object.public_id);
    }

    static create_new_user(unique_id: string, public_id: string): Promise<User> {
        return new Promise((resolve, reject) => {
            User.require_initialized();
            User.db.prepare(User.query_insert).get({unique_id, public_id}, (err, row) => {
                if (err) reject(err);
                const user = new User(row.internal_id, unique_id, public_id);
                user.log();
                resolve(user);
            }).finalize();
        });
    }

    static get_existing_user_internal(internal_id: number): User | null {
        User.require_initialized();
        let user: User|null = null;
        User.query_get_by_internal_statement.get(internal_id, (err, row) => {
            if (err) throw err;
            user = new User(internal_id, row.unique_id, row.public_id);
            user.log();
        }).finalize();
        return user;
    }
    
    static get_existing_user(unique_id: string): User | null {
        User.require_initialized();
        let user: User|null = null;
        User.query_get_statement.get(unique_id, (err, row) => {
            if (err) throw err;
            user = new User(row.internal_id, unique_id, row.public_id);
            user.log();
        }).finalize();
        return user;
    }

    static all(): User[] {
        User.require_initialized();
        let users: Array<User> = new Array();
        let result = User.query_all_statement.all((err, rows) => {
            if (err) throw err;
            for (let i = 0; i < rows.length; i++) {
                users.push(User.parse_object(rows[i]));
            }
        }).finalize();
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
