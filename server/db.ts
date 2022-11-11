import { User } from './src/User.js';
import { Coupon } from './src/Coupon.js';
import { Database, Statement } from './src/sqlite-async.js';

const main = async () => {
    const database: Database = await Database.open("./data/database.sqlite3");
    database.on("error", (err: Error) => {
        throw err;
    });
    
    await User.reset_table(database);
    await Coupon.reset_table(database);
    await User.initialize_statements(database);
    await Coupon.initialize_statements(database);
}

main();
