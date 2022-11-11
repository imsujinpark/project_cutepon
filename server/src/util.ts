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
