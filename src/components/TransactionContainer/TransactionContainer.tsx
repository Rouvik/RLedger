import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TransactionEntryDetailsView } from "../../db/TableDefinitions";
import TransactionFunctions, { type TransactionViewFilters } from "../../db/TransactionFunctions";
import style from "./TransactionContainer.module.css";
import TransactionEntry from "./TransactionEntry";
import utils from "../../scripts/utils";

type TransactionContainerParams = {
    ledgerId: number,
};

const PAGE_SIZE = 50;

type FilterState = {
    minAmount?: string,
    maxAmount?: string,
    minCreationDate?: string,
    maxCreationDate?: string,
    minTransactionDate?: string,
    maxTransactionDate?: string,
    minCreationTime?: string,
    maxCreationTime?: string,
    minTransactionTime?: string,
    maxTransactionTime?: string
};

export default function TransactionContainer({ ledgerId }: TransactionContainerParams) {
    const [transactions, setTransactions] = useState<TransactionEntryDetailsView[]>([]);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [filterEnabled, setFilterEnabled] = useState<boolean>(localStorage.getItem("filterEnabled") === 'true');
    const [filterState, setFilterState] = useState<FilterState>(JSON.parse(localStorage.getItem("filterState") || "{}"));
    const [filterParams, setFilterParams] = useState<TransactionViewFilters>({});
    const navigator = useNavigate();

    useEffect(() => {
        generateFilterParams(false);
    }, []);

    useEffect(() => {
        setPage(0);
    }, [ledgerId]);

    useEffect(() => {
        (
            async () => {
                // request an extra row to determine the end of transactions
                let trans = null;
                if (filterEnabled) {
                    trans = await TransactionFunctions.getTransactionViewListFilterByLedgerOrderByCreationPagedWithFilters(ledgerId, PAGE_SIZE * page, PAGE_SIZE + 1, filterParams);
                }
                else {
                    trans = await TransactionFunctions.getTransactionViewListFilterByLedgerOrderByCreationPaged(ledgerId, PAGE_SIZE * page, PAGE_SIZE + 1);
                }

                if (trans.length > PAGE_SIZE) {
                    setHasMore(true);
                    setTransactions(trans.slice(0, PAGE_SIZE));
                }
                else {
                    setHasMore(false);
                    setTransactions(trans);
                }

                localStorage.setItem("filterEnabled", filterEnabled.toString());
            }
        )();
    }, [ledgerId, page, filterEnabled, filterParams]);

    function updateFilterState<K extends keyof FilterState>(event: React.ChangeEvent<HTMLInputElement>, property: K) {
        setFilterState(prev => {
            return {
                ...prev,
                [property]: event.target.value || undefined
            };
        });
    }

    function generateFilterParams(updateLSFilterState: boolean) {
        const minAmount = filterState.minAmount ? +filterState.minAmount : undefined;

        let maxAmount;
        if (filterState.maxAmount) {
            if (filterParams.minAmount && +filterState.maxAmount < filterParams.minAmount) {
                alert("Error max amount cannot be less than min amount!");
                return;
            }

            maxAmount = +filterState.maxAmount;
        }

        const minCreationDate = utils.getDateWithOptionalTime(filterState.minCreationDate, filterState.minCreationTime);
        const maxCreationDate = utils.getDateWithOptionalTime(filterState.maxCreationDate, filterState.maxCreationTime);
        const minTransactionDate = utils.getDateWithOptionalTime(filterState.minTransactionDate, filterState.minTransactionTime);
        const maxTransactionDate = utils.getDateWithOptionalTime(filterState.maxTransactionDate, filterState.maxTransactionTime);

        setFilterParams({
            minAmount, maxAmount, minCreationDate, maxCreationDate, minTransactionDate, maxTransactionDate
        });

        if (updateLSFilterState) {
            localStorage.setItem("filterState", JSON.stringify(filterState));
        }
    }

    return (
        <>
            <div className={style.pager}>
                <button disabled={page == 0} onClick={() => setPage(p => p - 1)}>&#xef7d;</button>
                {page + 1}
                <button disabled={!hasMore} onClick={() => setPage(p => p + 1)}>&#xe941;</button>
            </div>
            <details className={style.filterContainer}>
                <summary>Filters (<label htmlFor="filterCheckbox"><input type="checkbox" id="filterCheckbox" checked={filterEnabled} onChange={(evt) => setFilterEnabled(evt.target.checked)} /> {filterEnabled ? "Enabled" : "Disabled"}</label>)</summary>
                <div>
                    <label htmlFor="filterMinAmt">Min Amount:<input type="number" id="filterMinAmt" value={filterState.minAmount} onChange={(evt) => updateFilterState(evt, "minAmount")} /></label>
                    <label htmlFor="filterMaxAmt">Max Amount:<input type="number" id="filterMaxAmt" value={filterState.maxAmount} onChange={(evt) => updateFilterState(evt, "maxAmount")} /></label>
                    <label htmlFor="filterMinCreationDate">Start Creation Date:
                        <input type="date" id="filterMinCreationDate" value={filterState.minCreationDate} onChange={(evt) => updateFilterState(evt, "minCreationDate")} />
                        <input type="time" id="filterMinCreationTime" value={filterState.minCreationTime} onChange={(evt) => updateFilterState(evt, "minCreationTime")} disabled={!filterState.minCreationDate} />
                    </label>
                    <label htmlFor="filterMaxCreationDate">End Creation Date:
                        <input type="date" id="filterMaxCreationDate" value={filterState.maxCreationDate} onChange={(evt) => updateFilterState(evt, "maxCreationDate")} />
                        <input type="time" id="filterMaxCreationTime" value={filterState.maxCreationTime} onChange={(evt) => updateFilterState(evt, "maxCreationTime")} disabled={!filterState.maxCreationDate} />
                    </label>
                    <label htmlFor="filterMinTransactionDate">Start Transaction Date:
                        <input type="date" id="filterMinTransactionDate" value={filterState.minTransactionDate} onChange={(evt) => updateFilterState(evt, "minTransactionDate")} />
                        <input type="time" id="filterMinTransactionTime" value={filterState.minTransactionTime} onChange={(evt) => updateFilterState(evt, "minTransactionTime")} disabled={!filterState.minTransactionDate} />
                    </label>
                    <label htmlFor="filterMaxTransactionDate">End Transaction Date:
                        <input type="date" id="filterMaxTransactionDate" value={filterState.maxTransactionDate} onChange={(evt) => updateFilterState(evt, "maxTransactionDate")} />
                        <input type="time" id="filterMaxTransactionTime" value={filterState.maxTransactionTime} onChange={(evt) => updateFilterState(evt, "maxTransactionTime")} disabled={!filterState.maxTransactionDate} />
                    </label>
                    <button onClick={() => generateFilterParams(true)}>Update Filter</button>
                </div>
            </details>
            <div className={style.container}>
                {
                    transactions.map(t => <TransactionEntry transactionView={t} key={t.id} onClick={() => navigator(`/transactionview/${t.id}`)} />)
                }
            </div>
        </>
    );
}