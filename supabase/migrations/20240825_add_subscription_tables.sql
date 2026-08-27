-- 1. Add subscription fields to shops table
ALTER TABLE public.shops 
ADD COLUMN plan_tier text DEFAULT 'trial',
ADD COLUMN plan_status text DEFAULT 'active',
ADD COLUMN plan_expires_at timestamptz DEFAULT (now() + interval '2 months');

-- 2. Create payment_slips table for manual bank transfers
CREATE TABLE public.payment_slips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id uuid REFERENCES public.shops(id) ON DELETE CASCADE,
    amount decimal NOT NULL,
    plan_tier text NOT NULL, -- e.g., 'pro'
    months int NOT NULL DEFAULT 1, -- how many months they are paying for
    slip_url text NOT NULL,
    status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at timestamptz DEFAULT now(),
    approved_at timestamptz
);

-- 3. RLS for payment_slips
ALTER TABLE public.payment_slips ENABLE ROW LEVEL SECURITY;

-- Shop owners can view their own slips
CREATE POLICY "Shop owners can view their own slips" 
ON public.payment_slips FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM shops 
        WHERE shops.id = payment_slips.shop_id 
        AND shops.owner_id = auth.uid()
    )
);

-- Shop owners can insert their own slips
CREATE POLICY "Shop owners can insert slips for their shop" 
ON public.payment_slips FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM shops 
        WHERE shops.id = payment_slips.shop_id 
        AND shops.owner_id = auth.uid()
    )
);

-- (Optional) Create a storage bucket for slips if not already existing
INSERT INTO storage.buckets (id, name, public) VALUES ('slips', 'slips', true) ON CONFLICT DO NOTHING;

-- RLS for storage (allow authenticated users to upload and view)
CREATE POLICY "Allow authenticated uploads to slips bucket"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'slips' AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow public viewing of slips"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'slips'
);
