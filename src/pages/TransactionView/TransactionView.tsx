import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { TransactionEntryDetails } from "../../db/TableDefinitions";
import TransactionFunctions from "../../db/TransactionFunctions";
import style from "./TransactionView.module.css";

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

    useEffect(() => {
        (
            async () => {
                if (!transactionId) {
                    alert("Error invalid transaction id");
                    navigator(-1);
                    return;
                }

                setTransactionInfo(await TransactionFunctions.getTransactionById(+transactionId));
            }
        )();
    }, [transactionId])

    return (
        <div className={style.container}>
            <h1>Transaction: {transactionInfo.name}</h1>
            <p>Details: {transactionInfo.details}</p>
            <p>Amount: &#8377;{transactionInfo.amount}</p>
            <p>Create Time: {new Date(transactionInfo.create_time).toLocaleString()}</p>
            <p>Transaction Time: {new Date(transactionInfo.transaction_time).toLocaleString()}</p>
            <button onClick={() => navigator(-1)}>Back</button>
        </div>
    )
}