import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Security from "../../clientUtils/Security";
import SettingsUtil from "../../clientUtils/SettingsUtil";
import ToggleBtn from "../../components/ToggleBtn/ToggleBtn";
import DBHandler from "../../db/DBHandler";
import style from "./Settings.module.css";

export default function Settings() {
    const [enableLock, setEnableLock] = useState<boolean>(false);
    const navigator = useNavigate();

    useEffect(() => {
        const loadPref = async () => {
            const value = await SettingsUtil.getLockPref();
            setEnableLock(value);
        };

        loadPref();
    }, []);

    async function enableLockHandler(newState: boolean) {
        const lockEnabled = await SettingsUtil.getLockPref();

        if (!lockEnabled && newState) {
            try {
                await Security.checkSecurity();
                await SettingsUtil.setLockPref(true);
                setEnableLock(true);
            } catch (error) {
                alert(error);
            }
        }
        else if (lockEnabled && !newState) {
            await SettingsUtil.setLockPref(false);
            setEnableLock(false);
        }
    }

    return (
        <div className={style.container}>
            <div className={style.importExportContainer}>
                <button className={`${style.importBtn} ${style.btn}`} onClick={DBHandler.importDB}>Import</button>
                <button className={`${style.exportBtn} ${style.btn}`} onClick={DBHandler.exportDB}>Export</button>
            </div>

            <div className={style.settingOption}>Enable lock: <ToggleBtn value={enableLock} onChange={enableLockHandler} /></div>
            <div className={style.importExportContainer}>
                <button className={`${style.btn} ${style.backBtn}`} onClick={() => navigator(-1)}>Back</button>
            </div>
        </div>
    );
}