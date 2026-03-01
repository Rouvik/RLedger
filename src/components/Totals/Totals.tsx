import { useNavigate } from "react-router-dom";
import style from "./Totals.module.css";

type TotalsParams = {
    totalVal?: number,
    numEntries?: number,
    transactionEntry?: boolean,
    addBtnHandler?: () => void,
    delBtnHandler?: () => void
};

export default function Totals({ totalVal = 0, numEntries = 0, transactionEntry = false, addBtnHandler = () => { }, delBtnHandler = () => { } }: TotalsParams) {
    const navigator = useNavigate();

    return (
        <div className={style.body}>
            <h1>{transactionEntry ? "Transactions" : "Ledgers"}</h1>
            <h2>Total: &#8377;{totalVal}</h2>
            <div className={style.statContainer}>
                Total {numEntries} {transactionEntry ? "transaction" : "ledger"} entries.
                <div>
                    <button className={`${style.addBtn} ${style.btn}`} onClick={addBtnHandler}>Add</button>
                    <button className={`${style.statBtn} ${style.btn}`} onClick={() => alert("Unimplemented...")}>Stats</button>
                    {
                        transactionEntry ?
                            <button className={`${style.deleteBtn} ${style.btn}`} onClick={delBtnHandler}>Delete</button>
                            :
                            <></>
                    }
                    {
                        transactionEntry ?
                            <button className={`${style.backBtn} ${style.btn}`} onClick={() => navigator(-1)}>Back</button>
                            :
                            <></>
                    }
                </div>
            </div>
        </div>
    );
}