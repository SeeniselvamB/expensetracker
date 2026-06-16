// import React, { useState, useEffect } from "react";
// import {
//     View, Text, TextInput, TouchableOpacity, StyleSheet,
//     Alert, Platform, KeyboardAvoidingView, ScrollView, Keyboard,
// } from "react-native";
// import DateTimePicker from '@react-native-community/datetimepicker';

// // ─── Design tokens (mirrors Money.js) ────────────────────────────────────────
// const COLORS = {
//     income: '#16A34A',
//     expense: '#DC2626',
//     primary: '#2563EB',
//     textDark: '#1E293B',
//     textMid: '#475569',
//     textLight: '#94A3B8',
//     inputBorder: '#CBD5E1',
//     inputBorderFocus: '#2563EB',
//     inputBg: '#F8FAFC',
//     cancel: '#64748B',
// };

// export default function Form({ onClose, addTransaction, editingTx }) {
//     const [type, setType] = useState("credit");
//     const [amount, setAmount] = useState("");
//     const [category, setCategory] = useState("");
//     const [description, setDescription] = useState("");
//     const [date, setDate] = useState(new Date());
//     const [showDatePicker, setShowDatePicker] = useState(false);
//     const [focusedField, setFocusedField] = useState(null);

//     useEffect(() => {
//         if (editingTx) {
//             setType(editingTx.type);
//             setAmount(editingTx.amount.toString());
//             setCategory(editingTx.category);
//             setDescription(editingTx.description || "");
//             setDate(new Date(editingTx.date));
//         }
//     }, [editingTx]);

//     const handleSubmit = async () => {
//         const trimmedAmount = amount.trim();
//         const trimmedCategory = category.trim();

//         if (!trimmedAmount || !trimmedCategory) {
//             return Alert.alert("Missing fields", "Amount and Category are required.");
//         }
//         const parsed = parseFloat(trimmedAmount);
//         if (isNaN(parsed) || parsed <= 0) {
//             return Alert.alert("Invalid amount", "Please enter a valid positive number.");
//         }

//         const tx = {
//             type,
//             amount: parsed,
//             category: trimmedCategory,
//             description: description.trim(),
//             date: date.toISOString().split("T")[0],
//         };

//         await addTransaction(tx);
//         // Reset fields (component may unmount, but safe to do)
//         setAmount(""); setCategory(""); setDescription("");
//     };


//     const onChangeDate = (event, selectedDate) => {
//         setShowDatePicker(Platform.OS === 'ios');
//         if (selectedDate) setDate(selectedDate);
//     };

//     const formattedDate = date.toISOString().split("T")[0];

//     return (
//         <View style={styles.overlay}>
//             <KeyboardAvoidingView
//                 behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//                 style={styles.kvWrapper}
//             >
//                 <View style={styles.sheet}>
//                     {/* Handle bar */}
//                     <View style={styles.handle} />

//                     <Text style={styles.title}>
//                         {editingTx ? "Edit Transaction" : "New Transaction"}
//                     </Text>

//                     <ScrollView
//                         showsVerticalScrollIndicator={false}
//                         keyboardShouldPersistTaps="handled"
//                         contentContainerStyle={styles.scrollContent}
//                     >
//                         {/* Type toggle */}
//                         <Text style={styles.fieldLabel}>Type</Text>
//                         <View style={styles.typeRow}>
//                             <TouchableOpacity
//                                 style={[
//                                     styles.typeBtn,
//                                     type === "credit" && styles.typeBtnActiveIncome,
//                                 ]}
//                                 onPress={() => setType("credit")}
//                                 activeOpacity={0.8}
//                             >
//                                 <Text style={[
//                                     styles.typeText,
//                                     type === "credit" && styles.typeTextActive,
//                                 ]}>
//                                     ↑  Credit
//                                 </Text>
//                             </TouchableOpacity>

