-- =======================================================================================
-- AI Choreography Designer OS - Data Architecture v3.0 (Monetization & 5-Step Pipeline)
-- =======================================================================================
--
-- [1. Token Economy (Coin-based Monetization)]
-- 월 구독제가 아닌 '코인 충전 결제 모델' 테이블.
--

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_wallets: 사용자의 코인 잔액 트래킹
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 500, -- 최초 회원가입 보너스 지급 (가치 체감용 500 코인)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

-- coin_transactions: 코인 차감 및 충전 역사 기록 (Pay-per-use 기반)
CREATE TABLE coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES user_wallets(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- 충전(+) 또는 차감(-) 
    -- e.g. -100 (기본 생성), -150 (무드보드 생성), -250 (PPT Export), +1500 (결제 충전)
    action_type VARCHAR(100) NOT NULL, 
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =======================================================================================
-- [2. 5-Step Chain of Prompts Pipeline Data Structure]
-- 단일 호출이 아닌, 5단계 분할 생성 로직 설계
-- =======================================================================================

-- 메인 프로젝트 테이블
CREATE TABLE choreography_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(50),
    dancers_count INTEGER,
    duration_minutes INTEGER,
    music_title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 1: 주제 및 감정 곡선 설계 (Chart UI용)
CREATE TABLE step1_theme_emotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES choreography_projects(id) ON DELETE CASCADE,
    philosophical_question TEXT,
    overall_mood VARCHAR(200),
    curve_points JSONB, -- [ { "timeRatio": 0.0, "intensity": 10 }, { "timeRatio": 0.5, "intensity": 100 } ... ]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 2: 타임라인 및 LMA 기반 안무 구조화 (Block UI용)
CREATE TABLE step2_timeline_lma (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES choreography_projects(id) ON DELETE CASCADE,
    part_name VARCHAR(50), -- e.g. 'Intro', 'Development', 'Climax'
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    description TEXT,
    lma_space VARCHAR(50), -- Direct / Flexible
    lma_weight VARCHAR(50), -- Heavy / Light
    lma_time VARCHAR(50), -- Sudden / Sustained
    lma_flow VARCHAR(50), -- Bound / Free
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Labanotation 번역 엔진
CREATE TABLE step3_labanotation_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timeline_id UUID REFERENCES step2_timeline_lma(id) ON DELETE CASCADE,
    physical_movement_script TEXT NOT NULL, -- LMA 기호를 활용해 물리적 동작을 산문으로 풀어낸 스크립트
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: 오디오 자동 매핑 (Audio BPM Sync)
CREATE TABLE step4_audio_sync (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES choreography_projects(id) ON DELETE CASCADE,
    bpm_progression VARCHAR(255), -- e.g. '80 BPM -> 120 BPM'
    sync_hints JSONB, -- 구간별 BPM에 맞춘 LMA 매핑 제안
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: 문서화 자동화 (PPT Export 용)
CREATE TABLE step5_presentation_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES choreography_projects(id) ON DELETE CASCADE,
    markdown_content TEXT, -- 포맷팅된 최종 마크다운
    slide_metadata JSONB, -- 장표별 구성 정보
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================================================================================
-- [Supabase RPC (Store Procedure) - 로직 처리 예제]
-- 코인 차감 시 안전성을 보장하는 함수
-- =======================================================================================
/*
CREATE OR REPLACE FUNCTION deduct_coin_for_generation(p_user_id UUID, cost INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_balance INTEGER;
    wallet_id UUID;
BEGIN
    SELECT id, balance INTO wallet_id, current_balance 
    FROM user_wallets 
    WHERE user_id = p_user_id;

    IF current_balance >= cost THEN
        UPDATE user_wallets 
        SET balance = balance - cost 
        WHERE id = wallet_id;
        
        INSERT INTO coin_transactions (user_id, wallet_id, amount, action_type, description)
        VALUES (p_user_id, wallet_id, -cost, 'generate_step1', '안무 기획 기본 생성 비용 차감');
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;
*/
