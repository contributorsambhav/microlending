'use client';

import { ArrowRight, Calendar, Clock, DollarSign, Percent, Target, Users } from 'lucide-react';
import { LoanRequest, stellarService } from '@/lib/stellar';
import { useEffect, useState } from 'react';

import ContributeModal from './ContributeModal';
import toast from 'react-hot-toast';
import { useWallet } from '@/context/WalletContext';

export default function LoanList() {
  const { isConnected } = useWallet();
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<{ loan: LoanRequest; loanId: number } | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isConnected) {
      loadLoans();
    }
  }, [isConnected]);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const totalLoans = await stellarService.getLoanCount();
      const loanPromises = [];
      
      for (let i = 1; i <= totalLoans; i++) {
        loanPromises.push(
          stellarService.getLoan(i).then(loan => ({ loan, loanId: i }))
        );
      }
      
      const loansData = await Promise.all(loanPromises);
      setLoans(loansData.map(l => l.loan));
    } catch (error) {
      console.error('Error loading loans:', error);
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (loan: LoanRequest) => {
    if (!loan.amount_requested) return 0;
    const funded = Number(loan.amount_funded);
    const requested = Number(loan.amount_requested);
    return Math.min((funded / requested) * 100, 100);
  };

  const getRemainingAmount = (loan: LoanRequest) => {
    const funded = Number(loan.amount_funded);
    const requested = Number(loan.amount_requested);
    return Math.max(requested - funded, 0);
  };

  const getDaysRemaining = (loan: LoanRequest) => {
    if (loan.funded_at && loan.due_at) {
      const now = Date.now() / 1000;
      const dueDate = Number(loan.due_at);
      const days = Math.max(Math.ceil((dueDate - now) / (24 * 60 * 60)), 0);
      return days;
    }
    return null;
  };

  const filteredLoans = loans.filter(loan => {
    switch (filter) {
      case 'active':
        return loan.is_active && Number(loan.amount_funded) < Number(loan.amount_requested);
      case 'funded':
        return Number(loan.amount_funded) >= Number(loan.amount_requested);
      case 'education':
        return loan.purpose === 'education';
      case 'business':
        return loan.purpose === 'business';
      default:
        return true;
    }
  });

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600">Connect your Freighter wallet to browse and contribute to loans.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Loans</h2>
        <p className="text-gray-600">Browse and contribute to loans from borrowers around the world</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { value: 'all', label: 'All Loans' },
          { value: 'active', label: 'Active' },
          { value: 'funded', label: 'Fully Funded' },
          { value: 'education', label: 'Education' },
          { value: 'business', label: 'Business' }
        ].map(filterOption => (
          <button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="loan-card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Loans Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLoans.map((loan, index) => {
            const progress = getProgressPercentage(loan);
            const remaining = getRemainingAmount(loan);
            const daysLeft = getDaysRemaining(loan);
            const isFullyFunded = progress >= 100;

            return (
              <div key={index} className="loan-card">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600 capitalize">
                        {loan.purpose}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {stellarService.formatAmount(loan.amount_requested)} XLM
                    </h3>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isFullyFunded 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isFullyFunded ? 'Funded' : 'Active'}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar h-2">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Loan Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Percent className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Interest:</span>
                    <span className="font-medium">{loan.interest_rate / 100}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{loan.duration_days} days</span>
                  </div>
                </div>

                {/* Funding Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Funded:</span>
                      <div className="font-medium text-green-600">
                        {stellarService.formatAmount(loan.amount_funded)} XLM
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Remaining:</span>
                      <div className="font-medium text-blue-600">
                        {stellarService.formatAmount(remaining)} XLM
                      </div>
                    </div>
                  </div>
                </div>

                {/* Days Left (if funded) */}
                {daysLeft !== null && (
                  <div className="mb-4 flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-gray-600">Due in {daysLeft} days</span>
                  </div>
                )}

                {/* Action Button */}
                {!isFullyFunded && remaining > 0 && (
                  <button
                    onClick={() => setSelectedLoan({ loan, loanId: index + 1 })}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Contribute</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                {isFullyFunded && (
                  <div className="w-full py-3 px-4 bg-green-50 text-green-700 rounded-lg text-center font-medium">
                    ✓ Fully Funded
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLoans.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Loans Found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No loans available at the moment. Check back later!' 
              : `No loans found for the "${filter}" filter. Try a different filter.`
            }
          </p>
        </div>
      )}

      {/* Contribute Modal */}
      {selectedLoan && (
        <ContributeModal
          loan={selectedLoan.loan}
          loanId={selectedLoan.loanId}
          onClose={() => setSelectedLoan(null)}
          onSuccess={() => {
            setSelectedLoan(null);
            loadLoans();
          }}
        />
      )}
    </div>
  );
}