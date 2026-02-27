import style from './LedgerEntry.module.css';

type LedgerEntryParams = {
    name: string,
    onClick: () => void
};

export default function LedgerEntry({ name, onClick }: LedgerEntryParams) {
    return (
        <div className={style.container} onClick={onClick} >
            {name}
        </div>
    );
}