import { Database, Statement } from './sqlite-async.js';
import { User } from './User.js';
import { UserCoupon } from './UserCoupon.js';
import * as util from './util.js';

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
    user_data?: any;

    private constructor(id: number, title: string, description: string, created_date: Date, expiration_date: Date, origin_user: User, target_user: User, status: CouponStatus, finish_date: Date | null) {
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
            user_data: this.user_data
        }
    }

    set_user_data(data: UserCoupon): Coupon {
        this.user_data = data.primitive();
        return this;
    }

    /** Given a list of Coupons, returns a list of the coupons in primitive form */
    static primitivize(coupons: Coupon[]): any[] {
        let primitivized_coupons: Array<any> = new Array();
        for (let i = 0; i < coupons.length; i++) {
            primitivized_coupons.push( coupons[i].primitive() );
        }
        return primitivized_coupons;
    }

    static same(a: Coupon, b: Coupon): { isSame: boolean, different?: string } {
        if (a.id !== b.id) return {isSame: false, different: "id"} ;
        if (a.title !== b.title) return {isSame: false, different: "title"} ;
        if (a.description !== b.description) return { isSame: false, different: "description" };
        if (a.created_date.getTime() !== b.created_date.getTime()) return {isSame: false, different: "created_date"} ;
        if (a.expiration_date.getTime() !== b.expiration_date.getTime()) return {isSame: false, different: "expiration_date"} ;
        if (a.origin_user.internal_id !== b.origin_user.internal_id) return {isSame: false, different: "origin_user"} ;
        if (a.target_user.internal_id !== b.target_user.internal_id) return {isSame: false, different: "target_user"} ;
        return {isSame: true};
    }

    static equal(a: Coupon, b: Coupon): { isEqual: boolean, different?: string } {
        const same = Coupon.same(a,b);
        if (!same.isSame) return {isEqual: false, different: same.different};
        if (a.status !== b.status) return {isEqual: false, different: "status"};
        if (a.finish_date?.getTime() !== b.finish_date?.getTime()) return {isEqual: false, different: "finish_date"};
        return {isEqual: true};
    }

    /** Initializes the static methods used for interacting with the User table */
    static async initialize_statements(db: Database) {
        Coupon.query_all_statement = await db.prepare(Coupon.query_all);
        Coupon.query_create_statement = await db.prepare(Coupon.query_create);
        Coupon.query_get_coupon_statement = await db.prepare(Coupon.query_get_coupon);
        Coupon.query_get_coupons_1_statement = await db.prepare(Coupon.query_get_coupons_1);
        Coupon.query_get_coupons_2_statement = await db.prepare(Coupon.query_get_coupons_2);
        Coupon.query_get_coupons_3_statement = await db.prepare(Coupon.query_get_coupons_3);
        Coupon.query_redeem_statement = await db.prepare(Coupon.query_redeem);
        Coupon.query_expired_statement = await db.prepare(Coupon.query_expired);
        Coupon.query_delete_statement = await db.prepare(Coupon.query_delete);
        Coupon.initialized = true;
    }

    static async close() {
        await Coupon.query_all_statement?.finalize();
        await Coupon.query_create_statement?.finalize();
        await Coupon.query_get_coupon_statement?.finalize();
        await Coupon.query_get_coupons_1_statement?.finalize();
        await Coupon.query_get_coupons_2_statement?.finalize();
        await Coupon.query_get_coupons_3_statement?.finalize();
        await Coupon.query_redeem_statement?.finalize();
        await Coupon.query_expired_statement?.finalize();
        await Coupon.query_delete_statement?.finalize();
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
                created_date int not null default (strftime('%s','now')),
                expiration_date int not null,
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
                finish_date int check(
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
        values (?, ?, ?, ?, ?) returning *
    `;
    static query_create_statement: Statement | null = null;
    
    /** Redeem a coupon */
    static query_redeem = `
        update coupon set finish_date = (strftime('%s','now')), status = 1 where id = ?
        returning *
    `;
    static query_redeem_statement: Statement | null = null;
    
    /** Set a coupon as expired */
    static query_expired = `
        update coupon set finish_date = (strftime('%s','now')), status = 3 where id = ?
        returning *
    `;
    static query_expired_statement: Statement | null = null;
    
    /** Set a coupon as expired */
    static query_delete = `
        update coupon set finish_date = (strftime('%s','now')), status = 2 where id = ?
        returning *
    `;
    static query_delete_statement: Statement | null = null;

    /** Get specific coupon data */
    static query_get_coupon = `
        select * from coupon where id = ?
    `;
    static query_get_coupon_statement: Statement | null = null;

    /** Get all the coupons received and active for user */
    static query_get_coupons_1 = `
        select * from coupon where target_user = ? and status = 0
    `;
    static query_get_coupons_1_statement: Statement | null = null;

    /** Get all the coupons sent by a user */
    static query_get_coupons_2 = `
        select * from coupon where origin_user = ? and status in (0, 1, 2, 3) 
    `;
    static query_get_coupons_2_statement: Statement | null = null;

    /** Get all the coupons received by a user */
    static query_get_coupons_3 = `
        select * from coupon where target_user = ? and status in (0, 1, 2, 3)
    `;
    static query_get_coupons_3_statement: Statement | null = null;

    /** Pass origin and target user if you know for sure who they are, else just pass null and it will be check inside the function */
    static async parse_object(object: any, origin_user: User | null, target_user?: User | null): Promise<Coupon> {
        if (object.id === null || object.id === undefined) util.unreachable("parse coupon is missing field id!")
        if (object.title === null || object.title === undefined) util.unreachable("parse coupon is missing field title!")
        if (object.description === null || object.description === undefined) util.unreachable("parse coupon is missing field description!")
        if (object.created_date === null || object.created_date === undefined) util.unreachable("parse coupon is missing field created_date!")
        if (object.expiration_date === null || object.expiration_date === undefined) util.unreachable("parse coupon is missing field expiration_date!")
        if (object.origin_user === null || object.origin_user === undefined) util.unreachable("parse coupon is missing field origin_user!")
        if (object.target_user === null || object.target_user === undefined) util.unreachable("parse coupon is missing field target_user!")
        if (object.status === null || object.status === undefined) util.unreachable("parse coupon is missing field status!")
        if (!object.finish_date === undefined) util.unreachable("parse coupon is missing field finish_date!")

        if (!origin_user) {
            origin_user = await User.get_existing_user_internal(object.origin_user);
            if (!origin_user) throw new Error(`Unreachable: user ${object.origin_user} must exist, but it doesn't!`)
        }
        else {
            if (origin_user.internal_id !== object.origin_user) throw new Error("The origin_user provided doesn't match this coupon's origin_user!")
        }

        if (!target_user) {
            target_user = await User.get_existing_user_internal(object.target_user);
            if (!target_user) throw new Error(`Unreachable: user ${object.target_user} must exist, but it doesn't!`)
        }
        else {
            if (target_user.internal_id !== object.target_user) throw new Error("The target_user provided doesn't match this coupon's target_user!")
        }

        return new Coupon(
            object.id,
            object.title,
            object.description,
            util.parse_timestamp_unix_epoch_seconds(object.created_date),
            util.parse_timestamp_unix_epoch_seconds(object.expiration_date),
            origin_user,
            target_user,
            object.status as CouponStatus,
            object.finish_date !== null ? util.parse_timestamp_unix_epoch_seconds(object.finish_date) : null
        );
    }

    static async create_new_coupon(title: string, description: string, expiration_date: Date, origin_user: User, target_user: User): Promise<Coupon> {
        Coupon.require_initialized();
        try {
            let result = await Coupon.query_create_statement?.get(title, description, expiration_date.getTime()/1000, origin_user.internal_id, target_user.internal_id);
            const coupon = await Coupon.parse_object(result, origin_user, target_user);

            if (typeof coupon.id !== 'number' ) throw new Error("unreachable");
            // TODO check that creation date is in range
            if ((typeof coupon.status !== 'number') || ((coupon.status as CouponStatus) !== CouponStatus.Active) ) throw new Error("unreachable");
            if (coupon.finish_date !== null ) throw new Error("unreachable");
            if (coupon.origin_user.internal_id !== origin_user.internal_id) throw new Error("unreachable");
            if (coupon.target_user.internal_id !== target_user.internal_id) throw new Error("unreachable");

            console.log(`create new coupon: ` + util.inspect(coupon));
            return coupon;
        }
        finally {
            await Coupon.query_create_statement?.reset();
        }
    }

    static async redeem(coupon: Coupon): Promise<Coupon> {
        Coupon.require_initialized();
        try {
            let result = await Coupon.query_redeem_statement?.get(coupon.id);
            // The origin and target of a coupon dont change
            const coupon_updated = await Coupon.parse_object(result, coupon.origin_user, coupon.target_user);
            // console.log("redeemed!")
            console.log(`coupon redeemed: ` + util.inspect(coupon_updated));
            return coupon_updated;
        }
        finally {
            await Coupon.query_redeem_statement?.reset();
        }
    }

    static async set_expired(coupon: Coupon): Promise<Coupon> {
        Coupon.require_initialized();
        try {
            let result = await Coupon.query_expired_statement?.get(coupon.id);
            // The origin and target of a coupon dont change
            const coupon_updated = await Coupon.parse_object(result, coupon.origin_user, coupon.target_user);
            console.log(`coupon expired: ` + util.inspect(coupon_updated));
            return coupon_updated;
        }
        finally {
            await Coupon.query_expired_statement?.reset();
        }
    }

    static async set_deleted(coupon: Coupon): Promise<Coupon> {
        Coupon.require_initialized();
        try {
            let result = await Coupon.query_delete_statement?.get(coupon.id);
            // The origin and target of a coupon dont change
            const coupon_updated = await Coupon.parse_object(result, coupon.origin_user, coupon.target_user);
            console.log(`coupon deleted: ` + util.inspect(coupon_updated));
            return coupon_updated;
        }
        finally {
            await Coupon.query_delete_statement?.reset();
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

    static async get_received(user: User): Promise<Coupon[]> {
        Coupon.require_initialized();
        try {
            
            // We are getting the available for user, meaning target_user = user
            let target_user = user;

            let result: any[] = await Coupon.query_get_coupons_3_statement?.all(target_user.internal_id);
            let coupons: Array<Coupon> = new Array();
            for (let i = 0; i < result.length; i++) {
                coupons.push(await Coupon.parse_object(result[i], null, target_user));
            }
            return coupons;
        }
        finally {
            await Coupon.query_get_coupons_3_statement?.reset();
        }
    }

    static async get(id: number): Promise<Coupon|null> {
        Coupon.require_initialized();
        try {
            let result: any = await Coupon.query_get_coupon_statement?.get(id);
            if (!result) return null;
            const coupon = await Coupon.parse_object(result, null, null);
            return coupon;
        }
        finally {
            await Coupon.query_get_coupon_statement?.reset();
        }
    }

    static async get_sent(user: User): Promise<Coupon[]> {
        Coupon.require_initialized();
        try {
            
            // We are getting the available for user, meaning origin_user = user
            let origin_user = user;

            let result: any[] = await Coupon.query_get_coupons_2_statement?.all(origin_user.internal_id);
            let coupons: Array<Coupon> = new Array();
            for (let i = 0; i < result.length; i++) {
                coupons.push(await Coupon.parse_object(result[i], origin_user, null));
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

    /** Will return the updated coupon IFF the coupon was indeed updated in status */
    static async update_status(coupon: Coupon, now?: { timestamp_ms: number, date: Date }): Promise<Coupon | undefined> {
        
        if (coupon.status !== CouponStatus.Active) return;
        
        if (!now) {
            const date_now = new Date();
            now = {
                date: date_now,
                timestamp_ms: date_now.getTime()
            }
        }

        if (coupon.expiration_date.getTime() < now.timestamp_ms) {
            return await Coupon.set_expired(coupon);
        }
        
        return;
    }

    /** Given a list of coupons, return a list with the same coupons, except they have been updated where necessary */
    static async update_all(coupons: Coupon[]): Promise<Coupon[]> {
        const now = new Date();
        for (let i = 0; i < coupons.length; i++) {
            const coupon = coupons[i];
            const updated = await Coupon.update_status(coupon, { date: now, timestamp_ms: now.getTime() });
            if (updated) {
                coupons[i] = updated;
            }
        }
        return coupons;
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
