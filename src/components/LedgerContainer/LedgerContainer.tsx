import type { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { useEffect, useState } from 'react';
import DBHandler from '../../db/DBHandler';
import style from './LedgerContainer.module.css';
import LedgerEntry from './LedgerEntry';

type LedgerEntryDetails = {
    id: number,
    name: string
};

async function getLedgers() {
    const db: SQLiteDBConnection = await DBHandler.getDB() as SQLiteDBConnection;
    const ret = await db.query("SELECT * FROM LEDGERS;");
    console.log(ret);

    return ret;
}

export default function LedgerContainer() {
    const [ledgers, setLedgers] = useState<LedgerEntryDetails[]>([]);

    useEffect(() => {
        (
            async () => {
                setLedgers(((await getLedgers()).values ?? []) as LedgerEntryDetails[]);
            }
        )();
        return;
    }, []);

    let key = 0;

    return (
        <div className={style.container}>
            {
                ledgers.map(l => <LedgerEntry name={l.name} key={key++} />)
            }
        </div>
    )
}