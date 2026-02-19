
-- ============================================================
-- STUDIO INVITE MODEL
-- ============================================================

-- Studios table: one per admin
CREATE TABLE public.studios (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL DEFAULT '',
  logo_url     TEXT,
  description  TEXT,
  visibility   TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('open', 'private')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;

-- Studio invites: token-based invite links
CREATE TABLE public.studio_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id   UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  invited_by  UUID NOT NULL REFERENCES auth.users(id),
  token       UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(studio_id, email)
);
ALTER TABLE public.studio_invites ENABLE ROW LEVEL SECURITY;

-- Studio roster: which freelancers are in which studios
CREATE TABLE public.studio_roster (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id     UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(studio_id, freelancer_id)
);
ALTER TABLE public.studio_roster ENABLE ROW LEVEL SECURITY;

-- Add studio_id and visibility to projects
ALTER TABLE public.projects
  ADD COLUMN studio_id  UUID REFERENCES public.studios(id),
  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('public', 'private'));

-- Updated_at triggers
CREATE TRIGGER update_studios_updated_at
  BEFORE UPDATE ON public.studios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- STUDIOS
-- Admins can read/write their own studio
CREATE POLICY "Admin can manage own studio" ON public.studios FOR ALL TO authenticated
  USING (admin_id = auth.uid()) WITH CHECK (admin_id = auth.uid());
-- Freelancers can read open studios
CREATE POLICY "Freelancers can view open studios" ON public.studios FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'freelancer') AND visibility = 'open');

-- STUDIO INVITES
-- Admin sees invites for their own studio
CREATE POLICY "Admin can manage studio invites" ON public.studio_invites FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.studios s WHERE s.id = studio_id AND s.admin_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.studios s WHERE s.id = studio_id AND s.admin_id = auth.uid())
  );
-- Anyone (including unauthenticated via anon key) can read a single invite by token for the accept page
CREATE POLICY "Token holder can read invite" ON public.studio_invites FOR SELECT TO anon, authenticated
  USING (true);
-- Authenticated users can update invite status (accept/decline)
CREATE POLICY "Authenticated can update invite status" ON public.studio_invites FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- STUDIO ROSTER
-- Admin can read/manage their studio's roster
CREATE POLICY "Admin can manage roster" ON public.studio_roster FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.studios s WHERE s.id = studio_id AND s.admin_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.studios s WHERE s.id = studio_id AND s.admin_id = auth.uid())
  );
-- Freelancer can see their own roster entries
CREATE POLICY "Freelancer can view own roster" ON public.studio_roster FOR SELECT TO authenticated
  USING (freelancer_id = auth.uid());
-- Authenticated users can insert roster entries (for invite-accept flow)
CREATE POLICY "Authenticated can join roster" ON public.studio_roster FOR INSERT TO authenticated
  WITH CHECK (freelancer_id = auth.uid());

-- PROJECTS: Drop old freelancer select policy and replace with visibility-aware one
DROP POLICY IF EXISTS "Freelancers can view relevant projects" ON public.projects;

CREATE POLICY "Freelancers can view relevant projects" ON public.projects FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'freelancer') AND (
      visibility = 'public'
      OR id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid())
      OR id IN (SELECT project_id FROM public.freelancer_responses WHERE user_id = auth.uid())
      OR (
        studio_id IS NOT NULL AND
        studio_id IN (SELECT studio_id FROM public.studio_roster WHERE freelancer_id = auth.uid())
      )
    )
  );

-- ============================================================
-- STORAGE BUCKET for studio logos
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('studio-logos', 'studio-logos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload studio logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'studio-logos');
CREATE POLICY "Public read access for studio logos" ON storage.objects FOR SELECT
  USING (bucket_id = 'studio-logos');
CREATE POLICY "Users can update own studio logos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'studio-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own studio logos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'studio-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- UPDATED handle_new_user TRIGGER
-- Now respects role from signup metadata and creates studio for admins
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'freelancer')
  );

  IF COALESCE(NEW.raw_user_meta_data->>'role', 'freelancer') = 'admin' THEN
    INSERT INTO public.studios (admin_id, name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'My') || '''s Studio'
    );
  END IF;

  RETURN NEW;
END;
$$;
