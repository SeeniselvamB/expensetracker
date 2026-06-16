import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    Modal, Alert, Animated, StatusBar, SafeAreaView,
} from "react-native";
import Form from "./Form";
import History from "./History";
import {
    getTransactions,
    saveTransactions,
    getStartingBalance,
    setStartingBalance,
    resetAll,
    clearTransactionHistory,
} from "./database";

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLORS = {
    bg: '#F0F4F8',
    card: '#FFFFFF',
    primary: '#2563EB',       // blue — balance amount
    income: '#16A34A',        // green
    expense: '#DC2626',       // red
    neutral: '#64748B',       // slate-500
    textDark: '#1E293B',      // slate-900
    textMid: '#475569',       // slate-600
    textLight: '#94A3B8',     // slate-400
    btnHistory: '#D97706',    // amber
    btnReset: '#DC2626',      // red
    toastSuccess: '#16A34A',
    toastError: '#DC2626',
    shadow: '#000',
};

// ─── SaveToast ─────────────────────────────────────────────────────────────────
function SaveToast({ message, type }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        if (!message) return;
        // Reset
        opacity.setValue(1);
        translateY.setValue(-20);

        // Slide in
        Animated.timing(translateY, {
            toValue: 0, duration: 250, useNativeDriver: true,
        }).start();

        // Fade out after delay
        const fade = Animated.timing(opacity, {
            toValue: 0, duration: 400, delay: 2000, useNativeDriver: true,
        });
        fade.start();
        return () => fade.stop();
    }, [message]);

    if (!message) return null;

    return (
        <Animated.View
            style={[
                styles.toast,
                type === 'error' ? styles.toastError : styles.toastSuccess,
                { opacity, transform: [{ translateY }] },
            ]}
            pointerEvents="none"
        >
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
}

