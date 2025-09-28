'use client';

import { useEffect, useState } from 'react';

import Dashboard from '@/components/Dashboard';
import { Header } from '@/components/Header';
import Hero from '@/components/Hero';
import LoanList from '@/components/LoanList';
import LoanRequestForm from '@/components/LoanRequestForm';
import Statistics from '@/components/Statistics';
import { WalletProvider } from '@/context/WalletContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

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