import DBHandler from "./DBHandler";
import type { LedgerEntryDetails } from "./TableDefinitions";

export async function getLedger(ledgerId: number) {
    const db = await DBHandler.getDB();
    try {
        const ledgerQuery = await db.query("SELECT * from LEDGERS WHERE id = ?;", [ledgerId]);
        console.log(ledgerQuery);

        if (ledgerQuery.values) {
            return ledgerQuery.values[0] as LedgerEntryDetails
        }
        else {
            return null;
        }
    } catch (error) {
        alert("Error failed to get ledger!" + error);
        return null;
    }
}

export default {
    getLedger
};