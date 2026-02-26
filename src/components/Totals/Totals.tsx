import style from "./Totals.module.css";

type TotalsParams = {
    totalVal?: number,
    numEntries?: number,
    transactionEntry?: boolean
};

export default function Totals({ totalVal = 0, numEntries = 0, transactionEntry = false }: TotalsParams) {
    return (
        <div className={style.body}>
            <h1>Total: ₹{totalVal}</h1>
            <p className={style.statContainer}>
                Total {numEntries} {transactionEntry ? "transaction" : "ledger"} entries.
                <button className={style.statBtn}>Stats</button></p>
        </div>
    );
}