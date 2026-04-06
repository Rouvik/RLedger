import DBHandler from "./DBHandler";
import type { LedgerEntryDetails, LedgerEntryDetailsView } from "./TableDefinitions";

class LedgerFunctionError extends Error {
    constructor(message: string) {
        super(`[LedgerFunctionError] ${message}`);
    }
}

/**
 * Gets complete info of a ledger
 * @param ledgerId The id of ledger to fetch
 * @returns The LedgerEntryDetails containing complete info of ledger
 */
export async function getLedger(ledgerId: number) {
    const db = await DBHandler.getDB();
    try {
        const ledgerQuery = await db.query("SELECT * from LEDGERS WHERE id = ?;", [ledgerId]);

        if (ledgerQuery.values && ledgerQuery.values.length > 0) {
            return ledgerQuery.values[0] as LedgerEntryDetails
        }
        else {
            throw new LedgerFunctionError("Failed to find required ledger");
        }
    } catch (error) {
        if (error instanceof LedgerFunctionError) {
            throw error;
        }

        throw new LedgerFunctionError("Failed to query for ledger\n" + error);
    }
}

/**
 * Gets a minimised LedgerEntryDetailsView[] for enumeration
 * @returns The LedgerEntryDetailsView[] containing basic ledger info
 */
export async function getLedgerViewList() {
    const db = await DBHandler.getDB();

    try {
        const ret = await db.query("SELECT id, name FROM LEDGERS;");
        if (ret.values) {
            return ret.values as LedgerEntryDetailsView[];
        }
        else {
            throw new LedgerFunctionError("Failed to get ledgers view listing");
        }
    } catch (error) {
        if (error instanceof LedgerFunctionError) {
            throw error;
        }

        throw new LedgerFunctionError("Failed to query for ledger views\n" + error);
    }
}

/**
 * Gets the complete LedgerEntryDetails for a particular ledger
 * @param ledgerId The id of ledger to get
 * @returns The complete LedgerEntryDetails of requested ledger
 */
export async function getLedgerById(ledgerId: number) {
    const db = await DBHandler.getDB();

    try {
        const ret = await db.query("SELECT id, name FROM LEDGERS WHERE id = ?;", [ledgerId]);
        if (ret.values && ret.values.length > 0) {
            return ret.values[0] as LedgerEntryDetails;
        }
        else {
            throw new LedgerFunctionError("Failed to get ledger view");
        }
    } catch (error) {
        if (error instanceof LedgerFunctionError) {
            throw error;
        }

        throw new LedgerFunctionError("Failed to query for ledger view\n" + error);
    }
}

/**
 * Gets the number of ledgers in DB
 * @returns The number of ledgers in DB
 */
export async function getLedgerCount() {
    const db = await DBHandler.getDB();

    try {
        const ret = await db.query("SELECT COUNT(*) FROM LEDGERS;");
        if (ret.values && ret.values.length > 0) {
            return ret.values[0]["COUNT(*)"] as number;
        }
        else {
            throw new LedgerFunctionError("Failed to get ledgers count");
        }
    } catch (error) {
        if (error instanceof LedgerFunctionError) {
            throw error;
        }

        throw new LedgerFunctionError("Failed to query for ledger count\n" + error);
    }
}

/**
 * Dedicated type of count and sum for use in getLedgerCountAndSum()
 */
export type LedgerCountAndSumTuple = {
    count: number,
    sum: number
};

/**
 * Gets the count of all ledgers, and sum of all transactions of all ledgers, ie. the net amount in account
 * @returns The count of all ledgers and sum of all transactions of all ledgers
 */
export async function getLedgerCountAndSum() {
    const db = await DBHandler.getDB();

    try {
        const ret = await db.query("SELECT (SELECT COUNT(*) FROM LEDGERS) AS count, (SELECT COALESCE(SUM(amount), 0) FROM TRANSACTIONS) AS sum;");
        if (ret.values && ret.values.length > 0) {
            return ret.values[0] as LedgerCountAndSumTuple;
        }
        else {
            throw new LedgerFunctionError("Failed to get ledgers count");
        }
    } catch (error) {
        if (error instanceof LedgerFunctionError) {
            throw error;
        }

        throw new LedgerFunctionError("Failed to query for ledger count\n" + error);
    }
}

/**
 * Deletes a ledger from DB by id
 * @param ledgerId The id of ledger to remove
 */
export async function deleteLedgerById(ledgerId: number) {
    const db = await DBHandler.getDB();

    try {
        await db.run("DELETE FROM LEDGERS WHERE id = ?", [ledgerId]);
    } catch (error) {
        throw new LedgerFunctionError("Failed to delete ledger\n" + error);
    }
}

/**
 * Updates a ledger entry in DB with id as ledgerValues.id, which must be valid
 * @param ledgerValues The LedgerEntryDetails to update to a ledger, note: the id in ledgerValues is used to pick the ledger to update and must be valid
 */
export async function updateLedger(ledgerValues: LedgerEntryDetails) {
    const db = await DBHandler.getDB();

    try {
        await db.run(
            `UPDATE LEDGERS
            SET name = ?, img = ?
            WHERE id = ?;`,
            [
                ledgerValues.name,
                ledgerValues.img,
                ledgerValues.id
            ]
        );
    } catch (error) {
        throw new LedgerFunctionError("Failed to update ledger entry, please check the inputs and try again\n" + error);
    }
}

/**
 * Adds a new ledger to DB
 * @param ledgerValues The values of the new ledger to add, note: id is removed in this field and assigned by DB, as mentioned in type
 */
export async function addLedger(ledgerValues: Omit<LedgerEntryDetails, "id">) {
    const db = await DBHandler.getDB();
    try {
        await db.run("INSERT INTO LEDGERS (NAME) VALUES (TRIM(?))", [ledgerValues.name]);
    } catch (error) {
        throw new LedgerFunctionError("Failed to add ledger\n" + error);
    }
}

export default {
    getLedger,
    getLedgerViewList,
    getLedgerById,
    getLedgerCount,
    getLedgerCountAndSum,
    deleteLedgerById,
    updateLedger,
    addLedger
};