# MicroLend - Decentralized Microlending Platform

A comprehensive Next.js application for interacting with your Stellar microlending smart contract. This platform enables users to request loans, contribute to existing loans, and manage their lending activities through a modern, responsive web interface.

## 🚀 Features

- **Wallet Integration**: Seamless Freighter wallet connection
- **Loan Management**: Request loans with customizable terms
- **Lending Interface**: Browse and contribute to available loans
- **Real-time Dashboard**: Track lending activities and statistics
- **Responsive Design**: Modern UI with Tailwind CSS
- **Interactive Charts**: Visualize platform statistics and trends

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Freighter Wallet browser extension
- Access to Stellar Testnet

## 🛠️ Installation

1. **Clone and setup the project:**
```bash
mkdir microlending-platform
cd microlending-platform

# Copy all the provided files into their respective directories
# Make sure to create the following directory structure:
# app/
#   ├── globals.css
#   ├── layout.tsx
#   └── page.tsx
# components/
#   ├── ContributeModal.tsx
#   ├── Dashboard.tsx
#   ├── Header.tsx
#   ├── Hero.tsx
#   ├── LoanList.tsx
#   ├── LoanRequestForm.tsx
#   └── Statistics.tsx
# context/
#   └── WalletContext.tsx
# lib/
#   └── stellar.ts
```

2. **Install dependencies:**
```bash
npm install
# or
yarn install
```

3. **Configure environment (optional):**
Create a `.env.local` file if you need to customize settings:
```env
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ID=CCFEXUP3A4C26ZXACKYYH525SNRBQLOEB3QXBTNTWNGKCPTW2RTHPLPO
```

4. **Update contract configuration:**
In `lib/stellar.ts`, update the contract ID if needed:
```typescript
this.contractId = 'CCFEXUP3A4C26ZXACKYYH525SNRBQLOEB3QXBTNTWNGKCPTW2RTHPLPO';
```

## 🚀 Running the Application

1. **Start the development server:**
```bash
npm run dev
# or
yarn dev
```

2. **Open your browser:**
Navigate to `http://localhost:3000`

3. **Connect your wallet:**
- Install the Freighter wallet extension
- Create or import a Stellar testnet account
- Fund your account with testnet XLM from the [Stellar Laboratory](https://laboratory.stellar.org/#account-creator)

## 💡 Usage Guide

### For Borrowers:

1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Request Loan**: Navigate to "Request Loan" tab
3. **Fill Details**: Enter loan amount, interest rate, duration, and purpose
4. **Submit**: Review terms and submit your loan request
5. **Wait for Funding**: Your loan will appear in the "Browse Loans" section
6. **Repay**: Once funded, you can repay through your dashboard

### For Lenders:

1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Browse Loans**: Navigate to "Browse Loans" tab
3. **Select Loan**: Click "Contribute" on any active loan
4. **Contribute**: Enter your contribution amount
5. **Confirm**: Sign the transaction with your wallet
6. **Earn Returns**: Receive principal + interest when borrower repays

### Dashboard Features:

- **Portfolio Overview**: See your total borrowed/lent amounts
- **Active Loans**: Track ongoing loan activities
- **Transaction History**: View your lending history
- **Statistics**: Analyze platform performance

## 🔧 Key Components

### Smart Contract Integration (`lib/stellar.ts`)
- Handles all Stellar blockchain interactions
- Manages wallet connections via Freighter
- Provides methods for loan operations

### Wallet Management (`context/WalletContext.tsx`)
- React context for wallet state management
- Handles connection/disconnection logic
- Provides wallet status across components

### Core Components:
- **Header**: Wallet connection and navigation
- **Dashboard**: User portfolio and quick actions
- **LoanRequestForm**: Create new loan requests
- **LoanList**: Browse and contribute to loans
- **ContributeModal**: Contribute to specific loans
- **Statistics**: Platform analytics and charts

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradients and animations
- **Responsive**: Works seamlessly on desktop and mobile
- **Interactive**: Hover effects, transitions, and micro-interactions
- **Accessible**: Proper contrast ratios and semantic markup
- **Data Visualization**: Charts and progress bars for better UX

## 📊 Platform Statistics

The statistics page includes:
- Total loans and volume metrics
- Interest rate distributions
- Loan purpose breakdowns
- Monthly volume trends
- Platform health indicators

## 🔐 Security Considerations

- All transactions require wallet signature
- Smart contract handles fund escrow safely
- No private keys are stored in the application
- Testnet environment for safe testing

## 🚨 Important Notes

1. **Testnet Only**: This is configured for Stellar testnet
2. **Freighter Required**: Users must have Freighter wallet installed
3. **Smart Contract**: Ensure your contract is deployed and initialized
4. **Token Support**: Currently supports the configured token only

## 🛠️ Customization

### Styling:
- Modify `app/globals.css` for global styles
- Update `tailwind.config.js` for theme customization
- Customize component styles in individual files

### Contract Integration:
- Update contract ID in `lib/stellar.ts`
- Modify contract methods as needed
- Add new contract functions if required

### Features:
- Add new loan purposes in `LoanRequestForm`
- Customize interest rate ranges
- Add notification systems
- Implement user profiles

## 📱 Mobile Support

The application is fully responsive and includes:
- Touch-friendly interfaces
- Mobile-optimized navigation
- Responsive charts and tables
- Proper viewport handling

## 🔄 Development Workflow

1. **Make Changes**: Edit components or add features
2. **Test Locally**: Use testnet for safe testing
3. **Build**: Run `npm run build` to test production build
4. **Deploy**: Deploy to your preferred hosting platform

## 📈 Production Deployment

For production deployment:

1. **Update Configuration**:
   - Change network to mainnet in `lib/stellar.ts`
   - Update contract ID for mainnet
   - Configure production environment variables

2. **Build Application**:
```bash
npm run build
```

3. **Deploy**:
   - Vercel: `vercel deploy`
   - Netlify: Connect repository and deploy
   - Custom: Upload `out` folder to your server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on testnet
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Common Issues:

**Wallet Connection Fails:**
- Ensure Freighter is installed and unlocked
- Check if you're on the correct network (testnet)
- Try refreshing the page

**Transaction Fails:**
- Verify account has sufficient balance
- Check if contract parameters are valid
- Ensure contract is properly deployed

**Loan Not Appearing:**
- Wait for transaction confirmation
- Refresh the page
- Check browser console for errors

**Charts Not Loading:**
- Clear browser cache
- Check network connectivity
- Verify Recharts is properly installed

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review smart contract deployment
3. Test with fresh testnet accounts
4. Check browser console for errors

---

Built with ❤️ using Next.js, Tailwind CSS, and Stellar SDK