
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { BacktestForm } from "@/components/BacktestForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BacktestPage() {
    const [result, setResult] = useState<{ count: number; winRate: number; return: number } | null>(null);

    const mutation = useMutation({
        mutationFn: ({ entry, margin, period }: { entry: number; margin: number; period: number }) =>
            api.simulateBacktest(entry, margin, period),
        onSuccess: (data) => {
            setResult({
                count: data.trade_count,
                winRate: data.win_rate,
                return: data.total_return,
            });
        },
    });

    const handleRun = (entry: number, margin: number, period: number) => {
        mutation.mutate({ entry, margin, period });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-2">Strategy Backtester</h1>
                <p className="text-muted-foreground">
                    Simulate spread trading strategies on historical data.
                </p>
            </div>

            <BacktestForm onRun={handleRun} isLoading={mutation.isPending} />

            {result && (
                <Card className="bg-primary/5">
                    <CardHeader>
                        <CardTitle>Backtest Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-sm text-muted-foreground">Total Trades</div>
                                <div className="text-2xl font-bold">{result.count}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Win Rate</div>
                                <div className="text-2xl font-bold text-green-500">{result.winRate.toFixed(1)}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Return</div>
                                <div className="text-2xl font-bold text-blue-500">{result.return.toFixed(2)}%</div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-muted-foreground pt-4">
                            * Results are hypothetical and do not account for slippage or fees.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
