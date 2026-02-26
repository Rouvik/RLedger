import style from './LedgerEntry.module.css';

type LedgerEntryParams = {
    name: string
};

export default function LedgerEntry({ name }: LedgerEntryParams) {
    return (
        <div className={style.container}>
            {name}
        </div>
    );
}