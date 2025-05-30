
-- Fix the generate_order_number function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION generate_order_number(business_prefix TEXT)
RETURNS TEXT AS $$
DECLARE
    today_date TEXT;
    sequence_number INTEGER;
    order_number TEXT;
BEGIN
    today_date := to_char(CURRENT_DATE, 'YYYYMMDD');
    
    -- Fix: Explicitly qualify the order_number column with table alias
    SELECT COALESCE(MAX(CAST(RIGHT(o.order_number, 3) AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM orders o
    WHERE o.order_number LIKE business_prefix || today_date || '%'
    AND o.user_id = auth.uid();
    
    order_number := business_prefix || today_date || LPAD(sequence_number::TEXT, 3, '0');
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
