import * as util from "util"

export function require_not_null(object: any): void {
    if (!object) throw new Error("required non null!");
}
export function throw_expression(msg: string): never {
    throw new Error(msg);
}
export function unreachable(msg?: string): never {
    throw new Error("Unreachable: " + msg);
}
export function log(obj: any): void {
    if (typeof obj === 'string') {
        console.log(obj)
    }
    else {
        const formatted = util.inspect(obj, { showHidden: false, depth: null, colors: true })
        console.log(formatted)
    }
}
export function inspect(obj: any): string {
    return util.inspect(obj, { showHidden: false, depth: null, colors: true })
}
export const hour_in_ms = 3600000;
export const day_in_ms = hour_in_ms * 24;

// Use it on every date coming out of sqlite.
// Return a Date object from a given datetime string that comes out of sqlite.
export const parse_sqlite_datetime_text = (sql_date: string): Date => {
    
    // sql_date is always an UTC date string.
    // But doing `new Date(sql_date)`, js thinks that sql_date is a local datetime string
    // I have not managed to do something like `new Date(sql_date, 'UTC'))` so that js knows that its already an utc date...
    // So in order to make a Date object with the correct date, I have to make a "UTC Datetime String" using `Date.UTC()`, and
    // then parse that string doing `new Date(utc_date_string)`...
    
    // This date is "correctly" parsed, but the `Date` class doesn't know that its a UTC date, so assumes its local date.
    const date: Date = new Date(sql_date);
    
    // Methods like `getFullYear` or `getMonth` will return the "local" timezoned month and year. But since
    // it thinks that the sql_date was local time to start with, those methods will give us the UTC values.
    // So this utc_timestamp is a correct timestamp in the correct timezone.
    const utc_timestamp: number = Date.UTC(
        date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()
    );
    
    // unlike the sql_date string, it will assume that this timestamp is indeed UTC (which it is), so this Date is finally correct
    const utc_date = new Date(utc_timestamp);
    log(utc_date);
    return utc_date;
}

export const parse_timestamp_unix_epoch_seconds = (unix_seconds_ts: number): Date => {
    const date: Date = new Date(unix_seconds_ts * 1000);
    return date;
    
}
