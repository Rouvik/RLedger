import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './pages/App/App';

import { defineCustomElements } from 'jeep-sqlite/loader';
import { Capacitor } from '@capacitor/core';
import LedgerCreate from './pages/LedgerCreate/LedgerCreate';
import LedgerView from './pages/LedgerView/LedgerView';
import TransactionCreate from './pages/TransactionCreate/TransactionCreate';

// get jeep loader
if (Capacitor.getPlatform() === 'web') {
    defineCustomElements(window);
}

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />} />
            
            <Route path='/ledgercreate' element={<LedgerCreate />} />
            <Route path='/transactioncreate/:ledgerId' element={<TransactionCreate />} />

            <Route path='/ledgerview/:ledgerId' element={<LedgerView />} />
        </Routes>
    </BrowserRouter>
);