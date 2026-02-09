
export interface MarketCandle {
    bucket: string; // ISO timestamp
    open: number;
    high: number;
    low: number;
    close: number;
    avg_spread: number;
}

export interface SpreadHeatmap {
    day_of_week: number; // 0-6
    hour_of_day: number; // 0-23
    minute_segment: number; // 0, 30, etc.
    avg_spread: number;
}

export interface BacktestResult {
    trade_count: number;
    win_rate: number;
    total_return: number;
}
