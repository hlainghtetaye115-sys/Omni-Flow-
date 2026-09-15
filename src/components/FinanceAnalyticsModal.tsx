import React, { useState } from 'react';
import { 
  BarChart3, Wallet, ArrowUpCircle, ArrowDownCircle, PieChart, 
  Trash2, Filter, Target, Plus, AlertTriangle, TrendingUp, Download, Sparkles
} from 'lucide-react';
import { MacWindowFrame } from './MacWindowFrame';
import { Transaction, Preferences, TransactionCategory } from '../types';

interface FinanceAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  preferences: Preferences;
  setPreferences: React.Dispatch<React.SetStateAction<Preferences>>;
  onDeleteTransaction: (id: string) => void;
}

const CATEGORY_LABELS: Record<TransactionCategory, { my: string; en: string; color: string; bg: string }> = {
  food: { my: 'စားသောက်စရိတ်', en: 'Food & Dining', color: 'text-amber-500', bg: 'bg-amber-500' },
  transport: { my: 'သွားလာစရိတ်', en: 'Transport', color: 'text-blue-500', bg: 'bg-blue-500' },
  bills: { my: 'ဖုန်း/ဘေလ်များ', en: 'Bills & Utilities', color: 'text-purple-500', bg: 'bg-purple-500' },
  shopping: { my: 'စျေးဝယ်ခြင်း', en: 'Shopping', color: 'text-pink-500', bg: 'bg-pink-500' },
  others: { my: 'အခြား ထွက်ငွေ', en: 'Others', color: 'text-slate-500', bg: 'bg-slate-500' },
  extra_income: { my: 'အပိုဝင်ငွေ / OT / လစာ', en: 'Income / Bonus', color: 'text-emerald-500', bg: 'bg-emerald-500' }
};

