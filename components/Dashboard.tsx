'use client';

import { AlertCircle, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { LoanRequest, stellarService } from '@/lib/stellar';
import { useEffect, useState } from 'react';

import toast from 'react-hot-toast';
import { useWallet } from '@/context/WalletContext';

export default function Dashboard() {
  const { isConnected } = useWallet();
  const [userLoans, setUserLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBorrowed: 0,
    totalLent: 0,
    activeLoans: 0,
    completedLoans: 0
  });

  useEffect(() => {
    if (isConnected) {
      loadUserData();
    }
  }, [isConnected]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // This is a simplified version - in a real app, you'd need to track user loans
      const totalLoans = await stellarService.getLoanCount();
      
      // For demo purposes, we'll show some sample data
      setStats({
        totalBorrowed: 15000,
        totalLent: 8500,
        activeLoans: 2,
        completedLoans: 5
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600">Connect your Freighter wallet to view your dashboard and start lending or borrowing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Borrowed</p>
              <p className="text-2xl font-bold text-gray-900">{stellarService.formatAmount(stats.totalBorrowed)} XLM</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Lent</p>
              <p className="text-2xl font-bold text-gray-900">{stellarService.formatAmount(stats.totalLent)} XLM</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Loans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeLoans}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedLoans}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2 w-full">
            <DollarSign className="w-4 h-4" />
            <span>Request New Loan</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2 w-full">
            <TrendingUp className="w-4 h-4" />
            <span>Browse Available Loans</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Loan #1234 fully funded</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">New contribution received</p>
                <p className="text-xs text-gray-600">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Loan #1233 due in 3 days</p>
                <p className="text-xs text-gray-600">3 days ago</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}