import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { apiService } from "@/lib/apiService";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

export default function Analytics() {
  const { isAuthenticated, isLoading } = useAuth();
  const { formatAmount } = useCurrency();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats", { month: selectedMonth, year: selectedYear }],
    queryFn: async () => {
      const response = await apiService.getUserStats({ month: selectedMonth, year: selectedYear });
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const { data: categoryExpenses } = useQuery({
    queryKey: ["/api/analytics/category-expenses", { month: selectedMonth, year: selectedYear }],
    queryFn: async () => {
      const response = await apiService.getCategoryExpenses({ month: selectedMonth, year: selectedYear });
      return response.data;
    },
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Detailed insights into your financial data</p>
        </div>

        {/* Date Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(stats?.monthlyIncome || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatAmount(stats?.monthlyExpenses || 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${((stats?.monthlyIncome || 0) - (stats?.monthlyExpenses || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount((stats?.monthlyIncome || 0) - (stats?.monthlyExpenses || 0))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Savings Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.savingsRate || 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Income vs Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="bg-green-500 rounded-t w-16 flex items-end justify-center text-white font-medium text-sm"
                    style={{ height: `${Math.max((stats?.monthlyIncome || 0) / Math.max(stats?.monthlyIncome || 1, stats?.monthlyExpenses || 1) * 200, 20)}px` }}
                  >
                    {formatAmount(stats?.monthlyIncome || 0)}
                  </div>
                  <span className="text-sm font-medium text-green-600">Income</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className="bg-red-500 rounded-t w-16 flex items-end justify-center text-white font-medium text-sm"
                    style={{ height: `${Math.max((stats?.monthlyExpenses || 0) / Math.max(stats?.monthlyIncome || 1, stats?.monthlyExpenses || 1) * 200, 20)}px` }}
                  >
                    {formatAmount(stats?.monthlyExpenses || 0)}
                  </div>
                  <span className="text-sm font-medium text-red-600">Expenses</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Rate Donut */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Savings Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#3b82f6"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(stats?.savingsRate || 0) * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">{stats?.savingsRate || 0}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Expense Breakdown by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!categoryExpenses || categoryExpenses?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No expense data for this period
              </div>
            ) : (
              <div className="space-y-4">
                {categoryExpenses?.map((item, index) => {
                  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
                  const color = colors[index % colors.length];
                  const maxAmount = Math.max(...categoryExpenses.map(cat => cat.amount));
                  
                  return (
                    <div key={item.category._id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                        <span className="font-medium">{item.category.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              backgroundColor: color,
                              width: `${(item.amount / maxAmount) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">{item.percentage}%</span>
                        <span className="font-semibold w-20 text-right">{formatAmount(item.amount)}</span>
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
  );
}