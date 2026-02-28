import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LedgerFunctions from '../../db/LedgerFunctions';
import type { LedgerEntryDetailsView } from '../../db/TableDefinitions';
import style from './LedgerContainer.module.css';
import LedgerEntry from './LedgerEntry';

export default function LedgerContainer() {
    const navigator = useNavigate();
    const [ledgers, setLedgers] = useState<LedgerEntryDetailsView[]>([]);

    useEffect(() => {
        (
            async () => {
                try {
                    setLedgers(await LedgerFunctions.getLedgerViewList());
                } catch (error) {
                    alert(error);
                    setLedgers([]);
                }
            }
        )();
    }, []);

    function handleLedgerClick(ledgerEntry: LedgerEntryDetailsView) {
        navigator(`/ledgerview/${ledgerEntry.id}`);
    }

    return (
        <div className={style.container}>
            {
                ledgers.map(l => <LedgerEntry name={l.name} key={l.id} onClick={() => handleLedgerClick(l)} />)
            }
        </div>
    )
}