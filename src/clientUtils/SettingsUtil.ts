import { Preferences } from "@capacitor/preferences";

export const PreferenceKeys = {
    enableLock: "enableLock"
} as const;

export async function getLockPref() {
    const lockPref = await Preferences.get({
        key: PreferenceKeys.enableLock
    });

    if (lockPref.value === null) {
        return false;
    }

    return lockPref.value === "true";
}

export async function setLockPref(value: boolean) {
    await Preferences.set({
        key: PreferenceKeys.enableLock,
        value: `${value}`
    });
}

export default {
    getLockPref,
    setLockPref
};