//                             <TouchableOpacity
//                                 style={[
//                                     styles.typeBtn,
//                                     type === "debit" && styles.typeBtnActiveDebit,
//                                 ]}
//                                 onPress={() => setType("debit")}
//                                 activeOpacity={0.8}
//                             >
//                                 <Text style={[
//                                     styles.typeText,
//                                     type === "debit" && styles.typeTextActive,
//                                 ]}>
//                                     ↓  Debit
//                                 </Text>
//                             </TouchableOpacity>
//                         </View>

//                         {/* Amount */}
//                         <Text style={styles.fieldLabel}>Amount <Text style={styles.required}>*</Text></Text>
//                         <View style={[
//                             styles.inputWrapper,
//                             focusedField === 'amount' && styles.inputWrapperFocused,
//                         ]}>
//                             <Text style={styles.currencySymbol}>₹</Text>
//                             <TextInput
//                                 placeholder="0.00"
//                                 placeholderTextColor={COLORS.textLight}
//                                 keyboardType="decimal-pad"
//                                 value={amount}
//                                 onChangeText={setAmount}
//                                 onFocus={() => setFocusedField('amount')}
//                                 onBlur={() => setFocusedField(null)}
//                                 style={styles.amountInput}
//                             />
//                         </View>

//                         {/* Category */}
//                         <Text style={styles.fieldLabel}>Category <Text style={styles.required}>*</Text></Text>
//                         <TextInput
//                             placeholder="e.g. Food, Salary, Rent"
//                             placeholderTextColor={COLORS.textLight}
//                             value={category}
//                             onChangeText={setCategory}
//                             onFocus={() => setFocusedField('category')}
//                             onBlur={() => setFocusedField(null)}
//                             style={[
//                                 styles.input,
//                                 focusedField === 'category' && styles.inputFocused,
//                             ]}
//                         />

//                         {/* Description */}
//                         <Text style={styles.fieldLabel}>Description <Text style={styles.optional}>(optional)</Text></Text>
//                         <TextInput
//                             placeholder="Add a note…"
//                             placeholderTextColor={COLORS.textLight}
//                             value={description}
//                             onChangeText={setDescription}
//                             onFocus={() => setFocusedField('description')}
//                             onBlur={() => setFocusedField(null)}
//                             style={[
//                                 styles.input,
//                                 focusedField === 'description' && styles.inputFocused,
//                             ]}
//                         />

//                         {/* Date */}
//                         <Text style={styles.fieldLabel}>Date</Text>
//                         <TouchableOpacity
//                             onPress={() => setShowDatePicker(true)}
//                             style={styles.dateBtn}
//                             activeOpacity={0.8}
//                         >
//                             <Text style={styles.dateBtnIcon}>📅</Text>
//                             <Text style={styles.dateBtnText}>{formattedDate}</Text>
//                         </TouchableOpacity>

//                         {showDatePicker && (
//                             <DateTimePicker
//                                 value={date}
//                                 mode="date"
//                                 display="calendar"
//                                 onChange={onChangeDate}
//                                 maximumDate={new Date()}
//                             />
//                         )}

//                         {/* Actions */}
//                         <TouchableOpacity
//                             style={[
//                                 styles.submitBtn,
//                                 { backgroundColor: type === 'credit' ? COLORS.income : COLORS.expense },
//                             ]}
//                             onPress={handleSubmit}
//                             activeOpacity={0.85}
//                         >
//                             <Text style={styles.submitBtnText}>
//                                 {editingTx ? "Update Transaction" : "Add Transaction"}
//                             </Text>
//                         </TouchableOpacity>

