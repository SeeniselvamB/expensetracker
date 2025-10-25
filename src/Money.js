import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from "react-native";
import Form from "./Form";
import History from "./History";
import {
    getTransactions,
    addTransaction,
    clearAll,
    getStartingBalance,
    setStartingBalance
} from "./database";

export default function Money() {
    const [transactions, setTransactions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [startingBalance, setStartingBalanceState] = useState(0);
    const [editingTx, setEditingTx] = useState(null);

    useEffect(() => {
        async function loadData() {
            const tx = await getTransactions();
            const bal = await getStartingBalance();
            setTransactions(tx);
            setStartingBalanceState(bal || 0);
        }
        loadData();
    }, []);

    const totalCredit = transactions
        .filter(t => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalDebit = transactions
        .filter(t => t.type === "debit")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = startingBalance + totalCredit - totalDebit;

    // Add or Update transaction
    const handleAddTransaction = async (tx) => {
        if (editingTx) {
            // Edit existing
            const updatedTxs = transactions.map(t => t.id === editingTx.id ? { ...t, ...tx } : t);
            setTransactions(updatedTxs);
            await clearAll(); // or save updatedTxs properly to storage
            setEditingTx(null);
        } else {
            const newTx = await addTransaction(tx);
            setTransactions(prev => [newTx, ...prev]);
        }
        setShowForm(false);
    };

    const handleEditTransaction = (tx) => {
        setEditingTx(tx);
        setShowForm(true);
        setShowHistory(false);
    };

    const handleClearHistory = async () => {
        Alert.alert(
            "Clear History",
            "This will remove all your transaction records for the month. Your current balance will be preserved. Do you want to continue?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        setStartingBalanceState(balance);
                        await setStartingBalance(balance);
                        setTransactions([]);
                        await clearAll();
                    }
                }
            ]
        );
    };

    const handleReset = async () => {
        Alert.alert(
            "Reset Everything",
            "This will clear all transactions and set balance to ₹0.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                        setStartingBalanceState(0);
                        setTransactions([]);
                        await setStartingBalance(0);
                        await clearAll();
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Expense Tracker</Text>

            <View style={styles.balanceBox}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
                <View style={styles.row}>
                    <View style={styles.creditBox}>
                        <Text style={styles.label}>Credit</Text>
                        <Text style={styles.creditAmount}>₹{totalCredit.toFixed(2)}</Text>
                    </View>
                    <View style={styles.debitBox}>
                        <Text style={styles.label}>Debit</Text>
                        <Text style={styles.debitAmount}>₹{totalDebit.toFixed(2)}</Text>
                    </View>
                </View>
            </View>

            {/* Main Buttons */}
            <View style={styles.buttonsRow}>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#27ae60" }]}
                    onPress={() => { setShowForm(true); setEditingTx(null); }}
                >
                    <Text style={styles.btnText}>Add Transaction</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#f39c12" }]}
                    onPress={() => setShowHistory(true)}
                >
                    <Text style={styles.btnText}>History</Text>
                </TouchableOpacity>
            </View>

            {/* Reset Button Below */}
            <View style={[styles.buttonsRow, { marginTop: 10 }]}>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#e74c3c" }]}
                    onPress={handleReset}
                >
                    <Text style={styles.btnText}>Reset</Text>
                </TouchableOpacity>
            </View>

            {/* Add Transaction Modal */}
            <Modal visible={showForm} transparent animationType="slide">
                <Form
                    onClose={() => { setShowForm(false); setEditingTx(null); }}
                    addTransaction={handleAddTransaction}
                    editingTx={editingTx}
                />
            </Modal>

            {/* History Modal */}
            <Modal visible={showHistory} transparent animationType="slide">
                <History
                    onClose={() => setShowHistory(false)}
                    transactions={transactions}
                    clearHistory={handleClearHistory}
                    startingBalance={startingBalance}
                    setEditingTx={handleEditTransaction}
                    deleteTx={async (id) => {
                        const updatedTx = transactions.filter(t => t.id !== id);
                        setTransactions(updatedTx);
                        await clearAll(); // or update storage
                    }}
                />
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
    title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginVertical: 10 },
    balanceBox: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        marginVertical: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    balanceLabel: { fontSize: 16, color: "#555" },
    balanceAmount: { fontSize: 32, fontWeight: "bold", color: "#3498db", marginVertical: 5 },
    row: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 10 },
    creditBox: { alignItems: "center" },
    debitBox: { alignItems: "center" },
    label: { fontSize: 14, color: "#555" },
    creditAmount: { fontSize: 20, fontWeight: "bold", color: "green" },
    debitAmount: { fontSize: 20, fontWeight: "bold", color: "red" },
    buttonsRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 15 },
    btn: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 5,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
        alignItems: "center",
    },
    btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
