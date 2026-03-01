import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LedgerUtils from '../../clientUtils/LedgerUtils';
import LedgerFunctions from '../../db/LedgerFunctions';
import style from './LedgerCreate.module.css';

export default function LedgerCreate() {
    const labelNameRef = useRef<HTMLInputElement>(null);
    const navigator = useNavigate();

    async function addLedger() {
        if (!labelNameRef.current) {
            return;
        }

        const name = labelNameRef.current.value;
        if (!LedgerUtils.validateLedgerFields(name)) {
            return;
        }

        try {
            await LedgerFunctions.addLedger({ name });
        } catch (error) {
            alert(error);
            return;
        }

        navigator("/", { replace: true });
    }

    return (
        <>
            <h1 className={style.heading}>Create a new Ledger</h1>
            <div className={style.container}>
                <label htmlFor="ledgerName" className={style.labelName}>Ledger Name<sup className={style.required}>*</sup>: <input type="text" id="ledgerName" ref={labelNameRef} /></label>
                {/* <label htmlFor="ledgerIcon">Ledger Icon: <input type="file" id="ledgerIcon" /></label> */}
                <div>
                    <button className={style.btn} onClick={addLedger}>Add</button>
                    <Link to="/" replace><button className={style.btn}>Back</button></Link>
                </div>
            </div>
        </>
    );
}