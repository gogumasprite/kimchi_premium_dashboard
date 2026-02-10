-- 1. get_market_candles
DROP FUNCTION IF EXISTS get_market_candles(INT);
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
    to_timestamp(floor(extract(epoch from created_at) / (interval_minutes * 60)) * (interval_minutes * 60)) as bucket,
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

-- 3. simulate_backtest (Updated to return trade details)
-- Drops previous version to allow return type change
DROP FUNCTION IF EXISTS simulate_backtest(double precision, double precision, integer);
DROP FUNCTION IF EXISTS simulate_backtest(float, float, int);

CREATE OR REPLACE FUNCTION simulate_backtest(entry_spread FLOAT, target_margin FLOAT, period_days INT)
RETURNS TABLE (
  entry_at TIMESTAMP WITH TIME ZONE,
  entry_spread DOUBLE PRECISION,
  exit_at TIMESTAMP WITH TIME ZONE,
  exit_spread DOUBLE PRECISION
) AS $$
DECLARE
  r RECORD;
  in_position BOOLEAN := FALSE;
  current_entry_price DOUBLE PRECISION := 0;
  current_entry_time TIMESTAMP WITH TIME ZONE;
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
      -- Entry Logic
      IF r.spread <= entry_spread THEN
        in_position := TRUE;
        current_entry_price := r.spread;
        current_entry_time := r.created_at;
      END IF;
    ELSE
      -- Exit Logic
      IF r.spread >= (current_entry_price + target_margin) THEN
        in_position := FALSE;
        
        -- Return this trade
        entry_at := current_entry_time;
        entry_spread := current_entry_price;
        exit_at := r.created_at;
        exit_spread := r.spread;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
  -- If still in position at end, we ignore the open trade or must decide logic. 
  -- Typically backtesters ignore the last open trade or mark it. Here we ignore.
END;
$$ LANGUAGE plpgsql;
