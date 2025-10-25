import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Form({ onClose, addTransaction, editingTx }) {
    const [type, setType] = useState("credit");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (editingTx) {
            setType(editingTx.type);
            setAmount(editingTx.amount.toString());
            setCategory(editingTx.category);
            setDescription(editingTx.description || "");
            setDate(new Date(editingTx.date));
        }
    }, [editingTx]);

    const handleAdd = async () => {
        if (!amount || !category) return Alert.alert("Error", "Amount and Category are required");

        const tx = {
            type,
            amount: parseFloat(amount),
            category,
            description,
            date: date.toISOString().split("T")[0]
        };

        await addTransaction(tx);
        setAmount(""); setCategory(""); setDescription("");
        onClose();
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios'); 
        if (selectedDate) setDate(selectedDate);
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.formBox}>
                <Text style={styles.title}>{editingTx ? "Edit Transaction" : "Add Transaction"}</Text>

                <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 10 }}>
                    <TouchableOpacity
                        style={[styles.typeBtn, { backgroundColor: type === "credit" ? "green" : "#ccc" }]}
                        onPress={() => setType("credit")}
                    >
                        <Text style={styles.typeText}>Credit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.typeBtn, { backgroundColor: type === "debit" ? "red" : "#ccc" }]}
                        onPress={() => setType("debit")}
                    >
                        <Text style={styles.typeText}>Debit</Text>
                    </TouchableOpacity>
                </View>

                <TextInput placeholder="Amount" keyboardType="numeric" value={amount} onChangeText={setAmount} style={styles.input} />
                <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={styles.input} />
                <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} />

                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateBtn}>
                    <Text style={styles.dateText}>Date: {date.toISOString().split("T")[0]}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="calendar"
                        onChange={onChangeDate}
                        maximumDate={new Date()}
                    />
                )}

                <TouchableOpacity style={[styles.btn, { backgroundColor: "blue" }]} onPress={handleAdd}>
                    <Text style={styles.btnText}>{editingTx ? "Update" : "Add"}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.btn, { backgroundColor: "#888" }]} onPress={onClose}>
                    <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
    formBox: { width: "90%", backgroundColor: "#fff", borderRadius: 12, padding: 20 },
    title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginVertical: 5 },
    typeBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    typeText: { color: "white", fontWeight: "bold" },
    dateBtn: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginVertical: 5 },
    dateText: { fontSize: 16 },
    btn: { paddingVertical: 12, borderRadius: 8, marginTop: 10, alignItems: "center" },
    btnText: { color: "white", fontWeight: "bold" },
});
