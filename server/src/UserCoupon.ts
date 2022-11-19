import { Coupon } from './Coupon.js';
import { Database, Statement } from './sqlite-async.js';
import { User } from './User.js';
import * as util from './util.js';

export class UserCoupon {

    /** The internal_id of the user */
    readonly user: User;
    /** The id of the coupon */
    readonly coupon: Coupon;
    /** SQLite internal row id */
    readonly rowid: number;
    /** Whether the user has hidden a coupon or not */
    hidden: boolean;

    private constructor(user_id: User, coupon_id: Coupon, hidden: boolean, rowid: number) {
        this.user = user_id;
        this.coupon = coupon_id;
        this.hidden = hidden;
        this.rowid = rowid;
    }

    primitive(): any {
        return {
            hidden: this.hidden,
        }
    }

    static async reset_table(db: Database) {
        await db.run(`
            drop table if exists user_coupon;
        `);
        // TODO Test whether the double primary key is a kept constraint
        // TODO Test that boolean cant be other than 0 or 1
        await db.run(`
            create table user_coupon (
                user_id integer not null,
                coupon_id integer not null,
                hidden boolean not null check (hidden in (0, 1)) default 0,
                primary key (user_id, coupon_id)
            );
        `);
    }

    static initialized: boolean = false;
    static async initialize_statements(db: Database) {
        UserCoupon.query_get_user_coupon_statement = await db.prepare(UserCoupon.query_get_user_coupon);
        UserCoupon.query_insert_update_user_coupon_statement = await db.prepare(UserCoupon.query_insert_update_user_coupon);
        UserCoupon.query_insert_ignore_user_coupon_statement = await db.prepare(UserCoupon.query_insert_ignore_user_coupon);
        UserCoupon.initialized = true;
    }

    static query_insert_ignore_user_coupon = `
        insert or ignore into user_coupon (user_id, coupon_id) values (?, ?) returning rowid, *;
    `;
    static query_insert_ignore_user_coupon_statement: Statement | null = null;
    static query_get_user_coupon = `
        select rowid, * from user_coupon where user_id = ? and coupon_id = ?;
    `;
    static query_get_user_coupon_statement: Statement | null = null;
    static query_insert_update_user_coupon = 'insert or replace into user_coupon (user_id, coupon_id, hidden) values (?, ?, ?);';
    static query_insert_update_user_coupon_statement: Statement | null = null;

    static async parse_object(object: any, user?: User, coupon?: Coupon): Promise<UserCoupon> {

        util.require_not_null(object.user_id);
        util.require_not_null(object.coupon_id);
        util.require_not_null(object.hidden);
        util.require_not_null(object.rowid);
        
        if (user) {
            if (user.internal_id !== object.user_id) throw new Error("Provided user and objects user dont match!")
        }
        else {
            user = await User.get_existing_user_internal(object.user_id) ?? util.unreachable();
        }

        if (coupon) {
            if (coupon.id !== object.coupon_id) throw new Error("Provided coupon and objects coupon dont match!")
        }
        else {
            coupon = await Coupon.get(object.coupon_id) ?? util.unreachable();
        }

        return new UserCoupon(user, coupon, object.hidden as boolean, object.rowid as number);
    }

    // Returns the UserCoupon relationship data
    static async get(user: User, coupon: Coupon): Promise<UserCoupon> {
        UserCoupon.require_initialized();

        if (coupon.target_user.internal_id !== user.internal_id && coupon.origin_user.internal_id !== user.internal_id) {
            throw new Error(`The user and coupon have no relationship!`);
        }

        try {
            let create_result = await UserCoupon.query_insert_ignore_user_coupon_statement?.get(user.internal_id, coupon.id);
            if (create_result) {
                // This will only happen the first time that a UserCoupon is created
                const user_coupon = await UserCoupon.parse_object(create_result, user, coupon);
                util.log(`Registered a UserCoupon ${util.inspect(user_coupon)}`);
                return user_coupon;
            }
        }
        finally {
            await UserCoupon.query_insert_ignore_user_coupon_statement?.reset();
        }

        try {
            let result = await UserCoupon.query_get_user_coupon_statement?.get(user.internal_id, coupon.id);
            const user_coupon = await UserCoupon.parse_object(result, user, coupon);
            return user_coupon;
        }
        finally {
            await UserCoupon.query_get_user_coupon_statement?.reset();
        }
    }

    // Sets the user data to every and each coupon
    // Every coupon must be related to the user
    static async get_all(user: User, coupons: Coupon[]) {
        UserCoupon.require_initialized();

        for (let i = 0; i < coupons.length; i++) {
            const coupon = coupons[i];
            if (coupon.target_user.internal_id !== user.internal_id && coupon.origin_user.internal_id !== user.internal_id) {
                throw new Error(`The user and coupon have no relationship!`);
            }

            try {
                let create_result = await UserCoupon.query_insert_ignore_user_coupon_statement?.get(user.internal_id, coupon.id);
                if (create_result) {
                    // This will only happen the first time that a UserCoupon is created
                    const user_data = await UserCoupon.parse_object(create_result, user, coupon);
                    util.log(`Registered a UserCoupon ${util.inspect(user_data)}`);
                    coupon.set_user_data(user_data);
                    continue;
                }
            }
            finally {
                await UserCoupon.query_insert_ignore_user_coupon_statement?.reset();
            }
    
            try {
                let result = await UserCoupon.query_get_user_coupon_statement?.get(user.internal_id, coupon.id);
                const user_data = await UserCoupon.parse_object(result, user, coupon);
                coupon.set_user_data(user_data);
                continue;
            }
            finally {
                await UserCoupon.query_get_user_coupon_statement?.reset();
            }
        }

    }

    // Updates the UserCoupon relationship data of the given coupon
    static async update(user_coupon: UserCoupon) {
        UserCoupon.require_initialized();
        try {
            await UserCoupon.query_insert_update_user_coupon_statement?.get(user_coupon.user.internal_id, user_coupon.coupon.id, user_coupon.hidden ? 1 : 0);
        }
        finally {
            await UserCoupon.query_insert_update_user_coupon_statement?.reset();
        }
    }

    static require_initialized() {
        if (!UserCoupon.initialized) throw new Error("UserCoupon model not initialized!");
    }

}
