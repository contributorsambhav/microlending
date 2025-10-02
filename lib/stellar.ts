import { Account, Address, BASE_FEE, Contract, Horizon, Networks, TransactionBuilder, nativeToScVal, rpc, scValToNative, xdr } from '@stellar/stellar-sdk';
import { getAddress, isConnected, setAllowed, signTransaction } from '@stellar/freighter-api';

export interface LoanRequest {
  borrower: string;
  amount_requested: bigint;
  interest_rate: number;
  duration_days: number;
  purpose: string;
  is_active: boolean;
  amount_funded: bigint;
  funded_at: bigint;
  due_at: bigint;
}

export interface LenderContribution {
  lender: string;
  amount: bigint;
}

class StellarService {
  private rpcServer: rpc.Server;
  private horizonServer: Horizon.Server;
  private contractId: string;
  private networkPassphrase: string;

  constructor() {
    // RPC server for Soroban contract interactions
    this.rpcServer = new rpc.Server('https://soroban-testnet.stellar.org');

    // Horizon server for account queries (balance, etc.)
    this.horizonServer = new Horizon.Server('https://horizon-testnet.stellar.org');

    this.contractId = 'CCFEXUP3A4C26ZXACKYYH525SNRBQLOEB3QXBTNTWNGKCPTW2RTHPLPO';
    this.networkPassphrase = Networks.TESTNET;
  }

  async isFreighterConnected(): Promise<boolean> {
    try {
      return await isConnected();
    } catch (error) {
      console.error('Error checking Freighter connection:', error);
      return false;
    }
  }

  async connectFreighter(): Promise<string> {
    try {
      // First check if already connected
      const connected = await isConnected();
      if (connected) {
        const result = await getAddress();
        return result.address;
      }

      await setAllowed();

      const result = await getAddress();
      return result.address;
    } catch (error) {
      console.error('Freighter connection error:', error);

      if (error instanceof Error) {
        if (error.message.includes('User declined access')) {
          throw new Error('User declined access');
        }
      }

      throw new Error('Freighter wallet extension not found. Please install Freighter from https://freighter.app/');
    }
  }

  async getPublicKey(): Promise<string> {
    try {
      const result = await getAddress();
      return result.address;
    } catch (error) {
      console.error('Error getting public key:', error);
      throw new Error('Failed to get public key from Freighter');
    }
  }

  // Get account balance using Horizon API
  async getAccountBalance(publicKey: string): Promise<string> {
    try {
      // Use Horizon server to load account
      const account = await this.horizonServer.loadAccount(publicKey);

      // Check if balances array exists
      if (!account.balances || !Array.isArray(account.balances)) {
        console.warn('Account balances not found or invalid format');
        return '0';
      }

      // Find native XLM balance
      const xlmBalance = account.balances.find((balance) => balance.asset_type === 'native');

      // Return balance or '0' if not found
      return xlmBalance?.balance || '0';
    } catch (error: unknown) {
      console.error('Error getting account balance:', error);

      if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { status?: number }; message?: string };
    if (err.response?.status === 404 || err.message?.includes('Not Found')) {
      console.warn('Account not found on network. It may need to be funded first.');
      return '0';
    }
  }

