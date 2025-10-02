'use client';

import { ArrowRight, Award, BookOpen, Briefcase, Calendar, CheckCircle, Clock, DollarSign, Filter, Percent, Search, Target, TrendingUp, Users, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

// Toast Component
const Toast = ({ message, type, onClose }) => (
  <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
    <Card className={`w-80 shadow-lg border-2 ${
      type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
    }`}>
      <CardContent className="flex items-center gap-3 p-4">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        )}
        <p className={`text-sm font-medium flex-1 ${
          type === 'success' ? 'text-green-900' : 'text-red-900'
        }`}>
          {message}
        </p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </CardContent>
    </Card>
  </div>
);

export default function EnhancedLoanList() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const [toast, setToast] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [isContributing, setIsContributing] = useState(false);

  useEffect(() => {
    loadLoans();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadLoans = () => {
    setLoading(true);
    
    setTimeout(() => {
      try {
        const storedLoans = JSON.parse(window.localStorage.getItem('newLoans') || '[]');
        setLoans(storedLoans);
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        setLoans([]);
      }
      
      setLoading(false);
    }, 500);
  };

  const handleContribute = async () => {
    if (!contributeAmount || parseFloat(contributeAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    const amount = parseFloat(contributeAmount);
    const remaining = getRemainingAmount(selectedLoan);
    const remainingXLM = remaining / 10000000;

    if (amount > remainingXLM) {
      showToast(`Amount exceeds remaining ${remainingXLM.toFixed(2)} XLM`, 'error');
      return;
    }

    setIsContributing(true);

    try {
      // Simulate contribution
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update loan in state
      const updatedLoans = loans.map(loan => {
        if (loan.loanId === selectedLoan.loanId) {
          const newFunded = Number(loan.amount_funded) + (amount * 10000000);
          return { ...loan, amount_funded: newFunded };
        }
        return loan;
      });

      setLoans(updatedLoans);

      // Update localStorage
      try {
        const storedLoans = JSON.parse(window.localStorage.getItem('newLoans') || '[]');
        const updatedStoredLoans = storedLoans.map(loan => {
          if (loan.loanId === selectedLoan.loanId) {
            const newFunded = Number(loan.amount_funded) + (amount * 10000000);
            return { ...loan, amount_funded: newFunded };
          }
          return loan;
        });
        window.localStorage.setItem('newLoans', JSON.stringify(updatedStoredLoans));
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }

      showToast(`Successfully contributed ${amount} XLM to Loan #${selectedLoan.loanId}!`, 'success');
      setSelectedLoan(null);
      setContributeAmount('');
    } catch (error) {
      showToast('Failed to process contribution', 'error');
    } finally {
      setIsContributing(false);
    }
  };

  const formatAmount = (amount) => {
    return (Number(amount) / 10000000).toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  };

  const getProgressPercentage = (loan) => {
    if (!loan.amount_requested) return 0;
    const funded = Number(loan.amount_funded);
    const requested = Number(loan.amount_requested);
    return Math.min((funded / requested) * 100, 100);
  };

  const getRemainingAmount = (loan) => {
    const funded = Number(loan.amount_funded);
    const requested = Number(loan.amount_requested);
    return Math.max(requested - funded, 0);
  };

  const getDaysRemaining = (loan) => {
    if (loan.funded_at && loan.due_at) {
      const now = Date.now() / 1000;
      const dueDate = Number(loan.due_at);
      const days = Math.max(Math.ceil((dueDate - now) / (24 * 60 * 60)), 0);
      return days;
    }
    return null;
  };

  const getPurposeIcon = (purpose) => {
    switch (purpose) {
      case 'education':
        return <BookOpen className="w-4 h-4" />;
      case 'business':
        return <Briefcase className="w-4 h-4" />;
      case 'medical':
        return <Target className="w-4 h-4" />;
      case 'personal':
        return <Target className="w-4 h-4" />;
      case 'emergency':
        return <Target className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const filteredLoans = loans.filter(loan => {
    let matchesFilter = true;
    switch (filter) {
      case 'active':
        matchesFilter = loan.is_active && Number(loan.amount_funded) < Number(loan.amount_requested);
        break;
      case 'funded':
        matchesFilter = Number(loan.amount_funded) >= Number(loan.amount_requested);
        break;
      case 'education':
        matchesFilter = loan.purpose === 'education';
        break;
      case 'business':
        matchesFilter = loan.purpose === 'business';
        break;
    }

    const matchesSearch = searchQuery === '' || 
      loan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.loanId?.toString().includes(searchQuery);

    return matchesFilter && matchesSearch;
  });

  const stats = {
    totalLoans: loans.length,
    activeLoans: loans.filter(l => l.is_active && Number(l.amount_funded) < Number(l.amount_requested)).length,
    totalFunded: loans.reduce((sum, l) => sum + Number(l.amount_funded), 0),
    avgInterest: loans.length > 0 ? loans.reduce((sum, l) => sum + l.interest_rate, 0) / loans.length / 100 : 0
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your Freighter wallet to browse and contribute to loans
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" size="lg">
              Connect Wallet
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header Section */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Available Loans
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Browse and contribute to loans from borrowers around the world
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLoans}</div>
            <p className="text-xs text-muted-foreground">Active opportunities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
            <p className="text-xs text-muted-foreground">Seeking funding</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funded</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(stats.totalFunded)}</div>
            <p className="text-xs text-muted-foreground">XLM contributed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Interest</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgInterest.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Expected returns</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search loans by description, purpose, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Loans</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="funded">Funded</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredLoans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Loans Found</h3>
                <p className="text-gray-600 text-center">
                  {searchQuery 
                    ? `No loans match "${searchQuery}". Try a different search term.`
                    : filter === 'all' 
                      ? 'No loans available at the moment. Check back later!' 
                      : `No loans found for the "${filter}" filter. Try a different filter.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLoans.map((loan) => {
                const progress = getProgressPercentage(loan);
                const remaining = getRemainingAmount(loan);
                const daysLeft = getDaysRemaining(loan);
                const isFullyFunded = progress >= 100;

                return (
                  <Card key={loan.loanId} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                            {getPurposeIcon(loan.purpose)}
                          </div>
                          <div>
                            <Badge variant="secondary" className="capitalize mb-1">
                              {loan.purpose}
                            </Badge>
                            <div className="text-xs text-muted-foreground">ID #{loan.loanId}</div>
                          </div>
                        </div>
                        <Badge variant={isFullyFunded ? "default" : "outline"} className={isFullyFunded ? "bg-green-500" : ""}>
                          {isFullyFunded ? '✓ Funded' : 'Active'}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">{formatAmount(loan.amount_requested)} XLM</CardTitle>
                      {loan.description && (
                        <CardDescription className="line-clamp-2">{loan.description}</CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Interest</div>
                            <div className="font-semibold">{loan.interest_rate / 100}%</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="text-muted-foreground">Duration</div>
                            <div className="font-semibold">{loan.duration_days}d</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Funded</span>
                          <span className="font-semibold text-green-600">
                            {formatAmount(loan.amount_funded)} XLM
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className="font-semibold text-blue-600">
                            {formatAmount(remaining)} XLM
                          </span>
                        </div>
                      </div>

                      {daysLeft !== null && (
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">Due in {daysLeft} days</span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter>
                      {!isFullyFunded && remaining > 0 ? (
                        <Button 
                          className="w-full group" 
                          onClick={() => setSelectedLoan(loan)}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Contribute Now
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      ) : (
                        <Button variant="secondary" className="w-full" disabled>
                          <Award className="w-4 h-4 mr-2" />
                          Fully Funded
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Contribute Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedLoan(null)}>
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                  {getPurposeIcon(selectedLoan.purpose)}
                </div>
                <div>
                  <CardTitle>Contribute to Loan #{selectedLoan.loanId}</CardTitle>
                  <CardDescription className="capitalize">
                    {selectedLoan.purpose} loan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedLoan.description && (
                <p className="text-sm text-muted-foreground">{selectedLoan.description}</p>
              )}
              
              <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requested</span>
                  <span className="font-semibold">{formatAmount(selectedLoan.amount_requested)} XLM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Already Funded</span>
                  <span className="font-semibold text-green-600">{formatAmount(selectedLoan.amount_funded)} XLM</span>
                </div>
                <div className="border-t border-blue-200 my-2 pt-2"></div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-bold text-blue-600">{formatAmount(getRemainingAmount(selectedLoan))} XLM</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contribute-amount">Contribution Amount (XLM)</Label>
                <Input 
                  id="contribute-amount"
                  type="number" 
                  step="0.01"
                  placeholder="Enter amount in XLM" 
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  disabled={isContributing}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: {formatAmount(getRemainingAmount(selectedLoan))} XLM
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setSelectedLoan(null)}
                disabled={isContributing}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleContribute}
                disabled={isContributing}
              >
                {isContributing ? 'Processing...' : 'Confirm Contribution'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}