'use client';

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Clock, DollarSign, Percent, Target, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { stellarService } from '@/lib/stellar';

export default function Statistics() {
  const [stats, setStats] = useState({
    totalLoans: 0,
    totalVolume: 0,
    averageInterestRate: 0,
    fundingRate: 0,
    activeLoans: 0,
    completedLoans: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const totalLoans = await stellarService.getLoanCount();
      
      // For demo purposes, we'll use mock data
      // In a real implementation, you'd aggregate data from all loans
      setStats({
        totalLoans,
        totalVolume: 125000,
        averageInterestRate: 15.5,
        fundingRate: 87.3,
        activeLoans: Math.floor(totalLoans * 0.6),
        completedLoans: Math.floor(totalLoans * 0.4)
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const loanVolumeData = [
    { month: 'Jan', volume: 15000, loans: 12 },
    { month: 'Feb', volume: 18000, loans: 15 },
    { month: 'Mar', volume: 22000, loans: 18 },
    { month: 'Apr', volume: 19000, loans: 16 },
    { month: 'May', volume: 25000, loans: 21 },
    { month: 'Jun', volume: 26000, loans: 22 }
  ];

  const purposeData = [
    { name: 'Education', value: 35, color: '#3B82F6' },
    { name: 'Business', value: 28, color: '#10B981' },
    { name: 'Healthcare', value: 15, color: '#F59E0B' },
    { name: 'Agriculture', value: 12, color: '#EF4444' },
    { name: 'Emergency', value: 7, color: '#8B5CF6' },
    { name: 'Other', value: 3, color: '#6B7280' }
  ];

  const interestRateData = [
    { range: '5-10%', count: 15 },
    { range: '10-15%', count: 28 },
    { range: '15-20%', count: 35 },
    { range: '20-30%', count: 22 },
    { range: '30-40%', count: 12 },
    { range: '40-50%', count: 5 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stats-card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Statistics</h2>
        <p className="text-gray-600">Overview of lending activity and platform metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Loans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLoans}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">{stellarService.formatAmount(stats.totalVolume)} XLM</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Interest Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageInterestRate}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Funding Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.fundingRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm text-gray-600">Completed Loans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedLoans}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loan Volume Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Loan Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'volume' ? `${stellarService.formatAmount(Number(value))} XLM` : value,
                    name === 'volume' ? 'Volume' : 'Loans'
                  ]}
                />
                <Bar dataKey="volume" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan Purpose Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Purpose Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={purposeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {purposeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {purposeData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-600">{item.name}: {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interest Rate Distribution */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interest Rate Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={interestRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Health */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">98.5%</div>
            <div className="text-sm text-gray-600">Repayment Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">2.1 days</div>
            <div className="text-sm text-gray-600">Avg Funding Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.2★</div>
            <div className="text-sm text-gray-600">Borrower Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}