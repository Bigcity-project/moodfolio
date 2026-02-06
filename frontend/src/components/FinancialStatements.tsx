'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileSpreadsheet } from 'lucide-react'
import type { FinancialStatementsDto } from '@/lib/api-client'

interface FinancialStatementsProps {
  financials: FinancialStatementsDto
}

type TabKey = 'income' | 'balance' | 'cashflow'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'income', label: 'Income' },
  { key: 'balance', label: 'Balance Sheet' },
  { key: 'cashflow', label: 'Cash Flow' },
]

function formatFinancialValue(value: number | null): string {
  if (value === null) return '-'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`
  return `${sign}$${abs.toFixed(2)}`
}

function formatQuarter(dateStr: string): string {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  const quarter = Math.ceil(month / 3)
  return `Q${quarter} ${year}`
}

export function FinancialStatements({ financials }: FinancialStatementsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('income')

  const hasIncome = financials.incomeStatements.length > 0
  const hasBalance = financials.balanceSheets.length > 0
  const hasCashFlow = financials.cashFlows.length > 0

  if (!hasIncome && !hasBalance && !hasCashFlow) return null

  return (
    <Card glass className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-900/30">
            <FileSpreadsheet className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Financial Statements</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-[11px] font-bold uppercase tracking-wide py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {activeTab === 'income' && hasIncome && <IncomeTable data={financials.incomeStatements} />}
          {activeTab === 'balance' && hasBalance && <BalanceTable data={financials.balanceSheets} />}
          {activeTab === 'cashflow' && hasCashFlow && <CashFlowTable data={financials.cashFlows} />}
          {activeTab === 'income' && !hasIncome && <NoData />}
          {activeTab === 'balance' && !hasBalance && <NoData />}
          {activeTab === 'cashflow' && !hasCashFlow && <NoData />}
        </div>
      </CardContent>
    </Card>
  )
}

function NoData() {
  return (
    <p className="text-sm text-slate-500 dark:text-slate-300 text-center py-4">
      No data available
    </p>
  )
}

interface TableProps<T> {
  data: T[]
}

function IncomeTable({ data }: TableProps<FinancialStatementsDto['incomeStatements'][number]>) {
  const rows = [
    { label: 'Revenue', key: 'revenue' as const },
    { label: 'Gross Profit', key: 'grossProfit' as const },
    { label: 'Operating Income', key: 'operatingIncome' as const },
    { label: 'Net Income', key: 'netIncome' as const },
    { label: 'EPS', key: 'eps' as const },
  ]

  return (
    <FinancialTable
      data={data}
      rows={rows}
      formatValue={(row, item) => {
        const val = item[row.key] as number | null
        return row.key === 'eps' && val !== null
          ? `$${val.toFixed(2)}`
          : formatFinancialValue(val)
      }}
    />
  )
}

function BalanceTable({ data }: TableProps<FinancialStatementsDto['balanceSheets'][number]>) {
  const rows = [
    { label: 'Total Assets', key: 'totalAssets' as const },
    { label: 'Total Liabilities', key: 'totalLiabilities' as const },
    { label: 'Total Equity', key: 'totalEquity' as const },
    { label: 'Cash', key: 'cash' as const },
    { label: 'Total Debt', key: 'totalDebt' as const },
  ]

  return <FinancialTable data={data} rows={rows} formatValue={(row, item) => formatFinancialValue(item[row.key] as number | null)} />
}

function CashFlowTable({ data }: TableProps<FinancialStatementsDto['cashFlows'][number]>) {
  const rows = [
    { label: 'Operating', key: 'operatingCashFlow' as const },
    { label: 'Investing', key: 'investingCashFlow' as const },
    { label: 'Financing', key: 'financingCashFlow' as const },
    { label: 'Free Cash Flow', key: 'freeCashFlow' as const },
    { label: 'CapEx', key: 'capitalExpenditure' as const },
  ]

  return <FinancialTable data={data} rows={rows} formatValue={(row, item) => formatFinancialValue(item[row.key] as number | null)} />
}

interface FinancialTableRow<T> {
  label: string
  key: keyof T
}

interface FinancialTableProps<T extends { endDate: string }> {
  data: T[]
  rows: FinancialTableRow<T>[]
  formatValue: (row: FinancialTableRow<T>, item: T) => string
}

function FinancialTable<T extends { endDate: string }>({ data, rows, formatValue }: FinancialTableProps<T>) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-700">
          <th className="text-left text-xs font-bold text-slate-500 dark:text-slate-300 py-2 pr-4" />
          {data.map((item) => (
            <th key={item.endDate} className="text-right text-xs font-bold text-slate-500 dark:text-slate-300 py-2 px-2">
              {formatQuarter(item.endDate)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row.key)} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
            <td className="text-xs font-semibold text-slate-600 dark:text-slate-300 py-2 pr-4 whitespace-nowrap">
              {row.label}
            </td>
            {data.map((item) => {
              const formatted = formatValue(row, item)
              const isNegative = formatted.startsWith('-')
              return (
                <td
                  key={item.endDate}
                  className={`text-right text-sm font-semibold tabular-nums py-2 px-2 ${
                    isNegative
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {formatted}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