//                         <TouchableOpacity
//                             style={styles.cancelBtn}
//                             onPress={onClose}
//                             activeOpacity={0.8}
//                         >
//                             <Text style={styles.cancelBtnText}>Cancel</Text>
//                         </TouchableOpacity>
//                     </ScrollView>
//                 </View>
//             </KeyboardAvoidingView>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     overlay: {
//         flex: 1,
//         justifyContent: 'flex-end',
//         backgroundColor: 'rgba(0,0,0,0.55)',
//     },
//     kvWrapper: {
//         width: '100%',
//     },
//     sheet: {
//         backgroundColor: '#fff',
//         borderTopLeftRadius: 24,
//         borderTopRightRadius: 24,
//         paddingHorizontal: 20,
//         paddingTop: 12,
//         paddingBottom: 24,
//         maxHeight: '92%',
//     },
//     handle: {
//         width: 40,
//         height: 4,
//         backgroundColor: '#CBD5E1',
//         borderRadius: 2,
//         alignSelf: 'center',
//         marginBottom: 16,
//     },
//     scrollContent: {
//         paddingBottom: 8,
//     },
//     title: {
//         fontSize: 20,
//         fontWeight: '800',
//         color: COLORS.textDark,
//         textAlign: 'center',
//         marginBottom: 20,
//         letterSpacing: 0.2,
//     },

//     // Labels
//     fieldLabel: {
//         fontSize: 13,
//         fontWeight: '600',
//         color: COLORS.textMid,
//         marginBottom: 6,
//         marginTop: 14,
//         letterSpacing: 0.2,
//     },
//     required: { color: COLORS.expense },
//     optional: { color: COLORS.textLight, fontWeight: '400' },

//     // Type toggle
//     typeRow: {
//         flexDirection: 'row',
//         gap: 10,
//     },
//     typeBtn: {
//         flex: 1,
//         paddingVertical: 12,
//         borderRadius: 12,
//         borderWidth: 1.5,
//         borderColor: COLORS.inputBorder,
//         alignItems: 'center',
//         backgroundColor: COLORS.inputBg,
//     },
//     typeBtnActiveIncome: {
//         backgroundColor: '#DCFCE7',
//         borderColor: COLORS.income,
//     },
//     typeBtnActiveDebit: {
//         backgroundColor: '#FEE2E2',
//         borderColor: COLORS.expense,
//     },
//     typeText: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: COLORS.textLight,
//     },
//     typeTextActive: {
//         color: COLORS.textDark,
//     },

//     // Inputs
//     input: {
//         borderWidth: 1.5,
//         borderColor: COLORS.inputBorder,
//         borderRadius: 12,
//         paddingHorizontal: 14,
//         paddingVertical: 12,
//         fontSize: 15,
//         color: COLORS.textDark,
//         backgroundColor: COLORS.inputBg,
//     },
//     inputFocused: {
//         borderColor: COLORS.inputBorderFocus,
//         backgroundColor: '#fff',
//     },

//     // Amount with prefix
//     inputWrapper: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1.5,
//         borderColor: COLORS.inputBorder,
//         borderRadius: 12,
//         paddingHorizontal: 14,
//         backgroundColor: COLORS.inputBg,
//     },
//     inputWrapperFocused: {
//         borderColor: COLORS.inputBorderFocus,
//         backgroundColor: '#fff',
//     },
//     currencySymbol: {
//         fontSize: 16,
//         fontWeight: '700',
//         color: COLORS.textMid,
//         marginRight: 6,
//     },
//     amountInput: {
//         flex: 1,
//         paddingVertical: 12,
//         fontSize: 16,
//         fontWeight: '600',
//         color: COLORS.textDark,
//     },

//     // Date
//     dateBtn: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderWidth: 1.5,
//         borderColor: COLORS.inputBorder,
//         borderRadius: 12,
//         paddingHorizontal: 14,
//         paddingVertical: 12,
//         backgroundColor: COLORS.inputBg,
//         gap: 10,
//     },
//     dateBtnIcon: { fontSize: 16 },
//     dateBtnText: { fontSize: 15, color: COLORS.textDark, fontWeight: '500' },

