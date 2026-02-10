"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { BacktestForm } from "@/components/BacktestForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BacktestTrade } from "@/types";
import { cn } from "@/lib/utils";

interface BacktestSummary {
    totalTrades: number;
    winRate: number;
    grossReturn: number; // Sum of spread diffs
    netReturn: number; // After fees
    netProfitKrw: number;
    finalEquity: number;
}

export default function BacktestPage() {
    // We store inputs to calculate KRW values after fetching trades
    const [inputs, setInputs] = useState<{ capital: number; fee: number } | null>(null);
    const [trades, setTrades] = useState<BacktestTrade[]>([]);

    // Derived Summary
    const [summary, setSummary] = useState<BacktestSummary | null>(null);

    const mutation = useMutation({
        mutationFn: ({ entry, margin, period, capital, fee }: { entry: number; margin: number; period: number; capital: number; fee: number }) =>
            api.simulateBacktest(entry, margin, period, capital, fee),
        onSuccess: (data, variables) => {
            setTrades(data);
            // Logic: 
            // 1. Trade Amount = Capital * 0.5
            // 2. Gross Return % = Sum(Exit - Entry)
            // 3. Fee % = 0.24 (User Input) per trade? Or slip/fee combined. 
            //    Usually spread diff is %, fee is %. 
            //    Backtest result returns % spread diff. 
            //    Net Trade % = (Exit - Entry) - Fee%
            // 4. KRW Profit per trade = TradeAmount * (Net%/100)

            if (!inputs) return;

            const { capital, fee } = inputs;
            const tradeAmt = capital * 0.5;

            let totalProfitKrw = 0;
            let winCount = 0;
            let grossReturnSum = 0;
            let netReturnSum = 0;

            data.forEach(t => {
                const spreadDiff = t.exit_val - t.entry_val; // e.g. 0.3%
                const netPct = spreadDiff - fee; // e.g. 0.3 - 0.24 = 0.06%

                const krwProfit = tradeAmt * (netPct / 100);

                totalProfitKrw += krwProfit;
                grossReturnSum += spreadDiff;
                netReturnSum += netPct;

                if (netPct > 0) winCount++;
            });

            setSummary({
                totalTrades: data.length,
                winRate: data.length > 0 ? (winCount / data.length) * 100 : 0,
                grossReturn: grossReturnSum,
                netReturn: netReturnSum,
                netProfitKrw: totalProfitKrw,
                finalEquity: capital + totalProfitKrw
            });
        },
    });

    const handleRun = (entry: number, margin: number, period: number, capital: number, fee: number) => {
        setInputs({ capital, fee });
        mutation.mutate({ entry, margin, period });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold mb-2">Detailed Strategy Backtester</h1>
                <p className="text-muted-foreground">
                    Simulate spread trading strategies with realistic fee and slippage calculation.
                </p>
            </div>

            <BacktestForm onRun={handleRun} isLoading={mutation.isPending} />

            {summary && inputs && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="py-4"><CardTitle className="text-sm">Total Trades</CardTitle></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{summary.totalTrades}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-4"><CardTitle className="text-sm">Win Rate</CardTitle></CardHeader>
                            <CardContent>
                                <div className={cn("text-2xl font-bold", summary.winRate >= 50 ? "text-red-500" : "text-blue-500")}>
                                    {summary.winRate.toFixed(1)}%
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-4"><CardTitle className="text-sm">Net Profit (KRW)</CardTitle></CardHeader>
                            <CardContent>
                                <div className={cn("text-2xl font-bold", summary.netProfitKrw >= 0 ? "text-red-500" : "text-blue-500")}>
                                    {Math.round(summary.netProfitKrw).toLocaleString()} ₩
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-4"><CardTitle className="text-sm">Final Equity</CardTitle></CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Math.round(summary.finalEquity).toLocaleString()} ₩
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Detailed Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trade History</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Entry Time</th>
                                        <th className="px-4 py-3">Entry (%)</th>
                                        <th className="px-4 py-3">Exit Time</th>
                                        <th className="px-4 py-3">Exit (%)</th>
                                        <th className="px-4 py-3 text-right">Net Return</th>
                                        <th className="px-4 py-3 text-right">Profit (KRW)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {trades.map((t, idx) => {
                                        const spreadDiff = t.exit_val - t.entry_val;
                                        const netPct = spreadDiff - inputs.fee;
                                        const profitKrw = (inputs.capital * 0.5) * (netPct / 100);

                                        return (
                                            <tr key={idx} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {new Date(t.entry_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{t.entry_val.toFixed(2)}%</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {new Date(t.exit_at).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{t.exit_val.toFixed(2)}%</td>
                                                <td className={cn("px-4 py-3 text-right font-medium", netPct >= 0 ? "text-red-500" : "text-blue-500")}>
                                                    {netPct >= 0 ? "+" : ""}{netPct.toFixed(2)}%
                                                </td>
                                                <td className={cn("px-4 py-3 text-right font-bold", profitKrw >= 0 ? "text-red-500" : "text-blue-500")}>
                                                    {Math.round(profitKrw).toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {trades.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">No trades found in this period.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
