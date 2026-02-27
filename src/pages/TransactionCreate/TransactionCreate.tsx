import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import type { LedgerEntryDetails } from "../../db/TableDefinitions";
import LedgerFunctions from "../../db/LedgerFunctions";

export default function TransactionCreate() {
    const { ledgerId } = useParams();
    const [ledger, setLedger] = useState<LedgerEntryDetails>();
    const navigator = useNavigate();

    useEffect(() => {
        (
            async () => {
                if (!ledgerId) {
                    alert("Error ledger is undefined!");
                    navigator(-1);  // go back
                    return;
                }

                const led = await LedgerFunctions.getLedger(+ledgerId);
                if (led) {
                    setLedger(led);
                }
                else {
                    alert("Error ledger not found!");
                    navigator(-1);
                    return;
                }
            }
        )();

        return () => {}
    }, []);

    return (
        <div>
            <h1>Adding transaction to "{ ledger?.name }"</h1>
        </div>
    )
}