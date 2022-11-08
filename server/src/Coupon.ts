import { Database, Statement } from 'sqlite3';
import { User } from './User.js';

function throw_expression(msg: string): never {
    throw new Error(msg);
}

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
    static initialize_statements(db: Database) {
        Coupon.query_all_statement = db.prepare(Coupon.query_all);
        Coupon.initialized = true;
    }
    
    /** Resets the User table to an empty table */
    static reset_table(db: Database) {
        db.serialize(() => {
            db.run(`
                drop table if exists coupon;
            `)
            .run(`
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
            `)
            .run(`
                -- Set an extra index for the table, since we will index by status and by origin pretty often
                create index by_status_index on coupon (status);
            `)
            .run(`
                create index by_origin_user_index on coupon (origin_user);
            `)
        });
    }

    static initialized: boolean = false;

    /** Query that creates a new user in the database and returns the autoincremented internal_id */
    static query_all = 'select * from coupon';
    static query_all_statement: Statement | null = null;

    static parse_object(object: any): Coupon {
        return new Coupon(
            object.id,
            object.title,
            object.description,
            new Date(object.created_date),
            new Date(object.expiration_date),
            User.get_existing_user_internal(object.origin_user) ?? throw_expression("AAAAh!"),
            User.get_existing_user_internal(object.target_user) ?? throw_expression("AAAAh!"),
            object.status as CouponStatus,
            new Date(object.finish_date)
        );
    }

    static all(): Coupon[] {
        Coupon.require_initialized();
        let coupons: Array<Coupon> = new Array();
        Coupon.query_all_statement?.all((err, rows) => {
            if (err) throw err;
            for (let i = 0; i < rows.length; i++) {
                coupons.push(Coupon.parse_object(rows[i]));
            }
        }).finalize();
        return coupons;
    }

    static require_initialized() {
        if (!Coupon.initialized) throw "Not initialized!";
    }

    static log_all() {
        let all_users = Coupon.all();
        for (let i = 0; i < all_users.length; i += 1) {
            all_users[i].log();
        }
    }

}
