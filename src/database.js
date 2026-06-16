import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = '@transactions';
const BALANCE_KEY = '@starting_balance';

/**
 * Core save function — always writes the full transactions array to AsyncStorage.
 * Guards against overwriting valid data with null/undefined/non-array.
 * Returns true on success, false on failure.
 */
export async function saveTransactions(updatedTransactions) {
    if (!Array.isArray(updatedTransactions)) {
        console.error('[saveTransactions] Refused: value is not an array', updatedTransactions);
        return false;
    }
    try {
        await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
        return true;
    } catch (e) {
        console.error('[saveTransactions] Failed:', e);
        return false;
    }
}

export async function getTransactions() {
    try {
        const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_KEY);
        if (jsonValue == null) return [];
        const parsed = JSON.parse(jsonValue);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('[getTransactions] Error:', e);
        return [];
    }
}

export async function getStartingBalance() {
    try {
        const value = await AsyncStorage.getItem(BALANCE_KEY);
        if (value == null) return 0;
        const parsed = parseFloat(value);
        // Guard against corrupted stored value
        return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
        console.error('[getStartingBalance] Error:', e);
        return 0;
    }
}

export async function setStartingBalance(balance) {
    try {
        // Guard against NaN being persisted
        const safe = isNaN(balance) ? 0 : balance;
        await AsyncStorage.setItem(BALANCE_KEY, safe.toString());
        return true;
    } catch (e) {
        console.error('[setStartingBalance] Error:', e);
        return false;
    }
}

/**
 * Clears ALL transaction history and resets starting balance to 0.
 * Only call after explicit user confirmation.
 */
export async function resetAll() {
    try {
        await AsyncStorage.multiSet([
            [TRANSACTIONS_KEY, JSON.stringify([])],
            [BALANCE_KEY, '0'],
        ]);
        return true;
    } catch (e) {
        console.error('[resetAll] Error:', e);
        return false;
    }
}

/**
 * Clears transaction history but preserves the current balance as the new starting balance.
 * Only call after explicit user confirmation.
 */
export async function clearTransactionHistory(newStartingBalance) {
    try {
        const safe = isNaN(newStartingBalance) ? 0 : newStartingBalance;
        await AsyncStorage.multiSet([
            [TRANSACTIONS_KEY, JSON.stringify([])],
            [BALANCE_KEY, safe.toString()],
        ]);
        return true;
    } catch (e) {
        console.error('[clearTransactionHistory] Error:', e);
        return false;
    }
}
