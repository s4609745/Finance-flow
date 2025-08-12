import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/apiService";
import AddTransactionModal from "@/components/add-transaction-modal";
import Navbar from "@/components/navbar";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
    queryFn: async () => {
      const response = await apiService.getUserStats();
      return response.data;
    },
    retry: false,
  });

  // Fetch recent transactions
  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/analytics/recent-transactions"],
    queryFn: async () => {
      const response = await apiService.getRecentTransactions();
      return response.data;
    },
    retry: false,
  });

  // Fetch category expenses
  const { data: categoryExpenses, isLoading: categoryLoading } = useQuery({
    queryKey: ["/api/analytics/category-expenses"],
    queryFn: async () => {
      const response = await apiService.getCategoryExpenses();
      return response.data;
    },
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onAddTransaction={() => setShowModal(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              {/* Total Balance */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-wallet text-primary text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Total Balance</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${stats?.totalBalance?.toFixed(2) || '0.00'}
                  </div>
                  <div className="flex items-center mt-2">
                    <i className="fas fa-arrow-up text-secondary text-sm mr-1"></i>
                    <span className="text-sm text-secondary">Current balance</span>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Income */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-arrow-down text-secondary text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Monthly Income</span>
                  </div>
                  <div className="text-2xl font-bold text-secondary">
                    ${stats?.monthlyIncome?.toFixed(2) || '0.00'}
                  </div>
                  <div className="flex items-center mt-2">
                    <i className="fas fa-arrow-up text-secondary text-sm mr-1"></i>
                    <span className="text-sm text-secondary">This month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Expenses */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-arrow-up text-danger text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Monthly Expenses</span>
                  </div>
                  <div className="text-2xl font-bold text-danger">
                    ${stats?.monthlyExpenses?.toFixed(2) || '0.00'}
                  </div>
                  <div className="flex items-center mt-2">
                    <i className="fas fa-chart-line text-gray-500 text-sm mr-1"></i>
                    <span className="text-sm text-gray-500">This month</span>
                  </div>
                </CardContent>
              </Card>

              {/* Savings Rate */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-piggy-bank text-accent text-xl"></i>
                    </div>
                    <span className="text-sm text-gray-500">Savings Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-accent">
                    {stats?.savingsRate || 0}%
                  </div>
                  <div className="flex items-center mt-2">
                    <i className="fas fa-target text-accent text-sm mr-1"></i>
                    <span className="text-sm text-accent">Monthly savings</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <a href="/transactions" className="text-primary hover:text-blue-700 text-sm font-medium">
                    View All
                  </a>
                </div>
              </div>
              <CardContent className="p-6">
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3 py-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : recentTransactions?.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-receipt text-gray-300 text-4xl mb-4"></i>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h4>
                    <p className="text-gray-500 mb-4">Start tracking your finances by adding your first transaction.</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Transaction
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions?.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                            transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'
                          }`}>
                            <i className={`fas ${transaction.category.icon} ${
                              transaction.type === 'expense' ? 'text-danger' : 'text-secondary'
                            }`}></i>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'expense' ? 'text-danger' : 'text-secondary'
                          }`}>
                            {transaction.type === 'expense' ? '-' : '+'}${transaction.amount}
                          </p>
                          <p className="text-sm text-gray-500">{transaction.category.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Expense Categories */}
          <div>
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Expense Categories</h3>
              </div>
              <CardContent className="p-6">
                {categoryLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2"></div>
                      </div>
                    ))}
                  </div>
                ) : categoryExpenses?.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-tags text-gray-300 text-3xl mb-4"></i>
                    <p className="text-gray-500">No expense data for this month</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoryExpenses?.map((item, index) => {
                      const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                      const colorClass = colors[index % colors.length];
                      
                      return (
                        <div key={item.category.id}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`h-3 w-3 ${colorClass} rounded-full`}></div>
                              <span className="text-sm font-medium text-gray-900">{item.category.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">${item.amount.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`${colorClass} h-2 rounded-full`} 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddTransactionModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
}
