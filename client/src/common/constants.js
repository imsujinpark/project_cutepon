export const Status = {
    ACTIVE: "active",
    DISABLED: "disabled"
}

export const StatusText = {
    ACTIVE: Status.ACTIVE.charAt(0).toUpperCase + Status.ACTIVE.slice(1),
    DISABLED: Status.DISABLED.charAt(0).toUpperCase + Status.DISABLED.slice(1),
}