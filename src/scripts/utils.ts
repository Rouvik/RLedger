/**
 * Converts back a UNIX time value to a Datetime local
 * @param datetime The UNIX time number to convert
 * @returns The Datetime local string after conversion or "" for null datetime
 */
export function toDatetimeLocal(datetime: number | null) {
    if (datetime == null) {
        return "";
    }

    const date = new Date(datetime);

    const pad = (n: number) => n.toString().padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Combines the date and time (optional) field from inputs and returns the corresponding UNIX time
 * @param date The date string from input field
 * @param time The time string from input field
 * @returns The combined date (+ time) UNIX time value
 */
export function getDateWithOptionalTime(date: string | undefined, time: string | undefined) {
    if (date) {
        if (time) {
            return new Date(`${date}T${time}`).getTime();
        }
        else {
            return new Date(date).getTime();
        }
    }
    else {
        return undefined;
    }
}

export default {
    toDatetimeLocal,
    getDateWithOptionalTime
};
