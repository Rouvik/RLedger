import DBHandler from "./DBHandler";
import type { TransactionEntryDetails, TransactionEntryDetailsView } from "./TableDefinitions";

class TransactionFunctionError extends Error {
    constructor(message: string) {
        super(`[LedgerFunctionError] ${message}`);
    }
}

/**
 * Gets the entire listing of TransactionView[] for all ledgers
 * @returns The minimal TransactionView entries for easy enumeration and printing for large requests
 */
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

        throw new TransactionFunctionError("Failed to query for transaction views\n" + error);
    }
}

/**
 * Gets the TrasactionView[] listing for a ledger ordered by creation_date
 * @param ledgerId The ledger to fetch transactions from
 * @returns TransactionsView[] listing
 */
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

        throw new TransactionFunctionError("Failed to query for transaction views\n" + error);
    }
}

/**
 * Gets the TrasactionView[] listing for a ledger ordered by creation_date with pagination
 * @param ledgerId The ledger to fetch transactions from
 * @param offset The offset to start reading from for pagination
 * @param limit The number of rows to read
 * @returns The TransactionView[] listing
 */
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

        throw new TransactionFunctionError("Failed to query for transaction views\n" + error);
    }
}

/**
 * TransactionFilters type to filter over, look at getTransactionViewListFilterByLedgerOrderByCreationPagedWithFilters(ledgerId: number, offset: number, limit: number, filters: TransactionViewFilters) for more info
 */
export type TransactionViewFilters = {
    minCreationDate?: number,
    maxCreationDate?: number,
    minTransactionDate?: number,
    maxTransactionDate?: number,
    minAmount?: number,
    maxAmount?: number
};

/**
 * Gets the TransactionView[] listing with pagination and complex filtering as described in TransactionViewFilters, all bounds inclusive
 * @param ledgerId The ledger to get transactions from
 * @param offset The offset to read rows from
 * @param limit The number of rows to read
 * @param filters The filtering to apply while reading, if it is {}, then it behaves similar to getTransactionViewListFilterByLedgerOrderByCreationPaged but with worser performance
 * @returns The TransactionView[] listing
 */
export async function getTransactionViewListFilterByLedgerOrderByCreationPagedWithFilters(ledgerId: number, offset: number, limit: number, filters: TransactionViewFilters) {
    const db = await DBHandler.getDB();
    try {
        const filterComponents = [];
        const filterArguments = [];

        if (filters.minAmount != undefined) {
            filterComponents.push("amount >= ?");
            filterArguments.push(filters.minAmount);
        }

        if (filters.maxAmount != undefined) {
            filterComponents.push("amount <= ?");
            filterArguments.push(filters.maxAmount);
        }

        if (filters.minCreationDate != undefined) {
            filterComponents.push("create_time >= ?");
            filterArguments.push(filters.minCreationDate);
        }

        if (filters.maxCreationDate != undefined) {
            filterComponents.push("create_time <= ?");
            filterArguments.push(filters.maxCreationDate);
        }

        if (filters.minTransactionDate != undefined) {
            filterComponents.push("transaction_time >= ?");
            filterArguments.push(filters.minTransactionDate);
        }

        if (filters.maxTransactionDate != undefined) {
            filterComponents.push("transaction_time <= ?");
            filterArguments.push(filters.maxTransactionDate);
        }

        const trasactionQuery = await db.query(`SELECT id, name, amount FROM TRANSACTIONS WHERE ledger_id = ? ${filterComponents.length ? " AND " + filterComponents.join(" AND ") : ""} ORDER BY create_time DESC LIMIT ? OFFSET ?;`, [ledgerId, ...filterArguments, limit, offset]);

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

        throw new TransactionFunctionError("Failed to query for transaction views\n" + error);
    }
}

/**
 * Gets the number of transactions in a ledger
 * @param ledgerId The ledger to get transactions from
 * @returns The number of transactions in a ledger
 */
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

        throw new TransactionFunctionError("Failed to query for transaction count\n" + error);
    }
}

