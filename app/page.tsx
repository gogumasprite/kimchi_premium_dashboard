
"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { StatsCard } from "@/components/StatsCard";
import { CandleChart } from "@/components/CandleChart";
import { Heatmap } from "@/components/Heatmap";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [interval, setInterval] = useState(60); // Default 1 hour
  const [heatmapSegment, setHeatmapSegment] = useState(60); // Default 60 mins

  const { data: candles } = useQuery({
    queryKey: ["candles", interval],
    queryFn: () => api.getMarketCandles(interval),
  });

  const { data: heatmap } = useQuery({
    queryKey: ["heatmap", heatmapSegment],
    queryFn: () => api.getSpreadHeatmap(heatmapSegment),
  });

  const currentSpread = candles?.[0]?.close ?? 0;
  const maxSpread = Math.max(...(candles?.map((c) => c.high) ?? [0]));
  const minSpread = Math.min(...(candles?.map((c) => c.low) ?? [0]));

  // Last Updated Time
  const lastUpdated = candles?.[0]?.bucket
    ? new Date(candles[0].bucket).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    : "-";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">

      {/* Header */}
      <div className="flex flex-col space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Kimchi Premium Dashboard</h1>
        <p className="text-muted-foreground">
          Last Updated (KST): {lastUpdated}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Current Premium" value={`${currentSpread.toFixed(2)}%`} trend="neutral" description="Real-time spread" />
        <StatsCard title="Max Spread (Period)" value={`${maxSpread.toFixed(2)}%`} trend="up" description="Highest within selected range" />
        <StatsCard title="Min Spread (Period)" value={`${minSpread.toFixed(2)}%`} trend="down" description="Lowest within selected range" />
      </div>

      {/* Main Chart Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Premium Chart</h2>

          {/* Button Group */}
          <div className="flex bg-muted p-1 rounded-lg">
            {[
              { label: '1H', value: 60 },
              { label: '4H', value: 240 },
              { label: '1D', value: 1440 }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setInterval(opt.value)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  interval === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 border rounded-xl bg-card shadow-sm h-[500px]">
          <CandleChart data={candles || []} />
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Hourly Heatmap</h2>

          {/* Heatmap Segment Selection */}
          <div className="flex bg-muted p-1 rounded-lg">
            {[
              { label: '60m', value: 60 },
              { label: '30m', value: 30 }
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setHeatmapSegment(opt.value)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  heatmapSegment === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 border rounded-xl bg-card shadow-sm overflow-hidden">
          <Heatmap data={heatmap || []} segmentMinutes={heatmapSegment} />
        </div>
      </div>
    </div>
  );
}
