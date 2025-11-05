"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Link from "next/link";

// Mock data - in a real app, this would come from a database
const mockExpenses = [
  {
    id: "1",
    description: "Dinner at Restaurant",
    amount: 120.5,
    paidBy: { id: "1", name: "You", email: "you@example.com" },
    date: new Date("2025-11-03"),
    group: "Weekend Trip",
  },
  {
    id: "2",
    description: "Grocery Shopping",
    amount: 85.3,
    paidBy: { id: "2", name: "Sarah", email: "sarah@example.com" },
    date: new Date("2025-11-02"),
    group: "Household",
  },
  {
    id: "3",
    description: "Movie Tickets",
    amount: 45.0,
    paidBy: { id: "1", name: "You", email: "you@example.com" },
    date: new Date("2025-11-01"),
    group: "Friends",
  },
];

const mockBalances = [
  { person: "Sarah", amount: 42.65, type: "owes-you" },
  { person: "Mike", amount: 28.5, type: "you-owe" },
  { person: "Emma", amount: 15.0, type: "owes-you" },
];

export default function Dashboard() {
  const [showAddExpense, setShowAddExpense] = useState(false);

  const totalOwed = mockBalances
    .filter((b) => b.type === "owes-you")
    .reduce((sum, b) => sum + b.amount, 0);

  const totalOwe = mockBalances
    .filter((b) => b.type === "you-owe")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="min-h-screen bg-tesla-white">
      <Header />

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Dashboard</h1>
          <p className="text-xl text-tesla-light-gray">
            Your expense overview and recent activity
          </p>
        </div>

        {/* Balance Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-tesla-black to-tesla-gray text-white">
            <div className="text-sm font-medium mb-2 text-white/80">Total Balance</div>
            <div className="text-4xl font-bold">
              ${(totalOwed - totalOwe).toFixed(2)}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-sm font-medium mb-2 text-white/80">You Are Owed</div>
            <div className="text-4xl font-bold">${totalOwed.toFixed(2)}</div>
          </Card>

          <Card className="bg-gradient-to-br from-tesla-red to-red-600 text-white">
            <div className="text-sm font-medium mb-2 text-white/80">You Owe</div>
            <div className="text-4xl font-bold">${totalOwe.toFixed(2)}</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-12">
          <Button onClick={() => setShowAddExpense(true)}>
            + Add Expense
          </Button>
          <Button variant="secondary">
            <Link href="/groups">Manage Groups</Link>
          </Button>
          <Button variant="secondary">Settle Up</Button>
        </div>

        {/* Recent Expenses */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Recent Expenses</h2>
          <div className="space-y-4">
            {mockExpenses.map((expense) => (
              <Card key={expense.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1">
                      {expense.description}
                    </h3>
                    <p className="text-sm text-tesla-light-gray">
                      {expense.group} • Paid by {expense.paidBy.name} •{" "}
                      {expense.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${expense.amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Balances */}
        <div>
          <h2 className="text-3xl font-bold mb-6">Outstanding Balances</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mockBalances.map((balance, idx) => (
              <Card key={idx}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-tesla-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {balance.person[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{balance.person}</h3>
                      <p className="text-sm text-tesla-light-gray">
                        {balance.type === "owes-you"
                          ? "owes you"
                          : "you owe"}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      balance.type === "owes-you"
                        ? "text-green-600"
                        : "text-tesla-red"
                    }`}
                  >
                    {balance.type === "owes-you" ? "+" : "-"}$
                    {balance.amount.toFixed(2)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold mb-6">Add Expense</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-tesla-light-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-tesla-red"
                  placeholder="What was this expense for?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-4 py-3 border border-tesla-light-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-tesla-red"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Group</label>
                <select className="w-full px-4 py-3 border border-tesla-light-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-tesla-red">
                  <option>Weekend Trip</option>
                  <option>Household</option>
                  <option>Friends</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Add Expense
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
