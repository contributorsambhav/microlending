import { Calendar, CheckCircle, DollarSign, Info, Loader2, Percent, Target, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export default function EnhancedLoanRequestForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    durationDays: '',
    purpose: 'business',
    description: ''
  });

  // Initialize mock loans on component mount
  React.useEffect(() => {
    initializeMockLoans();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showToast('Please enter a valid loan amount', 'error');
      return false;
    }
    if (!formData.interestRate || parseFloat(formData.interestRate) < 0) {
      showToast('Please enter a valid interest rate', 'error');
      return false;
    }
    if (!formData.durationDays || parseInt(formData.durationDays) <= 0) {
      showToast('Please enter a valid duration', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get existing loans to determine next ID
      let existingLoans = [];
      let nextId = 2000; // Start user loans at 2000
      try {
        const stored = window.localStorage.getItem('newLoans');
        if (stored) {
          existingLoans = JSON.parse(stored);
          // Find the highest ID and increment
          const maxId = Math.max(...existingLoans.map(l => l.loanId), 1999);
          nextId = maxId + 1;
        }
      } catch (error) {
        console.error('Error reading localStorage:', error);
      }

      // Create new loan object
      const newLoan = {
        loanId: nextId,
        borrower: 'GYOU...SELF', // Mock borrower address
        amount_requested: parseFloat(formData.amount) * 10000000, // Convert to stroops
        amount_funded: 0,
        interest_rate: parseFloat(formData.interestRate) * 100, // Store as basis points
        duration_days: parseInt(formData.durationDays),
        purpose: formData.purpose,
        is_active: true,
        funded_at: null,
        due_at: null,
        description: formData.description || `${formData.purpose.charAt(0).toUpperCase() + formData.purpose.slice(1)} loan request`
      };

      // Add new loan to the beginning of the array
      existingLoans.unshift(newLoan);

      // Save back to localStorage
      window.localStorage.setItem('newLoans', JSON.stringify(existingLoans));

      showToast(`Loan request for ${formData.amount} XLM submitted successfully!`, 'success');
      
      // Reset form
      setFormData({
        amount: '',
        interestRate: '',
        durationDays: '',
        purpose: 'business',
        description: ''
      });
    } catch (error) {
      console.error('Error:', error);
      showToast('Failed to submit loan request', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRepayment = () => {
    if (!formData.amount || !formData.interestRate || !formData.durationDays) return '0.00';
    const principal = parseFloat(formData.amount);
    const rate = parseFloat(formData.interestRate) / 100;
    const days = parseFloat(formData.durationDays);
    return (principal + (principal * rate * days / 365)).toFixed(2);
  };

  const calculateInterestAmount = () => {
    if (!formData.amount || !formData.interestRate || !formData.durationDays) return '0.00';
    const principal = parseFloat(formData.amount);
    const rate = parseFloat(formData.interestRate) / 100;
    const days = parseFloat(formData.durationDays);
    return (principal * rate * days / 365).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Request a Loan
          </h1>
          <p className="text-gray-600 text-lg">
            Fill in the details below to request funding through our peer-to-peer lending platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Form */}
          <Card className="md:col-span-2 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Loan Details
              </CardTitle>
              <CardDescription>
                Provide accurate information to increase your chances of funding
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Loan Amount (XLM)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 10000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Enter the amount you wish to borrow in XLM
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Interest Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="interestRate" className="text-sm font-medium flex items-center gap-2">
                      <Percent className="w-4 h-4" />
                      Interest Rate (%)
                    </Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 8.5"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Annual interest rate
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Duration (Days)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="e.g., 90"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Repayment period
                    </p>
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Loan Purpose
                  </Label>
                  <Select
                    value={formData.purpose}
                    onValueChange={(value) => setFormData({ ...formData, purpose: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">
                        <span className="flex items-center gap-2">
                          💼 Business
                        </span>
                      </SelectItem>
                      <SelectItem value="education">
                        <span className="flex items-center gap-2">
                          📚 Education
                        </span>
                      </SelectItem>
                      <SelectItem value="medical">
                        <span className="flex items-center gap-2">
                          🏥 Medical
                        </span>
                      </SelectItem>
                      <SelectItem value="personal">
                        <span className="flex items-center gap-2">
                          👤 Personal
                        </span>
                      </SelectItem>
                      <SelectItem value="emergency">
                        <span className="flex items-center gap-2">
                          🚨 Emergency
                        </span>
                      </SelectItem>
                      <SelectItem value="other">
                        <span className="flex items-center gap-2">
                          ✨ Other
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    What will you use this loan for?
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Provide additional details about your loan request to help lenders understand your needs..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-28 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add any relevant information that might help lenders make a decision
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Submit Loan Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            {/* Summary Card */}
            <Card className="shadow-xl border-2 border-blue-100">
              <CardHeader>
                <CardTitle className="text-lg">Loan Summary</CardTitle>
                <CardDescription>Review your loan details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-sm text-muted-foreground">Loan Amount</span>
                    <span className="font-bold text-lg">{formData.amount || '0'} XLM</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Interest Rate</span>
                    <Badge variant="secondary">{formData.interestRate || '0'}%</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <Badge variant="secondary">{formData.durationDays || '0'} days</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Purpose</span>
                    <Badge variant="outline" className="capitalize">{formData.purpose}</Badge>
                  </div>
                </div>

                {formData.amount && formData.interestRate && formData.durationDays && (
                  <>
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Interest Amount</span>
                        <span className="font-semibold text-orange-600">
                          +{calculateInterestAmount()} XLM
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                        <span className="text-sm font-medium">Total Repayment</span>
                        <span className="font-bold text-xl text-blue-600">
                          {calculateRepayment()} XLM
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Your loan will appear in the marketplace immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Lenders can contribute any amount up to your requested total</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Competitive interest rates increase funding chances</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Clear descriptions help build lender trust</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}