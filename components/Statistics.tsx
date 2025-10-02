import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, DollarSign, Percent, Target, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Statistics() {
  const [stats, setStats] = useState({
    totalLoans: 0,
    totalVolume: 0,
    averageInterestRate: 0,
    fundingRate: 0,
    activeLoans: 0,
    completedLoans: 0
  });

  const [purposeData, setPurposeData] = useState([]);
  const [interestRateData, setInterestRateData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    setLoading(true);
    try {
      const loans = JSON.parse(window.localStorage.getItem('newLoans') || '[]');
      
      if (loans.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate basic stats
      const totalLoans = loans.length;
      const totalVolume = loans.reduce((sum, loan) => sum + Number(loan.amount_funded), 0);
      const averageInterestRate = loans.reduce((sum, loan) => sum + loan.interest_rate, 0) / totalLoans / 100;
      
      const activeLoans = loans.filter(l => 
        l.is_active && Number(l.amount_funded) < Number(l.amount_requested)
      ).length;
      
      const completedLoans = loans.filter(l => 
        Number(l.amount_funded) >= Number(l.amount_requested)
      ).length;
      
      const fundingRate = totalLoans > 0 
        ? (completedLoans / totalLoans) * 100 
        : 0;

      setStats({
        totalLoans,
        totalVolume: totalVolume / 10000000, // Convert from stroops
        averageInterestRate,
        fundingRate,
        activeLoans,
        completedLoans
      });

      // Calculate purpose distribution
      const purposeCounts = loans.reduce((acc, loan) => {
        acc[loan.purpose] = (acc[loan.purpose] || 0) + 1;
        return acc;
      }, {});

      const purposeColors = {
        education: '#3B82F6',
        business: '#10B981',
        medical: '#F59E0B',
        personal: '#8B5CF6',
        emergency: '#EF4444',
        other: '#6B7280'
      };

      const purposeChartData = Object.entries(purposeCounts).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((count / totalLoans) * 100),
        color: purposeColors[name] || '#6B7280'
      }));

      setPurposeData(purposeChartData);

      // Calculate interest rate distribution
      const interestRanges = {
        '5-10%': 0,
        '10-15%': 0,
        '15-20%': 0,
        '20-30%': 0,
        '30-40%': 0,
        '40-50%': 0
      };

      loans.forEach(loan => {
        const rate = loan.interest_rate / 100;
        if (rate >= 5 && rate < 10) interestRanges['5-10%']++;
        else if (rate >= 10 && rate < 15) interestRanges['10-15%']++;
        else if (rate >= 15 && rate < 20) interestRanges['15-20%']++;
        else if (rate >= 20 && rate < 30) interestRanges['20-30%']++;
        else if (rate >= 30 && rate < 40) interestRanges['30-40%']++;
        else if (rate >= 40 && rate <= 50) interestRanges['40-50%']++;
      });

      const interestChartData = Object.entries(interestRanges).map(([range, count]) => ({
        range,
        count
      }));

      setInterestRateData(interestChartData);
      
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  // Mock monthly data (would need timestamp tracking in real implementation)
  const loanVolumeData = [
    { month: 'Jan', volume: stats.totalVolume * 0.12, loans: Math.floor(stats.totalLoans * 0.12) },
    { month: 'Feb', volume: stats.totalVolume * 0.14, loans: Math.floor(stats.totalLoans * 0.14) },
    { month: 'Mar', volume: stats.totalVolume * 0.16, loans: Math.floor(stats.totalLoans * 0.16) },
    { month: 'Apr', volume: stats.totalVolume * 0.15, loans: Math.floor(stats.totalLoans * 0.15) },
    { month: 'May', volume: stats.totalVolume * 0.20, loans: Math.floor(stats.totalLoans * 0.20) },
    { month: 'Jun', volume: stats.totalVolume * 0.23, loans: Math.floor(stats.totalLoans * 0.23) }
  ];

  if (loading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Platform Statistics
        </h1>
        <p className="text-gray-600 text-lg">
          Overview of lending activity and platform metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalLoans}</div>
            <p className="text-xs text-muted-foreground">Active opportunities</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatAmount(stats.totalVolume)} XLM</div>
            <p className="text-xs text-muted-foreground">Total funded</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Interest Rate</CardTitle>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.averageInterestRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Expected returns</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Success Rate</CardTitle>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.fundingRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Loans fully funded</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.activeLoans}</div>
            <p className="text-xs text-muted-foreground">Seeking funding</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Loans</CardTitle>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.completedLoans}</div>
            <p className="text-xs text-muted-foreground">Fully funded</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loan Volume Chart */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Loan Volume
            </CardTitle>
            <CardDescription>Distribution across last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loanVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'volume' ? `${formatAmount(Number(value))} XLM` : value,
                      name === 'volume' ? 'Volume' : 'Loans'
                    ]}
                  />
                  <Bar dataKey="volume" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Loan Purpose Distribution */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Loan Purpose Distribution
            </CardTitle>
            <CardDescription>Breakdown by loan category</CardDescription>
          </CardHeader>
          <CardContent>
            {purposeData.length > 0 ? (
              <>
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
                <div className="flex flex-wrap gap-3 mt-4">
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
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interest Rate Distribution */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-orange-600" />
            Interest Rate Distribution
          </CardTitle>
          <CardDescription>Number of loans by interest rate range</CardDescription>
        </CardHeader>
        <CardContent>
          {interestRateData.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Health */}
      <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Platform Health
          </CardTitle>
          <CardDescription>Key performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.fundingRate > 0 ? `${stats.fundingRate.toFixed(1)}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Funding Success Rate</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalLoans > 0 ? `${(stats.totalVolume / stats.totalLoans).toFixed(0)}` : '0'}
              </div>
              <div className="text-sm text-gray-600">Avg Loan Size (XLM)</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.activeLoans}
              </div>
              <div className="text-sm text-gray-600">Active Opportunities</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}