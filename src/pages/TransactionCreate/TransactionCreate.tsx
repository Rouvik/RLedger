import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LedgerFunctions from "../../db/LedgerFunctions";
import type { LedgerEntryDetails } from "../../db/TableDefinitions";
import TransactionFunctions from "../../db/TransactionFunctions";
import style from "./TransactionCreate.module.css";

function validateFields(name: string, amt: string) {
    if (!name && name.length == 0) {
        alert("Error name is required");
        return false;
    }

    if (!amt && amt.length == 0) {
        alert("Error amount is required");
        return false;
    }
    if (!(/^(?:-)?[0-9]{1,13}(?:\.[0-9]{1,4})?$/.test(amt))) {
        alert("Error amount must be a number, optionally with '.' for a paise and (1,13) character before '.' and (1,4) character after '.'");
        return false;
    }

    return true;
}

export default function TransactionCreate() {
    const { ledgerId } = useParams();
    const [ledger, setLedger] = useState<LedgerEntryDetails>();
    const navigator = useNavigate();

    const nameRef = useRef<HTMLInputElement>(null);
    const amtRef = useRef<HTMLInputElement>(null);
    const detailsRef = useRef<HTMLTextAreaElement>(null);
    const trnTimeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        (
            async () => {
                if (!ledgerId) {
                    alert("Error ledger is undefined!");
                    navigator(-1);
                    return;
                }

                try {
                    setLedger(await LedgerFunctions.getLedger(+ledgerId));
                } catch (error) {
                    alert(error);
                    navigator(-1);
                    return;
                }
            }
        )();

        return () => { }
    }, []);

    async function addTransaction() {
        const name = (nameRef.current as HTMLInputElement).value;
        const amt = (amtRef.current as HTMLInputElement).value;
        const details = (detailsRef.current as HTMLTextAreaElement).value;
        const trnTime = (trnTimeRef.current as HTMLInputElement).value;

        if (!validateFields(name, amt)) {
            return;
        }

        try {
            await TransactionFunctions.addTransactionToLedger(+(ledgerId as string), {
                name,
                amount: +amt,
                details,
                transaction_time: new Date(trnTime).getTime()
            });
        } catch (error) {
            alert(error);
            return;
        }

        navigator(`/ledgerview/${ledgerId}`, { replace: true });
    }

    return (
        <div className={style.container}>
            <h1>Adding transaction to "{ledger?.name}"</h1>
            <label htmlFor="trnName">Name<sup className={style.required}>*</sup> : <input type="text" id="trnName" ref={nameRef} /></label>
            <label htmlFor="trnAmt">Amount<sup className={style.required}>*</sup> : <input type="number" id="trnAmt" ref={amtRef} /></label>
            <label htmlFor="trnDetails">Details: <textarea id="trnDetails" ref={detailsRef}></textarea></label>
            <label htmlFor="trnTime">Transaction Time: <input type="datetime-local" id="trnTime" ref={trnTimeRef} /></label>

            <div>
                <button onClick={() => addTransaction()}>Add</button>
                <button onClick={() => navigator(-1)}>Back</button>
            </div>
        </div>
    )
}