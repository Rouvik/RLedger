import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import SettingsUtil from "./SettingsUtil";

let needsAuth = true;

export function setNeedsAuth(val: boolean = true) {
    needsAuth = val;
}

class SecurityError extends Error {
    constructor(msg: string) {
        super("[Security Error] " + msg);
    }
}

export async function checkSecurityCond() {
    if (await SettingsUtil.getLockPref()) {
        await checkSecurity();
    }
}

export async function checkSecurity() {
    if (!needsAuth) {
        return;
    }

    try {
        const biometryAvailable = NativeBiometric.isAvailable({ useFallback: true });

        if (!biometryAvailable) {
            throw new SecurityError("Error this app requires some native security or biometry enabled");
        }

        const verified = await NativeBiometric.verifyIdentity({
            reason: "For secure access",
            title: "Verify",
            subtitle: "Verify to login"
        }).then(() => true).catch(() => false);

        if (!verified) {
            throw new SecurityError("Error verification failed");
        }

        needsAuth = false;
    } catch (error) {
        if (error instanceof SecurityError) {
            throw error;
        }

        alert(error);
    }
}

export default {
    checkSecurity,
    setNeedsAuth
};