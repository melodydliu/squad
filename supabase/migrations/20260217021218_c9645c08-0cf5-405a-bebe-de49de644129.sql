
-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE public.project_status AS ENUM ('unassigned', 'assigned', 'completed');
CREATE TYPE public.transport_method AS ENUM ('personal_vehicle', 'uhaul_rental');
CREATE TYPE public.service_level AS ENUM ('design', 'delivery', 'setup', 'flip', 'strike');
CREATE TYPE public.inventory_item_status AS ENUM ('approved', 'flagged');
CREATE TYPE public.design_status AS ENUM ('in_review', 'needs_revision', 'approved');
CREATE TYPE public.quality_status AS ENUM ('good', 'issue');
CREATE TYPE public.freelancer_response_status AS ENUM ('available', 'unavailable');
CREATE TYPE public.notification_type AS ENUM ('project', 'approval', 'inventory', 'design', 'comment');
CREATE TYPE public.notification_target_tab AS ENUM ('overview', 'designs', 'inventory', 'assignment');

-- ============================================================
-- ALL TABLES (no cross-table RLS yet)
-- ============================================================

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  event_name TEXT NOT NULL,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  timeline TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  pay NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_hours NUMERIC(6,1) NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  design_guide TEXT NOT NULL DEFAULT '',
  transport_method public.transport_method NOT NULL DEFAULT 'personal_vehicle',
  service_level public.service_level[] NOT NULL DEFAULT '{}',
  day_of_contact TEXT NOT NULL DEFAULT '',
  status public.project_status NOT NULL DEFAULT 'unassigned',
  designers_needed INTEGER NOT NULL DEFAULT 1,
  inventory_confirmed BOOLEAN NOT NULL DEFAULT false,
  flowers_confirmed BOOLEAN NOT NULL DEFAULT false,
  hard_goods_confirmed BOOLEAN NOT NULL DEFAULT false,
  quality_status public.quality_status,
  quality_note TEXT,
  field_visibility JSONB NOT NULL DEFAULT '{"timeline":true,"location":true,"pay":true,"totalHours":true,"description":true,"designGuide":true,"transportMethod":true,"serviceLevel":true,"dayOfContact":true,"floralItems":true,"inspirationPhotos":true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.freelancer_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status public.freelancer_response_status NOT NULL DEFAULT 'available',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);
ALTER TABLE public.freelancer_responses ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.inspiration_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inspiration_photos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.floral_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.floral_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.floral_item_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floral_item_id UUID NOT NULL REFERENCES public.floral_items(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  freelancer_note TEXT,
  admin_note TEXT,
  design_status public.design_status NOT NULL DEFAULT 'in_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.floral_item_designs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.design_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floral_item_design_id UUID NOT NULL REFERENCES public.floral_item_designs(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.design_photos ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.design_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floral_item_design_id UUID NOT NULL REFERENCES public.floral_item_designs(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  note TEXT,
  admin_note TEXT,
  status public.design_status NOT NULL DEFAULT 'in_review',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.design_revisions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.flower_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  flower TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '',
  stems_in_recipe INTEGER NOT NULL DEFAULT 0,
  total_ordered INTEGER NOT NULL DEFAULT 0,
  extras INTEGER NOT NULL DEFAULT 0,
  status public.inventory_item_status,
  quality_notes TEXT,
  photo_url TEXT,
  updated_by UUID,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.flower_inventory ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.hard_good_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  status public.inventory_item_status,
  notes TEXT,
  photo_url TEXT,
  updated_by UUID,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hard_good_inventory ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  type public.notification_type NOT NULL DEFAULT 'project',
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  target_tab public.notification_target_tab,
  target_item_id TEXT,
  project_name TEXT,
  context_preview TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_floral_item_designs_updated_at BEFORE UPDATE ON public.floral_item_designs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flower_inventory_updated_at BEFORE UPDATE ON public.flower_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hard_good_inventory_updated_at BEFORE UPDATE ON public.hard_good_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS POLICIES (all tables exist now)
-- ============================================================

-- PROJECTS
CREATE POLICY "Admins can do everything on projects" ON public.projects FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Freelancers can view relevant projects" ON public.projects FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'freelancer') AND (
    status = 'unassigned'
    OR id IN (SELECT project_id FROM public.project_assignments WHERE user_id = auth.uid())
    OR id IN (SELECT project_id FROM public.freelancer_responses WHERE user_id = auth.uid())
  ));

-- PROJECT ASSIGNMENTS
CREATE POLICY "Admins full access project_assignments" ON public.project_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Freelancers can view own assignments" ON public.project_assignments FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- FREELANCER RESPONSES
CREATE POLICY "Admins full access freelancer_responses" ON public.freelancer_responses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Freelancers can manage own responses" ON public.freelancer_responses FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- INSPIRATION PHOTOS
CREATE POLICY "Admins full access inspiration_photos" ON public.inspiration_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Freelancers can view inspiration_photos" ON public.inspiration_photos FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'freelancer') AND EXISTS (
    SELECT 1 FROM public.projects p WHERE p.id = project_id AND (
      p.status = 'unassigned'
      OR p.id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid())
    )
  ));

-- FLORAL ITEMS
CREATE POLICY "Admins full access floral_items" ON public.floral_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Freelancers can view floral_items" ON public.floral_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'freelancer') AND EXISTS (
    SELECT 1 FROM public.projects p WHERE p.id = project_id AND (
      p.status = 'unassigned'
      OR p.id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid())
    )
  ));

-- FLORAL ITEM DESIGNS
CREATE POLICY "Admins full access floral_item_designs" ON public.floral_item_designs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Freelancers can manage designs on assigned projects" ON public.floral_item_designs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'freelancer') AND project_id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'freelancer') AND project_id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid()));

-- DESIGN PHOTOS
CREATE POLICY "Admins full access design_photos" ON public.design_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Freelancers can manage design photos" ON public.design_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'freelancer') AND floral_item_design_id IN (
    SELECT fid.id FROM public.floral_item_designs fid WHERE fid.project_id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid())
  ))
  WITH CHECK (public.has_role(auth.uid(), 'freelancer') AND floral_item_design_id IN (
    SELECT fid.id FROM public.floral_item_designs fid WHERE fid.project_id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid())
  ));

-- DESIGN REVISIONS
CREATE POLICY "Admins full access design_revisions" ON public.design_revisions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Freelancers can manage revisions" ON public.design_revisions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'freelancer') AND floral_item_design_id IN (
    SELECT fid.id FROM public.floral_item_designs fid WHERE fid.project_id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid())
  ))
  WITH CHECK (public.has_role(auth.uid(), 'freelancer') AND floral_item_design_id IN (
    SELECT fid.id FROM public.floral_item_designs fid WHERE fid.project_id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid())
  ));

-- FLOWER INVENTORY
CREATE POLICY "Admins full access flower_inventory" ON public.flower_inventory FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Freelancers can manage flower_inventory" ON public.flower_inventory FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'freelancer') AND project_id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'freelancer') AND project_id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid()));

-- HARD GOOD INVENTORY
CREATE POLICY "Admins full access hard_good_inventory" ON public.hard_good_inventory FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Freelancers can manage hard_good_inventory" ON public.hard_good_inventory FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'freelancer') AND project_id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'freelancer') AND project_id IN (SELECT pa.project_id FROM public.project_assignments pa WHERE pa.user_id = auth.uid()));

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('project-photos', 'project-photos', true);

CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'project-photos');
CREATE POLICY "Public read access for project photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'project-photos');
CREATE POLICY "Users can update own photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'project-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
