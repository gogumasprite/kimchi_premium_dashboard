-- 3. simulate_backtest (Updated with p_ prefix to avoid collision)
DROP FUNCTION IF EXISTS simulate_backtest(double precision, double precision, integer);
DROP FUNCTION IF EXISTS simulate_backtest(float, float, int);

CREATE OR REPLACE FUNCTION simulate_backtest(
    p_entry_spread FLOAT, 
    p_target_margin FLOAT, 
    p_period_days INT,
    p_initial_capital FLOAT DEFAULT NULL, -- Placeholder if user wants logic in SQL later
    p_fee_slippage FLOAT DEFAULT NULL -- Placeholder
)
RETURNS TABLE (
  entry_at TIMESTAMP WITH TIME ZONE,
  entry_val DOUBLE PRECISION,
  exit_at TIMESTAMP WITH TIME ZONE,
  exit_val DOUBLE PRECISION
) AS $$
DECLARE
  r RECORD;
  in_position BOOLEAN := FALSE;
  current_entry_price DOUBLE PRECISION := 0;
  current_entry_time TIMESTAMP WITH TIME ZONE;
  cutoff_time TIMESTAMP WITH TIME ZONE;
BEGIN
  cutoff_time := NOW() - (p_period_days || ' days')::INTERVAL;

  FOR r IN
    SELECT spread, created_at
    FROM market_ticks
    WHERE created_at >= cutoff_time
    ORDER BY created_at ASC
  LOOP
    IF NOT in_position THEN
      -- Entry Logic
      IF r.spread <= p_entry_spread THEN
        in_position := TRUE;
        current_entry_price := r.spread;
        current_entry_time := r.created_at;
      END IF;
    ELSE
      -- Exit Logic
      IF r.spread >= (current_entry_price + p_target_margin) THEN
        in_position := FALSE;
        
        -- Return result row with aliased columns
        entry_at := current_entry_time;
        entry_val := current_entry_price;
        exit_at := r.created_at;
        exit_val := r.spread;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
