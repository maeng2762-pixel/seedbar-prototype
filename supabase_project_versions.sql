-- Supabase Schema for AI Choreography Designer
-- This handles project versions, user wallets, and generation histories.

-- 1. Create Projects Table (Optional for organizing versions under a project)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Project Versions Table
CREATE TABLE IF NOT EXISTS public.project_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    
    -- Inputs (Parameters)
    genre TEXT,
    dancer_count INTEGER,
    duration TEXT,
    keywords TEXT[],
    
    -- Chain of Prompts Step 1: Text & Tags
    project_title TEXT,
    theme TEXT,
    concept TEXT,
    intent TEXT,
    content TEXT,
    trend_report TEXT,
    lma_tags JSONB, -- { space: [], weight: [], time: [], flow: [] }
    timeline JSONB, -- [{ phase, time_range, desc }]
    music_recommendation JSONB, -- { bpm, mood, genre }
    
    -- Chain of Prompts Step 2: Emotion Curve
    emotion_curve JSONB, -- { labels: [], intensities: [] }
    
    -- Chain of Prompts Step 3: 2D Coordinates
    motion_2d_paths JSONB, -- { total_duration_sec, dancers: [{ id, color, path }] }
    
    -- Chain of Prompts Step 4: Visual Images (Stage/Costume)
    moodboard_images TEXT[], -- Array of URLs
    
    is_active BOOLEAN DEFAULT false, -- If it's the currently selected version
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Mock Data Insertion Script (For Demo)
-- INSERT INTO auth.users (id, email) VALUES ...
-- INSERT INTO projects (id, title, user_id) VALUES ...
-- INSERT INTO project_versions (...) VALUES ...

-- 4. Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own versions"
    ON public.project_versions FOR ALL
    USING (auth.uid() = user_id);
