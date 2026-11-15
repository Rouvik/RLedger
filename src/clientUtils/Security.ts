import { NativeBiometric, BiometricAuthError } from "@capgo/capacitor-native-biometric";
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

function handleBiometricCheckErrorCodes(error_code: string): string {
    let code = Number(error_code);
    switch (code) {
        case BiometricAuthError.USER_CANCEL:
            return "User cancelled";

        case BiometricAuthError.USER_TEMPORARY_LOCKOUT:
        case BiometricAuthError.USER_LOCKOUT:
            return "User has been locked out, please unlock phone from lockscreen or settings or wait for temporary lockout to finish.";
    }

    return `Got unhandled error code ${error_code}`;
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

        const verifiedStatus = await NativeBiometric.verifyIdentity({
            reason: "For secure access",
            title: "Verify",
            subtitle: "Verify to login",
            maxAttempts: 3
        }).then(
            () => ({ isVerified: true, errorMsg: "" })
        ).catch((err) => {
            return { isVerified: false, errorMsg: handleBiometricCheckErrorCodes(err.code) }
        });

        if (!verifiedStatus.isVerified) {
            throw new SecurityError(verifiedStatus.errorMsg);
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