
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BacktestFormProps {
    onRun: (entry: number, exit: number, period: number) => void;
    isLoading: boolean;
}

export function BacktestForm({ onRun, isLoading }: BacktestFormProps) {
    const [entry, setEntry] = useState("0");
    const [exit, setExit] = useState("3");
    const [period, setPeriod] = useState("7");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRun(Number(entry), Number(exit), Number(period));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="entry">Entry Spread (%)</Label>
                    <Input
                        id="entry"
                        type="number"
                        step="0.1"
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="exit">Exit Spread (%)</Label>
                    <Input
                        id="exit"
                        type="number"
                        step="0.1"
                        value={exit}
                        onChange={(e) => setExit(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="period">Lookback Period (Days)</Label>
                    <Input
                        id="period"
                        type="number"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    />
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Simulating..." : "Run Backtest"}
            </Button>
        </form>
    );
}
