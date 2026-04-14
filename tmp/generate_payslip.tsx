import React from 'react';
import ReactPDF, { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import path from 'path';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#020617',
    color: '#f8fafc',
  },
  mainContainer: {
    padding: 40,
    height: '100%',
  },
  bgGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 400,
    height: 400,
    backgroundColor: '#3730a3',
    opacity: 0.1,
    borderRadius: 200,
  },
  bgGlowBottom: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 300,
    height: 300,
    backgroundColor: '#0e7490',
    opacity: 0.08,
    borderRadius: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 20,
  },
  companyInfo: {
    flexDirection: 'column',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#818cf8',
    letterSpacing: 1,
  },
  subLogo: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  receiptTitle: {
    textAlign: 'right',
  },
  titleMain: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  titleSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  gridCol: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gridTitle: {
    fontSize: 9,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  gridValue: {
    fontSize: 12,
    color: '#f1f5f9',
    fontWeight: 'bold',
  },
  gridSubValue: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 4,
    fontFamily: 'Courier',
  },
  tableContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(51, 65, 85, 0.3)',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  colDesc: { flex: 3 },
  colAmount: { flex: 1, textAlign: 'right' },
  headerText: { fontSize: 9, color: '#94a3b8', fontWeight: 'bold' },
  rowText: { fontSize: 11, color: '#e2e8f0' },
  rowTextDim: { fontSize: 10, color: '#64748b' },
  summaryBox: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#818cf8',
    fontFamily: 'Courier',
  },
  blockchainSection: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
    flexDirection: 'row',
    gap: 20,
  },
  qrCodeIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    padding: 5,
    borderRadius: 8,
  },
  verificationDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  statusBadge: {
    backgroundColor: '#064e3b',
    color: '#34d399',
    fontSize: 8,
    padding: '3px 8px',
    borderRadius: 100,
    width: 100,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  hashLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
  },
  hashValue: {
    fontSize: 9,
    color: '#22d3ee',
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  verificationFooterText: {
    fontSize: 8,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.5,
  }
});

const PayslipPDF = ({ txHash, employeeName, amount, date }: { txHash: string; employeeName: string; amount: number; date: string }) => {
  const baseSalary = amount;
  const networkFee = 0.00001;
  const netPayment = baseSalary - networkFee;
  const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(explorerUrl)}&size=150x150&color=06b6d4&bgcolor=ffffff`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.bgGlow} />
        <View style={styles.bgGlowBottom} />
        
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <View style={styles.companyInfo}>
              <Text style={styles.logoText}>PaySlip</Text>
              <Text style={styles.subLogo}>Decentralized Payroll</Text>
            </View>
            <View style={styles.receiptTitle}>
              <Text style={styles.titleMain}>Earnings Statement</Text>
              <Text style={styles.titleSub}>Period: {formattedDate}</Text>
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridCol}>
              <Text style={styles.gridTitle}>Employee Name</Text>
              <Text style={styles.gridValue}>{employeeName}</Text>
              <Text style={styles.gridSubValue}>Verified ID: {employeeName.replace(/\s+/g, '-').toLowerCase()}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridTitle}>Issued Date</Text>
              <Text style={styles.gridValue}>{date}</Text>
              <Text style={styles.gridSubValue}>Network: Stellar Testnet</Text>
            </View>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <View style={styles.colDesc}><Text style={styles.headerText}>DESCRIPTION</Text></View>
              <View style={styles.colAmount}><Text style={styles.headerText}>AMOUNT (XLM)</Text></View>
            </View>
            
            <View style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.rowText}>Salary Disbursement</Text>
                <Text style={styles.rowTextDim}>Monthly base payment in native asset</Text>
              </View>
              <View style={styles.colAmount}><Text style={styles.rowText}>{baseSalary.toFixed(2)}</Text></View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.rowText}>Network Fees (Sponsored)</Text>
                <Text style={styles.rowTextDim}>Employer covered Stellar base reserve fee</Text>
              </View>
              <View style={styles.colAmount}><Text style={styles.rowText}>-{networkFee.toFixed(5)}</Text></View>
            </View>

            <View style={{ ...styles.tableRow, borderBottomWidth: 0 }}>
              <View style={styles.colDesc}>
                <Text style={styles.rowTextDim}>Estimated USD Value (at time of tx)</Text>
              </View>
              <View style={styles.colAmount}><Text style={styles.rowTextDim}>~$ {(baseSalary * 0.11).toFixed(2)} USD</Text></View>
            </View>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>NET DISBURSEMENT</Text>
            <Text style={styles.summaryValue}>{netPayment.toFixed(5)} XLM</Text>
          </View>

          <View style={styles.blockchainSection}>
            <View style={styles.qrCodeIcon}>
              {txHash && <Image src={qrUrl} />}
            </View>
            <View style={styles.verificationDetails}>
              <View style={styles.statusBadge}>
                <Text>CONFIRMED</Text>
              </View>
              <Text style={styles.hashLabel}>BLOCKCHAIN TRANSACTION HASH</Text>
              <Text style={styles.hashValue}>{txHash || "PENDING_CONFIRMATION_ON_LEDGER"}</Text>
              <Text style={styles.verificationFooterText}>
                Scan QR code to view this transaction on the public Stellar ledger.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This is a digital receipt of a blockchain transaction. PaySlip is a non-custodial payroll layer on the Stellar Network.
              Values are cryptographically verifiable and immutable once recorded on the ledger.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const data = {
  txHash: "5347209847239084723908472390847239084723908472390847239084723908",
  employeeName: "Parth Karan",
  amount: 1500,
  date: "2026-04-06"
};

ReactPDF.renderToFile(<PayslipPDF {...data} />, path.join(process.cwd(), 'payslip_sample.pdf'))
  .then(() => console.log('Successfully generated PDF'))
  .catch(err => console.error('Error generating PDF:', err));
