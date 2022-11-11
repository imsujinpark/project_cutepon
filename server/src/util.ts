export function require_not_null(object: any): void {
    if (!object) throw new Error("required non null!");
}
export function throw_expression(msg: string): never {
    throw new Error(msg);
}
export function unreachable(msg?: string): never {
    throw new Error("Unreachable: " + msg);
}
export const hour_in_ms = 3600000;
export const day_in_ms = hour_in_ms * 24;
