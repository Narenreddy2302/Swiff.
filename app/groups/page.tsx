"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Card from "@/components/Card";
import Button from "@/components/Button";

const mockGroups = [
  {
    id: "1",
    name: "Weekend Trip",
    members: ["You", "Sarah", "Mike", "Emma"],
    totalExpenses: 456.8,
    yourBalance: 42.5,
  },
  {
    id: "2",
    name: "Household",
    members: ["You", "Sarah"],
    totalExpenses: 892.3,
    yourBalance: -28.5,
  },
  {
    id: "3",
    name: "Friends",
    members: ["You", "Mike", "Emma", "John", "Lisa"],
    totalExpenses: 234.0,
    yourBalance: 15.0,
  },
];

export default function Groups() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  return (
    <div className="min-h-screen bg-tesla-white">
      <Header />

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-4">Groups</h1>
            <p className="text-xl text-tesla-light-gray">
              Manage your expense groups and members
            </p>
          </div>
          <Button onClick={() => setShowCreateGroup(true)}>
            + Create Group
          </Button>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockGroups.map((group) => (
            <Card key={group.id} className="hover:border-tesla-red transition-colors">
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-2">{group.name}</h3>
                <p className="text-sm text-tesla-light-gray">
                  {group.members.length} members
                </p>
              </div>

              {/* Members Preview */}
              <div className="flex -space-x-2 mb-4">
                {group.members.slice(0, 4).map((member, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 bg-tesla-black text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white"
                    title={member}
                  >
                    {member[0]}
                  </div>
                ))}
                {group.members.length > 4 && (
                  <div className="w-10 h-10 bg-tesla-gray text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                    +{group.members.length - 4}
                  </div>
                )}
              </div>

              {/* Group Stats */}
              <div className="border-t border-tesla-light-gray/20 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-tesla-light-gray">Total Expenses</span>
                  <span className="font-bold">
                    ${group.totalExpenses.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-tesla-light-gray">Your Balance</span>
                  <span
                    className={`font-bold ${
                      group.yourBalance >= 0 ? "text-green-600" : "text-tesla-red"
                    }`}
                  >
                    {group.yourBalance >= 0 ? "+" : ""}$
                    {Math.abs(group.yourBalance).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                <Button variant="secondary" className="w-full">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold mb-6">Create New Group</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-tesla-light-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-tesla-red"
                  placeholder="e.g., Summer Vacation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add Members (Email)
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-tesla-light-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-tesla-red"
                  placeholder="member@example.com"
                />
                <p className="text-xs text-tesla-light-gray mt-2">
                  You can add more members later
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Create Group
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowCreateGroup(false)}
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
