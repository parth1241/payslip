const React = require('react');
const ReactPDF = require('@react-pdf/renderer');
const path = require('path');

const { Document, Page, Text, View, StyleSheet, Image } = ReactPDF;

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

const PayslipPDF = ({ txHash, employeeName, amount, date }) => {
  const baseSalary = amount;
  const networkFee = 0.00001;
  const netPayment = baseSalary - networkFee;
  const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(explorerUrl)}&size=150x150&color=06b6d4&bgcolor=ffffff`;

  return React.createElement(Document, null,
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(View, { style: styles.bgGlow }),
      React.createElement(View, { style: styles.bgGlowBottom }),
      React.createElement(View, { style: styles.mainContainer },
        React.createElement(View, { style: styles.header },
          React.createElement(View, { style: styles.companyInfo },
            React.createElement(Text, { style: styles.logoText }, "PaySlip"),
            React.createElement(Text, { style: styles.subLogo }, "Decentralized Payroll")
          ),
          React.createElement(View, { style: styles.receiptTitle },
            React.createElement(Text, { style: styles.titleMain }, "Earnings Statement"),
            React.createElement(Text, { style: styles.titleSub }, `Period: ${formattedDate}`)
          )
        ),
        React.createElement(View, { style: styles.grid },
          React.createElement(View, { style: styles.gridCol },
            React.createElement(Text, { style: styles.gridTitle }, "Employee Name"),
            React.createElement(Text, { style: styles.gridValue }, employeeName),
            React.createElement(Text, { style: styles.gridSubValue }, `Verified ID: ${employeeName.replace(/\s+/g, '-').toLowerCase()}`)
          ),
          React.createElement(View, { style: styles.gridCol },
            React.createElement(Text, { style: styles.gridTitle }, "Issued Date"),
            React.createElement(Text, { style: styles.gridValue }, date),
            React.createElement(Text, { style: styles.gridSubValue }, "Network: Stellar Testnet")
          )
        ),
        React.createElement(View, { style: styles.tableContainer },
          React.createElement(View, { style: styles.tableHeader },
            React.createElement(View, { style: styles.colDesc }, React.createElement(Text, { style: styles.headerText }, "DESCRIPTION")),
            React.createElement(View, { style: styles.colAmount }, React.createElement(Text, { style: styles.headerText }, "AMOUNT (XLM)"))
          ),
          React.createElement(View, { style: styles.tableRow },
            React.createElement(View, { style: styles.colDesc },
              React.createElement(Text, { style: styles.rowText }, "Salary Disbursement"),
              React.createElement(Text, { style: styles.rowTextDim }, "Monthly base payment in native asset")
            ),
            React.createElement(View, { style: styles.colAmount }, React.createElement(Text, { style: styles.rowText }, baseSalary.toFixed(2)))
          ),
          React.createElement(View, { style: styles.tableRow },
            React.createElement(View, { style: styles.colDesc },
              React.createElement(Text, { style: styles.rowText }, "Network Fees (Sponsored)"),
              React.createElement(Text, { style: styles.rowTextDim }, "Employer covered Stellar base reserve fee")
            ),
            React.createElement(View, { style: styles.colAmount }, React.createElement(Text, { style: styles.rowText }, `-${networkFee.toFixed(5)}`))
          ),
          React.createElement(View, { style: { ...styles.tableRow, borderBottomWidth: 0 } },
            React.createElement(View, { style: styles.colDesc },
              React.createElement(Text, { style: styles.rowTextDim }, "Estimated USD Value (at time of tx)")
            ),
            React.createElement(View, { style: styles.colAmount }, React.createElement(Text, { style: styles.rowTextDim }, `~$ ${(baseSalary * 0.11).toFixed(2)} USD`))
          )
        ),
        React.createElement(View, { style: styles.summaryBox },
          React.createElement(Text, { style: styles.summaryLabel }, "NET DISBURSEMENT"),
          React.createElement(Text, { style: styles.summaryValue }, `${netPayment.toFixed(5)} XLM`)
        ),
        React.createElement(View, { style: styles.blockchainSection },
          React.createElement(View, { style: styles.qrCodeIcon },
            txHash && React.createElement(Image, { src: qrUrl })
          ),
          React.createElement(View, { style: styles.verificationDetails },
            React.createElement(View, { style: styles.statusBadge },
              React.createElement(Text, null, "CONFIRMED")
            ),
            React.createElement(Text, { style: styles.hashLabel }, "BLOCKCHAIN TRANSACTION HASH"),
            React.createElement(Text, { style: styles.hashValue }, txHash || "PENDING_CONFIRMATION_ON_LEDGER"),
            React.createElement(Text, { style: styles.verificationFooterText }, "Scan QR code to view this transaction on the public Stellar ledger.")
          )
        ),
        React.createElement(View, { style: styles.footer },
          React.createElement(Text, { style: styles.footerText }, "This is a digital receipt of a blockchain transaction. PaySlip is a non-custodial payroll layer on the Stellar Network. Values are cryptographically verifiable and immutable once recorded on the ledger.")
        )
      )
    )
  );
};

const data = {
  txHash: "5347209847239084723908472390847239084723908472390847239084723908",
  employeeName: "Parth Karan",
  amount: 1500,
  date: "2026-04-06"
};

ReactPDF.renderToFile(React.createElement(PayslipPDF, data), path.join(process.cwd(), 'payslip_sample.pdf'))
  .then(() => console.log('Successfully generated PDF'))
  .catch(err => console.error('Error generating PDF:', err));
