import type { TransactionEntryDetailsView } from "../../db/TableDefinitions";
import style from "./TransactionEntry.module.css";

type TransactionEntryParams = {
    transactionView: TransactionEntryDetailsView,
    onClick: () => void
};

export default function TransactionEntry({ transactionView, onClick }: TransactionEntryParams) {
    return (
        <div className={style.container} onClick={onClick}>
            {transactionView.name} <span className={transactionView.amount < 0 ? style.debit : style.credit}>{transactionView.amount < 0 ? '-' : ''}&#8377;{Math.abs(transactionView.amount)}</span>
        </div>
    );
}