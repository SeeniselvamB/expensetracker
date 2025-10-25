import AsyncStorage from '@react-native-async-storage/async-storage';

const TRANSACTIONS_KEY = '@transactions';
const BALANCE_KEY = '@starting_balance';

export async function getTransactions() {
    try {
        const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.log('Error reading transactions:', e);
        return [];
    }
}

export async function addTransaction(txObj) {
    try {
        const existing = await getTransactions();
        const newTx = { id: Date.now().toString(), ...txObj };
        const updated = [newTx, ...existing];
        await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
        return newTx;
    } catch (e) {
        console.log('Error adding transaction:', e);
    }
}

export async function clearAll() {
    try {
        await AsyncStorage.removeItem(TRANSACTIONS_KEY);
    } catch (e) {
        console.log('Error clearing transactions:', e);
    }
}

export async function getStartingBalance() {
    try {
        const value = await AsyncStorage.getItem(BALANCE_KEY);
        return value ? parseFloat(value) : 0;
    } catch (e) {
        console.log('Error reading starting balance:', e);
        return 0;
    }
}

export async function setStartingBalance(balance) {
    try {
        await AsyncStorage.setItem(BALANCE_KEY, balance.toString());
    } catch (e) {
        console.log('Error saving starting balance:', e);
    }
}
