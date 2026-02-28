import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Totals from "../../components/Totals/Totals";
import TransactionContainer from "../../components/TransactionContainer/TransactionContainer";
import LedgerFunctions from "../../db/LedgerFunctions";
import TransactionFunctions, { type TransactionCountAndSumTuple } from "../../db/TransactionFunctions";

export default function LedgerView() {
    const { ledgerId } = useParams();
    const navigator = useNavigate();
    const [transactionViewInfo, setTransactionViewInfo] = useState<TransactionCountAndSumTuple>({ count: 0, sum: 0 });

    useEffect(() => {
        if (!ledgerId) {
            alert("Error undefined ledgerId");
            navigator(-1);
            return;
        }

        (
            async () => {
                try {
                    setTransactionViewInfo(await TransactionFunctions.getTransactionSumAndTotalByLedger(+ledgerId));
                } catch (error) {
                    alert(error);
                }
            }
        )();
    }, [ledgerId]);

    if (!ledgerId) {
        return null;
    }

    async function ledgerDeleteHandler() {
        if (!ledgerId) {
            return;
        }

        if (confirm("Delete ledger?")) {
            await LedgerFunctions.deleteLedgerById(+ledgerId);
            navigator("/", {replace: true});
        }
    }

    return (
        <>
            <Totals
                transactionEntry
                addBtnHandler={() => navigator(`/transactioncreate/${ledgerId}`)}
                delBtnHandler={ledgerDeleteHandler}
                numEntries={transactionViewInfo.count}
                totalVal={transactionViewInfo.sum}
            />
            <TransactionContainer ledgerId={+ledgerId} />
        </>
    );
}