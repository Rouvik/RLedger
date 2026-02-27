import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DBHandler from '../../db/DBHandler';
import style from './LedgerContainer.module.css';
import LedgerEntry from './LedgerEntry';
import type { LedgerEntryDetailsView } from '../../db/TableDefinitions';

async function getLedgers() {
    const db: SQLiteDBConnection = await DBHandler.getDB();
    const ret = await db.query("SELECT id, name FROM LEDGERS;");
    console.log(ret);

    return ret;
}

export default function LedgerContainer() {
    const navigator = useNavigate();
    const [ledgers, setLedgers] = useState<LedgerEntryDetailsView[]>([]);

    useEffect(() => {
        (
            async () => {
                setLedgers(((await getLedgers()).values ?? []) as LedgerEntryDetailsView[]);
            }
        )();
        return;
    }, []);

    function handleLedgerClick(ledgerEntry: LedgerEntryDetailsView) {
        navigator(`/ledgerview/${ledgerEntry.id}`);
    }

    let key = 0;

    return (
        <div className={style.container}>
            {
                ledgers.map(l => <LedgerEntry name={l.name} key={key++} onClick={() => handleLedgerClick(l)} />)
            }
        </div>
    )
}