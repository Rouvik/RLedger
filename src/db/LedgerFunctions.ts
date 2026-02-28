import DBHandler from "./DBHandler";
import type { LedgerEntryDetails, LedgerEntryDetailsView } from "./TableDefinitions";

class LedgerFunctionError extends Error {
    constructor(message: string) {
        super(`[LedgerFunctionError] ${message}`);
    }
}

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

        throw new LedgerFunctionError("Failed to query for ledger " + error);
    }
}

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

        throw new LedgerFunctionError("Failed to query for ledger views " + error);
    }
}

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

        throw new LedgerFunctionError("Failed to query for ledger count " + error);
    }
}

export type LedgerCountAndSumTuple = {
    count: number,
    sum: number
};

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

        throw new LedgerFunctionError("Failed to query for ledger count " + error);
    }
}


export async function deleteLedgerById(ledgerId: number) {
    const db = await DBHandler.getDB();

    try {
        await db.run("DELETE FROM LEDGERS WHERE id = ?", [ledgerId]);
    } catch (error) {
        throw new LedgerFunctionError("Failed to delete ledger " + error);
    }
}

export default {
    getLedger,
    getLedgerViewList,
    getLedgerCount,
    getLedgerCountAndSum,
    deleteLedgerById
};