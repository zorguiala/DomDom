import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

// Mock data - in real app, this would come from API
const activities = [
  {
    id: 1,
    type: "sale",
    description: "New sale order created",
    amount: 2500,
    user: "John Doe",
    avatar: "/avatars/john.jpg",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: 2,
    type: "purchase",
    description: "Purchase order approved",
    amount: 1200,
    user: "Jane Smith",
    avatar: "/avatars/jane.jpg",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 3,
    type: "production",
    description: "Production order completed",
    amount: null,
    user: "Mike Johnson",
    avatar: "/avatars/mike.jpg",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    id: 4,
    type: "inventory",
    description: "Low stock alert: Widget A",
    amount: null,
    user: "System",
    avatar: null,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
  },
  {
    id: 5,
    type: "expense",
    description: "Office supplies expense",
    amount: 350,
    user: "Sarah Wilson",
    avatar: "/avatars/sarah.jpg",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={activity.avatar || undefined}
              alt={activity.user}
            />
            <AvatarFallback>
              {activity.user === "System"
                ? "SY"
                : activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.description}
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{activity.user}</span>
              <span className="mx-1">•</span>
              <span>{formatRelativeTime(activity.timestamp)}</span>
            </div>
          </div>
          {activity.amount && (
            <div className="ml-auto font-medium">
              <span
                className={`${
                  activity.type === "sale"
                    ? "text-green-600"
                    : activity.type === "expense"
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                {activity.type === "sale"
                  ? "+"
                  : activity.type === "expense"
                    ? "-"
                    : ""}
                {formatCurrency(activity.amount)}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
