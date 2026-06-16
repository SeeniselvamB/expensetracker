import React, { useMemo } from "react";
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, Alert,
} from "react-native";
import { generatePDF } from "./GeneratePDF";

// ─── Design tokens (mirrors Money.js) ────────────────────────────────────────
const COLORS = {
    income: '#16A34A',
    expense: '#DC2626',
    primary: '#2563EB',
    textDark: '#1E293B',
    textMid: '#475569',
    textLight: '#94A3B8',
    cardBg: '#FFFFFF',
    incomeBg: '#F0FDF4',
    expenseBg: '#FFF5F5',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    pdf: '#2563EB',
    pdfBg: '#EFF6FF',
    closeBg: '#F1F5F9',
    close: '#64748B',
};

// ─── Transaction card ─────────────────────────────────────────────────────────
const TransactionCard = React.memo(({ item, onEdit, onDelete }) => {
    const isCredit = item.type === 'credit';

    return (
        <View style={[styles.card, isCredit ? styles.cardCredit : styles.cardDebit]}>
            <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                    <Text style={styles.cardCategory}>{item.category}</Text>
                    {item.description ? (
                        <Text style={styles.cardDescription}>{item.description}</Text>
                    ) : null}
                    <Text style={styles.cardDate}>{item.date}</Text>
                </View>
                <Text style={[styles.cardAmount, isCredit ? styles.creditText : styles.debitText]}>
                    {isCredit ? '+' : '−'}₹{item.amount.toFixed(2)}
                </Text>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => onEdit(item)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                    <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDelete(item)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

// ─── History screen ───────────────────────────────────────────────────────────
export default function History({
    onClose, transactions, clearHistory,
    startingBalance, setEditingTx, deleteTx,
}) {
    const handleEdit = (tx) => {
        setEditingTx(tx);
        onClose();
    };

    const handleDelete = (tx) => {
        Alert.alert(
            "Delete Transaction",
            `Delete "${tx.category}"? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteTx(tx.id) },
            ],
        );
    };

    // Memoised totals for the summary strip
    const { totalCredit, totalDebit } = useMemo(() => {
        const tc = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
        const td = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
        return { totalCredit: tc, totalDebit: td };
    }, [transactions]);

    const renderItem = ({ item }) => (
        <TransactionCard item={item} onEdit={handleEdit} onDelete={handleDelete} />
    );

    return (
        <View style={styles.overlay}>
            <View style={styles.sheet}>
                {/* Handle */}
                <View style={styles.handle} />

                <Text style={styles.title}>Transaction History</Text>

                {/* Summary strip */}
                {transactions.length > 0 && (
                    <View style={styles.summaryStrip}>
                        <View style={styles.stripItem}>
                            <Text style={styles.stripLabel}>Credit</Text>
                            <Text style={[styles.stripValue, { color: COLORS.income }]}>
                                +₹{totalCredit.toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.stripDivider} />
                        <View style={styles.stripItem}>
                            <Text style={styles.stripLabel}>{transactions.length} transactions</Text>
                        </View>
                        <View style={styles.stripDivider} />
                        <View style={styles.stripItem}>
                            <Text style={styles.stripLabel}>Debit</Text>
                            <Text style={[styles.stripValue, { color: COLORS.expense }]}>
                                −₹{totalDebit.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* List */}
                {transactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📭</Text>
                        <Text style={styles.emptyTitle}>No transactions yet</Text>
                        <Text style={styles.emptyHint}>Add your first transaction to get started</Text>
                    </View>
                ) : (
                    <FlatList
                        data={transactions}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                )}

                {/* Footer buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.footerBtn, styles.dangerBtn]}
                        onPress={clearHistory}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.footerBtnText, { color: COLORS.danger }]}>
                            Clear History
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.footerBtn, styles.pdfBtn]}
                        onPress={() => generatePDF(transactions, startingBalance)}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.footerBtnText, { color: COLORS.pdf }]}>
                            Export PDF
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.footerBtn, styles.closeBtn]}
                        onPress={onClose}
                        activeOpacity={0.85}
                    >
                        <Text style={[styles.footerBtnText, { color: COLORS.close }]}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
        maxHeight: '88%',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#CBD5E1',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.textDark,
        textAlign: 'center',
        marginBottom: 14,
        letterSpacing: 0.2,
    },

    // ── Summary strip
    summaryStrip: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        paddingVertical: 12,
        marginBottom: 14,
        alignItems: 'center',
    },
    stripItem: {
        flex: 1,
        alignItems: 'center',
    },
    stripDivider: {
        width: 1,
        height: 28,
        backgroundColor: '#E2E8F0',
    },
    stripLabel: {
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '600',
        marginBottom: 2,
        letterSpacing: 0.3,
    },
    stripValue: {
        fontSize: 14,
        fontWeight: '700',
    },

    // ── List
    listContent: {
        paddingBottom: 8,
    },

    // ── Transaction card
    card: {
        backgroundColor: COLORS.cardBg,
        borderRadius: 14,
        marginVertical: 5,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
        borderLeftWidth: 4,
    },
    cardCredit: {
        borderLeftColor: COLORS.income,
        backgroundColor: COLORS.incomeBg,
    },
    cardDebit: {
        borderLeftColor: COLORS.expense,
        backgroundColor: COLORS.expenseBg,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardLeft: {
        flex: 1,
        marginRight: 12,
    },
    cardCategory: {
        fontWeight: '700',
        fontSize: 15,
        color: COLORS.textDark,
    },
    cardDescription: {
        marginTop: 3,
        fontSize: 13,
        color: COLORS.textMid,
        fontStyle: 'italic',
    },
    cardDate: {
        marginTop: 4,
        fontSize: 11,
        color: COLORS.textLight,
        fontWeight: '500',
    },
    cardAmount: {
        fontSize: 16,
        fontWeight: '800',
    },
    creditText: { color: COLORS.income },
    debitText: { color: COLORS.expense },

    // ── Card actions
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 12,
    },
    editBtn: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
        backgroundColor: '#EFF6FF',
    },
    editBtnText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: 13,
    },
    deleteBtn: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
    },
    deleteBtnText: {
        color: COLORS.danger,
        fontWeight: '600',
        fontSize: 13,
    },

    // ── Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyIcon: { fontSize: 40, marginBottom: 12 },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.textMid,
        marginBottom: 6,
    },
    emptyHint: {
        fontSize: 13,
        color: COLORS.textLight,
    },

    // ── Footer
    footer: {
        gap: 10,
        marginTop: 14,
    },
    footerBtn: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    footerBtnText: {
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.2,
    },
    dangerBtn: { backgroundColor: COLORS.dangerBg },
    pdfBtn: { backgroundColor: COLORS.pdfBg },
    closeBtn: { backgroundColor: COLORS.closeBg },
});