// ─── Money (main screen) ───────────────────────────────────────────────────────
export default function Money() {
    const [transactions, setTransactions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [startingBalance, setStartingBalanceState] = useState(0);
    const [editingTx, setEditingTx] = useState(null);

    // Toast
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState('success');
    const toastKey = useRef(0);

    // ── Load on mount ────────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                const [tx, bal] = await Promise.all([getTransactions(), getStartingBalance()]);
                setTransactions(tx);
                setStartingBalanceState(bal);
            } catch (err) {
                console.error('[Money] Failed to load data:', err);
                setTransactions([]);
                setStartingBalanceState(0);
            }
        })();
    }, []);

    // ── Toast helper ─────────────────────────────────────────────────────────
    const showToast = useCallback((msg, type = 'success') => {
        toastKey.current += 1;
        setToastMsg(msg);
        setToastType(type);
    }, []);

    // ── Persist & notify ─────────────────────────────────────────────────────
    const persistTransactions = useCallback(async (updatedTxs) => {
        const ok = await saveTransactions(updatedTxs);
        showToast(ok ? '✓ Saved' : '⚠ Save failed', ok ? 'success' : 'error');
        return ok;
    }, [showToast]);

    // ── Derived totals (memoised) ────────────────────────────────────────────
    const { totalCredit, totalDebit, balance } = useMemo(() => {
        const tc = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
        const td = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
        return { totalCredit: tc, totalDebit: td, balance: startingBalance + tc - td };
    }, [transactions, startingBalance]);

    // ── Add / Edit ───────────────────────────────────────────────────────────
    // const handleAddTransaction = useCallback(async (tx) => {
    //     let updatedTxs;
    //     if (editingTx) {
    //         updatedTxs = transactions.map(t => t.id === editingTx.id ? { ...t, ...tx } : t);
    //         setEditingTx(null);
    //     } else {
    //         updatedTxs = [{ id: Date.now().toString(), ...tx }, ...transactions];
    //     }
    //     setTransactions(updatedTxs);
    //     await persistTransactions(updatedTxs);
    //     setShowForm(false);
    // }, [editingTx, transactions, persistTransactions]);

    const handleAddTransaction = useCallback(async (tx) => {
        let updatedTxs;

        if (editingTx) {
            updatedTxs = transactions.map(
                t => t.id === editingTx.id
                    ? { ...t, ...tx }
                    : t
            );
        } else {
            updatedTxs = [
                { id: Date.now().toString(), ...tx },
                ...transactions,
            ];
        }

        setTransactions(updatedTxs);
        setEditingTx(null);
        setShowForm(false);
        await persistTransactions(updatedTxs);
    }, [editingTx, transactions, persistTransactions]);

    // ── Delete single ────────────────────────────────────────────────────────
    // const handleDeleteTransaction = useCallback(async (id) => {
    //     const updatedTxs = transactions.filter(t => t.id !== id);
    //     setTransactions(updatedTxs);
    //     await persistTransactions(updatedTxs);
    // }, [transactions, persistTransactions]);
    const handleDeleteTransaction = useCallback(async (id) => {
        const updatedTxs = transactions.filter(
            t => t.id !== id
        );

        const ok = await persistTransactions(updatedTxs);

        if (ok) {
            setTransactions(updatedTxs);
        } else {
            Alert.alert(
                "Delete Failed",
                "Unable to save changes."
            );
        }
    }, [transactions, persistTransactions]);

    // ── Open edit form from History ──────────────────────────────────────────
    const handleEditTransaction = useCallback((tx) => {
        setEditingTx(tx);
        setShowHistory(false);
        setShowForm(true);
    }, []);

    // ── Clear History ────────────────────────────────────────────────────────
    const handleClearHistory = useCallback(() => {
        Alert.alert(
            'Clear History',
            'This will remove all transaction records. Your current balance will be preserved as the new starting balance. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear', style: 'destructive',
                    // onPress: async () => {
                    //     setStartingBalanceState(balance);
                    //     setTransactions([]);
                    //     const ok = await clearTransactionHistory(balance);
                    //     showToast(ok ? '✓ Saved' : '⚠ Save failed', ok ? 'success' : 'error');
                    // },
                    onPress: async () => {
                        const ok =
                            await clearTransactionHistory(balance);

                        if (ok) {
                            setStartingBalanceState(balance);
                            setTransactions([]);
                        }

                        showToast(
                            ok ? "✓ Saved" : "⚠ Save failed",
                            ok ? "success" : "error"
                        );
                    },
                },
            ],
        );
    }, [balance, showToast]);

    // ── Reset Everything ─────────────────────────────────────────────────────
    const handleReset = useCallback(() => {
        Alert.alert(
            'Reset Everything',
            'This will clear all transactions and set balance to ₹0.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset', style: 'destructive',
                    // onPress: async () => {
                    //     setStartingBalanceState(0);
                    //     setTransactions([]);
                    //     const ok = await resetAll();
                    //     showToast(ok ? '✓ Saved' : '⚠ Save failed', ok ? 'success' : 'error');
                    // },
                    onPress: async () => {
                        const ok = await resetAll();

                        if (ok) {
                            setStartingBalanceState(0);
                            setTransactions([]);
                        }

                        showToast(
                            ok ? "✓ Saved" : "⚠ Save failed",
                            ok ? "success" : "error"
                        );
                    },
                },
            ],
        );
    }, [showToast]);

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

            <View style={styles.container}>
                {/* Toast */}
                <SaveToast key={toastKey.current} message={toastMsg} type={toastType} />

                {/* Header */}
                <Text style={styles.title}>Expense Tracker</Text>
                <Text style={styles.subtitle}></Text>

                {/* Balance Card */}
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={[
                        styles.balanceAmount,
                        balance < 0 && { color: COLORS.expense },
                    ]}>
                        ₹{balance.toFixed(2)}
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryItem}>
                            {/* <View style={[styles.summaryDot, { backgroundColor: COLORS.income }]} /> */}
                            <Text style={styles.summaryLabel}>Income</Text>
                            <Text style={[styles.summaryAmount, { color: COLORS.income }]}>
                                ₹{totalCredit.toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            {/* <View style={[styles.summaryDot, { backgroundColor: COLORS.expense }]} /> */}
                            <Text style={styles.summaryLabel}>Expenses</Text>
                            <Text style={[styles.summaryAmount, { color: COLORS.expense }]}>
                                ₹{totalDebit.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Primary Actions */}
                <View style={styles.primaryRow}>
                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: COLORS.income }]}
                        onPress={() => { setShowForm(true); setEditingTx(null); }}
                        activeOpacity={0.82}
                    >
                        <Text style={styles.primaryBtnIcon}></Text>
                        <Text style={styles.primaryBtnText}>Add Transaction</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.primaryBtn, { backgroundColor: COLORS.btnHistory }]}
                        onPress={() => setShowHistory(true)}
                        activeOpacity={0.82}
                    >
                        <Text style={styles.primaryBtnIcon}>☰</Text>
                        <Text style={styles.primaryBtnText}>History</Text>
                    </TouchableOpacity>
                </View>

                {/* Reset */}
                <TouchableOpacity
                    style={styles.resetBtn}
                    onPress={handleReset}
                    activeOpacity={0.82}
                >
                    <Text style={styles.resetBtnText}>Reset Everything</Text>
                </TouchableOpacity>
            </View>

            {/* Add / Edit Modal */}
            <Modal visible={showForm} transparent animationType="slide" statusBarTranslucent>
                <Form
                    onClose={() => { setShowForm(false); setEditingTx(null); }}
                    addTransaction={handleAddTransaction}
                    editingTx={editingTx}
                />
            </Modal>

            {/* History Modal */}
            <Modal visible={showHistory} transparent animationType="slide" statusBarTranslucent>
                <History
                    onClose={() => setShowHistory(false)}
                    transactions={transactions}
                    clearHistory={handleClearHistory}
                    startingBalance={startingBalance}
                    setEditingTx={handleEditTransaction}
                    deleteTx={handleDeleteTransaction}
                />
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },

    // ── Toast
    toast: {
        position: 'absolute',
        top: 8,
        right: 16,
        zIndex: 999,
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 24,
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    toastSuccess: { backgroundColor: COLORS.toastSuccess },
    toastError: { backgroundColor: COLORS.toastError },
    toastText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.2 },

    // ── Header
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: COLORS.textDark,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 13,
        color: COLORS.textLight,
        textAlign: 'center',
        marginTop: 2,
        marginBottom: 20,
        letterSpacing: 0.2,
    },

    // ── Balance Card
    balanceCard: {
        backgroundColor: COLORS.card,
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 22,
        marginBottom: 24,
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 16,
        elevation: 6,
    },
    balanceLabel: {
        fontSize: 13,
        color: COLORS.textLight,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    balanceAmount: {
        fontSize: 38,
        fontWeight: '800',
        color: COLORS.primary,
        textAlign: 'center',
        marginTop: 6,
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        fontWeight: '600',
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    summaryAmount: {
        fontSize: 18,
        fontWeight: '700',
    },
    summaryDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E2E8F0',
    },

    // ── Buttons
    primaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    primaryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 14,
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 4,
        gap: 6,
    },
    primaryBtnIcon: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        lineHeight: 20,
    },
    primaryBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.2,
    },
    resetBtn: {
        borderWidth: 1.5,
        borderColor: COLORS.btnReset,
        borderRadius: 14,
        paddingVertical: 13,
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
    },
    resetBtnText: {
        color: COLORS.btnReset,
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.2,
    },
});
