'use client';

import { useEffect, useState } from 'react';

import Dashboard from '@/components/Dashboard';
import { Header } from '@/components/Header';
import Hero from '@/components/Hero';
import LoanList from '@/components/LoanList';
import LoanRequestForm from '@/components/LoanRequestForm';
import Statistics from '@/components/Statistics';
import { WalletProvider } from '@/context/WalletContext';

// Initialize mock loans in localStorage on first load
const initializeMockLoans = () => {
  const stored = window.localStorage.getItem('newLoans');
  if (!stored) {
    const mockLoans = [
      {
        loanId: 1001,
        borrower: 'GABC...XYZ1',
        amount_requested: 500000000000,
        amount_funded: 350000000000,
        interest_rate: 850,
        duration_days: 180,
        purpose: 'education',
        is_active: true,
        funded_at: null,
        due_at: null,
        description: 'Computer Science degree tuition for final year'
      },
      {
        loanId: 1002,
        borrower: 'GDEF...ABC2',
        amount_requested: 1000000000000,
        amount_funded: 250000000000,
        interest_rate: 1200,
        duration_days: 365,
        purpose: 'business',
        is_active: true,
        funded_at: null,
        due_at: null,
        description: 'Expanding local coffee shop to second location'
      },
      {
        loanId: 1003,
        borrower: 'GHIJ...DEF3',
        amount_requested: 300000000000,
        amount_funded: 300000000000,
        interest_rate: 750,
        duration_days: 90,
        purpose: 'education',
        is_active: true,
        funded_at: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
        due_at: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60,
        description: 'Online certification courses in data science'
      },
      {
        loanId: 1004,
        borrower: 'GKLM...GHI4',
        amount_requested: 750000000000,
        amount_funded: 600000000000,
        interest_rate: 950,
        duration_days: 270,
        purpose: 'business',
        is_active: true,
        funded_at: null,
        due_at: null,
        description: 'Purchase equipment for sustainable farming startup'
      },
      {
        loanId: 1005,
        borrower: 'GNOP...JKL5',
        amount_requested: 200000000000,
        amount_funded: 150000000000,
        interest_rate: 700,
        duration_days: 120,
        purpose: 'education',
        is_active: true,
        funded_at: null,
        due_at: null,
        description: 'Master\'s degree application and preparation costs'
      },
      {
        loanId: 1006,
        borrower: 'GQRS...MNO6',
        amount_requested: 400000000000,
        amount_funded: 400000000000,
        interest_rate: 800,
        duration_days: 150,
        purpose: 'business',
        is_active: true,
        funded_at: Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60,
        due_at: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60,
        description: 'Marketing campaign for e-commerce platform'
      },
      {
        loanId: 1007,
        borrower: 'GTUV...PQR7',
        amount_requested: 350000000000,
        amount_funded: 100000000000,
        interest_rate: 1100,
        duration_days: 240,
        purpose: 'medical',
        is_active: true,
        funded_at: null,
        due_at: null,
        description: 'Surgery and medical treatment for family member'
      },
      {
        loanId: 1008,
        borrower: 'GWXY...STU8',
        amount_requested: 600000000000,
        amount_funded: 450000000000,
        interest_rate: 900,
        duration_days: 200,
        purpose: 'personal',
        is_active: true,
        funded_at: null,
        due_at: null,
        description: 'Home renovation and repairs'
      },
      {
        loanId: 1009,
        borrower: 'GZAB...VWX9',
        amount_requested: 250000000000,
        amount_funded: 250000000000,
        interest_rate: 650,
        duration_days: 60,
        purpose: 'emergency',
        is_active: true,
        funded_at: Math.floor(Date.now() / 1000) - 20 * 24 * 60 * 60,
        due_at: Math.floor(Date.now() / 1000) + 40 * 24 * 60 * 60,
        description: 'Urgent family emergency fund'
      },
      {
        loanId: 1010,
        borrower: 'GCDE...YZA0',
        amount_requested: 450000000000,
        amount_funded: 200000000000,
        interest_rate: 1050,
        duration_days: 300,
        purpose: 'other',
        is_active: true,
        funded_at: null,
        due_at: null,
        description: 'Community center development project'
      },
      {
        loanId: 1011,
        borrower: 'GFGH...BCD1',
        amount_requested: 800000000000,
        amount_funded: 300000000000,
        interest_rate: 1150,
        duration_days: 365,
        purpose: 'medical',
        is_active: true,
        funded_at: null,
        due_at: null,
        description: 'Long-term medical care and rehabilitation'
      },
      {
        loanId: 1012,
        borrower: 'GIJK...EFG2',
        amount_requested: 550000000000,
        amount_funded: 550000000000,
        interest_rate: 875,
        duration_days: 180,
        purpose: 'personal',
        is_active: true,
        funded_at: Math.floor(Date.now() / 1000) - 60 * 24 * 60 * 60,
        due_at: Math.floor(Date.now() / 1000) + 120 * 24 * 60 * 60,
        description: 'Wedding and celebration expenses'
      }
    ];
    window.localStorage.setItem('newLoans', JSON.stringify(mockLoans));
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Initialize mock loans on component mount
  useEffect(() => {
    initializeMockLoans();
  }, []);

  return (
    <WalletProvider>
      <div className="min-h-screen">
        <Header />
        
        {/* Navigation Tabs */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 py-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('request-loan')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'request-loan'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Request Loan
              </button>
              <button
                onClick={() => setActiveTab('browse-loans')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'browse-loans'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Browse Loans
              </button>
              <button
                onClick={() => setActiveTab('statistics')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'statistics'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Statistics
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <>
              <Hero />
              <Dashboard />
            </>
          )}
          {activeTab === 'request-loan' && <LoanRequestForm />}
          {activeTab === 'browse-loans' && <LoanList />}
          {activeTab === 'statistics' && <Statistics />}
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">MicroLend</h3>
              <p className="text-gray-600 mb-4">
                Democratizing access to financial services through blockchain technology
              </p>
              <div className="flex justify-center space-x-6 text-sm text-gray-500">
                <a href="#" className="hover:text-gray-900">Terms</a>
                <a href="#" className="hover:text-gray-900">Privacy</a>
                <a href="#" className="hover:text-gray-900">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
}