import { User } from './src/User.js';
import { Coupon } from './src/Coupon.js';
import { Database, Statement } from './src/sqlite-async.js';
import { UserCoupon } from './src/UserCoupon.js';

const version = 2;
const main = async () => {
    const database: Database = await Database.open("./data/database.sqlite3");
    database.on("error", (err: Error) => {
        throw err;
    });
    
    if (version <= 1) {
        await User.reset_table(database);
        await Coupon.reset_table(database);
     
        await User.initialize_statements(database);
        await Coupon.initialize_statements(database);
    }

    if (version <= 2) {
        await UserCoupon.reset_table(database);
        await UserCoupon.initialize_statements(database);
    }
}

main();
