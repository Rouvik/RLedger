import DBHandler from "./DBHandler";
import type { TransactionEntryDetails, TransactionEntryDetailsView } from "./TableDefinitions";

class TransactionFunctionError extends Error {
    constructor(message: string) {
        super(`[LedgerFunctionError] ${message}`);
    }
}

export async function getTransactionViewList() {
    const db = await DBHandler.getDB();
    try {
        const trasactionQuery = await db.query("SELECT id, ledger_id, name, amount FROM TRANSACTIONS;");

        if (trasactionQuery.values) {
            return trasactionQuery.values as TransactionEntryDetailsView[];
        }
        else {
            throw new TransactionFunctionError("Failed to get transactions view listing");
        }
    } catch (error) {
        if (error instanceof TransactionFunctionError) {
            throw error;
        }

        throw new TransactionFunctionError("Failed to query for transaction views " + error);
    }
}

export async function getTransactionViewListFilterByLedgerOrderByCreation(ledgerId: number) {
    const db = await DBHandler.getDB();
    try {
        const trasactionQuery = await db.query("SELECT id, name, amount FROM TRANSACTIONS WHERE ledger_id = ? ORDER BY create_time DESC;", [ledgerId]);

        if (trasactionQuery.values) {
            return trasactionQuery.values as TransactionEntryDetailsView[];
        }
        else {
            throw new TransactionFunctionError("Failed to get transactions view listing");
        }
    } catch (error) {
        if (error instanceof TransactionFunctionError) {
            throw error;
        }

        throw new TransactionFunctionError("Failed to query for transaction views " + error);
    }
}

export async function getTransactionViewListFilterByLedgerOrderByCreationPaged(ledgerId: number, offset: number, limit: number) {
    const db = await DBHandler.getDB();
    try {
        const trasactionQuery = await db.query("SELECT id, name, amount FROM TRANSACTIONS WHERE ledger_id = ? ORDER BY create_time DESC LIMIT ? OFFSET ?;", [ledgerId, limit, offset]);

        if (trasactionQuery.values) {
            return trasactionQuery.values as TransactionEntryDetailsView[];
        }
        else {
            throw new TransactionFunctionError("Failed to get transactions view listing");
        }
    } catch (error) {
        if (error instanceof TransactionFunctionError) {
            throw error;
        }

        throw new TransactionFunctionError("Failed to query for transaction views " + error);
    }
}

export async function getTransactionCountByLedger(ledgerId: number) {
    const db = await DBHandler.getDB();
    try {
        const trasactionQuery = await db.query("SELECT COUNT(*) FROM TRANSACTIONS WHERE ledger_id = ?;", [ledgerId]);

        if (trasactionQuery.values && trasactionQuery.values.length > 0) {
            return trasactionQuery.values[0]["COUNT(*)"] as number;
        }
        else {
            throw new TransactionFunctionError("Failed to get transactions count");
        }
    } catch (error) {
        if (error instanceof TransactionFunctionError) {
            throw error;
        }

        throw new TransactionFunctionError("Failed to query for transaction count " + error);
    }
}

type TransactionInfo = {
    name: string,
    details: string,
    amount: number,
    transaction_time: number
};

export async function addTransactionToLedger(ledgerId: number, transactionValues: TransactionInfo) {
    const db = await DBHandler.getDB();

    try {
        await db.run("INSERT INTO TRANSACTIONS (ledger_id, name, details, amount, transaction_time) VALUES (?, ?, ?, ?, ?)", 
            [
                ledgerId,
                transactionValues.name,
                transactionValues.details,
                transactionValues.amount,
                transactionValues.transaction_time
            ]
        );
    } catch (error) {
        throw new TransactionFunctionError("Failed to insert transaction info check your values and please try again " + error);
    }
}

export async function getTransactionTotalByLedger(ledgerId: number) {
    const db = await DBHandler.getDB();
    try {
        const trasactionQuery = await db.query("SELECT SUM(amount) FROM TRANSACTIONS WHERE ledger_id = ?;", [ledgerId]);

        if (trasactionQuery.values && trasactionQuery.values.length > 0) {
            return trasactionQuery.values[0]["SUM(amount)"] as number;
        }
        else {
            throw new TransactionFunctionError("Failed to get transactions count");
        }
    } catch (error) {
        if (error instanceof TransactionFunctionError) {
            throw error;
        }

        throw new TransactionFunctionError("Failed to query for transaction count " + error);
    }
}

export type TransactionCountAndSumTuple = {
    count: number,
    sum: number
};

export async function getTransactionSumAndTotalByLedger(ledgerId: number) {
    const db = await DBHandler.getDB();
    try {
        const trasactionQuery = await db.query("SELECT COUNT(*) AS count, COALESCE (SUM(amount), 0) AS sum FROM TRANSACTIONS WHERE ledger_id = ?;", [ledgerId]);

        if (trasactionQuery.values && trasactionQuery.values.length > 0) {
            return trasactionQuery.values[0] as TransactionCountAndSumTuple;
        }
        else {
            throw new TransactionFunctionError("Failed to get transactions count");
        }
    } catch (error) {
        if (error instanceof TransactionFunctionError) {
            throw error;
        }

        throw new TransactionFunctionError("Failed to query for transaction count " + error);
    }
}

export async function getTransactionById(transactionId: number) {
    const db = await DBHandler.getDB();

    try {
        const transaction = await db.query("SELECT * from TRANSACTIONS WHERE id = ?;", [transactionId]);

        if (transaction.values && transaction.values.length > 0) {
            return transaction.values[0] as TransactionEntryDetails;
        }
        else {
            throw new TransactionFunctionError("No such transaction info found");
        }
    } catch (error) {
        if (error instanceof TransactionFunctionError) {
            throw error;
        }

        throw new TransactionFunctionError("Failed to query for transaction info" + error);
    }
}

export default {
    getTransactionViewList,
    getTransactionViewListFilterByLedgerOrderByCreation,
    getTransactionViewListFilterByLedgerOrderByCreationPaged,
    addTransactionToLedger,
    getTransactionCountByLedger,
    getTransactionTotalByLedger,
    getTransactionSumAndTotalByLedger,
    getTransactionById
};