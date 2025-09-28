'use client';

import { Calendar, DollarSign, Percent, Target, X } from 'lucide-react';
import { LoanRequest, stellarService } from '@/lib/stellar';

import toast from 'react-hot-toast';
import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';

interface ContributeModalProps {
  loan: LoanRequest;
  loanId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ContributeModal({ loan, loanId, onClose, onSuccess }: ContributeModalProps) {
  const { publicKey } = useWallet();
  const [contributionAmount, setContributionAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingAmount = Number(loan.amount_requested) - Number(loan.amount_funded);
  const maxContribution = stellarService.formatAmount(remainingAmount);

  const calculateExpectedReturn = () => {
    if (contributionAmount && loan.interest_rate) {
      const contribution = parseFloat(contributionAmount);
      const interestRate = loan.interest_rate / 10000; // Convert from basis points
      const totalLoanAmount = Number(loan.amount_requested);
      const contributionShare = contribution / stellarService.parseAmount(stellarService.formatAmount(totalLoanAmount));
      const totalRepayment = stellarService.parseAmount(stellarService.formatAmount(totalLoanAmount)) * (1 + interestRate);
      const expectedReturn = totalRepayment * contributionShare;
      
      return stellarService.formatAmount(expectedReturn);
    }
    return '0.00';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    setIsSubmitting(true);
    try {
      const amount = stellarService.parseAmount(contributionAmount);
      await stellarService.contributeToLoan(publicKey, loanId, amount);
      
      toast.success('Contribution successful!');
      onSuccess();
    } catch (error) {
      console.error('Error contributing to loan:', error);
      toast.error('Failed to contribute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Contribute to Loan</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Loan Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Purpose:</span>
              </div>
              <span className="text-sm font-medium text-gray-900 capitalize">{loan.purpose}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Loan Amount:</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stellarService.formatAmount(loan.amount_requested)} XLM
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Percent className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600">Interest Rate:</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{loan.interest_rate / 100}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Duration:</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{loan.duration_days} days</span>
            </div>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Funding Progress</span>
            <span>{stellarService.formatAmount(loan.amount_funded)} / {stellarService.formatAmount(loan.amount_requested)} XLM</span>
          </div>
          <div className="progress-bar h-2 mb-2">
            <div 
              className="progress-fill" 
              style={{ width: `${(Number(loan.amount_funded) / Number(loan.amount_requested)) * 100}%` }}
            />
          </div>
          <div className="text-sm text-gray-600">
            Remaining: {maxContribution} XLM
          </div>
        </div>

        {/* Contribution Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contribution Amount (XLM)
            </label>
            <input
              type="number"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              min="0.01"
              max={maxContribution}
              step="0.01"
              required
              className="input-field"
              placeholder={`Max: ${maxContribution} XLM`}
            />
          </div>

          {/* Expected Return */}
          {contributionAmount && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-green-800">
                <strong>Expected Return:</strong> {calculateExpectedReturn()} XLM
              </div>
              <div className="text-xs text-green-600 mt-1">
                This includes your principal + interest share
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !contributionAmount}
              className="btn-primary flex-1"
            >
              {isSubmitting ? 'Contributing...' : 'Contribute'}
            </button>
          </div>
        </form>

        {/* Quick Amount Buttons */}
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Quick amounts:</p>
          <div className="flex space-x-2">
            {[
              Math.min(10, parseFloat(maxContribution)),
              Math.min(25, parseFloat(maxContribution)),
              Math.min(50, parseFloat(maxContribution)),
              parseFloat(maxContribution)
            ].filter(amount => amount > 0).map((amount, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setContributionAmount(amount.toString())}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {amount === parseFloat(maxContribution) ? 'Max' : `${amount} XLM`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}