-- 1. get_market_candles
-- Groups ticks into candles by interval_minutes
-- Returns: bucket (time), open, high, low, close, avg_spread
CREATE OR REPLACE FUNCTION get_market_candles(interval_minutes INT)
RETURNS TABLE (
  bucket TIMESTAMP WITH TIME ZONE,
  open DOUBLE PRECISION,
  high DOUBLE PRECISION,
  low DOUBLE PRECISION,
  close DOUBLE PRECISION,
  avg_spread DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    to_timestamp(floor(extract(epoch from created_at) / (interval_minutes * 60)) * (interval_minutes * 60)) AT TIME ZONE 'UTC' as bucket,
    (array_agg(spread ORDER BY created_at ASC))[1] as open,
    MAX(spread) as high,
    MIN(spread) as low,
    (array_agg(spread ORDER BY created_at DESC))[1] as close,
    AVG(spread) as avg_spread
  FROM market_ticks
  GROUP BY bucket
  ORDER BY bucket DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. get_spread_heatmap
-- Aggregates average spread by day of week, hour, and minute segment
CREATE OR REPLACE FUNCTION get_spread_heatmap(segment_minutes INT DEFAULT 60)
RETURNS TABLE (
  day_of_week INT,
  hour_of_day INT,
  minute_segment INT,
  avg_spread DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CAST(EXTRACT(DOW FROM created_at) AS INT) as day_of_week,
    CAST(EXTRACT(HOUR FROM created_at) AS INT) as hour_of_day,
    CAST(
      FLOOR(EXTRACT(MINUTE FROM created_at) / segment_minutes) * segment_minutes 
    AS INT) as minute_segment,
    AVG(spread) as avg_spread
  FROM market_ticks
  GROUP BY day_of_week, hour_of_day, minute_segment
  ORDER BY day_of_week, hour_of_day, minute_segment;
END;
$$ LANGUAGE plpgsql;

-- 3. simulate_backtest
-- Simulates trading strategy based on entry/exit spreads over a period
CREATE OR REPLACE FUNCTION simulate_backtest(entry_spread FLOAT, exit_spread FLOAT, period_days INT)
RETURNS TABLE (
  trade_count INT,
  win_rate FLOAT,
  total_return FLOAT
) AS $$
DECLARE
  r RECORD;
  in_position BOOLEAN := FALSE;
  entry_price FLOAT := 0;
  total_trades INT := 0;
  wins INT := 0;
  cumulative_return FLOAT := 0;
  cutoff_time TIMESTAMP WITH TIME ZONE;
BEGIN
  cutoff_time := NOW() - (period_days || ' days')::INTERVAL;

  FOR r IN
    SELECT spread, created_at
    FROM market_ticks
    WHERE created_at >= cutoff_time
    ORDER BY created_at ASC
  LOOP
    IF NOT in_position THEN
      IF r.spread <= entry_spread THEN
        in_position := TRUE;
        entry_price := r.spread;
      END IF;
    ELSE
      IF r.spread >= exit_spread THEN
        in_position := FALSE;
        total_trades := total_trades + 1;
        -- Simple return calculation: spread difference
        cumulative_return := cumulative_return + (r.spread - entry_price);
        IF (r.spread - entry_price) > 0 THEN
          wins := wins + 1;
        END IF;
      END IF;
    END IF;
  END LOOP;

  trade_count := total_trades;
  IF total_trades > 0 THEN
    win_rate := (wins::FLOAT / total_trades::FLOAT) * 100;
  ELSE
    win_rate := 0;
  END IF;
  total_return := cumulative_return;
  
  -- Return a single row with results
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
