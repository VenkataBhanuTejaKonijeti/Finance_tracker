import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, TrendingUp, TrendingDown, DollarSign, Calendar, Trash2, Edit2, Check, X, 
  PieChart, BarChart3, Search, Download, Upload, Moon, Sun, Target, AlertCircle, 
  TrendingUp as TrendUp, TrendingDown as TrendDown, FileText, Settings, Info,
  Filter, ChevronLeft, ChevronRight, LineChart, Sparkles
} from 'lucide-react';

export default function FinanceTracker() {
  const [showLanding, setShowLanding] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showCharts, setShowCharts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('all'); // 'all', 'month', 'year'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [budgets, setBudgets] = useState({});
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [showInsights, setShowInsights] = useState(true);

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other']
  };

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('financeTransactions');
    const savedBudgets = localStorage.getItem('financeBudgets');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('financeTransactions', JSON.stringify(transactions));
  }, [transactions]);

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('financeBudgets', JSON.stringify(budgets));
  }, [budgets]);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (type === 'income' && !categories.income.includes(category)) {
      setCategory(categories.income[0]);
    } else if (type === 'expense' && !categories.expense.includes(category)) {
      setCategory(categories.expense[0]);
    }
  }, [type]);

  const addTransaction = () => {
    if (!description || !amount || !category) return;

    const newTransaction = {
      id: Date.now(),
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
      note: note || '',
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const deleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const startEdit = (transaction) => {
    setEditingId(transaction.id);
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setCategory(transaction.category);
    setDate(transaction.date);
    setNote(transaction.note || '');
  };

  const saveEdit = () => {
    setTransactions(transactions.map(t => 
      t.id === editingId 
        ? { ...t, description, amount: parseFloat(amount), type, category, date, note: note || '' }
        : t
    ));
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDescription('');
    setAmount('');
    setNote('');
    setType('expense');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  // Filter transactions based on search, date range, and view mode
  const getFilteredTransactions = () => {
    let filtered = transactions;

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.type === filter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.note && t.note.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(t => t.date >= dateRange.start && t.date <= dateRange.end);
    }

    // Apply view mode filter
    if (viewMode === 'month') {
      filtered = filtered.filter(t => t.date.startsWith(selectedMonth));
    } else if (viewMode === 'year') {
      filtered = filtered.filter(t => t.date.startsWith(selectedYear));
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate statistics for current filtered view
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Calculate statistics for all transactions (for insights)
  const allTimeIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const allTimeExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate monthly statistics
  const monthlyStats = transactions.reduce((acc, t) => {
    const month = t.date.slice(0, 7);
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += t.amount;
    } else {
      acc[month].expenses += t.amount;
    }
    return acc;
  }, {});

  // Calculate category totals
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const incomeByCategory = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  // Budget tracking
  const budgetStatus = Object.keys(budgets).map(cat => {
    const spent = expensesByCategory[cat] || 0;
    const budget = budgets[cat];
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    return {
      category: cat,
      budget,
      spent,
      remaining: budget - spent,
      percentage,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'good'
    };
  });

  // Calculate insights
  const insights = {
    avgMonthlyIncome: Object.keys(monthlyStats).length > 0 
      ? Object.values(monthlyStats).reduce((sum, m) => sum + m.income, 0) / Object.keys(monthlyStats).length 
      : 0,
    avgMonthlyExpenses: Object.keys(monthlyStats).length > 0
      ? Object.values(monthlyStats).reduce((sum, m) => sum + m.expenses, 0) / Object.keys(monthlyStats).length
      : 0,
    largestExpense: transactions.filter(t => t.type === 'expense').reduce((max, t) => 
      !max || t.amount > max.amount ? t : max, null),
    largestIncome: transactions.filter(t => t.type === 'income').reduce((max, t) => 
      !max || t.amount > max.amount ? t : max, null),
    mostSpentCategory: Object.entries(expensesByCategory).reduce((max, [cat, amt]) => 
      !max || amt > max.amount ? { category: cat, amount: amt } : max, null),
    savingsRate: allTimeIncome > 0 ? ((allTimeIncome - allTimeExpenses) / allTimeIncome * 100) : 0,
  };

  const getColor = (index, isIncome) => {
    const incomeColors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
    const expenseColors = ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'];
    return isIncome ? incomeColors[index % incomeColors.length] : expenseColors[index % expenseColors.length];
  };

  // Export data
  const exportData = (format) => {
    const dataStr = format === 'json' 
      ? JSON.stringify({ transactions, budgets }, null, 2)
      : convertToCSV(transactions);
    
    const dataBlob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-data-${new Date().toISOString().split('T')[0]}.${format}`;
    link.click();
  };

  const convertToCSV = (data) => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Note'];
    const rows = data.map(t => [
      t.date,
      t.type,
      t.category,
      t.description,
      t.amount,
      t.note || ''
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Import data
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.transactions) {
          setTransactions(data.transactions);
        }
        if (data.budgets) {
          setBudgets(data.budgets);
        }
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Budget management
  const addBudget = () => {
    if (!budgetCategory || !budgetAmount) return;
    setBudgets({ ...budgets, [budgetCategory]: parseFloat(budgetAmount) });
    setBudgetCategory('');
    setBudgetAmount('');
    setShowBudgetModal(false);
  };

  const deleteBudget = (category) => {
    const newBudgets = { ...budgets };
    delete newBudgets[category];
    setBudgets(newBudgets);
  };

  // Navigate months/years
  const navigateMonth = (direction) => {
    const date = new Date(selectedMonth + '-01');
    date.setMonth(date.getMonth() + direction);
    setSelectedMonth(date.toISOString().slice(0, 7));
  };

  const navigateYear = (direction) => {
    setSelectedYear((parseInt(selectedYear) + direction).toString());
  };

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100';
  const cardClass = darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800';
  const inputClass = darkMode 
    ? 'px-4 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-gray-100'
    : 'px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className={`min-h-screen ${bgClass} p-4 transition-colors duration-300`}>
      {showLanding ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div 
              onClick={() => setShowLanding(false)}
              className="cursor-pointer transform transition-all duration-500 hover:scale-110 hover:rotate-3 inline-block mb-8"
            >
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-2xl">
                <div className="relative">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <DollarSign className="text-white" size={120} strokeWidth={2.5} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <TrendingUp className="text-green-300" size={50} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <h1 className={`text-5xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
              Personal Finance Tracker
            </h1>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
              Advanced financial management with insights and analytics
            </p>
            
            <button
              onClick={() => setShowLanding(false)}
              className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Click Logo or Here to Start
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Header with Dark Mode Toggle */}
          <div className={`${cardClass} rounded-2xl shadow-xl p-6 mb-6`}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <DollarSign className="text-indigo-600" />
                Personal Finance Tracker
              </h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition`}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`${darkMode ? 'bg-green-900/30 border-green-700' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'} p-4 rounded-xl border-2`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`${darkMode ? 'text-green-300' : 'text-green-700'} font-semibold`}>Total Income</span>
                  <TrendingUp className={darkMode ? 'text-green-400' : 'text-green-600'} size={24} />
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                  ₹{totalIncome.toFixed(2)}
                </p>
                {viewMode !== 'all' && (
                  <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Filtered view
                  </p>
                )}
              </div>

              <div className={`${darkMode ? 'bg-red-900/30 border-red-700' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'} p-4 rounded-xl border-2`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`${darkMode ? 'text-red-300' : 'text-red-700'} font-semibold`}>Total Expenses</span>
                  <TrendingDown className={darkMode ? 'text-red-400' : 'text-red-600'} size={24} />
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  ₹{totalExpenses.toFixed(2)}
                </p>
                {viewMode !== 'all' && (
                  <p className={`text-xs mt-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    Filtered view
                  </p>
                )}
              </div>

              <div className={`${darkMode 
                ? balance >= 0 ? 'bg-blue-900/30 border-blue-700' : 'bg-orange-900/30 border-orange-700'
                : balance >= 0 ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
              } p-4 rounded-xl border-2`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`${darkMode 
                    ? balance >= 0 ? 'text-blue-300' : 'text-orange-300'
                    : balance >= 0 ? 'text-blue-700' : 'text-orange-700'
                  } font-semibold`}>Balance</span>
                  <DollarSign className={darkMode 
                    ? balance >= 0 ? 'text-blue-400' : 'text-orange-400'
                    : balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                  } size={24} />
                </div>
                <p className={`text-3xl font-bold ${darkMode 
                  ? balance >= 0 ? 'text-blue-300' : 'text-orange-300'
                  : balance >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  ₹{balance.toFixed(2)}
                </p>
                {insights.savingsRate > 0 && (
                  <p className={`text-xs mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Savings Rate: {insights.savingsRate.toFixed(1)}%
                  </p>
                )}
              </div>

              <div className={`${darkMode ? 'bg-purple-900/30 border-purple-700' : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'} p-4 rounded-xl border-2`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`${darkMode ? 'text-purple-300' : 'text-purple-700'} font-semibold`}>Transactions</span>
                  <FileText className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={24} />
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  {filteredTransactions.length}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {transactions.length} total
                </p>
              </div>
            </div>

            {/* Insights Section */}
            {showInsights && transactions.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50'} p-4 rounded-xl mb-6 border-2 ${darkMode ? 'border-gray-600' : 'border-indigo-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <Sparkles className="text-indigo-600" size={20} />
                    Financial Insights
                  </h3>
                  <button onClick={() => setShowInsights(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {insights.avgMonthlyIncome > 0 && (
                    <div>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Avg Monthly Income:</span>
                      <span className={`font-bold ml-2 ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        ₹{insights.avgMonthlyIncome.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {insights.avgMonthlyExpenses > 0 && (
                    <div>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Avg Monthly Expenses:</span>
                      <span className={`font-bold ml-2 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                        ₹{insights.avgMonthlyExpenses.toFixed(2)}
                      </span>
                    </div>
                  )}
                  {insights.mostSpentCategory && (
                    <div>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Top Category:</span>
                      <span className={`font-bold ml-2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                        {insights.mostSpentCategory.category} (₹{insights.mostSpentCategory.amount.toFixed(2)})
                      </span>
                    </div>
                  )}
                  {insights.savingsRate > 0 && (
                    <div>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Savings Rate:</span>
                      <span className={`font-bold ml-2 ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                        {insights.savingsRate.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Budget Status */}
            {budgetStatus.length > 0 && (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-yellow-50'} p-4 rounded-xl mb-6 border-2 ${darkMode ? 'border-gray-600' : 'border-yellow-200'}`}>
                <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Target className="text-yellow-600" size={20} />
                  Budget Status
                </h3>
                <div className="space-y-2">
                  {budgetStatus.map(budget => (
                    <div key={budget.category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{budget.category}</span>
                        <span className={`font-bold ${
                          budget.status === 'exceeded' ? 'text-red-600' :
                          budget.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          ₹{budget.spent.toFixed(2)} / ₹{budget.budget.toFixed(2)}
                          {budget.status === 'exceeded' && <AlertCircle className="inline ml-1" size={14} />}
                        </span>
                      </div>
                      <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
                        <div
                          className={`h-full transition-all duration-500 ${
                            budget.status === 'exceeded' ? 'bg-red-500' :
                            budget.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Transaction Form */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-xl mb-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {editingId ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <input
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputClass}
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={inputClass}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select Category</option>
                  {categories[type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex gap-2 mt-4">
                {editingId ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      <Check size={20} />
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                      <X size={20} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={addTransaction}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    <PlusCircle size={20} />
                    Add Transaction
                  </button>
                )}
              </div>
            </div>

            {/* Filters and Controls */}
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-xl mb-6`}>
              <div className="flex flex-wrap gap-4 items-center mb-4">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 pr-4 py-2 w-full ${inputClass}`}
                    />
                  </div>
                </div>

                {/* View Mode */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-4 py-2 rounded-lg transition ${viewMode === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-2 rounded-lg transition ${viewMode === 'month' 
                      ? 'bg-indigo-600 text-white' 
                      : darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setViewMode('year')}
                    className={`px-4 py-2 rounded-lg transition ${viewMode === 'year' 
                      ? 'bg-indigo-600 text-white' 
                      : darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Year
                  </button>
                </div>

                {/* Month/Year Navigation */}
                {viewMode === 'month' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-gray-300 rounded">
                      <ChevronLeft size={20} />
                    </button>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className={inputClass}
                    />
                    <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-gray-300 rounded">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {viewMode === 'year' && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigateYear(-1)} className="p-1 hover:bg-gray-300 rounded">
                      <ChevronLeft size={20} />
                    </button>
                    <input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className={inputClass}
                      min="2000"
                      max="2100"
                    />
                    <button onClick={() => navigateYear(1)} className="p-1 hover:bg-gray-300 rounded">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}

                {/* Type Filter */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition ${filter === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('income')}
                    className={`px-4 py-2 rounded-lg transition ${filter === 'income' 
                      ? 'bg-green-600 text-white' 
                      : darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setFilter('expense')}
                    className={`px-4 py-2 rounded-lg transition ${filter === 'expense' 
                      ? 'bg-red-600 text-white' 
                      : darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Expenses
                  </button>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter size={18} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>Date Range:</span>
                </div>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className={inputClass}
                  placeholder="Start Date"
                />
                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className={inputClass}
                  placeholder="End Date"
                />
                {(dateRange.start || dateRange.end) && (
                  <button
                    onClick={() => setDateRange({ start: '', end: '' })}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setShowCharts(!showCharts)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  {showCharts ? <BarChart3 size={18} /> : <PieChart size={18} />}
                  {showCharts ? 'Hide Charts' : 'Show Charts'}
                </button>
                <button
                  onClick={() => setShowBudgetModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                >
                  <Target size={18} />
                  Manage Budgets
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Download size={18} />
                  Export JSON
                </button>
                <button
                  onClick={() => exportData('csv')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Download size={18} />
                  Export CSV
                </button>
                <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition cursor-pointer">
                  <Upload size={18} />
                  Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Budget Modal */}
            {showBudgetModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`${cardClass} p-6 rounded-xl max-w-md w-full mx-4`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Manage Budgets</h3>
                    <button onClick={() => setShowBudgetModal(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                      <select
                        value={budgetCategory}
                        onChange={(e) => setBudgetCategory(e.target.value)}
                        className={inputClass + ' w-full'}
                      >
                        <option value="">Select Category</option>
                        {categories.expense.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Budget Amount</label>
                      <input
                        type="number"
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        placeholder="Enter budget amount"
                        className={inputClass + ' w-full'}
                      />
                    </div>
                    <button
                      onClick={addBudget}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Add Budget
                    </button>
                    {budgetStatus.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Existing Budgets</h4>
                        {budgetStatus.map(budget => (
                          <div key={budget.category} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{budget.category}</span>
                            <div className="flex items-center gap-2">
                              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>₹{budget.budget.toFixed(2)}</span>
                              <button
                                onClick={() => deleteBudget(budget.category)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Visualization Section */}
            {showCharts && filteredTransactions.length > 0 && (
              <div className="mb-6 space-y-6">
                {/* Income vs Expenses Comparison */}
                <div className={`${cardClass} p-6 rounded-xl border-2 ${darkMode ? 'border-gray-600' : 'border-indigo-200'} shadow-lg`}>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <BarChart3 className="text-indigo-600" />
                    Income vs Expenses Comparison
                  </h3>
                  
                  <div className={`mb-8 p-4 ${darkMode ? 'bg-gray-600' : 'bg-gradient-to-r from-green-50 to-red-50'} rounded-lg`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Comparison</span>
                      <span className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {balance >= 0 ? 'Surplus' : 'Deficit'}: ₹{Math.abs(balance).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-2 h-12 rounded-lg overflow-hidden">
                      <div 
                        className="bg-green-500 flex items-center justify-center text-white font-bold transition-all duration-500"
                        style={{ width: `${totalIncome > 0 ? (totalIncome / (totalIncome + totalExpenses)) * 100 : 0}%` }}
                      >
                        {totalIncome > 0 && `Income: ₹${totalIncome.toFixed(0)}`}
                      </div>
                      <div 
                        className="bg-red-500 flex items-center justify-center text-white font-bold transition-all duration-500"
                        style={{ width: `${totalExpenses > 0 ? (totalExpenses / (totalIncome + totalExpenses)) * 100 : 0}%` }}
                      >
                        {totalExpenses > 0 && `Expenses: ₹${totalExpenses.toFixed(0)}`}
                      </div>
                    </div>
                  </div>

                  {/* Category-wise Comparison */}
                  <div className="space-y-4">
                    <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Category Breakdown</h4>
                    {(() => {
                      const allCategories = new Set([
                        ...Object.keys(incomeByCategory),
                        ...Object.keys(expensesByCategory)
                      ]);
                      
                      return Array.from(allCategories).map((category) => {
                        const incomeAmount = incomeByCategory[category] || 0;
                        const expenseAmount = expensesByCategory[category] || 0;
                        const maxAmount = Math.max(incomeAmount, expenseAmount);
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{category}</div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-700">Income</span>
                                  <span className="font-bold text-green-700">₹{incomeAmount.toFixed(2)}</span>
                                </div>
                                <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-8 overflow-hidden`}>
                                  <div
                                    className="h-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                                    style={{ width: `${maxAmount > 0 ? (incomeAmount / maxAmount) * 100 : 0}%` }}
                                  >
                                    {incomeAmount > 0 && `${((incomeAmount / totalIncome) * 100).toFixed(1)}%`}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-red-700">Expenses</span>
                                  <span className="font-bold text-red-700">₹{expenseAmount.toFixed(2)}</span>
                                </div>
                                <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-8 overflow-hidden`}>
                                  <div
                                    className="h-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                                    style={{ width: `${maxAmount > 0 ? (expenseAmount / maxAmount) * 100 : 0}%` }}
                                  >
                                    {expenseAmount > 0 && `${((expenseAmount / totalExpenses) * 100).toFixed(1)}%`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Monthly Trends Chart */}
                {Object.keys(monthlyStats).length > 1 && (
                  <div className={`${cardClass} p-6 rounded-xl border-2 ${darkMode ? 'border-gray-600' : 'border-indigo-200'} shadow-lg`}>
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <LineChart className="text-indigo-600" />
                      Monthly Trends
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(monthlyStats).sort().map(([month, stats]) => {
                        const monthBalance = stats.income - stats.expenses;
                        const maxValue = Math.max(stats.income, stats.expenses);
                        return (
                          <div key={month} className="space-y-2">
                            <div className="flex justify-between">
                              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </span>
                              <span className={`font-bold ${monthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Balance: ₹{monthBalance.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex gap-2 h-8 rounded-lg overflow-hidden">
                              <div 
                                className="bg-green-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                                style={{ width: `${maxValue > 0 ? (stats.income / maxValue) * 100 : 0}%` }}
                              >
                                {stats.income > 0 && `₹${stats.income.toFixed(0)}`}
                              </div>
                              <div 
                                className="bg-red-500 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
                                style={{ width: `${maxValue > 0 ? (stats.expenses / maxValue) * 100 : 0}%` }}
                              >
                                {stats.expenses > 0 && `₹${stats.expenses.toFixed(0)}`}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pie Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {totalIncome > 0 && (
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-green-50 to-emerald-50'} p-6 rounded-xl border-2 ${darkMode ? 'border-gray-600' : 'border-green-200'}`}>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <PieChart className="text-green-600" />
                        Income Distribution
                      </h3>
                      <div className="flex flex-col items-center">
                        <svg viewBox="0 0 200 200" className="w-64 h-64">
                          {Object.entries(incomeByCategory).map(([category, amount], index, arr) => {
                            const total = totalIncome;
                            const percentage = (amount / total) * 100;
                            let startAngle = 0;
                            for (let i = 0; i < index; i++) {
                              startAngle += (arr[i][1] / total) * 360;
                            }
                            const endAngle = startAngle + (percentage / 100) * 360;
                            const startRad = (startAngle - 90) * (Math.PI / 180);
                            const endRad = (endAngle - 90) * (Math.PI / 180);
                            const x1 = 100 + 80 * Math.cos(startRad);
                            const y1 = 100 + 80 * Math.sin(startRad);
                            const x2 = 100 + 80 * Math.cos(endRad);
                            const y2 = 100 + 80 * Math.sin(endRad);
                            const largeArc = percentage > 50 ? 1 : 0;
                            
                            return (
                              <path
                                key={category}
                                d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={getColor(index, true)}
                                stroke="white"
                                strokeWidth="2"
                              />
                            );
                          })}
                        </svg>
                        <div className="mt-4 w-full space-y-2">
                          {Object.entries(incomeByCategory).map(([category, amount], index) => (
                            <div key={category} className={`flex items-center justify-between ${darkMode ? 'bg-gray-600' : 'bg-white'} p-2 rounded-lg`}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: getColor(index, true) }}
                                />
                                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{category}</span>
                              </div>
                              <div className="text-right">
                                <span className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>₹{amount.toFixed(2)}</span>
                                <span className={`text-xs ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  ({((amount / totalIncome) * 100).toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {totalExpenses > 0 && (
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-red-50 to-orange-50'} p-6 rounded-xl border-2 ${darkMode ? 'border-gray-600' : 'border-red-200'}`}>
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <PieChart className="text-red-600" />
                        Expenses Distribution
                      </h3>
                      <div className="flex flex-col items-center">
                        <svg viewBox="0 0 200 200" className="w-64 h-64">
                          {Object.entries(expensesByCategory).map(([category, amount], index, arr) => {
                            const total = totalExpenses;
                            const percentage = (amount / total) * 100;
                            let startAngle = 0;
                            for (let i = 0; i < index; i++) {
                              startAngle += (arr[i][1] / total) * 360;
                            }
                            const endAngle = startAngle + (percentage / 100) * 360;
                            const startRad = (startAngle - 90) * (Math.PI / 180);
                            const endRad = (endAngle - 90) * (Math.PI / 180);
                            const x1 = 100 + 80 * Math.cos(startRad);
                            const y1 = 100 + 80 * Math.sin(startRad);
                            const x2 = 100 + 80 * Math.cos(endRad);
                            const y2 = 100 + 80 * Math.sin(endRad);
                            const largeArc = percentage > 50 ? 1 : 0;
                            
                            return (
                              <path
                                key={category}
                                d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={getColor(index, false)}
                                stroke="white"
                                strokeWidth="2"
                              />
                            );
                          })}
                        </svg>
                        <div className="mt-4 w-full space-y-2">
                          {Object.entries(expensesByCategory).map(([category, amount], index) => (
                            <div key={category} className={`flex items-center justify-between ${darkMode ? 'bg-gray-600' : 'bg-white'} p-2 rounded-lg`}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: getColor(index, false) }}
                                />
                                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{category}</span>
                              </div>
                              <div className="text-right">
                                <span className={`text-sm font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>₹{amount.toFixed(2)}</span>
                                <span className={`text-xs ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  ({((amount / totalExpenses) * 100).toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Transactions List */}
            <div className="space-y-3">
              {filteredTransactions.length === 0 ? (
                <div className={`${cardClass} p-8 rounded-xl text-center`}>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchQuery || dateRange.start || viewMode !== 'all' 
                      ? 'No transactions match your filters. Try adjusting your search criteria.'
                      : 'No transactions yet. Add your first transaction above!'
                    }
                  </p>
                </div>
              ) : (
                filteredTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      transaction.type === 'income' 
                        ? darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
                        : darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${transaction.type === 'income' 
                          ? darkMode ? 'bg-green-800' : 'bg-green-200'
                          : darkMode ? 'bg-red-800' : 'bg-red-200'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className={darkMode ? 'text-green-300' : 'text-green-700'} size={20} />
                          ) : (
                            <TrendingDown className={darkMode ? 'text-red-300' : 'text-red-700'} size={20} />
                          )}
                        </div>
                        <div>
                          <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white'} px-2 py-1 rounded`}>
                              {transaction.category}
                            </span>
                            <span className={`flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Calendar size={14} />
                              {transaction.date}
                            </span>
                            {transaction.note && (
                              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                                - {transaction.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`text-xl font-bold ${
                        transaction.type === 'income' 
                          ? darkMode ? 'text-green-300' : 'text-green-700'
                          : darkMode ? 'text-red-300' : 'text-red-700'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(transaction)}
                          className={`p-2 ${darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-blue-100'} rounded-lg transition`}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteTransaction(transaction.id)}
                          className={`p-2 ${darkMode ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-red-100'} rounded-lg transition`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