/**
 * Type to store complete Transaction information and is consequently more verbose than TransactionView
 */
export type TransactionInfo = {
    name: string,
    details: string,
    amount: number,
    transaction_time: number
};

/**
 * Adds a transaction to a ledger specified by ledger id
 * @param ledgerId The ledger to add transaction to
 * @param transactionValues The Transaction information to store in DB
 */
export async function addTransactionToLedger(ledgerId: number, transactionValues: TransactionInfo) {
    const db = await DBHandler.getDB();

    try {
        await db.run("INSERT INTO TRANSACTIONS (ledger_id, name, details, amount, transaction_time) VALUES (?, TRIM(?), TRIM(?), ?, ?)",
            [
                ledgerId,
                transactionValues.name,
                transactionValues.details,
                transactionValues.amount,
                transactionValues.transaction_time
            ]
        );
    } catch (error) {
        throw new TransactionFunctionError("Failed to insert transaction info check your values and please try again\n" + error);
    }
}

/**
 * Gets the total amount in a ledger by summing all transaction amount entries in the ledger
 * @param ledgerId The ledger to get total transaction amount from
 * @returns The total amount of monetary value in a ledger, computed by adding all amount fields in transactions in the ledger
 */
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

        throw new TransactionFunctionError("Failed to query for transaction count\n" + error);
    }
}

/**
 * Dedicated type for getTransactionSumAndTotalByLedger(ledgerId: number) to get both the transaction count and sum
 */
export type TransactionCountAndSumTuple = {
    count: number,
    sum: number
};

/**
 * Gets the count and sum for all transactions in a ledger, used as a optimised path for Totals view to prevent multiple calls to DB
 * @param ledgerId The ledger to get count and sum from
 * @returns The object containing count and sum of all transactions in the ledger
 */
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

        throw new TransactionFunctionError("Failed to query for transaction count\n" + error);
    }
}

/**
 * Gets the complete information for a transaction
 * @param transactionId The id of transaction to fetch info for
 * @returns The complete transaction details
 */
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

        throw new TransactionFunctionError("Failed to query for transaction info\n" + error);
    }
}

/**
 * Updates the transaction with id specified in transactionValues.id with other values in transactionValues (id is obviously not updated to anything)
 * @param transactionValues The values to update in the transaction, note transaction id is used in this field to find the corresponding transaction, and must be valid pointing to correct transaction
 */
export async function updateTransaction(transactionValues: TransactionEntryDetails) {
    const db = await DBHandler.getDB();

    try {
        await db.run(
            `UPDATE TRANSACTIONS
            SET name = ?, details = ?, amount = ?, transaction_time = ?
            WHERE id = ?;`,
            [
                transactionValues.name,
                transactionValues.details,
                transactionValues.amount,
                transactionValues.transaction_time,
                transactionValues.id
            ]);
    } catch (error) {
        throw new TransactionFunctionError("Failed to update transaction, please check if details are valid\n" + error);
    }
}

/**
 * Removes a transaction from the ledger
 * @param transactionId The transaction to remove
 */
export async function deleteTransaction(transactionId: number) {
    const db = await DBHandler.getDB();

    try {
        await db.run("DELETE FROM TRANSACTIONS WHERE id = ?;", [transactionId]);
    } catch (error) {
        throw new TransactionFunctionError("Failed to delete transaction\n" + error);
    }
}

export default {
    getTransactionViewList,
    getTransactionViewListFilterByLedgerOrderByCreation,
    getTransactionViewListFilterByLedgerOrderByCreationPaged,
    getTransactionViewListFilterByLedgerOrderByCreationPagedWithFilters,
    addTransactionToLedger,
    getTransactionCountByLedger,
    getTransactionTotalByLedger,
    getTransactionSumAndTotalByLedger,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};