import { useEffect, useState } from "react";
import type { TransactionEntryDetailsView } from "../../db/TableDefinitions";
import TransactionFunctions from "../../db/TransactionFunctions";
import style from "./TransactionContainer.module.css";
import TransactionEntry from "./TransactionEntry";
import { useNavigate } from "react-router-dom";

type TransactionContainerParams = {
    ledgerId: number,
};

const PAGE_SIZE = 50;

export default function TransactionContainer({ ledgerId }: TransactionContainerParams) {
    const [transactions, setTransactions] = useState<TransactionEntryDetailsView[]>([]);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const navigator = useNavigate();
    
    useEffect(() => {
        setPage(0);
    }, [ledgerId]);

    useEffect(() => {
        (
            async () => {
                // request an extra row to determine the end of transactions
                const trans = await TransactionFunctions.getTransactionViewListFilterByLedgerOrderByCreationPaged(ledgerId, PAGE_SIZE * page, PAGE_SIZE + 1);                

                if (trans.length > PAGE_SIZE) {
                    setHasMore(true);
                    setTransactions(trans.slice(0, PAGE_SIZE));
                }
                else {
                    setHasMore(false);
                    setTransactions(trans);
                }
            }
        )();
    }, [ledgerId, page]);

    return (
        <>
            <div className={style.pager}>
                <button disabled={page == 0} onClick={() => setPage(p => p - 1)}>&#xef7d;</button>
                {page + 1}
                <button disabled={!hasMore} onClick={() => setPage(p => p + 1)}>&#xe941;</button>
            </div>
            <div className={style.container}>
                {
                    transactions.map(t => <TransactionEntry transactionView={t} key={t.id} onClick={() => navigator(`/transactionview/${t.id}`)} />)
                }
            </div>
        </>
    );
}