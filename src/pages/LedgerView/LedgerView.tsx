import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Totals from "../../components/Totals/Totals";
import TransactionContainer from "../../components/TransactionContainer/TransactionContainer";
import LedgerFunctions from "../../db/LedgerFunctions";
import type { LedgerEntryDetails, LedgerEntryDetailsView } from "../../db/TableDefinitions";
import TransactionFunctions, { type TransactionCountAndSumTuple } from "../../db/TransactionFunctions";

import LedgerUtils from "../../clientUtils/LedgerUtils";
import style from "./LedgerView.module.css";

export default function LedgerView() {
    const { ledgerId } = useParams();
    const navigator = useNavigate();
    const [transactionViewInfo, setTransactionViewInfo] = useState<TransactionCountAndSumTuple>({ count: 0, sum: 0 });
    const [ledgerView, setLedgerView] = useState<LedgerEntryDetails>({
        id: 0,
        name: "",
        img: 0
    });
    const [originaLedgerView, setOriginalLedgerView] = useState<LedgerEntryDetails>({
        id: 0,
        name: "",
        img: 0
    });
    const [ledgerInfoChanged, setLedgerInfoChanged] = useState<boolean>(false);

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

        (
            async () => {
                try {
                    const l = await LedgerFunctions.getLedgerById(+ledgerId);
                    setLedgerView(l);
                    setOriginalLedgerView(l);
                } catch (error) {
                    alert(error);
                }
            }
        )();
    }, [ledgerId]);

    useEffect(() => {
        setLedgerInfoChanged(
            originaLedgerView.name != ledgerView.name ||
            originaLedgerView.img != ledgerView.img
        );
    }, [ledgerView]);

    if (!ledgerId) {
        return null;
    }

    async function ledgerDeleteHandler() {
        if (!ledgerId) {
            return;
        }

        if (confirm("Delete ledger?")) {
            await LedgerFunctions.deleteLedgerById(+ledgerId);
            navigator("/", { replace: true });
        }
    }

    function ledgerInfoOnChangeHandler<K extends keyof LedgerEntryDetailsView>(
        evt: React.ChangeEvent<HTMLInputElement>,
        property: K
    ) {
        setLedgerView(l => ({
            ...l,
            [property]: evt.target.value
        }));
    }

    async function ledgerInfoUpdate() {
        if (!LedgerUtils.validateLedgerFields(ledgerView.name)) {
            return;
        }

        try {
            await LedgerFunctions.updateLedger(ledgerView);
            alert("Updated successfully!");
            setLedgerInfoChanged(false);
        } catch (error) {
            alert(error);
        }
    }

    return (
        <>
            <h1 className={style.header}>
                Ledger: <input type="text" value={ledgerView.name} onChange={(evt) => ledgerInfoOnChangeHandler(evt, "name")} />
                {
                    ledgerInfoChanged ?
                        <button onClick={ledgerInfoUpdate}>Update</button>
                        :
                        <></>
                }
            </h1>
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