export const FinanceAnalyticsModal: React.FC<FinanceAnalyticsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  preferences,
  setPreferences,
  onDeleteTransaction
}) => {
  const isMM = preferences.lang === 'my';
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetValue, setBudgetValue] = useState<string>(preferences.monthlyBudget ? String(preferences.monthlyBudget) : '500000');

  // Compute metrics
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthTx = transactions.filter(t => t.date.startsWith(currentMonthStr));

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryTotals: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const netBalance = totalIncome - totalExpense;
  const monthlyBudget = preferences.monthlyBudget || 0;
  
  // Calculate expenses for current month for budget comparison
  let thisMonthExpense = 0;
  currentMonthTx.forEach(t => {
    if (t.type === 'expense') thisMonthExpense += t.amount;
  });

  const budgetUsagePercent = monthlyBudget > 0 ? Math.min(100, (thisMonthExpense / monthlyBudget) * 100) : 0;

  const handleSaveBudget = () => {
    const parsed = parseFloat(budgetValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setPreferences(prev => ({ ...prev, monthlyBudget: parsed }));
    }
    setIsEditingBudget(false);
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,ID,Date,Type,Category,Amount,Note\n";
    transactions.forEach(t => {
      csvContent += `"${t.id}","${t.date}","${t.type}","${t.category}",${t.amount},"${t.note || ''}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OmniFlow_Finance_Report_${currentMonthStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MacWindowFrame
      isOpen={isOpen}
      onClose={onClose}
      title={isMM ? 'ငွေစာရင်း အကျဉ်းချုပ်နှင့် သုံးသပ်ချက်' : 'Finance Analytics & Budget'}
      maxWidthClass="max-w-2xl"
      icon={<BarChart3 className="w-4 h-4 text-indigo-500" />}
    >
      <div className="p-4 sm:p-5 space-y-5 max-h-[80vh] overflow-y-auto">
        
        {/* TOP OVERVIEW STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-[var(--color-text-muted)] uppercase tracking-wider">
              {isMM ? 'လက်ရှိ လက်ကျန်ငွေ' : 'Net Balance'}
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {netBalance.toLocaleString()} <span className="text-xs font-bold text-[var(--color-text-muted)]">Ks</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowUpCircle className="w-3 h-3" />
              {isMM ? 'စုစုပေါင်း ဝင်ငွေ' : 'Total Income'}
            </span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              +{totalIncome.toLocaleString()} <span className="text-xs font-bold">Ks</span>
            </div>
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
              <ArrowDownCircle className="w-3 h-3" />
              {isMM ? 'စုစုပေါင်း ထွက်ငွေ' : 'Total Expenses'}
            </span>
            <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
              -{totalExpense.toLocaleString()} <span className="text-xs font-bold">Ks</span>
            </div>
          </div>
        </div>

        {/* MONTHLY BUDGET ALERT CARD */}
        <div className="p-4 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-[var(--color-text-primary)]">
                  {isMM ? 'လစဉ် ထွက်ငွေ ဘတ်ဂျက် (Monthly Budget)' : 'Monthly Budget Goal'}
                </h4>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  {isMM ? 'ဤလအတွက် သတ်မှတ်ထားသော သုံးစွဲရန် ဘတ်ဂျက်' : 'Expense target for current month'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs font-bold rounded-lg cursor-pointer transition-all"
            >
              {isEditingBudget ? (isMM ? 'ပိတ်မည်' : 'Cancel') : (isMM ? '⚙️ ဘတ်ဂျက် ပြင်မည်' : 'Edit Target')}
            </button>
          </div>

          {isEditingBudget ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                value={budgetValue}
                onChange={e => setBudgetValue(e.target.value)}
                placeholder="Target budget amount"
                className="flex-1 p-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-primary)]"
              />
              <button
                onClick={handleSaveBudget}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                {isMM ? 'သိမ်းမည်' : 'Save'}
              </button>
            </div>
          ) : (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[var(--color-text-muted)]">
                  {isMM ? 'သုံးစွဲပြီး:' : 'Spent:'} <span className="text-[var(--color-text-primary)] font-black">{thisMonthExpense.toLocaleString()} Ks</span>
                </span>
                <span className="text-[var(--color-text-muted)]">
                  {isMM ? 'ဘတ်ဂျက်:' : 'Target:'} <span className="text-[var(--color-text-primary)] font-black">{monthlyBudget > 0 ? `${monthlyBudget.toLocaleString()} Ks` : (isMM ? 'မသတ်မှတ်ရသေးပါ' : 'Unset')}</span>
                </span>
              </div>

              {monthlyBudget > 0 && (
                <>
                  <div className="w-full h-2.5 bg-[var(--color-bg-card)] rounded-full overflow-hidden border border-[var(--color-border)]">
                    <div 
                      style={{ width: `${budgetUsagePercent}%` }}
                      className={`h-full rounded-full transition-all ${
                        budgetUsagePercent >= 100 ? 'bg-red-500' : budgetUsagePercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  {budgetUsagePercent >= 80 && (
                    <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      budgetUsagePercent >= 100 ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {budgetUsagePercent >= 100 
                          ? (isMM ? '⚠️ လစဉ် ဘတ်ဂျက် ကန့်သတ်ချက် ပြည့်မီ/ကျော်လွန်သွားပါပြီ!' : '⚠️ Monthly budget exceeded!')
                          : (isMM ? '⚡ သတိပေးချက်: လစဉ် ဘတ်ဂျက်၏ ၈၀% သုံးစွဲပြီးပါပြီ!' : '⚡ Warning: 80% of monthly budget spent!')}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* CATEGORY BREAKDOWN SECTION */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-xs sm:text-sm text-[var(--color-text-primary)] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-500" />
            <span>{isMM ? 'ကဏ္ဍအလိုက် ကုန်ကျစရိတ်များ (Category Breakdown)' : 'Category Breakdown'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map(catKey => {
              const catInfo = CATEGORY_LABELS[catKey];
              const amount = categoryTotals[catKey] || 0;
              const percent = totalExpense > 0 && catKey !== 'extra_income' 
                ? ((amount / totalExpense) * 100).toFixed(1)
                : '0';

              if (amount === 0 && catKey === 'extra_income') return null;

              return (
                <div key={catKey} className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl space-y-1.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${catInfo.color}`}>
                      {isMM ? catInfo.my : catInfo.en}
                    </span>
                    <span className="font-extrabold text-[var(--color-text-primary)]">
                      {amount.toLocaleString()} Ks
                    </span>
                  </div>
                  {catKey !== 'extra_income' && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--color-bg-input)] rounded-full overflow-hidden">
                        <div style={{ width: `${percent}%` }} className={`h-full ${catInfo.bg} rounded-full`} />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)]">{percent}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* TRANSACTIONS LOG & EXPORT SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs sm:text-sm text-[var(--color-text-primary)] flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-500" />
              <span>{isMM ? 'စာရင်းမှတ်တမ်းများ (All Logs)' : 'Transaction History'}</span>
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>{isMM ? 'CSV ထုတ်မည်' : 'Export CSV'}</span>
              </button>
              
              <div className="flex bg-[var(--color-bg-input)] p-0.5 rounded-lg border border-[var(--color-border)] text-[10px] font-bold">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer ${filterType === 'all' ? 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-xs' : 'text-[var(--color-text-muted)]'}`}
                >
                  {isMM ? 'အားလုံး' : 'All'}
                </button>
                <button
                  onClick={() => setFilterType('income')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer ${filterType === 'income' ? 'bg-[var(--color-bg-card)] text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-[var(--color-text-muted)]'}`}
                >
                  {isMM ? 'ဝင်ငွေ' : 'Income'}
                </button>
                <button
                  onClick={() => setFilterType('expense')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer ${filterType === 'expense' ? 'bg-[var(--color-bg-card)] text-red-500 shadow-xs' : 'text-[var(--color-text-muted)]'}`}
                >
                  {isMM ? 'ထွက်ငွေ' : 'Expenses'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {filteredTransactions.length === 0 ? (
              <div className="p-4 bg-[var(--color-bg-input)] rounded-xl text-center text-xs text-[var(--color-text-muted)]">
                {isMM ? 'စာရင်း မှတ်တမ်း မရှိသေးပါ။' : 'No transactions recorded yet.'}
              </div>
            ) : (
              filteredTransactions.slice().reverse().map(tx => {
                const catInfo = CATEGORY_LABELS[tx.category] || CATEGORY_LABELS.others;
                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl flex items-center justify-between text-xs hover:border-[var(--color-primary)] transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {tx.type === 'income' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-extrabold text-[var(--color-text-primary)]">
                          {isMM ? catInfo.my : catInfo.en}
                          {tx.note && <span className="text-[10px] font-normal text-[var(--color-text-muted)] ml-2">({tx.note})</span>}
                        </div>
                        <div className="text-[10px] text-[var(--color-text-muted)]">
                          {tx.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-black ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} Ks
                      </span>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
                        title={isMM ? 'ဖျက်မည်' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MacWindowFrame>
  );
};
