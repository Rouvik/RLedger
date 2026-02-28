type LedgerEntryDetailsView = {
    id: number,
    name: string
};

type LedgerEntryDetails = LedgerEntryDetailsView & {
    img?: number
}

type TransactionEntryDetailsView = {
    id: number,
    name: string,
    amount: number
};

type TransactionEntryDetails = TransactionEntryDetailsView & {
    ledger_id: number,
    details: string,
    create_time: number,
    transaction_time: number
};

export type {
    LedgerEntryDetailsView,
    LedgerEntryDetails,
    TransactionEntryDetailsView,
    TransactionEntryDetails
};