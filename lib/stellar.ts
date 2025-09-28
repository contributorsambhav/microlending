import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr
} from '@stellar/stellar-sdk';

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
  private server: rpc.Server;
  private contractId: string;
  private networkPassphrase: string;

  constructor() {
    this.server = new rpc.Server('https://soroban-testnet.stellar.org');
    this.contractId = 'CCFEXUP3A4C26ZXACKYYH525SNRBQLOEB3QXBTNTWNGKCPTW2RTHPLPO';
    this.networkPassphrase = Networks.TESTNET;
  }

  async isFreighterConnected(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      // Wait a bit for Freighter to load if it's still loading
      await this.waitForFreighter();
      if (window.freighterApi) {
        return await window.freighterApi.isConnected();
      }
    }
    return false;
  }

  async connectFreighter(): Promise<string> {
    if (typeof window !== 'undefined') {
      // Wait for Freighter to load
      await this.waitForFreighter();
      
      if (window.freighterApi) {
        const publicKey = await window.freighterApi.requestAccess();
        return publicKey;
      }
    }
    throw new Error('Freighter wallet extension not found. Please install Freighter from https://freighter.app/');
  }

  async getPublicKey(): Promise<string> {
    if (typeof window !== 'undefined') {
      await this.waitForFreighter();
      if (window.freighterApi) {
        return await window.freighterApi.getPublicKey();
      }
    }
    throw new Error('Freighter wallet not found');
  }

  private async waitForFreighter(timeout: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.freighterApi) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && window.freighterApi) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after specified time
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, timeout);
    });
  }

  private async buildTransaction(operation: xdr.Operation, publicKey: string) {
    const account = await this.server.getAccount(publicKey);
    
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(300)
      .build();

    return transaction;
  }

  async requestLoan(
    borrower: string,
    amount: number,
    interestRate: number,
    durationDays: number,
    purpose: string
  ): Promise<number> {
    try {
      const contract = new Contract(this.contractId);
      
      const operation = contract.call(
        'request_loan',
        nativeToScVal(Address.fromString(borrower)),
        nativeToScVal(amount, { type: 'i128' }),
        nativeToScVal(interestRate, { type: 'u32' }),
        nativeToScVal(durationDays, { type: 'u32' }),
        nativeToScVal(purpose, { type: 'symbol' })
      );

      const transaction = await this.buildTransaction(operation, borrower);
      const preparedTransaction = await this.server.prepareTransaction(transaction);

      if (typeof window !== 'undefined' && window.freighterApi) {
        const signedXDR = await window.freighterApi.signTransaction(preparedTransaction.toXDR(), {
          networkPassphrase: this.networkPassphrase,
        });

        const signedTransaction = TransactionBuilder.fromXDR(signedXDR, this.networkPassphrase);
        const result = await this.server.sendTransaction(signedTransaction);

        // Check if the transaction was successful using string comparison
        if (result.status === 'SUCCESS') {
          // Wait for the transaction to be confirmed and get the result
          const txResponse = await this.server.getTransaction(result.hash);
          if (txResponse.status === 'SUCCESS') {
            // Parse the result to extract loan ID
            // This is a simplified approach - you may need to parse XDR for complex return values
            return 1; // Placeholder - implement proper loan ID extraction from transaction result
          }
        }
      }

      throw new Error('Transaction failed');
    } catch (error) {
      console.error('Error requesting loan:', error);
      throw error;
    }
  }

  async contributeToLoan(
    lender: string,
    loanId: number,
    contributionAmount: number
  ): Promise<void> {
    try {
      const contract = new Contract(this.contractId);
      
      const operation = contract.call(
        'contribute_to_loan',
        nativeToScVal(Address.fromString(lender)),
        nativeToScVal(loanId, { type: 'u32' }),
        nativeToScVal(contributionAmount, { type: 'i128' })
      );

      const transaction = await this.buildTransaction(operation, lender);
      const preparedTransaction = await this.server.prepareTransaction(transaction);

      if (typeof window !== 'undefined' && window.freighterApi) {
        const signedXDR = await window.freighterApi.signTransaction(preparedTransaction.toXDR(), {
          networkPassphrase: this.networkPassphrase,
        });

        const signedTransaction = TransactionBuilder.fromXDR(signedXDR, this.networkPassphrase);
        const result = await this.server.sendTransaction(signedTransaction);

        if (result.status !== 'SUCCESS') {
          throw new Error('Transaction failed');
        }
      }
    } catch (error) {
      console.error('Error contributing to loan:', error);
      throw error;
    }
  }

  async repayLoan(borrower: string, loanId: number): Promise<void> {
    try {
      const contract = new Contract(this.contractId);
      
      const operation = contract.call(
        'repay_loan',
        nativeToScVal(Address.fromString(borrower)),
        nativeToScVal(loanId, { type: 'u32' })
      );

      const transaction = await this.buildTransaction(operation, borrower);
      const preparedTransaction = await this.server.prepareTransaction(transaction);

      if (typeof window !== 'undefined' && window.freighterApi) {
        const signedXDR = await window.freighterApi.signTransaction(preparedTransaction.toXDR(), {
          networkPassphrase: this.networkPassphrase,
        });

        const signedTransaction = TransactionBuilder.fromXDR(signedXDR, this.networkPassphrase);
        const result = await this.server.sendTransaction(signedTransaction);

        if (result.status !== 'SUCCESS') {
          throw new Error('Transaction failed');
        }
      }
    } catch (error) {
      console.error('Error repaying loan:', error);
      throw error;
    }
  }

  async getLoan(loanId: number): Promise<LoanRequest | null> {
    try {
      const contract = new Contract(this.contractId);
      
      const operation = contract.call(
        'get_loan',
        nativeToScVal(loanId, { type: 'u32' })
      );

      // Use a dummy account for simulation (contract reads don't need a real account)
      const dummyAccount = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      const result = await this.server.simulateTransaction(transaction);
      
      // Check simulation result properly
      if ('error' in result && result.error) {
        console.error('Simulation error:', result.error);
        return null;
      }

      // Extract return value from successful simulation
      if ('returnValue' in result && result.returnValue) {
        return scValToNative(result.returnValue) as LoanRequest;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting loan:', error);
      return null;
    }
  }

  async getLoanCount(): Promise<number> {
    try {
      const contract = new Contract(this.contractId);
      
      const operation = contract.call('get_loan_count');

      const dummyAccount = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      const result = await this.server.simulateTransaction(transaction);
      
      if ('error' in result && result.error) {
        console.error('Simulation error:', result.error);
        return 0;
      }

      if ('returnValue' in result && result.returnValue) {
        return scValToNative(result.returnValue) as number;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting loan count:', error);
      return 0;
    }
  }

  async getRemainingAmount(loanId: number): Promise<number> {
    try {
      const contract = new Contract(this.contractId);
      
      const operation = contract.call(
        'get_remaining_amount',
        nativeToScVal(loanId, { type: 'u32' })
      );

      const dummyAccount = new Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(operation)
        .setTimeout(300)
        .build();

      const result = await this.server.simulateTransaction(transaction);
      
      if ('error' in result && result.error) {
        console.error('Simulation error:', result.error);
        return 0;
      }

      if ('returnValue' in result && result.returnValue) {
        return scValToNative(result.returnValue) as number;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting remaining amount:', error);
      return 0;
    }
  }

  formatAmount(amount: bigint | number): string {
    const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
    return (numAmount / 10000000).toFixed(7); // Convert from stroops to XLM (7 decimal places)
  }

  parseAmount(amount: string | number): number {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return Math.floor(numAmount * 10000000); // Convert to stroops (XLM has 7 decimal places)
  }
}

// Extend Window interface for Freighter
declare global {
  interface Window {
    freighterApi: {
      isConnected(): Promise<boolean>;
      requestAccess(): Promise<string>;
      getPublicKey(): Promise<string>;
      signTransaction(xdr: string, options: { networkPassphrase: string }): Promise<string>;
    };
  }
}

export const stellarService = new StellarService();