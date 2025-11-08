-- =====================================================
-- PHASE 4: GROUPS & SHARED EXPENSES - DATABASE SETUP
-- =====================================================
-- Run this script in Supabase SQL Editor to add group functionality
-- This adds to the existing database setup from SUPABASE_COMPLETE_SETUP.sql

-- =====================================================
-- 1. GROUPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
-- Users can view groups they are members of
CREATE POLICY "Users can view groups they belong to"
  ON public.groups
  FOR SELECT
  USING (
    id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Users can create groups
CREATE POLICY "Users can create groups"
  ON public.groups
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Group creators can update their groups
CREATE POLICY "Group creators can update groups"
  ON public.groups
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Group creators can delete their groups
CREATE POLICY "Group creators can delete groups"
  ON public.groups
  FOR DELETE
  USING (created_by = auth.uid());

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON public.groups(created_at DESC);

-- =====================================================
-- 2. GROUP MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_members
-- Users can view members of groups they belong to
CREATE POLICY "Users can view members of their groups"
  ON public.group_members
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Group admins can add members
CREATE POLICY "Group admins can add members"
  ON public.group_members
  FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Group admins can update member roles
CREATE POLICY "Group admins can update members"
  ON public.group_members
  FOR UPDATE
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can remove themselves or admins can remove members
CREATE POLICY "Users can leave groups or admins can remove members"
  ON public.group_members
  FOR DELETE
  USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT group_id FROM public.group_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);

-- =====================================================
-- 3. GROUP EXPENSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  paid_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  split_type TEXT NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'custom', 'percentage')),
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.group_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_expenses
-- Users can view expenses from groups they belong to
CREATE POLICY "Users can view expenses from their groups"
  ON public.group_expenses
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Group members can create expenses
CREATE POLICY "Group members can create expenses"
  ON public.group_expenses
  FOR INSERT
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    ) AND
    paid_by = auth.uid()
  );

-- Expense creators can update their expenses
CREATE POLICY "Expense creators can update expenses"
  ON public.group_expenses
  FOR UPDATE
  USING (paid_by = auth.uid())
  WITH CHECK (paid_by = auth.uid());

-- Expense creators can delete their expenses
CREATE POLICY "Expense creators can delete expenses"
  ON public.group_expenses
  FOR DELETE
  USING (paid_by = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_expenses_group_id ON public.group_expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_group_expenses_paid_by ON public.group_expenses(paid_by);
CREATE INDEX IF NOT EXISTS idx_group_expenses_date ON public.group_expenses(expense_date DESC);

-- =====================================================
-- 4. GROUP EXPENSE PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_expense_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES public.group_expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_owed DECIMAL(12,2) NOT NULL CHECK (amount_owed >= 0),
  is_settled BOOLEAN DEFAULT FALSE,
  settled_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(expense_id, user_id)
);

-- Enable RLS
ALTER TABLE public.group_expense_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_expense_participants
-- Users can view participants for expenses in their groups
CREATE POLICY "Users can view expense participants in their groups"
  ON public.group_expense_participants
  FOR SELECT
  USING (
    expense_id IN (
      SELECT id FROM public.group_expenses
      WHERE group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
    )
  );

-- Expense creators can add participants
CREATE POLICY "Expense creators can add participants"
  ON public.group_expense_participants
  FOR INSERT
  WITH CHECK (
    expense_id IN (
      SELECT id FROM public.group_expenses WHERE paid_by = auth.uid()
    )
  );

-- Expense creators can update participants
CREATE POLICY "Expense creators can update participants"
  ON public.group_expense_participants
  FOR UPDATE
  USING (
    expense_id IN (
      SELECT id FROM public.group_expenses WHERE paid_by = auth.uid()
    )
  )
  WITH CHECK (
    expense_id IN (
      SELECT id FROM public.group_expenses WHERE paid_by = auth.uid()
    )
  );

-- Expense creators can delete participants
CREATE POLICY "Expense creators can delete participants"
  ON public.group_expense_participants
  FOR DELETE
  USING (
    expense_id IN (
      SELECT id FROM public.group_expenses WHERE paid_by = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expense_participants_expense_id ON public.group_expense_participants(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_participants_user_id ON public.group_expense_participants(user_id);

-- =====================================================
-- 5. GROUP SETTLEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.group_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  settled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  CHECK (from_user_id != to_user_id)
);

-- Enable RLS
ALTER TABLE public.group_settlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_settlements
-- Users can view settlements in groups they belong to
CREATE POLICY "Users can view settlements in their groups"
  ON public.group_settlements
  FOR SELECT
  USING (
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Users can create settlements they are part of
CREATE POLICY "Users can create settlements they are part of"
  ON public.group_settlements
  FOR INSERT
  WITH CHECK (
    (from_user_id = auth.uid() OR to_user_id = auth.uid()) AND
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_settlements_group_id ON public.group_settlements(group_id);
CREATE INDEX IF NOT EXISTS idx_group_settlements_from_user ON public.group_settlements(from_user_id);
CREATE INDEX IF NOT EXISTS idx_group_settlements_to_user ON public.group_settlements(to_user_id);

-- =====================================================
-- 6. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to groups table
DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to group_expenses table
DROP TRIGGER IF EXISTS update_group_expenses_updated_at ON public.group_expenses;
CREATE TRIGGER update_group_expenses_updated_at
  BEFORE UPDATE ON public.group_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. TRIGGER TO AUTO-ADD CREATOR AS ADMIN MEMBER
-- =====================================================

CREATE OR REPLACE FUNCTION add_creator_as_group_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_add_group_creator ON public.groups;
CREATE TRIGGER auto_add_group_creator
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_group_admin();

-- =====================================================
-- 8. VERIFICATION QUERY
-- =====================================================

SELECT
  'groups table exists' as check_name,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'groups' LIMIT 1) as status
UNION ALL
SELECT
  'group_members table exists',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members' LIMIT 1)
UNION ALL
SELECT
  'group_expenses table exists',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_expenses' LIMIT 1)
UNION ALL
SELECT
  'group_expense_participants table exists',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_expense_participants' LIMIT 1)
UNION ALL
SELECT
  'group_settlements table exists',
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_settlements' LIMIT 1)
UNION ALL
SELECT
  'RLS enabled on groups',
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'groups' LIMIT 1)
UNION ALL
SELECT
  'RLS enabled on group_members',
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'group_members' LIMIT 1)
UNION ALL
SELECT
  'RLS enabled on group_expenses',
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'group_expenses' LIMIT 1)
UNION ALL
SELECT
  'auto add group admin trigger exists',
  EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_add_group_creator' LIMIT 1);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- All 5 tables created with RLS policies
-- Automatic admin assignment for group creators
-- Ready to use with the Groups & Shared Expenses feature
-- =====================================================
