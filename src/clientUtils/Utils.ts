export function wrapAlertErrorFn(fn: (...args: any[]) => any) {
    return (...args: any[]) => {
        try {
            return fn(args);
        } catch (error) {
            alert(error);
        }
    }
}

export default {
    wrapAlertErrorFn
}