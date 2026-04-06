export function toDatetimeLocal(datetime: number | null) {
    if (datetime == null) {
        return "";
    }

    const date = new Date(datetime);

    const pad = (n: number) => n.toString().padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

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
