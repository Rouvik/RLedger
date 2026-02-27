type LedgerEntryDetailsView = {
    id: number,
    name: string
};

type LedgerEntryDetails = LedgerEntryDetailsView & {
    img?: number
}

export type {
    LedgerEntryDetailsView,
    LedgerEntryDetails
};