
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string;
    description?: string;
    trend?: "up" | "down" | "neutral";
}

export function StatsCard({ title, value, description, trend }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {trend === "up" && <ArrowUpIcon className="h-4 w-4 text-red-600 dark:text-red-500 font-bold" />}
                {trend === "down" && <ArrowDownIcon className="h-4 w-4 text-blue-600 dark:text-blue-500 font-bold" />}
                {trend === "neutral" && <MinusIcon className="h-4 w-4 text-gray-500" />}
            </CardHeader>
            <CardContent>
                <div className={cn(
                    "text-3xl font-extrabold tracking-tight",
                    trend === "up" && "text-red-600 dark:text-red-500",
                    trend === "down" && "text-blue-600 dark:text-blue-500"
                )}>
                    {value}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}
