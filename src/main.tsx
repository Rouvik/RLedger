import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './pages/App';

import { defineCustomElements } from 'jeep-sqlite/loader';
import { Capacitor } from '@capacitor/core';

// get jeep loader
if (Capacitor.getPlatform() === 'web') {
    defineCustomElements(window);
}

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />} />
        </Routes>
    </BrowserRouter>
);