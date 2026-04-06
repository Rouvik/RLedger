/**
 * Valid the ledger fields for correctness
 * @param name The ledger name string to validate
 * @returns true if all fields are valid else false
 */
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