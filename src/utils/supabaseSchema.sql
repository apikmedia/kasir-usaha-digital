
-- Supabase Database Schema for KasirPro POS System
-- Run this SQL in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create custom types
CREATE TYPE business_type AS ENUM ('laundry', 'warung', 'cuci_motor');
CREATE TYPE subscription_plan AS ENUM ('basic', 'premium');
CREATE TYPE order_status AS ENUM ('antrian', 'proses', 'selesai');
CREATE TYPE payment_method AS ENUM ('cash', 'transfer');

-- Create users profile table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    business_name TEXT,
    business_type business_type NOT NULL,
    subscription_plan subscription_plan DEFAULT 'basic',
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create customers table
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table (for warung)
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT,
    sku TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create services table (for laundry and cuci motor)
CREATE TABLE services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    business_type business_type NOT NULL,
    unit TEXT, -- 'kg' for laundry, 'unit' for cuci motor
    estimated_duration INTEGER, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    business_type business_type NOT NULL,
    status order_status DEFAULT 'antrian',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method,
    payment_status BOOLEAN DEFAULT false,
    notes TEXT,
    estimated_finish TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    name TEXT NOT NULL, -- store name in case product/service is deleted
    price DECIMAL(10,2) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL, -- decimal for laundry weight
    unit TEXT, -- 'pcs', 'kg', etc
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create laundry_orders table (specific data for laundry)
CREATE TABLE laundry_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    service_type TEXT NOT NULL, -- 'regular', 'express'
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create bike_orders table (specific data for cuci motor)
CREATE TABLE bike_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    bike_type TEXT NOT NULL,
    plate_number TEXT,
    bike_condition TEXT,
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create transactions table (for tracking daily limits)
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date)
);

-- Create subscription_usage table
CREATE TABLE subscription_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    storage_used BIGINT DEFAULT 0, -- in bytes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, month, year)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_business_type ON profiles(business_type);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_business_type ON services(business_type);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bike_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Customers policies
CREATE POLICY "Users can manage own customers" ON customers FOR ALL USING (
    user_id = auth.uid()
);

-- Products policies
CREATE POLICY "Users can manage own products" ON products FOR ALL USING (
    user_id = auth.uid()
);

-- Services policies
CREATE POLICY "Users can manage own services" ON services FOR ALL USING (
    user_id = auth.uid()
);

-- Orders policies
CREATE POLICY "Users can manage own orders" ON orders FOR ALL USING (
    user_id = auth.uid()
);

-- Order items policies
CREATE POLICY "Users can manage own order items" ON order_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Laundry orders policies
CREATE POLICY "Users can manage own laundry orders" ON laundry_orders FOR ALL USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = laundry_orders.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Bike orders policies
CREATE POLICY "Users can manage own bike orders" ON bike_orders FOR ALL USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = bike_orders.order_id 
        AND orders.user_id = auth.uid()
    )
);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions FOR ALL USING (
    user_id = auth.uid()
);

-- Subscription usage policies
CREATE POLICY "Users can view own usage" ON subscription_usage FOR ALL USING (
    user_id = auth.uid()
);

-- Create functions

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number(business_prefix TEXT)
RETURNS TEXT AS $$
DECLARE
    today_date TEXT;
    sequence_number INTEGER;
    order_number TEXT;
BEGIN
    today_date := to_char(CURRENT_DATE, 'YYYYMMDD');
    
    SELECT COALESCE(MAX(CAST(RIGHT(order_number, 3) AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM orders
    WHERE order_number LIKE business_prefix || today_date || '%'
    AND user_id = auth.uid();
    
    order_number := business_prefix || today_date || LPAD(sequence_number::TEXT, 3, '0');
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check daily transaction limit
CREATE OR REPLACE FUNCTION check_daily_limit()
RETURNS BOOLEAN AS $$
DECLARE
    user_plan subscription_plan;
    today_count INTEGER;
    limit_count INTEGER;
BEGIN
    -- Get user's subscription plan
    SELECT subscription_plan INTO user_plan
    FROM profiles
    WHERE id = auth.uid();
    
    -- Set limit based on plan
    IF user_plan = 'basic' THEN
        limit_count := 10;
    ELSE
        RETURN TRUE; -- No limit for premium
    END IF;
    
    -- Get today's transaction count
    SELECT COALESCE(transaction_count, 0) INTO today_count
    FROM transactions
    WHERE user_id = auth.uid()
    AND date = CURRENT_DATE;
    
    RETURN today_count < limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment daily transaction count
CREATE OR REPLACE FUNCTION increment_daily_count()
RETURNS VOID AS $$
BEGIN
    INSERT INTO transactions (user_id, date, transaction_count)
    VALUES (auth.uid(), CURRENT_DATE, 1)
    ON CONFLICT (user_id, date)
    DO UPDATE SET 
        transaction_count = transactions.transaction_count + 1,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-increment daily count when order is created
CREATE OR REPLACE FUNCTION trigger_increment_daily_count()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM increment_daily_count();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_daily_count_trigger
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_increment_daily_count();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default services for each business type
INSERT INTO services (user_id, name, description, price, business_type, unit, estimated_duration) VALUES
-- These will be template services that users can copy
('00000000-0000-0000-0000-000000000000', 'Cuci Basic', 'Cuci motor standar', 10000, 'cuci_motor', 'unit', 30),
('00000000-0000-0000-0000-000000000000', 'Cuci Premium', 'Cuci motor dengan shampo khusus', 15000, 'cuci_motor', 'unit', 45),
('00000000-0000-0000-0000-000000000000', 'Semir Body', 'Semir body motor', 20000, 'cuci_motor', 'unit', 60),
('00000000-0000-0000-0000-000000000000', 'Cuci Regular', 'Cuci pakaian regular', 5000, 'laundry', 'kg', 1440),
('00000000-0000-0000-0000-000000000000', 'Cuci Express', 'Cuci pakaian express (8 jam)', 8000, 'laundry', 'kg', 480);

-- Create view for daily reports
CREATE OR REPLACE VIEW daily_reports AS
SELECT 
    o.user_id,
    DATE(o.created_at) as report_date,
    COUNT(*) as total_orders,
    SUM(o.total_amount) as total_revenue,
    COUNT(CASE WHEN o.status = 'selesai' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.status = 'proses' THEN 1 END) as pending_orders,
    AVG(o.total_amount) as average_order_value
FROM orders o
GROUP BY o.user_id, DATE(o.created_at);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Comment documentation
COMMENT ON TABLE profiles IS 'User profiles with business information';
COMMENT ON TABLE customers IS 'Customer information for each business';
COMMENT ON TABLE products IS 'Products for warung business type';
COMMENT ON TABLE services IS 'Services for laundry and cuci motor business types';
COMMENT ON TABLE orders IS 'Main orders table for all business types';
COMMENT ON TABLE order_items IS 'Items/services within each order';
COMMENT ON TABLE laundry_orders IS 'Laundry-specific order details';
COMMENT ON TABLE bike_orders IS 'Cuci motor-specific order details';
COMMENT ON TABLE transactions IS 'Daily transaction count tracking for subscription limits';
COMMENT ON TABLE subscription_usage IS 'Monthly usage tracking for subscription management';

-- Example of how to use the functions:
-- SELECT check_daily_limit(); -- Returns true if user can create more transactions today
-- SELECT generate_order_number('LDY'); -- Generates order number like LDY202401150001
