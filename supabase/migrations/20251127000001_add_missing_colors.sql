insert into public.master_colors (name, hex_code) values
('Amber', '#f59e0b'),
('Lime', '#84cc16'),
('Emerald', '#10b981'),
('Sky', '#0ea5e9'),
('Violet', '#8b5cf6'),
('Fuchsia', '#d946ef'),
('Rose', '#f43f5e'),
('Slate', '#64748b')
on conflict (name) do nothing;
