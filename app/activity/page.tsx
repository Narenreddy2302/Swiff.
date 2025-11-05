"use client";

import Header from "@/components/Header";
import Card from "@/components/Card";

const mockActivity = [
  {
    id: "1",
    type: "expense",
    user: "You",
    action: "added",
    description: "Dinner at Restaurant",
    amount: 120.5,
    group: "Weekend Trip",
    timestamp: new Date("2025-11-03T19:30:00"),
  },
  {
    id: "2",
    type: "payment",
    user: "Mike",
    action: "paid",
    description: "you",
    amount: 50.0,
    group: "Friends",
    timestamp: new Date("2025-11-03T14:20:00"),
  },
  {
    id: "3",
    type: "expense",
    user: "Sarah",
    action: "added",
    description: "Grocery Shopping",
    amount: 85.3,
    group: "Household",
    timestamp: new Date("2025-11-02T10:15:00"),
  },
  {
    id: "4",
    type: "group",
    user: "You",
    action: "created group",
    description: "Weekend Trip",
    group: null,
    timestamp: new Date("2025-11-01T08:00:00"),
  },
  {
    id: "5",
    type: "expense",
    user: "You",
    action: "added",
    description: "Movie Tickets",
    amount: 45.0,
    group: "Friends",
    timestamp: new Date("2025-11-01T20:45:00"),
  },
  {
    id: "6",
    type: "member",
    user: "Emma",
    action: "joined",
    description: "Weekend Trip",
    group: "Weekend Trip",
    timestamp: new Date("2025-10-31T16:30:00"),
  },
];

export default function Activity() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "expense":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case "payment":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "group":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case "member":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return "Today at " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday at " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (days < 7) {
      return days + " days ago";
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="min-h-screen bg-tesla-white">
      <Header />

      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Activity</h1>
          <p className="text-xl text-tesla-light-gray">
            Recent activity across all your groups
          </p>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          {mockActivity.map((activity) => (
            <Card key={activity.id}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-tesla-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">
                        <span className="font-bold">{activity.user}</span>{" "}
                        {activity.action}{" "}
                        {activity.amount && (
                          <span className="font-bold text-tesla-red">
                            ${activity.amount.toFixed(2)}
                          </span>
                        )}{" "}
                        {activity.type === "expense" && "expense"}{" "}
                        <span className="text-tesla-light-gray">
                          &ldquo;{activity.description}&rdquo;
                        </span>
                      </p>
                      {activity.group && (
                        <p className="text-sm text-tesla-light-gray mt-1">
                          in {activity.group}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-tesla-light-gray whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="text-tesla-light-gray hover:text-tesla-black font-medium transition-colors">
            Load More Activity
          </button>
        </div>
      </main>
    </div>
  );
}
