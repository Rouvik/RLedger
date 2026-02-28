import { useNavigate } from 'react-router-dom';
import LedgerContainer from '../../components/LedgerContainer/LedgerContainer';
import Totals from '../../components/Totals/Totals';
import './App.module.css';
import LedgerFunctions, { type LedgerCountAndSumTuple } from '../../db/LedgerFunctions';
import { useEffect, useState } from 'react';

export default function App() {
    const navigator = useNavigate();
    const [ledgerViewInfo, setLedgerViewInfo] = useState<LedgerCountAndSumTuple>({ count: 0, sum: 0 });

    useEffect(() => {
        (async () => {
            try {
                setLedgerViewInfo(await LedgerFunctions.getLedgerCountAndSum());
            } catch (error) {
                alert(error);
            }
        })();

        return () => { };
    }, []);

    return (
        <>
            <Totals
                addBtnHandler={() => navigator("/ledgercreate")}
                numEntries={ledgerViewInfo.count}
                totalVal={ledgerViewInfo.sum}
            />
            <LedgerContainer />
        </>
    );
}