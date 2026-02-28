import { useRef } from 'react';
import DBHandler from '../../db/DBHandler';
import style from './LedgerCreate.module.css';
import { Link, useNavigate } from 'react-router-dom';

function validateFields(name: string) {
    if (!name || name.length == 0) {
        alert("Error name fields is required");
        return false;
    }

    return true;
}

export default function LedgerCreate() {
    const labelNameRef = useRef<HTMLInputElement>(null);
    const navigator = useNavigate();

    async function addLedger() {
        if (!labelNameRef.current) {
            return;
        }

        const name = labelNameRef.current.value;
        if (!validateFields(name)) {
            return;
        }

        const db = await DBHandler.getDB();
        try {
            await db.run("INSERT INTO LEDGERS (NAME) VALUES (?)", [name]);
        } catch (error) {
            alert("Error failed to insert into DB please try again...");
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