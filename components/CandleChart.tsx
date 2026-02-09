
"use client";

import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import { MarketCandle } from "@/types";

interface CandleChartProps {
    data: MarketCandle[];
}

export function CandleChart({ data }: CandleChartProps) {
    // Simple visualization: Line for Close price (or Avg Spread), Bar for Range?
    // User asked for "Candlestick Chart (or Line Chart)".
    // For simplicity and Recharts limitations with true candlesticks out-of-box,
    // we'll visualize the Average Spread as a Line and maybe High/Low as an error bar or just range area.
    // Actually, a simple Line chart for Average Spread with a range area (using Area) or just simple lines is best for "Spread %".
    // Let's do a Line Chart for Avg Spread, and maybe separate lines for High/Low if needed, but Avg is most important.

    // Preparing data for Recharts
    const chartData = data.map((d) => ({
        ...d,
        time: new Date(d.bucket).toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }),
    })).reverse(); // Recharts usually expects chronological order if we feed it right, API sorts DESC.

    return (
        <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                        minTickGap={50}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => `${val.toFixed(2)}%`}
                    />
                    <Tooltip
                        labelStyle={{ color: 'black' }}
                        formatter={(value: any) => [`${Number(value).toFixed(2)}%`, "Spread"]}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="avg_spread"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        name="Avg Spread"
                    />
                    <Line
                        type="monotone"
                        dataKey="high"
                        stroke="#ef4444"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        name="High"
                    />
                    <Line
                        type="monotone"
                        dataKey="low"
                        stroke="#3b82f6"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Low"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
