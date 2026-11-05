-- Create interest categories table
CREATE TABLE IF NOT EXISTS public.interest_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    icon_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.interest_categories ENABLE ROW LEVEL SECURITY;

-- Allow any user to read list of interest categories
CREATE POLICY "Public can read interest categories"
    ON public.interest_categories FOR SELECT
    USING (true);

-- Seed broad categories
INSERT INTO public.interest_categories (name, icon_path) VALUES
    ('Academic & Pre-Professional', '/onboarding/academic-and-pre-professional.svg'),
    ('Arts & Media', '/onboarding/arts-and-media.svg'),
    ('Community & Advocacy', '/onboarding/community-and-advocacy.svg'),
    ('Health & Wellness', '/onboarding/health-and-wellness.svg'),
    ('Spiritual & Religious', '/onboarding/spiritual-and-religious.svg'),
    ('Cultural & Identity-Based', '/onboarding/cultural-and-identity-based.svg'),
    ('Campus Life & Social', '/onboarding/campus-and-social.svg')
ON CONFLICT (name) DO NOTHING;

-- Create interests table
CREATE TABLE IF NOT EXISTS public.interests (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL REFERENCES public.interest_categories(name) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering interests by category
CREATE INDEX IF NOT EXISTS idx_interests_category ON public.interests(category);

-- Enable RLS
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- Allow any user to read list of interests
DROP POLICY IF EXISTS "Public can read interests" ON public.interests;
CREATE POLICY "Public can read interests"
    ON public.interests FOR SELECT
    USING (true);

-- Seed interests
INSERT INTO public.interests (name, category) VALUES
    ('Academic', 'Academic & Pre-Professional'),
    ('Business', 'Academic & Pre-Professional'),
    ('Career Planning', 'Academic & Pre-Professional'),
    ('Dental', 'Academic & Pre-Professional'),
    ('Educational', 'Academic & Pre-Professional'),
    ('Engineering', 'Academic & Pre-Professional'),
    ('Honor Societies', 'Academic & Pre-Professional'),
    ('Journals', 'Academic & Pre-Professional'),
    ('Law', 'Academic & Pre-Professional'),
    ('Leadership', 'Academic & Pre-Professional'),
    ('Medical', 'Academic & Pre-Professional'),
    ('Pre-Professional', 'Academic & Pre-Professional'),
    ('Technology', 'Academic & Pre-Professional'),
    ('Cultural', 'Cultural & Identity-Based'),
    ('African American', 'Cultural & Identity-Based'),
    ('Asian', 'Cultural & Identity-Based'),
    ('Asian Pacific Islander', 'Cultural & Identity-Based'),
    ('Latino/Latina', 'Cultural & Identity-Based'),
    ('Ethnic', 'Cultural & Identity-Based'),
    ('International Students', 'Cultural & Identity-Based'),
    ('Out-of-state Students', 'Cultural & Identity-Based'),
    ('Community Service', 'Community & Advocacy'),
    ('Social Activism', 'Community & Advocacy'),
    ('Service', 'Community & Advocacy'),
    ('LGBTQI', 'Community & Advocacy'),
    ('GSA Affiliated', 'Community & Advocacy'),
    ('Transfer Students', 'Community & Advocacy'),
    ('Faculty/Staff', 'Community & Advocacy'),
    ('Arts', 'Arts & Media'),
    ('Dance', 'Arts & Media'),
    ('Film', 'Arts & Media'),
    ('Music', 'Arts & Media'),
    ('Media', 'Arts & Media'),
    ('Theater', 'Arts & Media'),
    ('Club Sports', 'Health & Wellness'),
    ('Fitness', 'Health & Wellness'),
    ('Health and Wellness', 'Health & Wellness'),
    ('Self Improvement', 'Health & Wellness'),
    ('Sports', 'Health & Wellness'),
    ('Martial Arts', 'Health & Wellness'),
    ('Religious', 'Spiritual & Religious'),
    ('Spiritual', 'Spiritual & Religious'),
    ('Greek Life', 'Campus Life & Social'),
    ('Student Government', 'Campus Life & Social'),
    ('Social', 'Campus Life & Social'),
    ('Spirit/Booster', 'Campus Life & Social'),
    ('Recreation', 'Campus Life & Social')
ON CONFLICT (name) DO NOTHING;
