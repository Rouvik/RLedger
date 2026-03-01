export function validateLedgerFields(name: string) {
    if (!name || (name.trim()).length == 0) {
        alert("Error name fields is required");
        return false;
    }

    return true;
}

export default {
    validateLedgerFields
};