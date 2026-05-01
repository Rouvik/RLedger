import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './pages/App/App';

import LedgerCreate from './pages/LedgerCreate/LedgerCreate';
import LedgerView from './pages/LedgerView/LedgerView';
import TransactionCreate from './pages/TransactionCreate/TransactionCreate';
import TransactionView from './pages/TransactionView/TransactionView';

let lastBackPress = 0;

// get jeep loader
if (import.meta.env.VITE_PLATFORM === 'web') {
    const { defineCustomElements } = await import('jeep-sqlite/loader');
    defineCustomElements(window);
}

// android authentication and back button handler
if (import.meta.env.VITE_PLATFORM === 'android') {
    const { App: CapacitorApp } = await import('@capacitor/app');
    const { Toast } = await import("@capacitor/toast");
    const { NativeBiometric } = await import("@capgo/capacitor-native-biometric");

    try {
        const biometryAvailable = NativeBiometric.isAvailable({ useFallback: true });

        if (!biometryAvailable) {
            alert("Error this app requires some native security or biometry enabled");
            CapacitorApp.exitApp();
        }

        const verified = await NativeBiometric.verifyIdentity({
            reason: "For secure access",
            title: "Verify",
            subtitle: "Verify to login",
            description: "Please satisfy system security requirements to login"
        }).then(() => true).catch(() => false);

        if (!verified) {
            alert("Error verification failed");
            CapacitorApp.exitApp();
        }
    } catch (error) {
        alert(error);
    }

    CapacitorApp.addListener('backButton', () => {
        if (window.location.pathname !== '/') {
            window.history.back();
        }
        else {
            const now = Date.now();
            if (now - lastBackPress < 2000) {
                CapacitorApp.exitApp();
            }
            else {
                lastBackPress = now;

                Toast.show({
                    text: "Press back button again to exit",
                    duration: 'short',
                    position: 'bottom'
                });
            }
        }
    });
}

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />} />

            <Route path='/ledgercreate' element={<LedgerCreate />} />
            <Route path='/transactioncreate/:ledgerId' element={<TransactionCreate />} />

            <Route path='/ledgerview/:ledgerId' element={<LedgerView />} />
            <Route path='/transactionview/:transactionId' element={<TransactionView />} />
        </Routes>
    </BrowserRouter>
);