'use client';

import { Calendar, DollarSign, FileText, Percent, Send } from 'lucide-react';

import { stellarService } from '@/lib/stellar';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';

export default function LoanRequestForm() {
  const { publicKey, isConnected } = useWallet();
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    duration: '',
    purpose: 'education'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const purposes = [
    { value: 'education', label: 'Education' },
    { value: 'business', label: 'Business' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateInterest = () => {
    if (formData.amount && formData.interestRate) {
      const principal = parseFloat(formData.amount);
      const rate = parseFloat(formData.interestRate) / 100;
      return (principal * rate).toFixed(2);
    }
    return '0.00';
  };

  const calculateTotal = () => {
    if (formData.amount && formData.interestRate) {
      const principal = parseFloat(formData.amount);
      const interest = parseFloat(calculateInterest());
      return (principal + interest).toFixed(2);
    }
    return '0.00';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      const amount = stellarService.parseAmount(formData.amount);
      const interestRate = Math.floor(parseFloat(formData.interestRate) * 100); // Convert to basis points
      const duration = parseInt(formData.duration);

      const loanId = await stellarService.requestLoan(
        publicKey,
        amount,
        interestRate,
        duration,
        formData.purpose
      );

      toast.success(`Loan request created successfully! Loan ID: ${loanId}`);
      
      // Reset form
      setFormData({
        amount: '',
        interestRate: '',
        duration: '',
        purpose: 'education'
      });
    } catch (error) {
      console.error('Error creating loan request:', error);
      toast.error('Failed to create loan request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600">Connect your Freighter wallet to request a loan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request a Loan</h2>
          <p className="text-gray-600">Fill out the form below to request funding from the community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Loan Amount (XLM)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              min="1"
              max="1000"
              step="0.01"
              required
              className="input-field"
              placeholder="Enter amount (1-1000 XLM)"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: 1 XLM, Maximum: 1000 XLM</p>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Percent className="w-4 h-4 inline mr-1" />
              Interest Rate (%)
            </label>
            <input
              type="number"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleInputChange}
              min="5"
              max="50"
              step="0.1"
              required
              className="input-field"
              placeholder="Enter interest rate (5-50%)"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: 5%, Maximum: 50%</p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Duration (Days)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="30"
              max="365"
              required
              className="input-field"
              placeholder="Enter duration (30-365 days)"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum: 30 days, Maximum: 365 days</p>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Purpose
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              required
              className="input-field"
            >
              {purposes.map(purpose => (
                <option key={purpose.value} value={purpose.value}>
                  {purpose.label}
                </option>
              ))}
            </select>
          </div>

          {/* Loan Summary */}
          {formData.amount && formData.interestRate && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-gray-900">Loan Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Principal:</span>
                  <span className="font-medium text-gray-900 ml-2">{formData.amount} XLM</span>
                </div>
                <div>
                  <span className="text-gray-600">Interest:</span>
                  <span className="font-medium text-gray-900 ml-2">{calculateInterest()} XLM</span>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900 ml-2">{formData.duration || 0} days</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Repayment:</span>
                  <span className="font-bold text-blue-600 ml-2">{calculateTotal()} XLM</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Loan Request'}</span>
          </button>
        </form>

        {/* Important Notes */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your loan will be visible to all lenders once submitted</li>
            <li>• Funds are released only when the loan is fully funded</li>
            <li>• A 1% platform fee is deducted from funded loans</li>
            <li>• Ensure you can repay the full amount by the due date</li>
          </ul>
        </div>
      </div>
    </div>
  );
}