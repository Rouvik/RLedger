/**
 * Checks fields name and amount of transaction for validity
 * @param name The name field of transaction
 * @param amt The amount field of transaction
 * @returns true if all fields are valid else false
 */
export function validateTransactionFields(name: string, amt: string) {
    if (!name || (name.trim()).length == 0) {
        alert("Error name is required");
        return false;
    }

    if (!amt || amt.length == 0 || +amt == 0) {
        alert("Error amount is required");
        return false;
    }
    if (!(/^(?:-)?[0-9]{1,13}(?:\.[0-9]{1,4})?$/.test(amt))) {
        alert("Error amount must be a number, optionally with '.' for a paise and (1,13) character before '.' and (1,4) character after '.'");
        return false;
    }

    return true;
}

export default {
    validateTransactionFields
}