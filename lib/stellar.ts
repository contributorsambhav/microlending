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
// Import the official Freighter API
import {
  getAddress,
  isConnected,
  setAllowed,
  signTransaction
} from '@stellar/freighter-api';

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
    try {
      return await isConnected();
    } catch (error) {
      console.error('Error checking Freighter connection:', error);
      return false;
    }
  }

  async connectFreighter(): Promise<string> {
    try {
      // Request access to the wallet
      await setAllowed();
      
      // Get the public key
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
        nativeToScVal(Address.fromString(borrower), { type: 'address' }),
        nativeToScVal(amount, { type: 'i128' }),
        nativeToScVal(interestRate, { type: 'u32' }),
        nativeToScVal(durationDays, { type: 'u32' }),
        nativeToScVal(purpose, { type: 'symbol' })
      );

      const transaction = await this.buildTransaction(operation, borrower);
      const preparedTransaction = await this.server.prepareTransaction(transaction);

      // Sign with Freighter using the official API
      const signedXDR = await signTransaction(preparedTransaction.toXDR(), {
        networkPassphrase: this.networkPassphrase,
      });

      const signedTransaction = TransactionBuilder.fromXDR(
        signedXDR.signedTxXdr,
        this.networkPassphrase
      );
      
      const result = await this.server.sendTransaction(signedTransaction);

      // Wait for transaction confirmation
      if (result.status === 'PENDING') {
        const hash = result.hash;
        let txResponse = await this.server.getTransaction(hash);
        
        // Poll until transaction is confirmed
        while (txResponse.status === 'NOT_FOUND') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          txResponse = await this.server.getTransaction(hash);
        }
        
        if (txResponse.status === 'SUCCESS' && txResponse.resultMetaXdr) {
          const returnValue = txResponse.resultMetaXdr.v3()?.sorobanMeta()?.returnValue();
          if (returnValue) {
            return scValToNative(returnValue) as number;
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
        nativeToScVal(Address.fromString(lender), { type: 'address' }),
        nativeToScVal(loanId, { type: 'u32' }),
        nativeToScVal(contributionAmount, { type: 'i128' })
      );

      const transaction = await this.buildTransaction(operation, lender);
      const preparedTransaction = await this.server.prepareTransaction(transaction);

      const signedXDR = await signTransaction(preparedTransaction.toXDR(), {
        networkPassphrase: this.networkPassphrase,
      });

      const signedTransaction = TransactionBuilder.fromXDR(
        signedXDR.signedTxXdr,
        this.networkPassphrase
      );
      
      const result = await this.server.sendTransaction(signedTransaction);

      if (result.status === 'PENDING') {
        const hash = result.hash;
        let txResponse = await this.server.getTransaction(hash);
        
        while (txResponse.status === 'NOT_FOUND') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          txResponse = await this.server.getTransaction(hash);
        }
        
        if (txResponse.status !== 'SUCCESS') {
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
        nativeToScVal(Address.fromString(borrower), { type: 'address' }),
        nativeToScVal(loanId, { type: 'u32' })
      );

      const transaction = await this.buildTransaction(operation, borrower);
      const preparedTransaction = await this.server.prepareTransaction(transaction);

      const signedXDR = await signTransaction(preparedTransaction.toXDR(), {
        networkPassphrase: this.networkPassphrase,
      });

      const signedTransaction = TransactionBuilder.fromXDR(
        signedXDR.signedTxXdr,
        this.networkPassphrase
      );
      
      const result = await this.server.sendTransaction(signedTransaction);

      if (result.status === 'PENDING') {
        const hash = result.hash;
        let txResponse = await this.server.getTransaction(hash);
        
        while (txResponse.status === 'NOT_FOUND') {
          await new Promise(resolve => setTimeout(resolve, 1000));
          txResponse = await this.server.getTransaction(hash);
        }
        
        if (txResponse.status !== 'SUCCESS') {
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

      const dummyAccount = new Account(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        '0'
      );
      
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
        return null;
      }

      if ('results' in result && result.results && result.results.length > 0) {
        const returnValue = result.results[0].retval;
        return scValToNative(returnValue) as LoanRequest;
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

      const dummyAccount = new Account(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        '0'
      );
      
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

      if ('results' in result && result.results && result.results.length > 0) {
        const returnValue = result.results[0].retval;
        return scValToNative(returnValue) as number;
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

      const dummyAccount = new Account(
        'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
        '0'
      );
      
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

  formatAmount(amount: bigint | number): string {
    const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
    return (numAmount / 10000000).toFixed(7);
  }

  parseAmount(amount: string | number): number {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return Math.floor(numAmount * 10000000);
  }
}

export const stellarService = new StellarService();