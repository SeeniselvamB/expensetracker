import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { generatePDF } from "./GeneratePDF";

export default function History({ onClose, transactions, clearHistory, startingBalance, setEditingTx, deleteTx }) {

    const handleEdit = (tx) => {
        setEditingTx(tx);
        onClose(); // Close history modal
    };

    const handleDelete = (tx) => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteTx(tx.id) }
            ]
        );
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.box}>
                <Text style={styles.title}>Transaction History</Text>

                {transactions.length === 0 ? (
                    <Text style={styles.noTx}>No transactions to show</Text>
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        renderItem={({ item }) => (
                            <View style={[styles.card, item.type === "credit" ? styles.credit : styles.debit]}>
                                <View style={styles.row}>
                                    <Text style={styles.category}>{item.category}</Text>
                                    <Text style={[styles.amount, item.type === "credit" ? styles.creditText : styles.debitText]}>
                                        {item.type === "credit" ? '+' : '-'}₹{item.amount.toFixed(2)}
                                    </Text>
                                </View>
                                {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
                                <Text style={styles.date}>{item.date}</Text>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(item)}>
                                        <Text style={styles.actionText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                                        <Text style={styles.actionText}>X</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                )}

                <TouchableOpacity style={[styles.btn, { backgroundColor: "#ff5555" }]} onPress={clearHistory}>
                    <Text style={styles.btnText}>Clear History</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#3498db" }]}
                    onPress={() => generatePDF(transactions, startingBalance)}
                >
                    <Text style={styles.btnText}>View & Download PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                     style={[styles.btn, { backgroundColor: "#a8a9aaff" }]} 
                    onPress={onClose}>
                    <Text style={styles.btnText}>Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    box: { width: "90%", maxHeight: "80%", backgroundColor: "#fff", borderRadius: 15, padding: 20 },
    title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
    noTx: { textAlign: "center", fontSize: 16, color: "#888", marginVertical: 20 },
    card: {
        padding: 15,
        borderRadius: 12,
        marginVertical: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        backgroundColor: "#fff",
        borderLeftWidth: 5,
    },
    credit: { borderLeftColor: "green" },
    debit: { borderLeftColor: "red" },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    category: { fontWeight: "bold", fontSize: 16, color: "#555" },
    amount: { fontWeight: "bold", fontSize: 16 },
    creditText: { color: "green" },
    debitText: { color: "red" },
    description: { marginTop: 5, fontStyle: "italic", color: "#666" },
    date: { marginTop: 3, fontSize: 12, color: "#999" },
    btn: { paddingVertical: 12, borderRadius: 8, marginTop: 15, alignItems: "center" },
    btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
    actionRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
    editBtn: { backgroundColor: "#3498db", padding: 5, borderRadius: 5, marginRight: 10 },
    deleteBtn: { backgroundColor: "#e74c3c", padding: 5, borderRadius: 5 },
    actionText: { color: "white", fontWeight: "bold" },
});
