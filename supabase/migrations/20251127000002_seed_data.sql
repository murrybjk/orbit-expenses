-- 1. Seed Master Icons (Essentials + Categories)
insert into public.master_icons (name, label) values
('Utensils', 'Utensils'), ('Coffee', 'Coffee'), ('Car', 'Car'), ('Plane', 'Plane'), 
('ShoppingBag', 'ShoppingBag'), ('Gift', 'Gift'), ('Home', 'Home'), ('Wifi', 'Wifi'), 
('Zap', 'Zap'), ('Film', 'Film'), ('Gamepad2', 'Gamepad2'), ('Music', 'Music'), 
('HeartPulse', 'HeartPulse'), ('TrendingUp', 'TrendingUp'), ('Briefcase', 'Briefcase'), 
('GraduationCap', 'GraduationCap'), ('Wrench', 'Wrench'), ('Smartphone', 'Smartphone'), 
('CreditCard', 'CreditCard'), ('Globe', 'Globe'), ('CircleDashed', 'CircleDashed'),
('Bike', 'Bike'), ('Dumbbell', 'Dumbbell'), ('Trophy', 'Trophy'), ('Medal', 'Medal'),
('Tent', 'Tent'), ('Camera', 'Camera'), ('Palette', 'Palette'), ('Ticket', 'Ticket'),
('Map', 'Map'), ('Anchor', 'Anchor'), ('Train', 'Train'), ('Bus', 'Bus'),
('Laptop', 'Laptop'), ('Printer', 'Printer'), ('Cloud', 'Cloud'), ('Battery', 'Battery'),
('Server', 'Server'), ('Database', 'Database'), ('Cpu', 'Cpu'),
('Tv', 'Tv'), ('Scissors', 'Scissors'), ('Watch', 'Watch'), ('Glasses', 'Glasses'),
('Shirt', 'Shirt'), ('Baby', 'Baby'), ('Dog', 'Dog'), ('Cat', 'Cat'),
('Banknote', 'Banknote'), ('Wallet', 'Wallet'), ('PiggyBank', 'PiggyBank'),
('Sun', 'Sun'), ('Umbrella', 'Umbrella'), ('Droplet', 'Droplet'), ('Hammer', 'Hammer'),
('Beer', 'Beer'), ('Pizza', 'Pizza'), ('Fuel', 'Fuel'), ('Pill', 'Pill'),
('Leaf', 'Leaf'), ('Flower', 'Flower'), ('Trees', 'Trees'), ('Mountain', 'Mountain'),
('Headphones', 'Headphones'), ('Speaker', 'Speaker'), ('Mic', 'Mic'), ('Video', 'Video'),
('Book', 'Book'), ('Library', 'Library')
on conflict (name) do nothing;

-- 2. Seed Categories (referencing Colors and Icons)
insert into public.categories (id, label, color_name, icon_name) values
('FOOD', 'Food & Dining', 'Blue', 'Utensils'),
('TRANSPORT', 'Transport', 'Amber', 'Car'),
('SHOPPING', 'Shopping', 'Pink', 'ShoppingBag'),
('HOUSING', 'Housing', 'Indigo', 'Home'),
('ENTERTAINMENT', 'Entertainment', 'Violet', 'Film'),
('HEALTH', 'Health', 'Emerald', 'HeartPulse'),
('INVESTMENT', 'Investments', 'Cyan', 'TrendingUp'),
('OTHER', 'Other', 'Slate', 'CircleDashed')
on conflict (id) do update set
    label = excluded.label,
    color_name = excluded.color_name,
    icon_name = excluded.icon_name;

-- 3. Seed Expenses (Sample Data)
insert into public.expenses (title, amount, date, category_id, note) values
('Grocery Run', 85.50, current_date - 1, 'FOOD', 'Weekly essentials'),
('Netflix Subscription', 15.99, current_date - 2, 'ENTERTAINMENT', 'Monthly'),
('Gas Station', 45.00, current_date - 3, 'TRANSPORT', 'Full tank'),
('New Sneakers', 120.00, current_date - 5, 'SHOPPING', 'Nike Air'),
('Rent Payment', 1200.00, current_date - 10, 'HOUSING', 'November Rent'),
('Pharmacy', 25.40, current_date - 1, 'HEALTH', 'Vitamins'),
('Stock Purchase', 500.00, current_date - 4, 'INVESTMENT', 'Tech ETF'),
('Coffee with Jim', 12.50, current_date, 'FOOD', 'Starbucks')
on conflict do nothing;
