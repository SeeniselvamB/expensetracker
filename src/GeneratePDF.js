import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

// Minimal date helpers — replaces the heavy `moment` dependency
function formatDate(dateStr) {
    // dateStr is already "YYYY-MM-DD" from the form; return as-is
    return dateStr;
}

function getYYYYMM(dateStr) {
    return dateStr.slice(0, 7); // "YYYY-MM"
}

function formatMonthYear(dateStr) {
    const [year, month] = dateStr.split('-');
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function currentYYYYMM() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

export async function generatePDF(transactions, startingBalance = 0) {
    if (!transactions || transactions.length === 0) {
        Alert.alert("No transactions", "There are no transactions to generate a PDF.");
        return;
    }

    try {
        const currentMonth = currentYYYYMM();
        const monthlyTx = transactions.filter(tx => getYYYYMM(tx.date) === currentMonth);

        if (monthlyTx.length === 0) {
            Alert.alert("No transactions", "No transactions found for the current month.");
            return;
        }

        // Oldest → newest in the PDF
        const orderedTx = [...monthlyTx].reverse();

        let runningBalance = startingBalance;
        let totalCredit = 0;
        let totalDebit = 0;

        const rows = orderedTx.map(tx => {
            if (tx.type === 'credit') {
                runningBalance += tx.amount;
                totalCredit += tx.amount;
            } else {
                runningBalance -= tx.amount;
                totalDebit += tx.amount;
            }

            const rowColor = tx.type === 'credit' ? '#e8f8e8' : '#fdeaea';
            const amountColor = tx.type === 'credit' ? '#16A34A' : '#DC2626';
            const sign = tx.type === 'credit' ? '+' : '−';

            return `
                <tr style="background-color:${rowColor};">
                    <td>${formatDate(tx.date)}</td>
                    <td>${tx.category}</td>
                    <td>${tx.description || '—'}</td>
                    <td style="color:${amountColor};font-weight:700;">
                        ${sign}₹${tx.amount.toFixed(2)}
                    </td>
                    <td>₹${runningBalance.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        const monthLabel = formatMonthYear(orderedTx[0].date);

        const html = `
        <html>
            <head>
                <meta charset="utf-8" />
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        color: #1E293B;
                        padding: 20px;
                    }
                    h2 {
                        text-align: center;
                        color: #2563EB;
                        margin-bottom: 20px;
                    }
                    table {
                        margin: 0 auto;
                        border-collapse: collapse;
                        width: 95%;
                        font-size: 13px;
                    }
                    th, td {
                        border: 1px solid #CBD5E1;
                        padding: 8px 10px;
                        text-align: center;
                    }
                    th {
                        background-color: #2563EB;
                        color: #fff;
                        font-weight: 700;
                    }
                    .total {
                        font-weight: 700;
                        background-color: #FEF3C7;
                        color: #1E293B;
                    }
                </style>
            </head>
            <body>
                <h2>${monthLabel} — Transaction Summary</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="4" class="total">Starting Balance</td>
                            <td class="total">₹${startingBalance.toFixed(2)}</td>
                        </tr>
                        ${rows}
                        <tr>
                            <td colspan="2" class="total">Total Credit</td>
                            <td colspan="2" class="total" style="color:#16A34A;">+₹${totalCredit.toFixed(2)}</td>
                            <td class="total"></td>
                        </tr>
                        <tr>
                            <td colspan="2" class="total">Total Debit</td>
                            <td colspan="2" class="total" style="color:#DC2626;">−₹${totalDebit.toFixed(2)}</td>
                            <td class="total"></td>
                        </tr>
                        <tr>
                            <td colspan="4" class="total">Closing Balance</td>
                            <td class="total">₹${runningBalance.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'View & Share Transaction PDF',
        });

    } catch (error) {
        Alert.alert("PDF Error", "Failed to generate PDF: " + error.message);
        console.error('[generatePDF]', error);
    }
}
