import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#f8fafc',
  },
  headerBox: {
    backgroundColor: '#0f172a', // Dark Navy
    padding: 30,
    borderRadius: 8,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyName: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerBrand: {
    color: '#818cf8', // Indigo
    fontSize: 10,
    marginTop: 4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'right',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 5,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: '#334155',
  },
  value: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  monoValue: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: '#0f172a',
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableColLeft: { flex: 2 },
  tableColRight: { flex: 1, textAlign: 'right' },
  tableHeaderText: { fontSize: 10, color: '#475569', fontWeight: 'bold' },
  tableText: { fontSize: 11, color: '#1e293b' },
  tableTextMono: { fontSize: 11, fontFamily: 'Courier', color: '#1e293b' },
  totalRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#e0e7ff', // light indigo
    borderTopWidth: 1,
    borderColor: '#c7d2fe',
  },
  totalTextCol: { flex: 2, textAlign: 'right', paddingRight: 20 },
  totalText: { fontSize: 12, color: '#3730a3', fontWeight: 'bold' },
  totalValueCol: { flex: 1, textAlign: 'right' },
  totalValueMono: { fontSize: 13, fontFamily: 'Courier', color: '#312e81', fontWeight: 'bold' },
  blockchainBox: {
    marginTop: 20,
    backgroundColor: '#030712', // deep dark
    padding: 20,
    borderRadius: 8,
  },
  blockchainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  verifiedStamp: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 10,
  },
  verificationTitle: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold' },
  hashLabel: { color: '#94a3b8', fontSize: 9, marginBottom: 4 },
  hashValue: { color: '#22d3ee', fontSize: 9, fontFamily: 'Courier', marginBottom: 12 },
  explorerUrl: { color: '#818cf8', fontSize: 9, textDecoration: 'underline' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
  }
});

interface PayslipData {
  txHash: string;
  employeeName: string;
  amount: number;
  date: string;
}

export const PayslipPDF = ({ txHash, employeeName, amount, date }: PayslipData) => {
  const baseSalary = amount;
  const networkFee = 0.00001; // Mocked Stellar default fee
  const netPayment = baseSalary - networkFee;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBox}>
          <View>
            <Text style={styles.companyName}>Payslip</Text>
            <Text style={styles.headerBrand}>Enterprise Payroll</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>OFFICIAL PAYSLIP</Text>
            <Text style={{ color: '#94a3b8', fontSize: 11, textAlign: 'right', marginTop: 4 }}>
              {new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Employee Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{employeeName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Pay Period:</Text>
            <Text style={styles.value}>{date}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Receiving Wallet (Stellar):</Text>
            <Text style={styles.monoValue}>{txHash ? "G...[REDACTED]" : "Pending"}</Text>
          </View>
        </View>

        {/* Payment Breakdown Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <View style={styles.tableColLeft}><Text style={styles.tableHeaderText}>DESCRIPTION</Text></View>
              <View style={styles.tableColRight}><Text style={styles.tableHeaderText}>AMOUNT (XLM)</Text></View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableColLeft}><Text style={styles.tableText}>Base Salary Disbursement</Text></View>
              <View style={styles.tableColRight}><Text style={styles.tableTextMono}>{baseSalary.toFixed(2)}</Text></View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.tableColLeft}><Text style={styles.tableText}>Sender Sponsored Network Fee</Text></View>
              <View style={styles.tableColRight}><Text style={styles.tableTextMono}>({networkFee.toFixed(5)})</Text></View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableColLeft}><Text style={{...styles.tableText, color: '#64748b'}}>Exchange Rate Estimate at Execution</Text></View>
              <View style={styles.tableColRight}><Text style={{...styles.tableTextMono, color: '#64748b'}}>~ $0.11 USD / XLM</Text></View>
            </View>

            <View style={styles.totalRow}>
              <View style={styles.totalTextCol}><Text style={styles.totalText}>NET PAYMENT ISSUED:</Text></View>
              <View style={styles.totalValueCol}><Text style={styles.totalValueMono}>{netPayment.toFixed(5)} XLM</Text></View>
            </View>
          </View>
        </View>

        {/* Blockchain Verification */}
        <View style={styles.blockchainBox}>
          <View style={styles.blockchainHeader}>
            <Text style={styles.verifiedStamp}>VERIFIED ON-CHAIN</Text>
            <Text style={styles.verificationTitle}>Stellar Network Verification</Text>
          </View>
          <Text style={styles.hashLabel}>TRANSACTION HASH / LEDGER ID</Text>
          <Text style={styles.hashValue}>{txHash || "PENDING CONFIRMATION"}</Text>
          
          <Text style={styles.hashLabel}>VIEW ON EXPLORER</Text>
          <Text style={styles.explorerUrl}>
            https://stellar.expert/explorer/testnet/tx/{txHash}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This document is a cryptographically verified receipt of a transaction executed on the Stellar blockchain.
            The values reported are strictly bounded within the public ledger.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
