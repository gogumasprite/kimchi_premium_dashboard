
import { supabase } from '@/lib/supabase';
import { MarketCandle, SpreadHeatmap, BacktestTrade } from '@/types';

export const api = {
    getMarketCandles: async (intervalMinutes: number): Promise<MarketCandle[]> => {
        console.log(`Fetching candles with interval: ${intervalMinutes}m`);
        const { data, error } = await supabase.rpc('get_market_candles', {
            interval_minutes: intervalMinutes,
        });
        if (error) {
            console.error('Error fetching candles:', error);
            throw error;
        }
        console.log(`Fetched ${data?.length || 0} candles`);
        return data || [];
    },

    getSpreadHeatmap: async (segmentMinutes: number = 60): Promise<SpreadHeatmap[]> => {
        const { data, error } = await supabase.rpc('get_spread_heatmap', {
            segment_minutes: segmentMinutes,
        });
        if (error) throw error;
        return data || [];
    },

    simulateBacktest: async (entrySpread: number, targetMargin: number, periodDays: number, capital?: number, fee?: number): Promise<BacktestTrade[]> => {
        const { data, error } = await supabase.rpc('simulate_backtest', {
            p_entry_spread: entrySpread,
            p_target_margin: targetMargin,
            p_period_days: periodDays,
            p_initial_capital: capital || 0,
            p_fee_slippage: fee || 0
        });
        if (error) throw error;
        return data || [];
    },
};
