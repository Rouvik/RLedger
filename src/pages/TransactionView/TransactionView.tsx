import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { TransactionEntryDetails } from "../../db/TableDefinitions";
import TransactionFunctions from "../../db/TransactionFunctions";
import { toDatetimeLocal } from "../../scripts/utils";
import style from "./TransactionView.module.css";
import TransactionUtils from "../../clientUtils/TransactionUtils";

export default function TransactionView() {
    const { transactionId } = useParams();
    const navigator = useNavigate();
    const [transactionInfo, setTransactionInfo] = useState<TransactionEntryDetails>({
        id: -1,
        amount: 0,
        create_time: 0,
        details: "",
        ledger_id: -1,
        name: "",
        transaction_time: 0
    });
    const [originalTransactionInfo, setOriginalTransactionInfo] = useState<TransactionEntryDetails>({
        id: -1,
        amount: 0,
        create_time: 0,
        details: "",
        ledger_id: -1,
        name: "",
        transaction_time: 0
    });

    const [changesMade, setChangesMade] = useState<boolean>(false);

    useEffect(() => {
        (
            async () => {
                if (!transactionId) {
                    alert("Error invalid transaction id");
                    navigator(-1);
                    return;
                }

                const trnInfo = await TransactionFunctions.getTransactionById(+transactionId);
                console.log(trnInfo);
                setTransactionInfo(trnInfo);
                setOriginalTransactionInfo(trnInfo);
            }
        )();
    }, [transactionId])

    useEffect(() => {
        setChangesMade(
            originalTransactionInfo.name != transactionInfo.name ||
            originalTransactionInfo.amount != transactionInfo.amount ||
            originalTransactionInfo.details != transactionInfo.details ||
            originalTransactionInfo.transaction_time != transactionInfo.transaction_time
        );
    }, [transactionInfo]);

    function updateFunction<K extends keyof TransactionEntryDetails>(
        evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        property: K
    ) {
        setTransactionInfo(t => ({
            ...t,
            [property]: property == "transaction_time" ? new Date(evt.target.value).getTime() : evt.target.value
        }));
    }

    async function updateTransaction() {
        if (!TransactionUtils.validateTransactionFields(transactionInfo.name, transactionInfo.amount.toString())) {
            return;
        }
        
        try {
            await TransactionFunctions.updateTransaction(transactionInfo);
            alert("Updated successfully!");
            setChangesMade(false);
        } catch (error) {
            alert(error);
        }
    }

    async function deleteTransaction() {
        if (!transactionId) {
            return;
        }

        if (!confirm("Delete transaction?")) {
            return;
        }

        try {
            await TransactionFunctions.deleteTransaction(+transactionId);
            navigator(`/ledgerview/${transactionInfo.ledger_id}`, { replace: true });
        } catch (error) {
            alert(error);
        }
    }

    return (
        <div className={style.container}>
            <h1>Transaction: <input type="text" id="trnName" value={transactionInfo.name} onChange={(evt) => updateFunction(evt, "name")} /></h1>
            <label htmlFor="trnDetails">Details: <textarea id="trnDetails" value={transactionInfo.details} onChange={(evt) => updateFunction(evt, "details")}></textarea></label>
            <label htmlFor="trnAmt">Amount: &#8377;<input type="number" id="trnAmt" value={transactionInfo.amount} onChange={(evt) => updateFunction(evt, "amount")} /></label>
            <label htmlFor="trnTime">Transaction Time: <input type="datetime-local" id="trnTime" value={toDatetimeLocal(transactionInfo.transaction_time)} onChange={(evt) => updateFunction(evt, "transaction_time")} /></label>
            <label>Create Time: {new Date(transactionInfo.create_time).toLocaleString()}</label>
            <div>
                {
                    changesMade ?
                        <button onClick={updateTransaction}>Update</button>
                        :
                        <></>
                }
                <button onClick={() => navigator(-1)}>Back</button>
                <button onClick={deleteTransaction} className={style.danger}>Delete</button>
            </div>
        </div>
    )
}