//     // Submit
//     submitBtn: {
//         paddingVertical: 15,
//         borderRadius: 14,
//         alignItems: 'center',
//         marginTop: 22,
//         shadowColor: '#000',
//         shadowOpacity: 0.15,
//         shadowOffset: { width: 0, height: 3 },
//         shadowRadius: 6,
//         elevation: 4,
//     },
//     submitBtnText: {
//         color: '#fff',
//         fontWeight: '700',
//         fontSize: 16,
//         letterSpacing: 0.3,
//     },

//     // Cancel
//     cancelBtn: {
//         paddingVertical: 14,
//         borderRadius: 14,
//         alignItems: 'center',
//         marginTop: 10,
//         backgroundColor: '#F1F5F9',
//     },
//     cancelBtnText: {
//         color: COLORS.cancel,
//         fontWeight: '600',
//         fontSize: 15,
//     },
// });




import React, { useState, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, Platform
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Form({ onClose, addTransaction, editingTx }) {
    const [type, setType] = useState("credit");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        if (editingTx) {
            setType(editingTx.type);
            setAmount(editingTx.amount.toString());
            setCategory(editingTx.category);
            setDescription(editingTx.description || "");
            setDate(new Date(editingTx.date));
        }
    }, [editingTx]);

    const handleSubmit = async () => {
        const trimmedAmount = amount.trim();
        const trimmedCategory = category.trim();

        if (!trimmedAmount || !trimmedCategory) {
            return Alert.alert("Missing fields", "Amount and Category are required.");
        }

        const parsed = parseFloat(trimmedAmount);
        if (isNaN(parsed) || parsed <= 0) {
            return Alert.alert("Invalid amount", "Enter a valid positive number.");
        }

        const tx = {
            type,
            amount: parsed,
            category: trimmedCategory,
            description: description.trim(),
            date: date.toISOString().split("T")[0],
        };

        await addTransaction(tx);

        setAmount("");
        setCategory("");
        setDescription("");

        onClose(); // IMPORTANT: closes on first submit
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) setDate(selectedDate);
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.formBox}>
                <Text style={styles.title}>
                    {editingTx ? "Edit Transaction" : "Add Transaction"}
                </Text>

                {/* Type */}
                <View style={styles.typeRow}>
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

                {/* Amount */}
                <TextInput
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    onFocus={() => setFocusedField("amount")}
                    onBlur={() => setFocusedField(null)}
                    style={[
                        styles.input,
                        focusedField === "amount" && styles.focused
                    ]}
                />

                {/* Category */}
                <TextInput
                    placeholder="Category"
                    value={category}
                    onChangeText={setCategory}
                    onFocus={() => setFocusedField("category")}
                    onBlur={() => setFocusedField(null)}
                    style={[
                        styles.input,
                        focusedField === "category" && styles.focused
                    ]}
                />

                {/* Description */}
                <TextInput
                    placeholder="Description"
                    value={description}
                    onChangeText={setDescription}
                    onFocus={() => setFocusedField("description")}
                    onBlur={() => setFocusedField(null)}
                    style={[
                        styles.input,
                        focusedField === "description" && styles.focused
                    ]}
                />

                {/* Date */}
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.dateBtn}
                >
                    <Text style={styles.dateText}>
                        Date: {date.toISOString().split("T")[0]}
                    </Text>
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

                {/* Buttons */}
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "blue" }]}
                    onPress={handleSubmit}
                >
                    <Text style={styles.btnText}>
                        {editingTx ? "Update" : "Add"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#888" }]}
                    onPress={onClose}
                >
                    <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)"
    },

    formBox: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 15
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginVertical: 5
    },

    focused: {
        borderColor: "blue"
    },

    typeRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 10
    },

    typeBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8
    },

    typeText: {
        color: "white",
        fontWeight: "bold"
    },

    dateBtn: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginVertical: 5
    },

    dateText: {
        fontSize: 16
    },

    btn: {
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: "center"
    },

    btnText: {
        color: "white",
        fontWeight: "bold"
    }
});