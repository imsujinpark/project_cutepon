import { Database, Statement } from '../src/sqlite-async.js';

export abstract class user_insert {
    static input = class { unique_id: string; public_id: string }
    static output = class { internal_id: number }
    static query_string = 'insert into user (unique_id, public_id) values (?, ?) returning internal_id';
    static query_statement: Statement | null = null;
    static async query(input: typeof user_insert.input): Promise<typeof user_insert.output[]> {
        const all = await this.query_statement?.all(Object.values(input));
        let out: Array<typeof user_insert.output> = new Array();
        for (let i = 0; i < all.length; i++) {
            out.push(all[i] as typeof user_insert.output);
        }
        return out;
    }
    static async prepare(db: Database) {
        this.query_statement = await db.prepare(this.query_string);
        this.initialized = true;
    }
    static async finalize() {
        await this.query_statement?.finalize();
    }
    static initialized: boolean = false;
}
export abstract class user_by_unique {
    static input = class { unique_id: string }
    static output = class { internal_id: number; public_id: string }
    static query_string = 'select internal_id, public_id from user where unique_id = ?';
    static query_statement: Statement | null = null;
    static async query(input: typeof user_by_unique.input): Promise<typeof user_by_unique.output[]> {
        const all = await this.query_statement?.all(Object.values(input));
        let out: Array<typeof user_by_unique.output> = new Array();
        for (let i = 0; i < all.length; i++) {
            out.push(all[i] as typeof user_by_unique.output);
        }
        return out;
    }
    static async prepare(db: Database) {
        this.query_statement = await db.prepare(this.query_string);
        this.initialized = true;
    }
    static async finalize() {
        await this.query_statement?.finalize();
    }
    static initialized: boolean = false;
}
export abstract class user_by_internal {
    static input = class { internal_id: number }
    static output = class { unique_id: string; public_id: string }
    static query_string = 'select unique_id, public_id from user where internal_id = ?';
    static query_statement: Statement | null = null;
    static async query(input: typeof user_by_internal.input): Promise<typeof user_by_internal.output[]> {
        const all = await this.query_statement?.all(Object.values(input));
        let out: Array<typeof user_by_internal.output> = new Array();
        for (let i = 0; i < all.length; i++) {
            out.push(all[i] as typeof user_by_internal.output);
        }
        return out;
    }
    static async prepare(db: Database) {
        this.query_statement = await db.prepare(this.query_string);
        this.initialized = true;
    }
    static async finalize() {
        await this.query_statement?.finalize();
    }
    static initialized: boolean = false;
}
export abstract class user_by_public {
    static input = class { public_id: string }
    static output = class { unique_id: string; internal_id: number }
    static query_string = 'select unique_id, internal_id from user where public_id = ?';
    static query_statement: Statement | null = null;
    static async query(input: typeof user_by_public.input): Promise<typeof user_by_public.output[]> {
        const all = await this.query_statement?.all(Object.values(input));
        let out: Array<typeof user_by_public.output> = new Array();
        for (let i = 0; i < all.length; i++) {
            out.push(all[i] as typeof user_by_public.output);
        }
        return out;
    }
    static async prepare(db: Database) {
        this.query_statement = await db.prepare(this.query_string);
        this.initialized = true;
    }
    static async finalize() {
        await this.query_statement?.finalize();
    }
    static initialized: boolean = false;
}
export abstract class user_all {
    static input = class {}
    static output = class { internal_id: number; unique_id: string; public_id: string }
    static query_string = 'select * from user';
    static query_statement: Statement | null = null;
    static async query(input: typeof user_all.input): Promise<typeof user_all.output[]> {
        const all = await this.query_statement?.all(Object.values(input));
        let out: Array<typeof user_all.output> = new Array();
        for (let i = 0; i < all.length; i++) {
            out.push(all[i] as typeof user_all.output);
        }
        return out;
    }
    static async prepare(db: Database) {
        this.query_statement = await db.prepare(this.query_string);
        this.initialized = true;
    }
    static async finalize() {
        await this.query_statement?.finalize();
    }
    static initialized: boolean = false;
}
