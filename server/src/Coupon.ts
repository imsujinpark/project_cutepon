import { Database, Statement } from './sqlite-async.js';
import { User } from './User.js';

export enum CouponStatus {
    Active, Redeemed, Deleted, Expired
}

export class Coupon {

    readonly id: number;
    readonly title: string;
    readonly description: string;
    readonly created_date: Date;
    readonly expiration_date: Date;
    readonly origin_user: User;
    readonly target_user: User;
    
    status: CouponStatus;
    finish_date: Date;

    constructor(id: number, title: string, description: string, created_date: Date, expiration_date: Date, origin_user: User, target_user: User, status: CouponStatus, finish_date: Date) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.created_date = created_date;
        this.expiration_date = expiration_date;
        this.origin_user = origin_user;
        this.target_user = target_user;
        this.status = status;
        this.finish_date = finish_date;
    }

    log() {
        console.log(this);
    }

    /** Initializes the static methods used for interacting with the User table */
    static async initialize_statements(db: Database) {
        Coupon.query_all_statement = await db.prepare(Coupon.query_all);
        Coupon.initialized = true;
    }

    static async close() {
        await Coupon.query_all_statement?.finalize();
    }
    
    /** Resets the User table to an empty table */
    static async reset_table(db: Database) {
        await db.run(`
            drop table if exists coupon;
        `);
        await db.run(`
            create table coupon (
                
                -- ** read-only data, definition of the coupon **
                id integer unique primary key autoincrement not null, -- Notes (Oscar) I believe sqlite will create an alias for rowid... TODO Gotta check
                title text not null,
                description text not null,
                created_date datetime not null,
                expiration_date datetime not null,
                origin_user integer not null references user(id),
                target_user integer not null references user(id),
                
                -- ** dynamic data, might change as coupon status changes **
            
                -- Enum describing the status of the coupon:
                -- 0 Active, 1 Redeemed, 2 Deleted, 3 Expired
                -- Make sure no invalid data enters is used for status
                status integer check(
                    status >= 0 and
                    status <= 3
                ) not null,
            
                -- Refers to the date that the coupon was "terminated" regardless of the reason, be it expired, was used, or deleted.
                finish_date datetime not null
            
            );
        `);
        await db.run(`
            -- Set an extra index for the table, since we will index by status and by origin pretty often
            create index by_status_index on coupon (status);
        `);
        await db.run(`
            create index by_origin_user_index on coupon (origin_user);
        `);
    }

    static initialized: boolean = false;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_all = 'select * from coupon';
    static query_all_statement: Statement | null = null;

    static async parse_object(object: any): Promise<Coupon> {
        let origin_user = await User.get_existing_user_internal(object.origin_user);
        if (!origin_user) throw new Error(`Unreachable: user ${object.origin_user} must exist, but it doesn't!`)
        let target_user = await User.get_existing_user_internal(object.target_user);
        if (!target_user) throw new Error(`Unreachable: user ${object.target_user} must exist, but it doesn't!`)
        return new Coupon(
            object.id,
            object.title,
            object.description,
            new Date(object.created_date),
            new Date(object.expiration_date),
            origin_user,
            target_user,
            object.status as CouponStatus,
            new Date(object.finish_date)
        );
    }

    static async all(): Promise<Coupon[]> {
        Coupon.require_initialized();
        try {
            let result = await Coupon.query_all_statement?.all();
            let coupons: Array<Coupon> = new Array();
            for (let i = 0; i < result.length; i++) {
                coupons.push(await Coupon.parse_object(result[i]));
            }
            return coupons;
        }
        finally {
            await Coupon.query_all_statement?.reset();
        }
    }

    static require_initialized() {
        if (!Coupon.initialized) throw new Error("Not initialized!");
    }

    static async log_all() {
        let all_users = await Coupon.all();
        for (let i = 0; i < all_users.length; i += 1) {
            all_users[i].log();
        }
    }

}
