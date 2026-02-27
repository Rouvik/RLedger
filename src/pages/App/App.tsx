import { useNavigate } from 'react-router-dom';
import LedgerContainer from '../../components/LedgerContainer/LedgerContainer';
import Totals from '../../components/Totals/Totals';
import './App.module.css';

export default function App() {
    const navigator = useNavigate();

    return (
        <>
            <Totals addBtnHandler={() => navigator("/ledgercreate")} />
            <LedgerContainer />
        </>
    );
}