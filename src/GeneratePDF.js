import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import moment from 'moment'; // npm install moment

export async function generatePDF(transactions, startingBalance = 0) {
    if (!transactions || transactions.length === 0) {
        Alert.alert("No transactions", "There are no transactions to generate PDF.");
        return;
    }

    try {
        // Filter transactions for current month
        const currentMonth = moment().format('YYYY-MM');
        const monthlyTx = transactions.filter(tx =>
            moment(tx.date).format('YYYY-MM') === currentMonth
        );

        if (monthlyTx.length === 0) {
            Alert.alert("No transactions", "No transactions for the current month.");
            return;
        }

        // 👇 Reverse order so oldest appears first (bottom in History = top in PDF)
        const orderedTx = [...monthlyTx].reverse();

        // Calculate running balance starting from main balance
        let runningBalance = startingBalance;
        let totalCredit = 0;
        let totalDebit = 0;

        const rows = orderedTx.map(tx => {
            if (tx.type === "credit") {
                runningBalance += tx.amount;
                totalCredit += tx.amount;
            } else {
                runningBalance -= tx.amount;
                totalDebit += tx.amount;
            }

            // Highlight credit/debit rows with color
            const rowColor = tx.type === "credit" ? "#e8f8e8" : "#fdeaea";
            const amountColor = tx.type === "credit" ? "green" : "red";

            return `
                <tr style="background-color: ${rowColor};">
                    <td>${tx.date}</td>
                    <td>${tx.category}</td>
                    <td>${tx.description || ''}</td>
                    <td style="color:${amountColor}; font-weight:bold;">
                        ${tx.type === 'credit' ? '+' : '-'}₹${tx.amount.toFixed(2)}
                    </td>
                    <td>₹${runningBalance.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        const html = `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; }
                    table { margin: 0 auto; border-collapse: collapse; width: 90%; }
                    th, td { border: 1px solid #333; padding: 8px; text-align: center; }
                    th { background-color: #3498db; color: white; }
                    .total { font-weight: bold; font-size: 16px; background-color: #f1c40f; }
                    h2 { color: #2c3e50; }
                </style>
            </head>
            <body>
                <h2>${moment().format('MMMM YYYY')} Transaction History</h2>
                <table>
                    <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Credit/Debit</th>
                        <th>Balance</th>
                    </tr>
                    <tr>
                        <td colspan="4" class="total">Starting Balance</td>
                        <td class="total">₹${startingBalance.toFixed(2)}</td>
                    </tr>
                    ${rows}
                    <tr>
                        <td colspan="2" class="total">Total Credit</td>
                        <td colspan="2" class="total">₹${totalCredit.toFixed(2)}</td>
                        <td class="total"></td>
                    </tr>
                    <tr>
                        <td colspan="2" class="total">Total Debit</td>
                        <td colspan="2" class="total">₹${totalDebit.toFixed(2)}</td>
                        <td class="total"></td>
                    </tr>
                    <tr>
                        <td colspan="4" class="total">Final Balance</td>
                        <td class="total">₹${runningBalance.toFixed(2)}</td>
                    </tr>
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
        Alert.alert("Error", "Failed to generate PDF: " + error.message);
        console.log(error);
    }
}
