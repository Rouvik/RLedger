import { useNavigate, useParams } from "react-router-dom";
import Totals from "../../components/Totals/Totals";

export default function LedgerView() {
    const { ledgerId } = useParams();
    const navigator = useNavigate();


    return (
        <>
            <Totals transactionEntry addBtnHandler={() => navigator(`/transactioncreate/${ledgerId}`)} />
        </>
    );
}