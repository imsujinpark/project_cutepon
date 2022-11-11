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
    finish_date: Date | null;

    private constructor(id: number, title: string, description: string, created_date: Date, expiration_date: Date, origin_user: User, target_user: User, status: CouponStatus, finish_date: Date) {
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
    
    /** Returns this coupon as an object that only contains primitive data types */
    primitive(): any {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            created_date: this.created_date.getTime(),
            expiration_date: this.expiration_date.getTime() ,
            origin_user: this.origin_user.public_id,
            target_user: this.target_user.public_id,
            status: this.status,
            finish_date: this.finish_date ? this.finish_date.getTime() : null,
        }
    }

    /** Given a list of Coupons, returns a list of the coupons in primitive form */
    static primitivize(coupons: Coupon[]): any[] {
        let primitivized_coupons: Array<any> = new Array();
        for (let i = 0; i < coupons.length; i++) {
            primitivized_coupons.push( coupons[i].primitive() );
        }
        return primitivized_coupons;
    }

    /** Initializes the static methods used for interacting with the User table */
    static async initialize_statements(db: Database) {
        Coupon.query_all_statement = await db.prepare(Coupon.query_all);
        Coupon.query_create_statement = await db.prepare(Coupon.query_create);
        Coupon.query_get_coupons_1_statement = await db.prepare(Coupon.query_get_coupons_1);
        Coupon.query_get_coupons_2_statement = await db.prepare(Coupon.query_get_coupons_2);
        Coupon.initialized = true;
    }

    static async close() {
        await Coupon.query_all_statement?.finalize();
        await Coupon.query_create_statement?.finalize();
        await Coupon.query_get_coupons_1_statement?.finalize();
        await Coupon.query_get_coupons_2_statement?.finalize();
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
                created_date datetime not null default (DATETIME('now')),
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
                ) not null default 0,
            
                -- Refers to the date that the coupon was "terminated" regardless of the reason, be it expired, was used, or deleted.
                -- Must be null if coupon is Active. Must never be null otherwise
                finish_date datetime check(
                    finish_date is null and status = 0
                    or
                    finish_date is not null and status != 0
                ) default null
            
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
    static query_all = `select * from coupon`;
    static query_all_statement: Statement | null = null;
    
    /** Create a coupon with the standard input, relying on all the default values and returning them */
    static query_create = `
        insert into coupon (title, description, expiration_date, origin_user, target_user)
        values (?, ?, ?, ?, ?) returning created_date, id, status, finish_date, origin_user, target_user
    `;
    static query_create_statement: Statement | null = null;

    /** Get all the coupons that a user might want to use */
    static query_get_coupons_1 = `
        select * from coupon where target_user = ? and status = 0
    `;
    static query_get_coupons_1_statement: Statement | null = null;

    /** Get all the coupons sent by a user */
    static query_get_coupons_2 = `
        select * from coupon where origin_user = ? and status in (0, 1, 2, 3) 
    `;
    static query_get_coupons_2_statement: Statement | null = null;

    /** Pass origin and target user if you know for sure who they are, else just pass null and it will be check inside the function */
    static async parse_object(object: any, origin_user: User | null, target_user?: User | null): Promise<Coupon> {
        if (!origin_user) {
            origin_user = await User.get_existing_user_internal(object.origin_user);
            if (!origin_user) throw new Error(`Unreachable: user ${object.origin_user} must exist, but it doesn't!`)
        }
        if (!target_user) {
            target_user = await User.get_existing_user_internal(object.target_user);
            if (!target_user) throw new Error(`Unreachable: user ${object.target_user} must exist, but it doesn't!`)
        }
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

    static async create_new_coupon(title: string, description: string, expiration_date: Date, origin_user: User, target_user: User): Promise<Coupon> {
        Coupon.require_initialized();
        try {
            let result = await Coupon.query_create_statement?.get(title, description, expiration_date.getTime(), origin_user.internal_id, target_user.internal_id);
            const id = result.id;
            const created_date = result.created_date;
            const status = result.status;
            const finish_date = result.finish_date;
            const returned_origin_user = result.origin_user;
            const returned_target_user = result.target_user;
            if (typeof id !== 'number' ) throw new Error("unreachable");
            if (typeof created_date !== 'string' ) throw new Error("unreachable");
            if ((typeof status !== 'number') || ((status as CouponStatus) !== 0) ) throw new Error("unreachable");
            if (finish_date !== null ) throw new Error("unreachable");
            if (origin_user.internal_id !== returned_origin_user) throw new Error("unreachable");
            if (target_user.internal_id !== returned_target_user) throw new Error("unreachable");
            const coupon = new Coupon(
                id,
                title,
                description,
                new Date(created_date),
                expiration_date,
                origin_user,
                target_user,
                status,
                finish_date,
            );
            return coupon;
        }
        finally {
            await Coupon.query_create_statement?.reset();
        }
    }

    static async get_available(user: User): Promise<Coupon[]> {
        Coupon.require_initialized();
        try {
            
            // We are getting the available for user, meaning target_user = user
            let target_user = user;

            let result: any[] = await Coupon.query_get_coupons_1_statement?.all(target_user.internal_id);
            let coupons: Array<Coupon> = new Array();
            for (let i = 0; i < result.length; i++) {
                coupons.push(await Coupon.parse_object(result[i], null, target_user));
            }
            return coupons;
        }
        finally {
            await Coupon.query_get_coupons_1_statement?.reset();
        }
    }

    static async get_sent(user: User): Promise<Coupon[]> {
        Coupon.require_initialized();
        try {
            
            // We are getting the available for user, meaning target_user = user
            let target_user = user;

            let result: any[] = await Coupon.query_get_coupons_2_statement?.all(target_user.internal_id);
            let coupons: Array<Coupon> = new Array();
            for (let i = 0; i < result.length; i++) {
                coupons.push(await Coupon.parse_object(result[i], null, target_user));
            }
            return coupons;
        }
        finally {
            await Coupon.query_get_coupons_2_statement?.reset();
        }
    }

    static async all(): Promise<Coupon[]> {
        Coupon.require_initialized();
        try {
            let result = await Coupon.query_all_statement?.all();
            let coupons: Array<Coupon> = new Array();
            for (let i = 0; i < result.length; i++) {
                coupons.push(await Coupon.parse_object(result[i], null, null));
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