      // Return '0' for any other errors
      return '0';
    }
  }

  private async buildTransaction(operation: xdr.Operation, publicKey: string) {
    // Use RPC server for getting account info for transactions
    const account = await this.rpcServer.getAccount(publicKey);

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase
    })
      .addOperation(operation)
      .setTimeout(300)
      .build();

    return transaction;
  }

  async requestLoan(borrower: string, amount: number, interestRate: number, durationDays: number, purpose: string): Promise<number> {
    try {
      console.log('Request loan params:', {
        borrower,
        amount,
        interestRate,
        durationDays,
        purpose
      });

      // Ensure we have a valid connection
      const connected = await this.isFreighterConnected();
      if (!connected) {
        throw new Error('Freighter wallet is not connected');
      }

      // Verify the public key matches
      const currentPublicKey = await this.getPublicKey();
      if (currentPublicKey !== borrower) {
        throw new Error('Connected wallet does not match borrower address');
      }

      const contract = new Contract(this.contractId);

      // Ensure purpose is lowercase and valid for symbol (max 32 chars)
      const purposeLower = purpose.toLowerCase().substring(0, 32);

      console.log('Building contract call with params:', {
        borrower,
        amount,
        interestRate,
        durationDays,
        purposeLower
      });

      // Build the operation matching the CLI format exactly
      const operation = contract.call('request_loan', nativeToScVal(borrower, { type: 'address' }), nativeToScVal(BigInt(amount), { type: 'i128' }), nativeToScVal(interestRate, { type: 'u32' }), nativeToScVal(durationDays, { type: 'u32' }), nativeToScVal(purposeLower, { type: 'symbol' }));

      const transaction = await this.buildTransaction(operation, borrower);

      console.log('Transaction built, simulating...');
      console.log('Final params:', {
        borrower,
        amount: `${amount} stroops (${amount / 10000000} XLM)`,
        interestRate: `${interestRate} (${interestRate / 100}%)`,
        durationDays,
        purpose: purposeLower
      });

      console.log('Preparing transaction (includes simulation)...');

      // prepareTransaction does simulation internally and prepares everything
      const preparedTransaction = await this.rpcServer.prepareTransaction(transaction);

      console.log('Transaction prepared successfully');

      console.log('Signing with Freighter...');

      // Add a small delay to ensure UI is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const signedXDR = await signTransaction(preparedTransaction.toXDR(), {
        networkPassphrase: this.networkPassphrase,
        accountToSign: borrower
      });

      const signedTransaction = TransactionBuilder.fromXDR(signedXDR.signedTxXdr, this.networkPassphrase);

      console.log('Sending transaction...');

      const result = await this.rpcServer.sendTransaction(signedTransaction);

      console.log('Transaction sent, status:', result.status, 'hash:', result.hash);

      if (result.status === 'PENDING') {
        const hash = result.hash;
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          try {
            const txResponse = await this.rpcServer.getTransaction(hash);

            if (txResponse.status === 'SUCCESS') {
              console.log('Transaction successful!');

              if (txResponse.returnValue) {
                const loanId = scValToNative(txResponse.returnValue) as number;
                console.log('Loan ID:', loanId);
                return loanId;
              }

              console.log('Transaction successful, but no return value found');
              return 1;
            }

            if (txResponse.status === 'FAILED') {
              console.error('Transaction failed:', txResponse);

              if (txResponse.resultMetaXdr) {
                console.error('Result meta:', txResponse.resultMetaXdr);
              }
              throw new Error('Transaction failed on Stellar network');
            }
          } catch (e) {
            if (e instanceof Error && !e.message.includes('Transaction not found')) {
              throw e;
            }
          }

          attempts++;
        }

        throw new Error('Transaction confirmation timeout');
      }

      if (result.status === 'ERROR') {
        console.error('Transaction error:', result);
        throw new Error(`Transaction failed: ${result.errorResult?.toXDR()}`);
      }

      throw new Error('Transaction submission failed');
    } catch (error) {
      console.error('Error requesting loan:', error);
      throw error;
    }
  }

  async contributeToLoan(lender: string, loanId: number, contributionAmount: number): Promise<void> {
    try {
      const connected = await this.isFreighterConnected();
      if (!connected) {
        throw new Error('Freighter wallet is not connected');
      }

      const currentPublicKey = await this.getPublicKey();
      if (currentPublicKey !== lender) {
        throw new Error('Connected wallet does not match lender address');
      }

      const contract = new Contract(this.contractId);

      const operation = contract.call('contribute_to_loan', nativeToScVal(Address.fromString(lender), { type: 'address' }), nativeToScVal(loanId, { type: 'u32' }), nativeToScVal(BigInt(contributionAmount), { type: 'i128' }));

      const transaction = await this.buildTransaction(operation, lender);
      const preparedTransaction = await this.rpcServer.prepareTransaction(transaction);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const signedXDR = await signTransaction(preparedTransaction.toXDR(), {
        networkPassphrase: this.networkPassphrase,
        accountToSign: lender
      });

      const signedTransaction = TransactionBuilder.fromXDR(signedXDR.signedTxXdr, this.networkPassphrase);

      const result = await this.rpcServer.sendTransaction(signedTransaction);

      if (result.status === 'PENDING') {
        const hash = result.hash;
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          try {
            const txResponse = await this.rpcServer.getTransaction(hash);

            if (txResponse.status === 'SUCCESS') {
              return;
            }

            if (txResponse.status === 'FAILED') {
              console.error('Transaction failed:', txResponse);
              throw new Error('Transaction failed on Stellar network');
            }
          } catch (e) {
            if (e instanceof Error && !e.message.includes('Transaction not found')) {
              throw e;
            }
          }

          attempts++;
        }

        throw new Error('Transaction confirmation timeout');
      }

      if (result.status === 'ERROR') {
        console.error('Transaction error:', result);
        throw new Error(`Transaction failed: ${result.errorResult?.toXDR()}`);
      }
    } catch (error) {
      console.error('Error contributing to loan:', error);
      throw error;
    }
  }

  async repayLoan(borrower: string, loanId: number): Promise<void> {
    try {
      const connected = await this.isFreighterConnected();
      if (!connected) {
        throw new Error('Freighter wallet is not connected');
      }

      const currentPublicKey = await this.getPublicKey();
      if (currentPublicKey !== borrower) {
        throw new Error('Connected wallet does not match borrower address');
      }

      const contract = new Contract(this.contractId);

      const operation = contract.call('repay_loan', nativeToScVal(Address.fromString(borrower), { type: 'address' }), nativeToScVal(loanId, { type: 'u32' }));

      const transaction = await this.buildTransaction(operation, borrower);
      const preparedTransaction = await this.rpcServer.prepareTransaction(transaction);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const signedXDR = await signTransaction(preparedTransaction.toXDR(), {
        networkPassphrase: this.networkPassphrase,
        accountToSign: borrower
      });

      const signedTransaction = TransactionBuilder.fromXDR(signedXDR.signedTxXdr, this.networkPassphrase);

      const result = await this.rpcServer.sendTransaction(signedTransaction);

      if (result.status === 'PENDING') {
        const hash = result.hash;
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 2000));

          try {
            const txResponse = await this.rpcServer.getTransaction(hash);

            if (txResponse.status === 'SUCCESS') {
              return;
            }

            if (txResponse.status === 'FAILED') {
              console.error('Transaction failed:', txResponse);
              throw new Error('Transaction failed on Stellar network');
            }
          } catch (e) {
            if (e instanceof Error && !e.message.includes('Transaction not found')) {
              throw e;
            }
          }

          attempts++;
        }

        throw new Error('Transaction confirmation timeout');
      }

      if (result.status === 'ERROR') {
        console.error('Transaction error:', result);
        throw new Error(`Transaction failed: ${result.errorResult?.toXDR()}`);
      }
    } catch (error) {
      console.error('Error repaying loan:', error);
      throw error;
    }
  }

  async getLoan(loanId: number): Promise<LoanRequest | null> {
    try {
      console.log(`Fetching loan #${loanId}...`);

      const contract = new Contract(this.contractId);

      const operation = contract.call('get_loan', nativeToScVal(loanId, { type: 'u32' }));

      const dummyAccount = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');

      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      const result = await this.rpcServer.simulateTransaction(transaction);

      if ('error' in result && result.error) {
        console.error(`Simulation error for loan #${loanId}:`, result.error);
        return null;
      }

      if ('results' in result && result.results && result.results.length > 0) {
        const returnValue = result.results[0].retval;
        const loanData = scValToNative(returnValue) as LoanRequest;
        console.log(`Loan #${loanId} data:`, loanData);
        return loanData;
      }

      console.warn(`No results returned for loan #${loanId}`);
      return null;
    } catch (error) {
      console.error(`Error getting loan #${loanId}:`, error);
      return null;
    }
  }

  async getLoanCount(): Promise<number> {
    try {
      console.log('Fetching loan count...');

      const contract = new Contract(this.contractId);

      const operation = contract.call('get_loan_count');

      const dummyAccount = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');

      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      const result = await this.rpcServer.simulateTransaction(transaction);

      if ('error' in result && result.error) {
        console.error('Simulation error getting loan count:', result.error);
        return 0;
      }

      if ('results' in result && result.results && result.results.length > 0) {
        const returnValue = result.results[0].retval;
        const count = scValToNative(returnValue) as number;
        console.log('Total loan count:', count);
        return count;
      }

      console.warn('No results returned for loan count');
      return 0;
    } catch (error) {
      console.error('Error getting loan count:', error);
      return 0;
    }
  }

  async getRemainingAmount(loanId: number): Promise<number> {
    try {
      const contract = new Contract(this.contractId);

      const operation = contract.call('get_remaining_amount', nativeToScVal(loanId, { type: 'u32' }));

      const dummyAccount = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');

      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      const result = await this.rpcServer.simulateTransaction(transaction);

      if ('error' in result && result.error) {
        console.error('Simulation error:', result.error);
        return 0;
      }

      if ('results' in result && result.results && result.results.length > 0) {
        const returnValue = result.results[0].retval;
        return scValToNative(returnValue) as number;
      }

      return 0;
    } catch (error) {
      console.error('Error getting remaining amount:', error);
      return 0;
    }
  }

  formatAmount(amount: bigint | number | string): string {
    let numAmount: number;

    if (typeof amount === 'bigint') {
      numAmount = Number(amount);
    } else if (typeof amount === 'string') {
      numAmount = parseInt(amount, 10);
    } else {
      numAmount = amount;
    }

    return (numAmount / 10000000).toFixed(7);
  }

  parseAmount(amount: string | number): number {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return Math.floor(numAmount * 10000000);
  }
}

export const stellarService = new StellarService();
