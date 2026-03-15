/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Seedbar AI Creative Production Engine v2.0
 * 7-Step Chain of Prompts Pipeline + Chance Operation Engine
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 🎲 v2.0 — "Chance Operation" 우연성 엔진 통합
 * 
 * NEW: 동일한 입력값이 주어져도 매번 완전히 다른 결과물을 생성합니다.
 * - ChanceOperationEngine: 난수 기반 '히든 제약 조건' 주입
 * - AntiClichePromptBuilder: 클리셰 방지 시스템 프롬프트
 * - UniquenessChecker: DB 기반 중복 방지 (24시간 내 유사 결과 회피)
 * 
 * Tech Stack: Vite + React (Frontend), OpenAI GPT-4o (Simulated), Supabase
 */

import { 
    ChanceOperationEngine, 
    AntiClichePromptBuilder, 
    UniquenessChecker 
} from './chanceOperationEngine.js';
import { getPlanHeaders } from '../lib/subscriptionContext';
import { apiUrl } from '../lib/apiClient';

export class ChoreographyAIPipeline {
    constructor(userId) {
        this.userId = userId;
        this.chanceEngine = new ChanceOperationEngine();
        this.constraints = null;      // 현재 세션의 히든 제약 조건
        this.systemPrompt = "";       // 현재 세션의 시스템 프롬프트
        this.recentTitles = [];       // 중복 방지용 최근 제목 목록
    }

    /**
     * 메인 파이프라인 실행 (v2.0 — 우연성 엔진 통합)
     * @param {Object} input - { genre, dancersCount, duration, mood, theme, keywords }
     */
    async generateFullChoreography(input) {
        // ═══ 콩쿠르 모드 감지 ═══
        this.isCompetition = (input.genre || '').toLowerCase().includes('competition') || 
                             (input.genre || '').includes('콩쿠르');
        
        console.log(`\n🎬 [PIPELINE v2.0 START] ═══════════════════════════════════`);
        console.log(`   Theme: ${input.theme} | Keywords: ${(input.keywords || []).join(', ')}`);
        if (this.isCompetition) {
            console.log(`   🏆 COMPETITION MODE ACTIVATED — Jury-Targeted Output`);
        }

        try {
            // ═══ PHASE 0: 우연성 엔진 초기화 ═══
            console.log('\n🎲 [PHASE 0] Rolling Chance Operation Dice...');
            this.constraints = this.chanceEngine.rollDice();

            // ═══ PHASE 0.5: 중복 방지 — 최근 결과물 조회 ═══
            console.log('🗃️ [PHASE 0.5] Fetching recent outputs for uniqueness check...');
            this.recentTitles = await UniquenessChecker.fetchRecentOutputs();
            console.log(`   Found ${this.recentTitles.length} recent titles to avoid.`);

            // ═══ PHASE 0.9: 안티-클리셰 시스템 프롬프트 빌드 ═══
            console.log('📝 [PHASE 0.9] Building Anti-Cliché System Prompt...');
            this.systemPrompt = AntiClichePromptBuilder.buildSystemPrompt(
                input, 
                this.recentTitles, 
                this.constraints
            );
            const modelParams = AntiClichePromptBuilder.getModelParams();
            console.log(`   Model: ${modelParams.model} | Temp: ${modelParams.temperature} | Presence: ${modelParams.presence_penalty} | Top-P: ${modelParams.top_p}`);

            // ═══ STEP 1: Title & Concept Engine ═══
            console.log('\n🏷️ [STEP 1] Generating Artistic Titles (Anti-Cliché)...');
            const step1Result = await this.step1_TitleGenerator(input);

            console.log('💡 [STEP 2] Generating Concept & Philosophy...');
            const step2Result = await this.step2_ConceptGenerator(input, step1Result);

            // ═══ 중복 방지: 생성된 제목을 히스토리에 등록 ═══
            UniquenessChecker.registerOutput(
                step1Result.scientific?.en || 'Untitled', 
                step2Result.artisticPhilosophy
            );

            // ═══ STEP 3: AI Choreography Engine (Narrative + Timing) ═══
            console.log('📖 [STEP 3] Building Narrative Structure...');
            const step3Result = await this.step3_NarrativeBuilder(input, step2Result);

            console.log('⏱️ [STEP 4] Generating Choreography Timing Map...');
            const timingResult = await this.step4c_TimingEngineGenerator(input, step3Result);

            // ═══ STEP 5: AI Stage Map Engine (2D Flow + Chance Spatial) ═══
            console.log('🗺️ [STEP 5] Generating 2D Flow Patterns (with Spatial Constraints)...');
            const flowResult = await this.step4b_StageFlowGenerator(input, timingResult);

            // ═══ STEP 6: AI Music Engine ═══
            console.log('🎵 [STEP 6] Analyzing Music Concept...');
            const step4Result = await this.step4_MusicAnalysis(input, step3Result);

            // ═══ STEP 7: Stage & Visuals ═══
            console.log('🎨 [STEP 7] Generating Stage & Visual Concept...');
            const step5Result = await this.step5_StageConcept(input, step3Result);

            // ═══ STEP 8-9: Output Formatting ═══
            console.log('📊 [STEP 8] Formatting PPT Presentation Data...');
            const step6Result = await this.step6_PresentationBuilder(step1Result, step2Result, step3Result, step4Result, step5Result);

            console.log('📰 [STEP 9] Designing Pamphlet Layout Text...');
            const step7Result = await this.step7_PamphletDesigner(step1Result, step2Result, step3Result, step4Result, step5Result);

            console.log(`\n✅ [PIPELINE v2.0 SUCCESS] ═══════════════════════════════`);
            console.log(`   🎲 Dice Roll ID: ${this.constraints.rollId}`);

            return {
                titles: step1Result,
                concept: step2Result,
                narrative: step3Result,
                music: step4Result,
                flow: flowResult,
                timing: timingResult,
                stage: step5Result,
                presentation: step6Result,
                pamphlet: step7Result,
                // v2.0: 우연성 엔진 메타데이터 (UI에서 표시 가능)
                chanceOperation: this.chanceEngine.getConstraintsSummary(),
                // v2.1: 콩쿠르 모드 플래그
                isCompetition: this.isCompetition
            };

        } catch (error) {
            console.error('❌ [PIPELINE ERROR]', error);
            throw new Error('AI 파이프라인 생성 중 오류가 발생했습니다.');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 세부 프롬프트 체인 (Chance Engine + Anti-Cliché 적용)
    // ═══════════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔨 HAMMER-HIT TITLE SYSTEM v3.0 (망치 효과 제목 엔진)
    // ═══════════════════════════════════════════════════════════════════════════
    //
    // Pipeline: Philosophy FIRST → Title Reverse-Engineering
    //
    // Rule 1: Missing Puzzle Piece — 제목은 수수께끼
    // Rule 2: Radical Domain Crossing — 감정→과학/수학 은유
    // Rule 3: Scale of Expression — 4가지 표현 스케일
    // ═══════════════════════════════════════════════════════════════════════════

    _getDomainCrossingMap() {
        return {
            'Sorrow': {
                domain: 'Thermodynamics',
                metaphors: {
                    scientific: [
                        { en: 'Absolute Zero', kr: '절대 영도' },
                        { en: 'Heat Death', kr: '열적 죽음' },
                        { en: 'Entropy at 3:00 AM', kr: '새벽 3시의 엔트로피' },
                        { en: '-273.15°C', kr: '-273.15°C' },
                        { en: 'Thermal Equilibrium', kr: '열적 평형' },
                    ],
                    radical: [
                        { en: 'We Are All Cooling Down', kr: '우리는 모두 식어가고 있다' },
                        { en: 'The Room Gets Colder When You Leave', kr: '네가 떠나면 방이 차가워진다' },
                        { en: 'Nothing Stays Warm', kr: '따뜻한 것은 없다' },
                        { en: 'I Forgot How to Cry Standing Up', kr: '서서 우는 법을 잊었다' },
                    ],
                    surreal: [
                        { en: 'Liquid Bone', kr: '액체로 된 뼈' },
                        { en: 'The Color of a Closed Door', kr: '닫힌 문의 색깔' },
                        { en: 'Drowning in Dry Air', kr: '마른 공기에서 익사하기' },
                        { en: 'Salt Cathedral', kr: '소금 성당' },
                    ],
                    minimalist: [
                        { en: '0.0K', kr: '0.0K' },
                        { en: '[ — ]', kr: '[ — ]' },
                        { en: '∅', kr: '∅' },
                    ],
                },
                philosophies: [
                    "열역학 제2법칙에 따르면 모든 닫힌 계(closed system)는 반드시 최대 엔트로피를 향해 붕괴한다. 인간의 관계도 예외가 아니다.",
                    "절대 영도(-273.15°C)에서 모든 분자 운동이 정지하듯, 슬픔의 극점에서 신체는 더 이상 진동하지 않는다.",
                    "열은 항상 뜨거운 곳에서 차가운 곳으로만 흐른다. 사랑도. 기억도. 시간도.",
                ],
                statements: [
                    "본 작품은 열역학적 냉각 과정을 인간 감정의 소멸에 대한 은유로 사용한다. 무용수의 신체는 점진적으로 에너지를 잃어가며, 결국 분자 운동이 정지하는 절대 영도에 도달한다.",
                    "본 작품은 열적 평형—두 물체의 온도가 같아져 더 이상 에너지 교환이 없는 상태—을 관계의 종말로 시각화한다.",
                    "본 작품은 엔트로피의 비가역성을 통해, 한번 흩어진 감정은 결코 원래의 형태로 돌아갈 수 없음을 증명한다.",
                ],
            },
            'Joy': {
                domain: 'Particle Physics',
                metaphors: {
                    scientific: [
                        { en: 'Higgs Field', kr: '힉스 장(場)' },
                        { en: 'Spontaneous Symmetry Breaking', kr: '자발적 대칭 깨짐' },
                        { en: 'Excitation State', kr: '들뜬 상태' },
                        { en: 'Resonance Frequency', kr: '공명 주파수' },
                    ],
                    radical: [
                        { en: 'Too Bright to Look At', kr: '눈이 부셔서 볼 수 없다' },
                        { en: 'Laughing Without Permission', kr: '허락 없이 웃기' },
                        { en: 'The Body Forgets It Has Bones', kr: '몸이 뼈가 있다는 걸 잊는다' },
                    ],
                    surreal: [
                        { en: 'A Room Made of Laughter', kr: '웃음으로 만든 방' },
                        { en: 'Sunlight Has Weight', kr: '햇빛에는 무게가 있다' },
                        { en: 'Gravity Takes a Day Off', kr: '중력의 휴일' },
                    ],
                    minimalist: [
                        { en: '!', kr: '!' },
                        { en: '↑↑↑', kr: '↑↑↑' },
                    ],
                },
                philosophies: [
                    "입자물리학에서 '들뜬 상태(Excited State)'란 입자가 평소보다 높은 에너지 준위를 점유한 일시적 상태다. 기쁨도 그런 것이다—찬란하지만, 지속될 수 없다.",
                    "힉스 장(Higgs Field)이 입자에 질량을 부여하듯, 기쁨은 존재에 무게를 부여하여 우리를 '여기'에 정박시킨다.",
                ],
                statements: [
                    "본 작품은 양자역학의 '들뜬 상태'를 통해, 기쁨의 찬란함과 불안정성을 동시에 가시화한다. 에너지 준위가 높을수록 추락도 깊다.",
                    "본 작품은 자발적 대칭 깨짐—완벽한 균형이 스스로 무너지며 새로운 질서를 만드는 현상—으로 환희의 순간을 포착한다.",
                ],
            },
            'Solitude': {
                domain: 'Quantum Mechanics',
                metaphors: {
                    scientific: [
                        { en: 'Observer Effect', kr: '관측자 효과' },
                        { en: 'Superposition of One', kr: '1인의 중첩 상태' },
                        { en: 'Quantum Decoherence', kr: '양자 결어긋남' },
                        { en: "Schrödinger's Room", kr: '슈뢰딩거의 방' },
                    ],
                    radical: [
                        { en: 'No One Is Coming', kr: '아무도 오지 않는다' },
                        { en: 'Talking to the Wall', kr: '벽을 보고 말하기' },
                        { en: 'The Audience Is Empty', kr: '객석이 비었다' },
                    ],
                    surreal: [
                        { en: 'Echo Without a Source', kr: '원본 없는 메아리' },
                        { en: 'A Shadow That Arrives Before the Body', kr: '몸보다 먼저 도착하는 그림자' },
                        { en: 'The Sound of One Skin Breathing', kr: '한 피부가 호흡하는 소리' },
                    ],
                    minimalist: [
                        { en: '1', kr: '1' },
                        { en: '[    ]', kr: '[    ]' },
                        { en: '. . .', kr: '. . .' },
                    ],
                },
                philosophies: [
                    "양자역학의 관측자 효과에 따르면, 관측하는 행위 자체가 대상의 상태를 변화시킨다. 고독이란 아무도 관측하지 않을 때 존재가 '확정되지 않는' 상태다.",
                    "슈뢰딩거의 고양이처럼, 누군가 문을 열기 전까지 나는 존재하면서 동시에 존재하지 않는다.",
                ],
                statements: [
                    "본 작품은 양자역학의 '관측자 효과'를 무대 위에 구현한다. 무용수는 관객의 시선이 닿을 때만 '존재'하며, 시선이 벗어나면 확률의 파동으로 흩어진다.",
                    "본 작품은 양자 결어긋남—양자 상태가 환경과 상호작용하며 고유성을 잃는 현상—을 통해, 고립이 어떻게 정체성을 증발시키는지 탐구한다.",
                ],
            },
            'Love': {
                domain: 'Orbital Mechanics',
                metaphors: {
                    scientific: [
                        { en: 'Lagrange Point', kr: '라그랑주 점' },
                        { en: 'Tidal Locking', kr: '조석 고정' },
                        { en: 'Binary Star System', kr: '쌍성계' },
                        { en: 'Gravitational Lensing', kr: '중력 렌즈 효과' },
                    ],
                    radical: [
                        { en: 'I Orbit You Whether I Want To or Not', kr: '원하든 원하지 않든 나는 너를 공전한다' },
                        { en: 'We Will Collide Eventually', kr: '우리는 결국 충돌한다' },
                        { en: 'Falling Is Not a Choice', kr: '떨어지는 것은 선택이 아니다' },
                    ],
                    surreal: [
                        { en: 'Two Moons with No Planet', kr: '행성 없는 두 개의 달' },
                        { en: 'Breathing in Orbit', kr: '궤도 위에서 호흡하기' },
                        { en: 'The Gravity Between Your Hands', kr: '양손 사이의 중력' },
                    ],
                    minimalist: [
                        { en: '↻ ↺', kr: '↻ ↺' },
                        { en: 'L₁', kr: 'L₁' },
                    ],
                },
                philosophies: [
                    "라그랑주 점이란 두 천체의 중력이 정확히 상쇄되어, 세 번째 물체가 영원히 정지할 수 있는 지점이다. 사랑은 두 존재 사이의 그런 불가능한 균형점을 찾는 행위다.",
                    "조석 고정—달이 항상 같은 면만 지구를 향하듯, 사랑에 빠진 두 존재는 서로의 중력에 의해 영원히 한 면만을 보여주게 된다.",
                ],
                statements: [
                    "본 작품은 궤도 역학의 쌍성계를 은유로 사용한다. 두 무용수는 공유된 질량 중심을 끊임없이 공전하며, 가까워질수록 궤도 붕괴의 위험도 커진다.",
                    "본 작품은 라그랑주 점—두 중력이 완벽히 상쇄되는 불가능한 균형의 지점—에서 '정지'의 의미를 탐구한다.",
                ],
            },
            'Longing': {
                domain: 'Optics & Wave Theory',
                metaphors: {
                    scientific: [
                        { en: 'Redshift', kr: '적색편이' },
                        { en: 'Focal Length of Absence', kr: '부재의 초점 거리' },
                        { en: 'Refraction Index', kr: '굴절률' },
                        { en: 'Parallax Error', kr: '시차 오차' },
                    ],
                    radical: [
                        { en: 'Looking at Where You Were', kr: '네가 있던 자리를 보고 있다' },
                        { en: 'The Light Arrives After You Leave', kr: '빛은 네가 떠난 뒤에 도착한다' },
                        { en: 'Still Setting the Table for Two', kr: '여전히 두 사람 분의 식탁을 차린다' },
                    ],
                    surreal: [
                        { en: "The Smell of a Color That Doesn't Exist", kr: '존재하지 않는 색의 냄새' },
                        { en: 'Listening to a Photograph', kr: '사진을 듣다' },
                        { en: 'Touching the Space Where Sound Was', kr: '소리가 있던 공간을 만지다' },
                    ],
                    minimalist: [
                        { en: '→     ←', kr: '→     ←' },
                        { en: 'z = ?', kr: 'z = ?' },
                    ],
                },
                philosophies: [
                    "적색편이(Redshift)란 멀어지는 천체의 빛이 붉게 변하는 현상이다. 그리움이란, 멀어지는 존재가 기억 속에서 색이 변해가는 것이다.",
                    "초점 거리(Focal Length)란 렌즈가 빛을 모아 상(像)을 맺는 거리다. 부재한 대상의 초점 거리는 무한대이며, 그래서 그 이미지는 영원히 맺히지 않는다.",
                ],
                statements: [
                    "본 작품은 적색편이—멀어지는 별의 빛이 붉게 변해가는 현상—을 통해, 시간에 의해 변형되는 기억의 광학적 왜곡을 무대 위에 투사한다.",
                ],
            },
            'Anxiety': {
                domain: 'Signal Processing',
                metaphors: {
                    scientific: [
                        { en: 'Feedback Loop', kr: '피드백 루프' },
                        { en: 'White Noise at 2:00 AM', kr: '새벽 2시의 백색소음' },
                        { en: 'Signal-to-Noise Ratio', kr: '신호 대 잡음비' },
                        { en: 'Frequency Distortion', kr: '주파수 왜곡' },
                    ],
                    radical: [
                        { en: "Can't Stop Counting", kr: '세는 것을 멈출 수 없다' },
                        { en: "My Hands Won't Be Still", kr: '손이 가만히 있지 않는다' },
                        { en: 'Everything Is Too Loud', kr: '모든 것이 너무 시끄럽다' },
                    ],
                    surreal: [
                        { en: 'Sweating From the Inside', kr: '안쪽에서 흘리는 땀' },
                        { en: 'The Clock Melts Upward', kr: '시계가 위로 녹는다' },
                        { en: 'Breathing Glass', kr: '유리를 호흡하다' },
                    ],
                    minimalist: [
                        { en: '~~~~~', kr: '~~~~~' },
                        { en: 'SNR < 0', kr: 'SNR < 0' },
                    ],
                },
                philosophies: [
                    "신호처리학에서 피드백 루프란 출력이 다시 입력으로 돌아가 끝없이 증폭되는 현상이다. 불안은 사고의 피드백 루프다.",
                    "SNR(신호 대 잡음비)이 0 이하가 되면 신호는 잡음에 매몰된다. 불안한 상태의 인간은 자기 목소리를 자기 안의 소음에서 구별할 수 없다.",
                ],
                statements: [
                    "본 작품은 신호처리학의 피드백 루프를 은유로 사용하여, 불안이 어떻게 자기 자신을 연료로 삼아 끝없이 증폭되는지를 무용수의 반복 동작과 점진적 붕괴로 가시화한다.",
                ],
            },
            'Loss': {
                domain: 'Archaeology & Geology',
                metaphors: {
                    scientific: [
                        { en: 'Half-Life', kr: '반감기' },
                        { en: 'Fossil Record', kr: '화석 기록' },
                        { en: 'Erosion Rate', kr: '침식률' },
                        { en: 'Stratigraphy of the Missing', kr: '결여의 지층학' },
                    ],
                    radical: [
                        { en: 'The Drawer Is Still Full of Your Things', kr: '서랍에 아직 네 물건이 있다' },
                        { en: 'The Bed Still Remembers Your Weight', kr: '침대가 아직 너의 무게를 기억한다' },
                        { en: 'We Are All Becoming Sediment', kr: '우리는 모두 퇴적물이 되어가고 있다' },
                    ],
                    surreal: [
                        { en: 'Excavating a Fingerprint', kr: '지문을 발굴하다' },
                        { en: 'The Fossil of a Conversation', kr: '대화의 화석' },
                        { en: 'Dust That Used to Be a Hand', kr: '손이었던 먼지' },
                    ],
                    minimalist: [
                        { en: 't½', kr: 't½' },
                        { en: '−1', kr: '−1' },
                        { en: '___', kr: '___' },
                    ],
                },
                philosophies: [
                    "반감기(Half-Life)란 방사성 물질이 원래 양의 절반으로 붕괴하는 데 걸리는 시간이다. 상실에도 반감기가 있다—단, 영(零)에 수렴할 뿐 결코 도달하지 않는다.",
                    "지질학에서 침식은 단일 사건이 아니라 수백만 년에 걸친 미세한 반복이다. 상실도 그렇다—한 번에 무너지는 것이 아니라, 매일 조금씩 닳아 없어진다.",
                ],
                statements: [
                    "본 작품은 방사성 반감기를 은유로 사용하여, 상실이 어떻게 시간의 함수로 작동하는지—절대로 0에 도달하지 않지만 끝없이 줄어드는—를 무용수의 점진적 소멸로 형상화한다.",
                ],
            },
            'Tension': {
                domain: 'Structural Engineering',
                metaphors: {
                    scientific: [
                        { en: 'Load-Bearing Wall', kr: '내력벽' },
                        { en: 'Yield Point', kr: '항복점' },
                        { en: 'Stress Fracture', kr: '피로 골절' },
                        { en: 'Compression Failure', kr: '압축 파괴' },
                    ],
                    radical: [
                        { en: 'Something Is About to Break', kr: '무언가 부러지려 하고 있다' },
                        { en: 'Hold Your Breath', kr: '숨을 참아라' },
                        { en: 'The Room Is Getting Smaller', kr: '방이 점점 좁아지고 있다' },
                    ],
                    surreal: [
                        { en: 'The Floor Is Holding Its Breath', kr: '바닥이 숨을 참고 있다' },
                        { en: 'Silence With Teeth', kr: '이빨이 달린 침묵' },
                        { en: 'Architecture Made of Anger', kr: '분노로 만든 건축' },
                    ],
                    minimalist: [
                        { en: '━━━━━×', kr: '━━━━━×' },
                        { en: 'σ > σy', kr: 'σ > σy' },
                    ],
                },
                philosophies: [
                    "구조공학에서 항복점(Yield Point)이란 재료가 탄성 한계를 넘어 영구 변형이 시작되는 지점이다. 인간 관계의 긴장도 이 지점을 가진다—한번 넘으면 원래로 돌아갈 수 없다.",
                ],
                statements: [
                    "본 작품은 구조공학의 응력-변형 곡선을 인간 관계에 적용한다. 무용수들의 신체는 점점 증가하는 하중 아래에서 탄성 한계에 도달한 뒤 영구히 변형된다.",
                ],
            },
            'Despair': {
                domain: 'Mathematics / Set Theory',
                metaphors: {
                    scientific: [
                        { en: 'Asymptote', kr: '점근선' },
                        { en: 'The Limit Approaching Zero', kr: '0에 수렴하는 극한' },
                        { en: 'Empty Set', kr: '공집합' },
                    ],
                    radical: [
                        { en: 'The Exit Is Painted On', kr: '출구는 그려진 것이다' },
                        { en: 'I Can See the Bottom', kr: '바닥이 보인다' },
                    ],
                    surreal: [
                        { en: 'Stairs That Only Go Down', kr: '내려가기만 하는 계단' },
                        { en: 'A Map With No Edges', kr: '가장자리 없는 지도' },
                    ],
                    minimalist: [
                        { en: 'lim → 0', kr: 'lim → 0' },
                        { en: '∅', kr: '∅' },
                    ],
                },
                philosophies: [
                    "점근선(Asymptote)—함수가 끝없이 다가가지만 결코 닿지 못하는 선. 절망이란 구원의 점근선 위에서 영원히 접근만 하는 상태다.",
                ],
                statements: [
                    "본 작품은 수학의 점근선 개념을 통해, 결코 도달할 수 없는 것을 향해 무한히 다가가는 절망의 역학을 신체로 구현한다.",
                ],
            },
            'Hope': {
                domain: 'Chemistry / Phase Transition',
                metaphors: {
                    scientific: [
                        { en: 'Supersaturation', kr: '과포화' },
                        { en: 'Crystallization Point', kr: '결정화 지점' },
                        { en: 'Phase Transition', kr: '상전이' },
                    ],
                    radical: [
                        { en: 'Not Yet, But Almost', kr: '아직은 아니지만, 거의' },
                        { en: 'One Degree Before Boiling', kr: '끓기 1도 전' },
                    ],
                    surreal: [
                        { en: 'A Seed That Dreams of Concrete', kr: '콘크리트를 꿈꾸는 씨앗' },
                        { en: 'Light Arriving From a Dead Star', kr: '죽은 별에서 도착하는 빛' },
                    ],
                    minimalist: [
                        { en: '99°C', kr: '99°C' },
                        { en: '→', kr: '→' },
                    ],
                },
                philosophies: [
                    "과포화(Supersaturation)란 용액이 이론적 한계 이상의 용질을 품고 있는 불안정한 상태다. 희망은 그런 것이다—하나의 작은 충격이 전체를 결정으로 변환시킬 수 있는, 임계 직전의 충만.",
                ],
                statements: [
                    "본 작품은 화학적 과포화—한계 이상을 품은 불안정한 충만—을 통해, 희망이 폭발적 변화의 직전에 놓인 긴장임을 무대 위에 형상화한다.",
                ],
            },
            'Memory': {
                domain: 'Geology / Stratigraphy',
                metaphors: {
                    scientific: [
                        { en: 'Sediment Core', kr: '퇴적 코어' },
                        { en: 'Palimpsest', kr: '팔림프세스트' },
                        { en: 'Carbon Dating', kr: '탄소 연대 측정' },
                    ],
                    radical: [
                        { en: 'I Remember It Wrong Every Time', kr: '매번 다르게 기억한다' },
                        { en: 'The Photo Is Fading', kr: '사진이 바래고 있다' },
                    ],
                    surreal: [
                        { en: 'Excavating a Lullaby', kr: '자장가를 발굴하다' },
                        { en: 'The Taste of a Year', kr: '한 해의 맛' },
                    ],
                    minimalist: [
                        { en: '¹⁴C', kr: '¹⁴C' },
                        { en: '≈', kr: '≈' },
                    ],
                },
                philosophies: [
                    "지질학의 지층은 겹겹이 쌓인 시간의 물리적 기록이다. 기억도 그렇다—다만 지층과 달리, 위의 층이 아래의 층을 끊임없이 변형시킨다.",
                ],
                statements: [
                    "본 작품은 퇴적학의 레이어링을 차용하여, 몸에 켜켜이 쌓인 기억의 지층을 안무적 발굴로 한 겹씩 드러낸다.",
                ],
            },
        };
    }

    _getKeywordTranslation(keyword) {
        const map = {
            '슬픔': 'Sorrow', '기쁨': 'Joy', '분노': 'Fury', '고독': 'Solitude',
            '외로움': 'Loneliness', '사랑': 'Love', '그리움': 'Longing', '공포': 'Dread',
            '불안': 'Anxiety', '평화': 'Serenity', '희망': 'Hope', '절망': 'Despair',
            '우울': 'Melancholy', '환희': 'Ecstasy', '고요': 'Stillness', '혼돈': 'Chaos',
            '긴장': 'Tension', '이별': 'Departure', '만남': 'Encounter', '상실': 'Loss',
            '자유': 'Liberation', '속박': 'Confinement', '탄생': 'Genesis', '소멸': 'Extinction',
            '침묵': 'Silence', '폭발': 'Eruption', '균열': 'Fracture', '치유': 'Healing',
            '현대무용': 'Contemporary', '발레': 'Ballet', '힙합': 'Urban',
            '죽음': 'Death', '시간': 'Time', '기억': 'Memory', '꿈': 'Dream',
            '존재': 'Existence', '관계': 'Connection', '경계': 'Threshold', '중력': 'Gravity',
            '호흡': 'Breath', '빛': 'Light', '어둠': 'Darkness',
        };
        return map[keyword] || keyword;
    }

    _pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    _filterUsed(arr, recentTitles) {
        const filtered = arr.filter(t => !recentTitles.includes(t.en || t));
        return filtered.length > 0 ? filtered : arr;
    }

    _getSimilarDomain(keyword) {
        const sim = {
            'Loneliness': 'Solitude', 'Dread': 'Anxiety', 'Fury': 'Tension',
            'Melancholy': 'Sorrow', 'Ecstasy': 'Joy', 'Stillness': 'Solitude',
            'Chaos': 'Anxiety', 'Departure': 'Loss', 'Encounter': 'Love',
            'Liberation': 'Hope', 'Confinement': 'Tension', 'Genesis': 'Hope',
            'Extinction': 'Loss', 'Silence': 'Solitude', 'Eruption': 'Tension',
            'Fracture': 'Loss', 'Healing': 'Hope', 'Descent': 'Despair',
            'Resurrection': 'Hope', 'Drift': 'Longing', 'Awakening': 'Joy',
            'Death': 'Loss', 'Time': 'Memory', 'Dream': 'Hope',
            'Existence': 'Solitude', 'Connection': 'Love', 'Threshold': 'Tension',
            'Gravity': 'Love', 'Breath': 'Anxiety', 'Light': 'Joy', 'Darkness': 'Sorrow',
            'Contemporary': 'Tension', 'Urban': 'Tension', 'Serenity': 'Joy',
        };
        return sim[keyword] || 'Sorrow';
    }

    // ═══ STEP 1: Title Generator (Hammer-Hit v3.0) ═══
    async step1_TitleGenerator(input) {
        await new Promise(r => setTimeout(r, 600));

        const keywords = input.keywords || [];
        const cleanKw = (kw) => (kw || '').replace(/^#/, '').trim();
        const primaryKw = cleanKw(keywords[0]) || input.theme || '존재';
        const secondaryKw = cleanKw(keywords[1]) || input.mood || 'tension';
        const primaryEn = this._getKeywordTranslation(primaryKw);
        const secondaryEn = this._getKeywordTranslation(secondaryKw);

        const domainMap = this._getDomainCrossingMap();
        let domainData = domainMap[primaryEn] || domainMap[secondaryEn];
        if (!domainData) {
            domainData = domainMap[this._getSimilarDomain(primaryEn)] || domainMap[this._getSimilarDomain(secondaryEn)] || domainMap['Sorrow'];
        }

        const scientific = this._pickRandom(this._filterUsed(domainData.metaphors.scientific, this.recentTitles));
        const radical = this._pickRandom(this._filterUsed(domainData.metaphors.radical, this.recentTitles));
        const surreal = this._pickRandom(this._filterUsed(domainData.metaphors.surreal, this.recentTitles));
        const minimalist = this._pickRandom(this._filterUsed(domainData.metaphors.minimalist, this.recentTitles));

        console.log(`   🔨 HAMMER-HIT TITLES v3.0:
      Input: "${primaryKw}" → Domain: [${domainData.domain}]
      ⚗️ Scientific:  ${scientific.en} (${scientific.kr})
      🔪 Radical:     ${radical.en} (${radical.kr})
      🌀 Surreal:     ${surreal.en} (${surreal.kr})
      ▫️ Minimalist:  ${minimalist.en} (${minimalist.kr})`);

        return { 
            scientific, radical, surreal, minimalist,
            _domain: domainData.domain,
            _primaryEn: primaryEn,
            _secondaryEn: secondaryEn,
        };
    }

    // ═══ STEP 2: Concept Generator (Philosophy-First, Bilingual) ═══
    async step2_ConceptGenerator(input, titles) {
        await new Promise(r => setTimeout(r, 600));

        const domainMap = this._getDomainCrossingMap();
        const primaryEn = titles._primaryEn || 'Sorrow';
        const secondaryEn = titles._secondaryEn || 'Tension';
        
        let domainData = domainMap[primaryEn] || domainMap[secondaryEn];
        if (!domainData) {
            domainData = domainMap[this._getSimilarDomain(primaryEn)] || domainMap['Sorrow'];
        }

        // 확장된 철학 풀 — 도메인과 무관하게 다양한 시각 제공
        const philosophyPool = [
            { en: "The human body is simultaneously the most precise instrument and the most unreliable narrator. Dance is the moment these two truths collide.", kr: "인간의 신체는 동시에 가장 정밀한 악기이자 가장 신뢰할 수 없는 서술자다. 춤은 이 두 진실이 충돌하는 순간이다." },
            { en: "In thermodynamics, a system that cannot exchange heat with its surroundings reaches maximum entropy. Grief operates identically — isolation accelerates dissolution.", kr: "열역학에서 외부와 열 교환이 불가능한 계는 최대 엔트로피에 도달한다. 슬픔도 동일하게 작동한다 — 고립은 붕괴를 가속한다." },
            { en: "Mycorrhizal networks beneath the forest floor transmit chemical signals across kilometers. Movement between strangers on a stage follows the same invisible logic.", kr: "숲 바닥 아래의 균사체 네트워크는 수 킬로미터에 걸쳐 화학 신호를 전달한다. 무대 위 낯선 이들 사이의 움직임도 동일한 보이지 않는 논리를 따른다." },
            { en: "Quantum decoherence: the moment a particle becomes aware of being observed, its superposition collapses. The performer's paradox is identical — the act of being watched destroys what is being watched.", kr: "양자 결어긋남: 입자가 관측되고 있음을 인식하는 순간, 중첩 상태가 붕괴한다. 무용수의 역설도 동일하다 — 관찰받는 행위가 관찰받는 것을 파괴한다." },
            { en: "Architecture's negative space — the void framed by walls — is not emptiness but structured absence. Stillness in performance is architecture.", kr: "건축에서의 부정적 공간 — 벽으로 둘러싸인 빈 공간 — 은 공허함이 아니라 구조화된 부재다. 공연에서의 정지는 건축이다." },
            { en: "Geological strata record time in reverse: the deeper you dig, the older the truth. The body's movement catalog works identically — new gestures sediment over old ones.", kr: "지질 지층은 시간을 역순으로 기록한다: 깊이 팔수록 더 오래된 진실이 나온다. 신체의 동작 카탈로그도 동일하게 작동한다 — 새로운 제스처가 오래된 것 위에 퇴적된다." },
            { en: "Signal processing defines noise as any frequency that obscures the target signal. In performance, the body's 'noise' — breath, tremor, hesitation — is often the only honest signal.", kr: "신호 처리는 노이즈를 대상 신호를 가리는 모든 주파수로 정의한다. 공연에서 신체의 '노이즈' — 호흡, 떨림, 주저함 — 는 종종 유일하게 솔직한 신호다." },
            { en: "The Lagrange point between two gravitational bodies is a position of perfect equilibrium — where neither force dominates. Partnership in dance seeks this impossible balance.", kr: "두 중력체 사이의 라그랑주 지점은 완벽한 균형의 위치다 — 어느 쪽 힘도 지배하지 않는 곳. 춤에서의 파트너십은 이 불가능한 균형을 추구한다." },
            { en: "Fermentation transforms sugar into alcohol through the labor of invisible organisms over time. What we call 'emotion' in performance is grief or love that has been fermenting in the body for years.", kr: "발효는 시간에 걸쳐 보이지 않는 유기체의 작용으로 당을 알코올로 변환시킨다. 공연에서 우리가 '감정'이라 부르는 것은, 신체 안에서 수년간 발효되어 온 슬픔 혹은 사랑이다." },
            { en: "Set theory distinguishes between the infinite set of integers and the infinite set of real numbers — infinities can have different magnitudes. Not all emptiness is equal.", kr: "집합론은 정수의 무한 집합과 실수의 무한 집합을 구분한다 — 무한도 크기가 다를 수 있다. 모든 공허함이 동등하지는 않다." },
            { en: "Structural engineering calculates stress distribution across members to prevent single-point catastrophic failure. The ensemble protects its most vulnerable member through identical redistribution.", kr: "구조공학은 단일 지점의 파국적 붕괴를 막기 위해 부재에 걸리는 응력 분포를 계산한다. 앙상블은 동일한 재분배를 통해 가장 취약한 구성원을 보호한다." },
            { en: "The observer effect in quantum mechanics implies that measurement fundamentally alters the measured system. Every rehearsal that has ever occurred has already altered the performance being rehearsed.", kr: "양자역학의 관측자 효과는 측정이 측정 대상 시스템을 근본적으로 변경함을 의미한다. 지금까지 이루어진 모든 리허설은 이미 연습 중인 공연을 변형시켰다." },
        ];

        // 확장된 아티스틱 스테이트먼트 풀
        const statementPool = [
            { en: "This work excavates the thermodynamic cost of emotional labor — the heat generated by grief that has nowhere to dissipate.", kr: "이 작품은 감정 노동의 열역학적 비용을 발굴한다 — 흩어질 곳 없는 슬픔이 만들어내는 열." },
            { en: "The choreography refuses to illustrate grief. Instead, it demonstrates the physical mechanics of its weight distribution — how sorrow reorganizes the skeletal alignment of everyone in proximity.", kr: "이 안무는 슬픔을 묘사하기를 거부한다. 대신, 그 무게 분산의 물리적 역학을 시연한다 — 슬픔이 근처 모든 이의 골격 배열을 어떻게 재조직하는지." },
            { en: "Borrowing the methodology of archaeological stratigraphy, this work moves through time in reverse — beginning with the surface trauma and excavating toward the original site of formation.", kr: "고고학적 층서학의 방법론을 차용하여, 이 작품은 시간을 역방향으로 이동한다 — 표면의 상처에서 시작하여 형성의 원래 장소를 향해 발굴한다." },
            { en: "This piece proposes that longing is not a psychological state but a physical force with a direction and a magnitude. The body becomes the vector.", kr: "이 작품은 그리움이 심리적 상태가 아니라 방향과 크기를 가진 물리적 힘이라고 제안한다. 신체는 벡터가 된다." },
            { en: "Using the signal-to-noise ratio as choreographic structure: the work begins at maximum noise and ends at a silence that is not absence but pure signal.", kr: "신호 대 잡음비를 안무적 구조로 사용하여: 이 작품은 최대 노이즈에서 시작하고 부재가 아닌 순수한 신호인 침묵으로 끝난다." },
            { en: "The ensemble functions as a mycelial network — not a collection of individuals but a distributed organism making collective, subterranean decisions about resource allocation and survival.", kr: "앙상블은 균사체 네트워크로 기능한다 — 개인들의 집합이 아니라 자원 할당과 생존에 대한 집단적, 지하적 결정을 내리는 분산된 유기체." },
            { en: "Deconstructing the physics of the Lagrange point — this duet maps the exact moment when two gravitational bodies achieve equilibrium, and what must be sacrificed to maintain it.", kr: "라그랑주 지점의 물리학을 해체하며 — 이 2인무는 두 중력체가 평형을 달성하는 정확한 순간과, 그것을 유지하기 위해 무엇을 희생해야 하는지를 지도화한다." },
            { en: "The work investigates chemical phase transitions — the precise moment water becomes steam — as a model for understanding human transformation that is irreversible.", kr: "이 작품은 화학적 상전이 — 물이 증기가 되는 정확한 순간 — 를 되돌릴 수 없는 인간 변화를 이해하는 모델로 탐구한다." },
            { en: "Structural failure analysis in engineering identifies the critical load threshold. This choreography locates the body's equivalent threshold — the weight of memory it can carry before reorganizing.", kr: "공학의 구조 파괴 분석은 임계 하중 임계값을 식별한다. 이 안무는 신체의 동등한 임계값을 찾는다 — 재조직하기 전에 운반할 수 있는 기억의 무게." },
            { en: "Applying the mathematics of orbital decay: relationships do not end but rather spiral inward in increasingly compressed orbits until the final inertial collapse.", kr: "궤도 감쇠의 수학을 적용하여: 관계는 끝나지 않고, 최종 관성 붕괴까지 점점 더 압축된 궤도로 안쪽으로 나선을 그린다." },
        ];

        // ═══ 콩쿠르 모드: 심사위원 맞춤형 학술적 철학/의도 ═══
        if (this.isCompetition) {
            const compPhilosophyPool = [
                { en: "Drawing from Rudolf Laban's Effort Theory (1947), this work deconstructs the four motion factors — Weight, Space, Time, Flow — as independent variables in a controlled experiment on the body's resistance to emotional gravity.", kr: "루돌프 라반의 에포트 이론(1947)에 기반하여, 본 작품은 네 가지 동작 요인 — 무게, 공간, 시간, 흐름 — 을 감정적 중력에 대한 신체의 저항을 탐구하는 통제된 실험의 독립 변인으로 해체한다." },
                { en: "Informed by Doris Humphrey's 'Fall and Recovery' principle (The Art of Making Dances, 1959), this choreography maps the exact threshold between controlled descent and irreversible collapse — the moment the body surrenders to gravity and simultaneously defies it.", kr: "도리스 험프리의 '낙하와 회복(Fall and Recovery)' 원칙(The Art of Making Dances, 1959)에 입각하여, 본 안무는 제어된 하강과 비가역적 붕괴 사이의 정확한 임계점 — 신체가 중력에 항복하면서 동시에 중력을 거스르는 순간 — 을 지도화한다." },
                { en: "This work applies Irmgard Bartenieff's Fundamentals of movement (1980) to interrogate the somatic intelligence of the pelvis as the body's primary decision-making center, challenging the ocular-centric bias of Western performance evaluation.", kr: "본 작품은 이름가르트 바르테니에프의 움직임 기초(1980)를 적용하여 골반의 체감각적 지성을 신체의 주요 의사결정 중심으로 심문하며, 서양 공연 평가의 시각 중심적 편향에 도전한다." },
                { en: "Rooted in Merleau-Ponty's phenomenology of perception, this solo excavates the 'pre-reflective body' — movement that occurs before conscious intention, where the nervous system makes choreographic decisions the mind has not yet authorized.", kr: "메를로-퐁티의 지각의 현상학에 뿌리를 둔 이 솔로는 '전(前)반성적 신체' — 의식적 의도 이전에 발생하는 움직임, 신경계가 정신이 아직 승인하지 않은 안무적 결정을 내리는 지점 — 를 발굴한다." },
            ];
            const compStatementPool = [
                { en: "[Jury Statement] This work proposes a radical re-reading of Laban's Weight Effort: the performer does not 'use' weight but rather negotiates with gravitational force as a co-author. The 2-4 minute constraint is not a limitation but a compression chamber — every gesture carries the density of a full-length work.", kr: "[심사위원 진술] 본 작품은 라반의 무게 에포트에 대한 급진적 재해석을 제안합니다: 무용수는 무게를 '사용'하는 것이 아니라 중력을 공동 저자로서 협상합니다. 2~4분의 시간 제약은 한계가 아니라 압축 챔버입니다 — 모든 제스처가 전막 작품의 밀도를 담고 있습니다." },
                { en: "[Jury Statement] Structured around Humphrey's principle that 'the arc between two deaths is dance,' this work compresses the full lifecycle of a movement idea — from initiation through crisis to resolution — into a single, uninterrupted kinetic sentence of extreme technical and emotional demands.", kr: "[심사위원 진술] '두 죽음 사이의 호(arc)가 춤이다'라는 험프리의 원칙을 중심으로 구성된 본 작품은, 움직임 아이디어의 전체 생애 주기 — 시작에서 위기, 해소까지 — 를 극도의 테크닉과 감정적 요구를 담은 하나의 끊기지 않는 동역학적 문장으로 압축합니다." },
                { en: "[Jury Statement] This solo operates at the intersection of biomechanical precision and affective porosity — the performer's technical virtuosity is not displayed as an end but deployed as a vehicle for making the audience's proprioceptive system resonate at the frequency of the work's philosophical inquiry.", kr: "[심사위원 진술] 이 솔로는 생체역학적 정밀함과 정동적 다공성의 교차점에서 작동합니다 — 무용수의 기술적 기량은 그 자체가 목적이 아닌, 관객의 고유감각 시스템을 작품의 철학적 탐구 주파수에 공명시키기 위한 매개체로 배치됩니다." },
            ];
            const philosophy = this._pickRandom(compPhilosophyPool);
            const statement = this._pickRandom(compStatementPool);
            return { artisticPhilosophy: philosophy, artisticStatement: statement };
        }

        const philosophy = this._pickRandom(philosophyPool);
        const statement = this._pickRandom(statementPool);

        return { artisticPhilosophy: philosophy, artisticStatement: statement };
    }


    // ─── 내러티브 생성 (Chance Engine 적용) ───
    async step3_NarrativeBuilder(input, concept) {
        await new Promise(r => setTimeout(r, 600));

        // 🎲 역설(Paradox) 반영한 감정 곡선 변형
        const paradox = this.constraints?.paradox;
        let emotionCurveIntensities = [10, 35, 65, 100, 15]; // Default

        // ═══ 콩쿠르 모드: 극단적 대비 곡선 ═══
        if (this.isCompetition) {
            emotionCurveIntensities = [5, 15, 45, 100, 8]; // 바닥에서 시작 → 극단적 폭발 → 급냉각
        } else if (paradox?.id === 'stillness_paradox') {
            emotionCurveIntensities = [10, 55, 85, 5, 100]; // 절정에서 정적, 끝에서 폭발
        } else if (paradox?.id === 'inverted_tempo') {
            emotionCurveIntensities = [95, 60, 30, 10, 80]; // 시작이 가장 빠르고, 점차 느려짐
        } else if (paradox?.id === 'weight_contradiction') {
            emotionCurveIntensities = [5, 20, 100, 40, 70]; // 불규칙 파형
        }

        // 내러티브 풀 — 영한 쌍으로 다양하게 확장
        const introPool = [
            { en: "Bodies exist as isolated signals before the transmission begins. Stillness is not absence — it is maximum storage.", kr: "신체는 전송이 시작되기 전 고립된 신호로 존재한다. 정지는 부재가 아니다 — 그것은 최대 저장 상태다." },
            { en: "The performers arrive like developing photographs — form emerging from chemical uncertainty.", kr: "무용수들은 현상되는 사진처럼 등장한다 — 화학적 불확실성 속에서 형태가 드러난다." },
            { en: "Breath precedes form. The air thickens before the body arrives. Space is colonized by intention before movement.", kr: "호흡이 형태보다 먼저 도착한다. 신체가 오기 전 공기가 두꺼워진다. 공간은 움직임보다 먼저 의도에 의해 점령된다." },
            { en: "A seismic tremor before the fault slips. The audience feels it in their sternum before the eye confirms it.", kr: "단층이 미끄러지기 전의 지진 진동. 관객은 눈으로 확인하기 전에 흉골로 느낀다." },
            { en: "The stage is a petri dish. Organisms that do not yet know they are in the same ecosystem.", kr: "무대는 페트리 접시다. 아직 같은 생태계 안에 있다는 것을 모르는 유기체들." },
            { en: "Absolute zero equivalent — molecular motion approaches but never reaches complete stillness. The body vibrates at the threshold of perception.", kr: "절대영도에 상응하는 상태 — 분자 운동이 완전한 정지에 가까워지지만 결코 도달하지 않는다. 신체는 지각의 경계에서 진동한다." },
        ];
        const devPool = [
            { en: "Trajectories begin to interfere — overlapping frequencies generating constructive and destructive interference simultaneously.", kr: "궤적이 간섭하기 시작한다 — 겹치는 주파수가 보강 간섭과 소멸 간섭을 동시에 만들어낸다." },
            { en: "The gravitational fields overlap. Neither body can maintain its original orbit. New trajectories are negotiated in real time.", kr: "중력장이 겹친다. 어떤 신체도 원래 궤도를 유지할 수 없다. 새로운 궤적이 실시간으로 협상된다." },
            { en: "A fault line under stress — micro-fractures accumulate faster than they can heal. The rupture is not sudden; it was always happening.", kr: "압력을 받는 단층선 — 미세 균열이 아무는 것보다 빠르게 축적된다. 균열은 갑작스럽지 않다; 항상 일어나고 있었다." },
            { en: "Two incompatible operating systems attempting to share the same hardware. The body discovers syntax errors it cannot recover from.", kr: "동일한 하드웨어를 공유하려는 두 개의 호환되지 않는 운영 체제. 신체는 복구할 수 없는 구문 오류를 발견한다." },
            { en: "The mycelium is sending chemical distress signals. The forest is deciding which tree to abandon.", kr: "균사체가 화학적 조난 신호를 보내고 있다. 숲이 어느 나무를 포기할지 결정하고 있다." },
            { en: "Tidal forces begin to deform the smaller body. What was spherical becomes elongated, tidal-locked, unable to face away.", kr: "조석력이 더 작은 천체를 변형시키기 시작한다. 구형이었던 것이 길어지고, 조석 고정되며, 등을 돌릴 수 없게 된다." },
        ];
        const climaxPool = [
            { en: "Terminal velocity. The body has stopped accelerating not because it has slowed, but because the medium can no longer offer resistance.", kr: "종단 속도. 신체가 감속해서가 아니라 매질이 더 이상 저항을 제공할 수 없기 때문에 가속이 멈춘다." },
            { en: "Criticality: the exact moment a nuclear chain reaction becomes self-sustaining. Every body on stage is simultaneously the fissile material and the moderator.", kr: "임계점: 핵 연쇄 반응이 자기 지속적이 되는 정확한 순간. 무대 위 모든 신체는 동시에 핵분열 물질이자 감속재다." },
            { en: "The past and present perform simultaneously. Memory and present-tense share the same coordinates without canceling each other.", kr: "과거와 현재가 동시에 공연한다. 기억과 현재 시제가 서로를 없애지 않고 동일한 좌표를 공유한다." },
            { en: "The climax is silence. Not the silence before, but the silence that has been stripped of all potential for recovery.", kr: "절정은 침묵이다. 이전의 침묵이 아니라, 회복의 가능성이 모두 제거된 침묵." },
            { en: "Event horizon: the point beyond which no information can escape. What happens in the next thirty seconds cannot be transmitted to the audience. They must experience it without language.", kr: "사건의 지평선: 어떤 정보도 탈출할 수 없는 지점. 다음 30초 동안 일어나는 일은 관객에게 전달될 수 없다. 그들은 언어 없이 경험해야 한다." },
            { en: "The Compressed Knot reaches its maximum density. Something must be expelled. The question is whether it will be matter, energy, or memory.", kr: "압축된 매듭이 최대 밀도에 도달한다. 무언가가 배출되어야 한다. 질문은 그것이 물질인지, 에너지인지, 기억인지다." },
        ];
        const resPool = [
            { en: "Not silence but the acoustic shadow of movement. The room remembers the shape of sound that has just left it.", kr: "침묵이 아니라 움직임의 음향적 그림자. 방은 방금 떠난 소리의 형태를 기억한다." },
            { en: "The half-life of grief: it never fully decays, only becomes less measurable. The final stillness contains the full original dose — just distributed across more space.", kr: "슬픔의 반감기: 완전히 소멸하지 않고 측정하기 어려워질 뿐이다. 마지막 정지에는 전체 원래 용량이 담겨 있다 — 단지 더 많은 공간에 분산될 뿐이다." },
            { en: "The stage floor records thermal signatures of movement — friction ghosts that persist beyond the performance's duration.", kr: "무대 바닥은 움직임의 열적 서명을 기록한다 — 공연 시간을 넘어 지속되는 마찰의 유령들." },
            { en: "Sediment settles. What seemed violent was geological — the catastrophe of an afternoon compressed into three minutes.", kr: "침전물이 가라앉는다. 폭력적으로 보였던 것은 지질학적이었다 — 오후의 격변이 3분으로 압축된 것." },
            { en: "The performers leave but the relationships they created persist as invisible architecture — load-bearing voids.", kr: "무용수들은 떠나지만 그들이 만든 관계는 보이지 않는 건축물로 지속된다 — 하중을 지탱하는 공허." },
            { en: "Phase transition complete. What entered as solid has exited as gas. The theater holds the molecular memory of a transformation it cannot name.", kr: "상전이 완료. 고체로 들어온 것이 기체로 나갔다. 극장은 이름 붙일 수 없는 변환의 분자적 기억을 품고 있다." },
        ];

        // LMA 풀 — 영한 쌍으로 확장
        const lmaOptions = [
            { space: "Direct & Structured", weight: "Strong & Grounded", time: "Sudden & Erratic", flow: "Bound & Tense" },
            { space: "Indirect & Peripheral", weight: "Light & Suspended", time: "Sustained & Continuous", flow: "Free & Unrestricted" },
            { space: "Flexible & Organic", weight: "Heavy & Gravitational", time: "Quick & Staccato", flow: "Bound then Released" },
            { space: "Multi-Focus & Scattered", weight: "Alternating Strong-Light", time: "Decelerated & Suspended", flow: "Swinging & Oscillating" },
            { space: "Axial & Rotational", weight: "Weightless & Anti-gravity", time: "Polyrhythmic & Irregular", flow: "Fragmentary & Glitching" },
            { space: "Peripheral & Tracing", weight: "Micro-weighted & Precise", time: "Pulsing & Wave-like", flow: "Continuous & Liquid" },
            { space: "Central & Radiating", weight: "Counter-weighted & Opposing", time: "Irregular Suspension", flow: "Interrupted & Resumed" },
        ];

        const parseDuration = (dur) => {
            if (!dur) return 180;
            const str = dur.toString();
            if (str.includes(':')) {
                const [mm, ss] = str.split(':').map(Number);
                return (mm * 60) + (ss || 0);
            }
            return (parseInt(str) || 3) * 60;
        };

        const durationSec = parseDuration(input.duration);

        const formatT = (sec) => `${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2, '0')}`;

        return {
            intro: this._pickRandom(introPool),
            development: this._pickRandom(devPool),
            climax: this._pickRandom(climaxPool),
            resolution: this._pickRandom(resPool),
            emotionCurve: {
                labels: [
                    `${formatT(durationSec * 0)}(Intro)`, 
                    `${formatT(durationSec * 0.25)}(Dev)`, 
                    `${formatT(durationSec * 0.5)}(Conflict)`, 
                    `${formatT(durationSec * 0.75)}(Climax)`, 
                    `${formatT(durationSec)}(Res)`
                ],
                intensities: emotionCurveIntensities
            },
            lma: this._pickRandom(lmaOptions)
        };
    }

    // ─── 2D Flow Pattern (공간 디자인 강제 적용) ───
    async step4b_StageFlowGenerator(input, narrative) {
        const dancersCount = parseInt(input.dancersCount) || 5;
        const mood = input.mood?.toLowerCase() || "";
        const timeline = narrative?.timeline || [
            { id: 1, time: "0:00", stage: "Intro" },
            { id: 2, time: "1:30", stage: "Development" },
            { id: 3, time: "3:45", stage: "Climax" },
            { id: 4, time: "5:20", stage: "Resolution" },
            { id: 5, time: "7:00", stage: "Fade Out" }
        ];

        // ═══ 콩쿠르 모드: 정면(심사위원석) 지향 동선 ═══
        if (this.isCompetition) {
            console.log('   🏆 [COMPETITION FLOW] Front-facing diagonal spatial design');
            const { flow_pattern } = this._generateCompetitionFlow(timeline, dancersCount);
            return { flow_pattern };
        }

        const { flow_pattern } = generateFlowFromTimeline(timeline, dancersCount, mood, this.chanceEngine, this.constraints);
        return { flow_pattern };
    }

    /**
     * 콩쿠르 전용 2D 플로우 패턴 — Rule C: 심사위원석 정면 정향
     * 에너지가 후방(Backstage)에서 전방(Front/Downstage)으로 쏘아지는 사선 동선
     * + 정중앙(Center Stage) 깊은 활용
     */
    _generateCompetitionFlow(timeline, dancersCount) {
        const competitionFormations = [
            "Center Stage Anchor",      // 정중앙 고정 → 사선 확장
            "Downstage Diagonal Attack", // 후방 → 전방 사선 돌진
            "Backstage to Front Surge",  // 무대 뒤에서 앞으로 에너지 폭발
            "Front Triangle Lock",       // 정면 삼각형 고정 (심사위원 직격)
            "Spiral to Center",          // 나선형으로 센터 집중
        ];

        const compAnalysisPool = {
            "Center Stage Anchor": { en: "Maximum impact position: center stage utilization for jury eye-line dominance.", kr: "최대 임팩트 포지션: 심사위원 시선 지배를 위한 센터 스테이지 활용." },
            "Downstage Diagonal Attack": { en: "Diagonal attack vector from upstage to downstage — energy projected directly at jury.", kr: "업스테이지에서 다운스테이지로의 사선 공격 벡터 — 에너지가 심사위원에게 직접 투사." },
            "Backstage to Front Surge": { en: "Full-stage depth utilization: backstage initiation surging to front edge for maximum presence.", kr: "풀 스테이지 깊이 활용: 무대 후방에서 시작하여 전면 끝까지 돌진하는 최대 존재감." },
            "Front Triangle Lock": { en: "Triangular downstage lock formation — face the jury, split focus, maximize visual field coverage.", kr: "삼각형 다운스테이지 고정 대형 — 심사위원 정면, 시선 분할, 시각 필드 최대 커버." },
            "Spiral to Center": { en: "Centripetal spiral narrowing to exact center before explosive release outward.", kr: "정확한 센터로 좁아지는 구심적 나선 후 외향적 폭발 해방." },
        };

        const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        const flow_pattern = timeline.map((tItem, idx) => {
            const formation = pickRandom(competitionFormations);
            const stageName = typeof tItem.stage === 'object' ? tItem.stage.en : tItem.stage;
            const _progress = Math.floor((idx / (timeline.length - 1 || 1)) * 100);

            let dancers = [];
            for (let i = 0; i < dancersCount; i++) {
                let x = 50, y = 50;
                if (formation === 'Center Stage Anchor') {
                    // 센터 주변에 밀집, y값은 무대 중앙~전방(60~80)
                    x = 45 + (Math.random() * 10);
                    y = 55 + (Math.random() * 25);
                } else if (formation === 'Downstage Diagonal Attack') {
                    // 사선: 좌상→우하 또는 우상→좌하
                    const diag = Math.random() > 0.5;
                    x = diag ? 10 + (i / dancersCount) * 80 : 90 - (i / dancersCount) * 80;
                    y = 10 + (i / dancersCount) * 80;
                } else if (formation === 'Backstage to Front Surge') {
                    // 후방(y=10~20)에서 전방(y=75~90)으로
                    const progress = _progress / 100;
                    x = 30 + (Math.random() * 40);
                    y = 10 + progress * 70 + (Math.random() * 10);
                } else if (formation === 'Front Triangle Lock') {
                    // 정면 삼각형 — y 70~90, x 균등 분배
                    const positions = [[50, 75], [30, 85], [70, 85], [20, 90], [80, 90]];
                    const pos = positions[i % positions.length];
                    x = pos[0] + (Math.random() * 6 - 3);
                    y = pos[1] + (Math.random() * 5);
                } else {
                    // Spiral to Center
                    const angle = (i / dancersCount) * Math.PI * 2.5;
                    const dist = 35 - (idx / (timeline.length || 1)) * 25;
                    x = 50 + Math.cos(angle) * dist;
                    y = 60 + Math.sin(angle) * (dist * 0.7);
                }
                dancers.push({ id: i + 1, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) });
            }

            return {
                time: tItem.time,
                _progress,
                stage: stageName,
                formation,
                dancers,
                analysis: compAnalysisPool[formation] || { en: "Competition spatial pattern.", kr: "콩쿠르 공간 패턴." }
            };
        });

        return { flow_pattern };
    }

    generateFlowAnalysis(formation, mood) {
        const analysisPool = {
            "Diagonal Split": [
                "단절과 대립을 강조하는 대각선 분리 구도.",
                "서로 다른 시간대에 존재하는 듯한 사선의 단층.",
            ],
            "Unbalanced Cluster": [
                "불안정함과 심리적 압박을 표현하는 비정형 군집.",
                "중심 없는 군집 — 대화 없이 밀집된 고독의 형태.",
            ],
            "Explosive Scatter": [
                "순간적인 에너지 폭발을 시각화한 산개 대형.",
                "파편화된 기억이 퍼져나가는 듯한 공간 확장.",
            ],
            "Asymmetric V": [
                "비대칭적 리더십과 권력의 이동을 보여주는 V 포메이션.",
                "한 쪽으로 기울어진 전진의 방향성.",
            ],
            "Linear Exit": [
                "통제된 퇴장. 모든 미련을 단절시키는 직선적 구도.",
                "하나의 선으로 모여 증발하는 무용수들의 경로.",
            ],
            "Spiral Arm": [
                "소용돌이치는 에너지. 중심에서 외곽으로 확장되는 원형 감각.",
                "나선형 진화의 시각적 은유.",
            ],
            "Scattered Nuclei": [
                "다중 포커스. 무대 위 여러 개의 소규모 사건이 동시 다발적으로 발생.",
                "분열된 자아들의 파편적 대화 지점.",
            ],
            "Compressed Knot": [
                "극도의 밀집. 숨 쉴 공간조차 압축된 신체들의 얽힘.",
                "폭발 직전의 위태로운 매듭 상태.",
            ],
            "Tangential Lines": [
                "서로 만나지 않고 스쳐 지나가는 평행과 접선의 구도.",
                "영원히 교차하지 않는 관계의 철학.",
            ],
            "Concentric Orbits": [
                "태양계와 같은 동심원 궤도. 보이지 않는 중력에 결속된 움직임.",
                "반복적이고 운명적인 순환의 무대.",
            ]
        };
        const options = analysisPool[formation] || ["구조적 움직임의 패턴.", "공간의 기하학적 활용."];
        return options[Math.floor(Math.random() * options.length)];
    }

    // ─── Music Counterpoint Engine v2.0 — Doris Humphrey Principle ───
    // "Don't be a slave to music." The sound must counterpoint the body, not duplicate it.
    async step4_MusicAnalysis(input, narrative) {
        await new Promise(r => setTimeout(r, 600));

        // Backend-first advanced engine:
        // 1) Trend-aware query planning (RAG-ready)
        // 2) Anti-copycat filtering
        // 3) Spotify/YouTube retrieval
        try {
            const moodFromKeywords = Array.isArray(input.keywords) && input.keywords.length
                ? input.keywords.join(', ')
                : (input.mood || '');
            const response = await fetch(apiUrl('/api/music/recommend'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getPlanHeaders() },
                body: JSON.stringify({
                    theme: input.theme,
                    genre: input.genre,
                    mood: moodFromKeywords,
                    keywords: input.keywords || [],
                    duration: input.duration,
                    dancersCount: input.dancersCount,
                    narrative,
                    competitionMode: this.isCompetition,
                    isCompetition: this.isCompetition,
                    avoidArtists: ['Max Richter', 'Ludovico Einaudi', 'Hans Zimmer'],
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const recommendationBuckets = data?.recommendations;
                if (data?.ok !== false && recommendationBuckets && typeof recommendationBuckets === 'object') {
                    const orderedStrategies = ['trend', 'balanced', 'counterpoint'];
                    const flattenedTracks = orderedStrategies
                        .flatMap((strategyName) => (recommendationBuckets?.[strategyName] || []).slice(0, 1))
                        .filter(Boolean);
                    const trendRationale = data?.strategy?.trend?.rationale || '';
                    const balancedRationale = data?.strategy?.balanced?.rationale || '';
                    const counterpointRationale = data?.strategy?.counterpoint?.rationale || '';

                    return {
                        music_recommendations: flattenedTracks,
                        recommendations: recommendationBuckets,
                        strategy: data?.strategy || {},
                        acousticRationale: {
                            en: trendRationale || balancedRationale || 'Provider-based music recommendations aligned to the choreography.',
                            kr: trendRationale || balancedRationale || '안무 구조에 맞춰 외부 음악 추천을 정렬했습니다.',
                        },
                        style: 'Spotify + YouTube Curated Engine',
                        soundTexture: {
                            en: balancedRationale || trendRationale || 'Provider-driven music texture planning',
                            kr: balancedRationale || trendRationale || '프로바이더 기반 음악 텍스처 설계',
                        },
                        referenceArtists: '',
                        counterpointRule: counterpointRationale,
                        silenceInserted: false,
                    };
                }
            } else {
                console.warn('[MUSIC ANALYSIS] backend response not ok:', response.status);
            }
        } catch (error) {
            console.warn('[MUSIC ANALYSIS] backend unavailable; skipping legacy local library:', error);
        }

        if (this.isCompetition) {
            return {
                music_recommendations: [],
                recommendations: {},
                strategy: {},
                acousticRationale: {
                    en: 'Competition music providers are temporarily unavailable. Retry to fetch live Spotify and YouTube picks.',
                    kr: '콩쿠르 음악 프로바이더 결과를 아직 불러오지 못했습니다. 다시 시도하면 실시간 Spotify/YouTube 추천을 가져옵니다.',
                },
                style: 'Spotify + YouTube Curated Engine',
                soundTexture: {
                    en: 'Competition provider fallback',
                    kr: '콩쿠르 프로바이더 대기 상태',
                },
                referenceArtists: '',
                counterpointRule: '',
                silenceInserted: false,
            };
        }

        return {
            music_recommendations: [],
            recommendations: {},
            strategy: {},
            acousticRationale: {
                en: 'Provider-based music recommendations are temporarily unavailable.',
                kr: '현재 외부 음악 추천 결과를 불러오지 못했습니다.',
            },
            style: 'Spotify + YouTube Curated Engine',
            soundTexture: {
                en: 'Waiting for provider results',
                kr: '프로바이더 결과 대기 중',
            },
            referenceArtists: '',
            counterpointRule: '',
            silenceInserted: false,
        };

        const dur = parseInt(input.duration) || 5;
        const mood = (input.mood || "tension").toLowerCase();
        const lma = narrative?.lma || {};

        // ─── RULE 1: Counterpoint Mapping Table ───
        // 안무의 LMA 에너지 레벨을 판독하여, 정반대의 청각적 텍스처를 매핑한다.
        // Heavy, Bound, Sudden → Minimal, Sparse, Ambient
        // Light, Free, Sustained → Industrial, Dense, Percussive
        const isHeavy = (lma.weight || "").toLowerCase().includes("strong") ||
                        (lma.weight || "").toLowerCase().includes("heavy") ||
                        (lma.flow || "").toLowerCase().includes("bound");
        const isFast  = (lma.time || "").toLowerCase().includes("sudden") ||
                        (lma.time || "").toLowerCase().includes("quick");

        // ─── 대위법적 음악 큐레이션 풀 ───
        // 각 트랙은 예술적 의도(rationale)와 검색 쿼리(query)를 포함한다
        const counterpointLibrary = [
            // Category A: Heavy/Explosive 안무 → 역설적 정적/앰비언트
            {
                track_title: "Fragile Systems",
                artist: "Stars of the Lid",
                genre: "orchestral ambient drone",
                duration: "6:18",
                actual_audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
                album_art: `https://api.dicebear.com/7.x/shapes/svg?seed=fragile&backgroundColor=0d0a1c&shapeColor=5B13EC`,
                searchQuery: "Stars of the Lid orchestral ambient drone slow",
                rationale: {
                    en: "Doris Humphrey Rule 1 Applied — The choreography's explosive energy is intentionally countered by an immense, hovering orchestral drone. The sound does not energize; it witnesses. The audience's body holds the movement; the music holds the space.",
                    kr: "도리스 험프리 Rule 1 적용 — 안무의 폭발적 에너지를 역설적으로 거대하고 부유하는 오케스트라 드론으로 상쇄합니다. 음악은 에너지를 주지 않습니다; 그것은 목격합니다. 관객의 몸이 움직임을 품고, 음악이 공간을 품습니다."
                },
                bpm_timeline: [
                    { time: "0:00", stage: { en: "Suspension", kr: "부유" }, action: { en: "sonic stillness / body ignites", kr: "청각적 정지 / 신체 점화" } },
                    { time: "2:00", stage: { en: "Tension Field", kr: "긴장장" }, action: { en: "drone swells against violent gesture", kr: "드론 팽창, 격렬한 제스처에 역행" } },
                    { time: "4:30", stage: { en: "Witness", kr: "목격" }, action: { en: "full orchestral bloom — body freezes", kr: "오케스트라 개화 — 신체 정지" } },
                ],
                tags: ["ambient", "counterpoint", "heavy-body"]
            },
            {
                track_title: "Deleted",
                artist: "Deleted",
                genre: "neo-classical minimal piano",
                duration: "4:45",
                actual_audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                album_art: `https://api.dicebear.com/7.x/shapes/svg?seed=nils&backgroundColor=0d0a1c&shapeColor=6366f1`,
                searchQuery: "Nils Frahm neo-classical minimal piano solo ambient",
                rationale: {
                    en: "Each piano note lands as a single-point intervention — a geometric precision against the choreography's fluid, organic weight. Silence between notes becomes loadbearing architecture.",
                    kr: "각각의 피아노 음표는 단일 지점의 개입으로 착지합니다 — 안무의 유동적이고 유기적인 무게에 맞선 기하학적 정밀함. 음표 사이의 침묵이 하중을 지탱하는 건축이 됩니다."
                },
                bpm_timeline: [
                    { time: "0:00", stage: { en: "Arrival", kr: "도착" }, action: { en: "sparse piano enters — body is maximum density", kr: "희박한 피아노 진입 — 신체 최대 밀도" } },
                    { time: "1:40", stage: { en: "Counterpoint", kr: "대위" }, action: { en: "piano accelerates as body slows", kr: "피아노 가속, 신체 감속" } },
                    { time: "3:20", stage: { en: "Resolution", kr: "해소" }, action: { en: "final note sustains — dancers release", kr: "마지막 음 지속 — 무용수 해방" } },
                ],
                tags: ["piano", "minimal", "counterpoint"]
            },
            // Category B: Light/Free 안무 → 역설적 중압감/인더스트리얼
            {
                track_title: "Terminal Rust",
                artist: "Emptyset",
                genre: "industrial metallic percussion",
                duration: "5:22",
                actual_audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
                album_art: `https://api.dicebear.com/7.x/shapes/svg?seed=rust&backgroundColor=0d0a1c&shapeColor=ef4444`,
                searchQuery: "Emptyset industrial metallic percussion dark electronic harsh",
                rationale: {
                    en: "Rule 2 — Texture over Melody. Light, aerial choreography is deliberately anchored by low-frequency metallic percussion. The audience experiences cognitive dissonance: the body floats; the sound sinks. This gap is the work.",
                    kr: "Rule 2 — 멜로디보다 질감. 가볍고 공중적인 안무가 저주파 금속 타악기로 의도적으로 고정됩니다. 관객은 인지 부조화를 경험합니다: 몸은 떠오르고, 소리는 가라앉습니다. 이 간극이 작품입니다."
                },
                bpm_timeline: [
                    { time: "0:00", stage: { en: "Weight Inversion", kr: "무게 역전" }, action: { en: "heavy percussion enters — dancers levitate", kr: "무거운 타악 진입 — 무용수 공중 부양" } },
                    { time: "2:10", stage: { en: "Ground Zero", kr: "그라운드 제로" }, action: { en: "bass drop — aerial sequence peaks", kr: "베이스 드롭 — 공중 시퀀스 정점" } },
                    { time: "4:00", stage: { en: "Collapse", kr: "붕괴" }, action: { en: "industrial silence — bodies land", kr: "산업적 침묵 — 신체 착지" } },
                ],
                tags: ["industrial", "counterpoint", "light-body"]
            },
            {
                track_title: "For", // Jon Hopkins track
                artist: "Jon Hopkins",
                genre: "glitched electronic cinematic",
                duration: "5:00",
                actual_audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                album_art: `https://api.dicebear.com/7.x/shapes/svg?seed=jhopkins&backgroundColor=0d0a1c&shapeColor=0ea5e9`,
                searchQuery: "Jon Hopkins glitch ambient electronic cinematic dark",
                rationale: {
                    en: "A fractured electronic landscape where each glitch pulse corresponds inversely to the choreography's sustained breath. The body breathes out; the sound inhales. A living respiratory counterpoint.",
                    kr: "파편화된 전자 풍경에서 각각의 글리치 펄스는 안무의 지속된 호흡과 역으로 대응합니다. 몸이 내쉬면, 소리는 들이쉽니다. 살아있는 호흡의 대위법."
                },
                bpm_timeline: [
                    { time: "0:00", stage: { en: "Genesis", kr: "생성" }, action: { en: "static crackle — body breathes deep", kr: "정전기 잡음 — 신체 심호흡" } },
                    { time: "1:30", stage: { en: "Friction", kr: "마찰" }, action: { en: "glitch accelerates — sustained movement", kr: "글리치 가속 — 지속 움직임" } },
                    { time: "3:50", stage: { en: "Dissolution", kr: "용해" }, action: { en: "electronic fog — final stillness", kr: "전자적 안개 — 최종 정지" } },
                ],
                tags: ["glitch", "electronic", "cinematic"]
            },
            // Category C: Silence / Field Recording 레이어
            {
                track_title: "Factory Floor (Field Recording)",
                artist: "BJ Nilsen",
                genre: "industrial field recording drone",
                duration: "7:30",
                actual_audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
                album_art: `https://api.dicebear.com/7.x/shapes/svg?seed=factory&backgroundColor=0d0a1c&shapeColor=78716c`,
                searchQuery: "BJ Nilsen field recording industrial drone environmental",
                rationale: {
                    en: "Rule 3 — The Use of Everyday Noise. This soundscape intentionally places machine-breath and factory rhythm beneath the dance. The dancers become humans in an automated world: a documentary counterpoint that no melody can achieve.",
                    kr: "Rule 3 — 일상의 소음 활용. 이 사운드스케이프는 의도적으로 기계의 호흡과 공장의 리듬을 춤 아래에 배치합니다. 무용수들은 자동화된 세계 속 인간이 됩니다: 어떤 멜로디도 달성할 수 없는 다큐멘터리적 대위법."
                },
                bpm_timeline: [
                    { time: "0:00", stage: { en: "Ambience Layer", kr: "환경음 레이어" }, action: { en: "machine breath — human body enters", kr: "기계 호흡 — 인체 진입" } },
                    { time: "3:00", stage: { en: "Coexistence", kr: "공존" }, action: { en: "overlapping rhythms — organic vs mechanical", kr: "겹치는 리듬 — 유기체 대 기계" } },
                    { time: "6:00", stage: { en: "Silence Insert", kr: "침묵 삽입" }, action: { en: "complete silence (2 bars) — intentional void", kr: "완전한 침묵(2절) — 의도적 공백" } },
                ],
                tags: ["field-recording", "silence", "drone"]
            },
            {
                track_title: "Substrata",
                artist: "Biosphere",
                genre: "minimal drone ambient",
                duration: "6:00",
                actual_audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                album_art: `https://api.dicebear.com/7.x/shapes/svg?seed=substrata&backgroundColor=0d0a1c&shapeColor=059669`,
                searchQuery: "Biosphere substrata minimal ambient drone cold",
                rationale: {
                    en: "A sub-zero sonic environment that makes the body's warmth the most violent event on stage. The colder the sound, the more alive the dancer appears. Temperature as counterpoint.",
                    kr: "영하의 음향 환경은 신체의 온기를 무대 위 가장 폭력적인 사건으로 만듭니다. 소리가 차가울수록 무용수는 더 살아있어 보입니다. 온도로서의 대위법."
                },
                bpm_timeline: [
                    { time: "0:00", stage: { en: "Thermal Zero", kr: "열적 제로" }, action: { en: "arctic drone — body temperature rises", kr: "북극 드론 — 체온 상승" } },
                    { time: "2:30", stage: { en: "Pulse", kr: "맥박" }, action: { en: "subtle beat emerges — body responds", kr: "미묘한 비트 출현 — 신체 반응" } },
                    { time: "5:00", stage: { en: "Extinction", kr: "소멸" }, action: { en: "return to silence — memory of warmth", kr: "침묵으로 복귀 — 온기의 기억" } },
                ],
                tags: ["ambient", "drone", "counterpoint"]
            },
        ];

        // ─── RULE 1 대위법 필터링 ───
        // 안무가 Heavy/Fast면 → Ambient/Minimal 트랙 우선
        // 안무가 Light/Free면 → Industrial/Dense 트랙 우선
        let preferredTags = [];
        if (isHeavy || isFast) {
            preferredTags = ["ambient", "piano", "minimal", "drone"];
        } else {
            preferredTags = ["industrial", "glitch", "field-recording", "electronic"];
        }

        // 무드 기반 추가 필터
        if (mood.includes("sad") || mood.includes("슬")) preferredTags.push("counterpoint");
        if (mood.includes("tension") || mood.includes("긴장")) preferredTags.push("drone");
        if (mood.includes("joy") || mood.includes("기쁨")) preferredTags.push("industrial"); // 역설적 대위

        // 정렬: 선호 태그 매칭 개수 기준 내림차순
        const scored = counterpointLibrary.map(track => ({
            ...track,
            score: track.tags.filter(tag => preferredTags.includes(tag)).length + Math.random() * 0.5
        })).sort((a, b) => b.score - a.score);

        let trackCount = 2;
        if (dur <= 3) trackCount = 1;
        if (dur >= 30) trackCount = 3;

        const selected = scored.slice(0, trackCount);

        // ─── Acoustic Rationale (작품 전체 사운드 디자인 의도) ───
        const overallRationales = [
            {
                en: "Doris Humphrey declared: 'Dance is not a slave to music.' Applied here: the sonic environment creates deliberate friction against the movement — not harmony. The silence between phrases carries more weight than any note.",
                kr: "도리스 험프리는 선언했습니다: '춤은 음악의 노예가 아니다.' 여기에 적용: 음향 환경은 움직임에 의도적 마찰을 만들 뿐, 조화를 만들지 않습니다. 악절 사이의 침묵이 어떤 음표보다 더 무겁습니다."
            },
            {
                en: "The selected soundscape operates as a shadow choreography — an acoustic body that moves in the opposite direction of the dancer. When the dancer ascends, the sound descends. When the body contracts, the frequency expands.",
                kr: "선택된 사운드스케이프는 그림자 안무로 작동합니다 — 무용수의 반대 방향으로 움직이는 음향 신체. 무용수가 상승하면 소리는 하강합니다. 신체가 수축하면 주파수는 확장됩니다."
            },
            {
                en: "Silence is the most radical choice. Three intentional voids have been placed within the timeline: moments where the audience must listen to the sound of their own breathing — and realize they have been holding it.",
                kr: "침묵이 가장 급진적인 선택입니다. 타임라인 내에 세 개의 의도적 공백이 배치되었습니다: 관객이 자신의 호흡 소리를 들어야 하는 순간들 — 그리고 자신이 숨을 참고 있었다는 것을 깨닫는 순간."
            },
            {
                en: "The Music Analysis Engine applied Abstract & Counterpoint Mapping: choreography read as high-energy and gravitational; therefore the sonic palette was inverted toward extreme minimalism and negative space.",
                kr: "음악 분석 엔진이 추상 & 대위법 매핑을 적용했습니다: 안무는 고에너지이자 중력적으로 판독되었습니다; 따라서 음향 팔레트는 극단적 미니멀리즘과 네거티브 스페이스로 역전되었습니다."
            },
        ];

        // ─── Sound Texture Pool (업그레이드) ───
        const soundTextures = [
            { en: "Sub-bass drone layered with reversed granular breath samples — the sound breathes inversely to the dancer", kr: "서브 베이스 드론 + 역방향 그레인 호흡 샘플 레이어 — 소리가 무용수와 반대로 호흡" },
            { en: "Metallic percussion field recordings with micro-silence insertions every 30 seconds", kr: "금속 타악 현장 녹음 + 30초마다 마이크로 침묵 삽입" },
            { en: "Glitched piano textures (pitch-shifted -24 semitones) against sustained high-frequency sine tones", kr: "글리치 피아노 텍스처 (피치 -24반음) + 지속되는 고주파 사인파" },
            { en: "White noise swell architecture — silence occupies 40% of the timeline as structural load-bearing element", kr: "화이트 노이즈 스웰 구조 — 침묵이 타임라인의 40%를 구조적 하중 요소로 점유" },
            { en: "Industrial field recording with algorithmic micro-stutter rhythm — simulating machine heartbeat", kr: "산업용 현장 녹음 + 알고리즘 마이크로스터터 리듬 — 기계 심장박동 시뮬레이션" },
        ];

        // ═══ 콩쿠르 모드: Rule D — 독특한 질감의 음악 전략 ═══
        if (this.isCompetition) {
            const compMusicRationale = [
                {
                    en: "[Competition Music Strategy] AVOID: predictable piano accompaniment. DEPLOY: textural electronic elements with absolute silence at climax. When the music drops to zero, the dancer's body becomes the only instrument — this is when the jury evaluates raw technique.",
                    kr: "[콩쿠르 음악 전략] 회피: 예측 가능한 피아노 반주. 적용: 절정부에서 절대 침묵을 활용한 텍스처 전자음. 음악이 제로로 떨어지면 무용수의 신체가 유일한 악기가 됩니다 — 이것이 심사위원이 순수 기량을 평가하는 순간입니다."
                },
                {
                    en: "[Competition Music Strategy] Use the body as percussion. Three percussive silence breaks within 3 minutes weaponize the performer's breath and footfalls as the dominant sonic texture. The jury hears effort.",
                    kr: "[콩쿠르 음악 전략] 신체를 타악기로 사용합니다. 3분 안에 세 번의 타악적 침묵 구간이 무용수의 호흡과 발소리를 지배적 음향 텍스처로 무기화합니다. 심사위원은 노력을 듣습니다."
                },
            ];
            return {
                music_recommendations: [],
                acousticRationale: this._pickRandom(compMusicRationale),
                style: "Competition Tactical Counterpoint",
                soundTexture: { en: "Textural electronic with strategic silence insertions at climax — body as percussion instrument. No predictable piano.", kr: "절정부 전략적 침묵 삽입이 있는 텍스처 전자음 — 신체가 타악기. 예측 가능한 피아노 배제." },
                referenceArtists: '',
                counterpointRule: "",
                silenceInserted: false,
            };
        }

        return {
            music_recommendations: [],
            acousticRationale: '',
            style: '',
            soundTexture: '',
            referenceArtists: '',
            counterpointRule: '',
            silenceInserted: false,
        };
    }

    // ─── Timing Engine (Chance Device 적용) ───
    async step4c_TimingEngineGenerator(input, narrative) {
        await new Promise(r => setTimeout(r, 800));
        
        const parseDuration = (dur) => {
            if (!dur) return 180;
            const str = dur.toString();
            if (str.includes(':')) {
                const [mm, ss] = str.split(':').map(Number);
                return (mm * 60) + (ss || 0);
            }
            return (parseInt(str) || 3) * 60;
        };

        const totalSeconds = parseDuration(input.duration);

        // ═══ 콩쿠르 모드: Rule B — 15초 도입 + 극단적 대비 타임라인 ═══
        let introEnd, devEnd, climaxEnd;
        if (this.isCompetition) {
            introEnd = Math.min(15, Math.floor(totalSeconds * 0.08)); // 최대 15초 도입
            devEnd = Math.floor(totalSeconds * 0.45);  // 빠른 전개
            climaxEnd = Math.floor(totalSeconds * 0.80); // 긴 절정 (기량 과시 구간)
        } else {
            introEnd = Math.floor(totalSeconds * 0.2);
            devEnd = Math.floor(totalSeconds * 0.55);
            climaxEnd = Math.floor(totalSeconds * 0.85);
        }
        
        // v2.0: 확장된 바이링구얼 무브먼트 라이브러리
        const movements = [
            { en: "walk", kr: "걷기" },
            { en: "fall", kr: "낙하" },
            { en: "contraction", kr: "수축" },
            { en: "release", kr: "이완" },
            { en: "spiral", kr: "나선형 움직임" },
            { en: "turn", kr: "회전" },
            { en: "jump", kr: "점프" },
            { en: "lift", kr: "리프트" },
            { en: "floor movement", kr: "플로어 동작" },
            { en: "stillness", kr: "정지" },
            { en: "slow spiral turn", kr: "느린 나선형 회전" },
            { en: "sudden collapse", kr: "급작스러운 붕괴" },
            { en: "controlled fall", kr: "제어된 낙하" },
            { en: "expanding arm gesture", kr: "확장되는 팔 동작" },
            // v2.0 추가
            { en: "weight transfer through pelvis", kr: "골반을 통한 무게 이동" },
            { en: "axial suspension", kr: "축 방향 서스펜션" },
            { en: "off-balance lean", kr: "불균형 기울기" },
            { en: "sequential spine undulation", kr: "순차적 척추 율동" },
            { en: "peripheral reach & retract", kr: "말단 뻗기 및 회수" },
            { en: "grounded rebound", kr: "접지 반동" },
        ];
        
        const getRandomMv = () => movements[Math.floor(Math.random() * movements.length)];
        
        let eventCount = 8;
        if (totalSeconds >= 300) eventCount = 14;
        
        const timelineItems = [];
        const formatTime = (secs) => `${Math.floor(secs/60)}:${(secs%60).toString().padStart(2, '0')}`;
        
        // 동작 질감(Movement Quality) 추천 풀 — 느낌/텍스처 기반
        const qualityPool = [
            { en: "Recommend: heavy, waterlogged gestures. As if each limb is dragging through a medium denser than air. Let gravity be an active collaborator.", kr: "추천 동작 질감: 무겁고 물에 젖은 제스처. 마치 각 사지가 공기보다 밀도 높은 매질을 통과하는 것처럼. 중력을 능동적인 협력자로 삼으세요." },
            { en: "Recommend: glass-smooth and then suddenly granular. Alternate between frictionless glides and abrupt, sand-textured stops. No gradual transitions.", kr: "추천 동작 질감: 유리처럼 매끄럽다가 갑자기 거칠어지는 질감. 마찰 없는 미끄러짐과 갑작스러운 모래 질감의 정지를 교대하세요. 점진적 전환은 없습니다." },
            { en: "Recommend: vibrating stillness. The body should appear motionless to the audience while internally trembling at a frequency just below visual detection.", kr: "추천 동작 질감: 진동하는 정지. 신체는 관객에게 정지처럼 보여야 하지만 내부적으로는 시각적 감지 한계 바로 아래의 주파수로 떨고 있어야 합니다." },
            { en: "Recommend: delayed momentum. Let the intention travel through the spine before the limb executes. Every gesture should arrive one beat after the decision to make it.", kr: "추천 동작 질감: 지연된 모멘텀. 사지가 실행하기 전에 의도가 척추를 통과하게 하세요. 모든 제스처는 만들기로 결정한 후 한 박자 늦게 도착해야 합니다." },
            { en: "Recommend: brittle precision. Movements that are geometrically exact but could shatter at any point. Think crystalline structure under extreme pressure.", kr: "추천 동작 질감: 부서지기 쉬운 정밀함. 기하학적으로 정확하지만 언제든 산산조각날 수 있는 움직임. 극도의 압력 아래 있는 결정 구조를 생각하세요." },
            { en: "Recommend: conductive warmth spreading from point of contact outward. Touch generates heat that visibly affects the receiving body.", kr: "추천 동작 질감: 접촉 지점에서 외부로 퍼지는 전도성 온기. 접촉이 열을 만들고 그 열이 받는 신체에 눈에 띄게 영향을 미칩니다." },
            { en: "Recommend: tidal — pulled by something off-stage, unseen. Movement driven by an external gravity the audience cannot source but can feel.", kr: "추천 동작 질감: 조석 — 무대 밖의 보이지 않는 무언가에 끌리는. 관객이 출처는 알 수 없지만 느낄 수 있는 외부 중력에 의해 구동되는 움직임." },
            { en: "Recommend: fermented weight — movement that carries the residue of everything that came before it. Nothing is fresh; everything is loaded.", kr: "추천 동작 질감: 발효된 무게 — 이전의 모든 것의 잔류물을 담은 움직임. 어떤 것도 신선하지 않고; 모든 것이 무게를 담고 있습니다." },
            { en: "Recommend: static interference — movement that is clear and then disrupted by an invisible signal. Glitch the clean line before completing it.", kr: "추천 동작 질감: 정적 간섭 — 명확하다가 보이지 않는 신호에 의해 방해받는 움직임. 깨끗한 선을 완성하기 전에 글리치를 넣으세요." },
            { en: "Recommend: sedimentary layering — let each gesture deposit on top of the previous one without erasing it. The body becomes an archive of its own movement history.", kr: "추천 동작 질감: 퇴적층 쌓기 — 각 제스처가 이전 것을 지우지 않고 위에 퇴적되게 하세요. 신체는 자신의 움직임 역사의 기록이 됩니다." },
        ];

        const introDescPool_en = [
            "Performers approach slowly, establishing the spatial atmosphere.",
            "Bodies materialize from the periphery like developing photographs.",
            "Breath precedes form — the air thickens before the body arrives.",
            "The body is present before it moves. Presence is its own choreography.",
            "Stillness as maximum information density. The audience reads everything before a single movement occurs.",
        ];
        const introDescPool_kr = [
            "무용수들이 천천히 다가오며 무대의 공간적 분위기를 설정합니다.",
            "현상 사진처럼 가장자리에서부터 서서히 형체가 드러납니다.",
            "호흡이 형태보다 먼저 도착합니다 — 신체가 오기 전 공기가 두꺼워집니다.",
            "신체는 움직이기 전에 이미 존재합니다. 존재 자체가 안무입니다.",
            "최대 정보 밀도로서의 정지. 단 하나의 움직임이 일어나기 전에 관객은 모든 것을 읽습니다.",
        ];
        const devDescPool_en = [
            "The movement becomes more erratic, expanding into larger spatial gestures with tension.",
            "Trajectories begin to interfere — like overlapping radio frequencies creating static.",
            "Proximity creates friction. Not warmth, but the heat of tectonic plates grinding.",
            "The choreography develops a grammar — then immediately begins violating its own rules.",
            "Bodies negotiate the same space without sharing the same time signature.",
        ];
        const devDescPool_kr = [
            "움직임이 다소 불규칙해지며, 긴장감과 함께 더 넓은 공간적 제스처로 확장됩니다.",
            "궤적이 간섭하기 시작합니다 — 겹치는 라디오 주파수가 노이즈를 만드는 것처럼.",
            "근접성이 마찰을 만듭니다. 온기가 아닌, 지각판이 부딪히는 열입니다.",
            "안무는 문법을 발전시킨다 — 그리고 즉시 자신의 규칙을 위반하기 시작한다.",
            "신체들은 같은 박자 서명 없이 같은 공간을 협상한다.",
        ];
        const climaxDescPool_en = [
            "High energy release. Dancers utilize full physical limits, engaging in dynamic floorwork.",
            "The body's structural integrity fails. Joints become hinges swinging in impossible arcs.",
            "Terminal velocity — movement accelerates beyond control, momentum becomes the choreographer.",
            "Criticality achieved. The performance cannot be stopped now — it must run to completion.",
            "The climax is not a peak but a collapse. The highest point was three cues ago.",
        ];
        const climaxDescPool_kr = [
            "고에너지의 해소. 신체의 물리적 한계를 활용하며 역동적인 움직임을 전개합니다.",
            "신체의 구조적 일체감이 무너집니다. 관절이 불가능한 호를 그리는 경첩이 됩니다.",
            "종단 속도 — 제어를 넘어 가속하며, 모멘텀 자체가 안무가가 됩니다.",
            "임계점 달성. 이제 공연은 멈출 수 없다 — 완료될 때까지 실행되어야 한다.",
            "절정은 최고점이 아니라 붕괴다. 가장 높은 지점은 세 큐 전이었다.",
        ];
        const resDescPool_en = [
            "Energy dissipates. Bodies return to a state of stillness, mirroring the start.",
            "What remains is not silence, but the acoustic shadow of movement.",
            "The stage remembers what the body forgets — traces of friction, thermal ghosts.",
            "Settling, like sediment. The violence was geological — the catastrophe of an afternoon compressed into minutes.",
            "The performers are leaving. What they built between them remains as invisible architecture.",
        ];
        const resDescPool_kr = [
            "에너지가 흩어집니다. 시작과 마찬가지로 신체는 다시 정적인 상태로 돌아갑니다.",
            "남겨진 것은 침묵이 아니라, 움직임의 음향적 그림자입니다.",
            "무대가 신체가 잊는 것을 기억합니다 — 마찰의 흔적, 열의 잔상.",
            "침전물처럼 가라앉습니다. 폭력은 지질학적이었다 — 오후의 격변이 몇 분으로 압축된 것.",
            "무용수들이 떠나고 있습니다. 그들 사이에 구축한 것은 보이지 않는 건축물로 남습니다.",
        ];

        for (let i = 0; i < eventCount; i++) {
            const timeSec = Math.floor((totalSeconds / eventCount) * i);
            let stageEn = "Intro";
            let stageKr = "도입";
            
            if (timeSec >= climaxEnd) { stageEn = "Resolution"; stageKr = "종결"; }
            else if (timeSec >= devEnd) { stageEn = "Climax"; stageKr = "절정"; }
            else if (timeSec >= introEnd) { stageEn = "Development"; stageKr = "전개"; }
            
            let action = { en: "", kr: "" };
            let description = { en: "", kr: "" };
            const m = getRandomMv();
            
            if (stageEn === "Intro") {
                if (this.isCompetition) {
                    // Rule B: 바닥 밀착 그라운드 워크로 15초 이내 시선 끌기
                    action = i === 0 
                        ? { en: "Ground work floor entry (15s impact)", kr: "그라운드 워크 플로어 입장 (15초 임팩트)" }
                        : { en: `Floor-contact ${m.en}`, kr: `바닥 밀착 ${m.kr}` };
                    description = {
                        en: "[Competition: Rule B] Full floor contact entry — capture jury attention within first 15 seconds through extreme grounded physicality. Body pressed into stage surface, creating immediate visual contrast for the vertical explosion to follow.",
                        kr: "[콩쿠르: Rule B] 완전한 바닥 밀착 입장 — 첫 15초 안에 극도의 접지된 신체성으로 심사위원의 시선을 사로잡습니다. 신체가 무대 표면에 밀착되어, 이후 수직 폭발과의 즉각적 시각 대비를 만듭니다."
                    };
                } else if (i === 0) {
                    action = { en: "Slow walking entrance", kr: "천천히 걸어나오는 입장" };
                } else {
                    action = { en: `Stillness & ${m.en}`, kr: `정적 및 ${m.kr}` };
                }
                if (!this.isCompetition) {
                    const idx = Math.floor(Math.random() * introDescPool_en.length);
                    description = { en: introDescPool_en[idx], kr: introDescPool_kr[idx] };
                }
            } else if (stageEn === "Development") {
                action = { en: `First interaction, ${m.en}`, kr: `첫 번째 상호작용 및 ${m.kr}` };
                const idx = Math.floor(Math.random() * devDescPool_en.length);
                description = { en: devDescPool_en[idx], kr: devDescPool_kr[idx] };
            } else if (stageEn === "Climax") {
                const m2 = getRandomMv();
                if (this.isCompetition) {
                    // Rule B: 기술적 기량 과시 — 도약, 회전, 극단적 비대칭
                    const virtuosoMoves = [
                        { en: "explosive aerial jump", kr: "폭발적 공중 도약" },
                        { en: "triple pirouette", kr: "트리플 피루엣" },
                        { en: "grand jeté with extreme extension", kr: "극단적 익스텐션의 그랑 주테" },
                        { en: "fouetté series into asymmetric freeze", kr: "푸에테 시리즈 → 비대칭 프리즈" },
                        { en: "axial spin into controlled collapse", kr: "축 회전 → 제어된 붕괴" },
                    ];
                    const v = this._pickRandom(virtuosoMoves);
                    action = { en: `${v.en} → ${m2.en}`, kr: `${v.kr} → ${m2.kr}` };
                    description = {
                        en: "[Competition: Rule B — Technical Virtuosity] This segment MUST showcase explosive jumps, turns, or extreme asymmetry. LMA Effort shifts from sustained/heavy to sudden/light in a single phrase. The jury evaluates peak technique here.",
                        kr: "[콩쿠르: Rule B — 기술적 기량 과시] 이 구간은 반드시 폭발적 도약, 회전, 또는 극단적 비대칭을 선보여야 합니다. LMA 에포트가 하나의 프레이즈 안에서 지속적/무거움에서 갑작스러움/가벼움으로 전환됩니다. 심사위원이 이 구간에서 최고 기량을 평가합니다."
                    };
                } else {
                    action = { en: `Explosive ${m.en} & ${m2.en}`, kr: `폭발적인 ${m.kr} 및 ${m2.kr}` };
                    const idx = Math.floor(Math.random() * climaxDescPool_en.length);
                    description = { en: climaxDescPool_en[idx], kr: climaxDescPool_kr[idx] };
                }
            } else {
                action = { en: `Fading ${m.en}`, kr: `희미해지는 ${m.kr}` };
                const idx = Math.floor(Math.random() * resDescPool_en.length);
                description = { en: resDescPool_en[idx], kr: resDescPool_kr[idx] };
            }

            // 🎲 Chance Engine: 동작 변형 기법 적용 (50% 확률로 적용)
            if (this.constraints && Math.random() > 0.5) {
                const modified = this.chanceEngine.applyToMovement(action, description, this.constraints);
                action = modified.action;
                description = modified.description;
            }

            timelineItems.push({
                id: `cue-${Date.now()}-${i}`,
                timeSec: timeSec,
                time: formatTime(timeSec),
                stage: { en: stageEn, kr: stageKr },
                action: action,
                description: description,
                movementQuality: this._pickRandom(qualityPool)
            });
        }
        
        return {
            totalDuration: formatTime(totalSeconds),
            emotionStructure: {
                intro: `0:00 - ${formatTime(introEnd)}`,
                development: `${formatTime(introEnd)} - ${formatTime(devEnd)}`,
                climax: `${formatTime(devEnd)} - ${formatTime(climaxEnd)}`,
                resolution: `${formatTime(climaxEnd)} - ${formatTime(totalSeconds)}`
            },
            timeline: timelineItems
        };
    }

    // ─── Stage Concept (다양성 확보) ───
    async step5_StageConcept(input, narrative) {
        await new Promise(r => setTimeout(r, 500));

        // ═══ 콩쿠르 모드: 심사위원석 정면 최적화 무대 ═══
        if (this.isCompetition) {
            const compLighting = [
                "정면(심사위원석 방향) 하이라이트 집중 + 후방 실루엣 역광. 도입부 완전 블랙아웃에서 절정부 단일 스포트라이트로 전환.",
                "콩쿠르 규격 조명: 바닥 전면 워시 + 정면 45도 키라이트. 절정 순간 단 1초간 스트로보 — 무용수의 공중 정지 프레임을 심사위원 망막에 각인.",
                "극도로 절제된 조명: 도입~전개는 바닥 수평 사이드 라이트(근육 결 강조), 절정에서만 정면 풀 와시 점등으로 기량의 선명함 극대화.",
            ];
            const compCostume = [
                "콩쿠르 규격: 관절 라인과 근육 결이 최대한 노출되는 다크 뉴트럴 톤 유니타드. 의상이 기술을 가리지 않도록 최소화.",
                "근육의 미세 진동까지 가시화하는 스킨톤 메쉬 위 부분 레이어. 회전 시 원심력을 시각화하는 한쪽 팔 슬릿.",
                "심사위원 시선용: 상체 밀착 + 하체 유동적 팬츠. 다리 라인의 기술적 정확성과 상체의 감정 표현을 동시에 극대화.",
            ];
            return {
                lighting: this._pickRandom(compLighting),
                costume: this._pickRandom(compCostume),
                props: "콩쿠르에서는 소품 사용을 최소화합니다 — 순수 신체 기량에 집중. 무대 전면(다운스테이지) 50% 영역을 중심 퍼포먼스 존으로 설정."
            };
        }
        
        const lightingPool = [
            "도입부는 콜드 화이트 핀라이트, 절정부는 눈부신 스트로보 라이트 활용.",
            "천장에서 떨어지는 수직 라이트 커튼 — 무용수가 통과할 때마다 그림자가 분열.",
            "바닥 매립형 LED 그리드로 무용수의 경로를 실시간 트레이싱.",
            "단일 광원(하수 사이드 바 라이트)만 사용, 명암 비율 90:10의 극단적 키아로스쿠로.",
        ];
        const costumePool = [
            "근육의 움직임이 극대화되어 보이는 다크 차콜 심리스 웨어 위 세미 슬릿 스커트.",
            "반투명 오르간자 레이어 — 움직임에 따라 신체의 실루엣이 지연되어 나타남.",
            "산업용 방진복을 해체한 비대칭 절개 의상, 한쪽 어깨만 노출.",
            "피부색과 동일한 메쉬 위에 뼈 구조를 투영하는 프로젝션 매핑 의상.",
        ];
        const propsPool = [
            "무대를 가로지르는 반투명 대형 실크 천막(Scrim).",
            "무대 바닥에 깔린 3톤의 미세 입자(micro-bead) — 무용수의 궤적이 물리적으로 기록됨.",
            "천장에서 내려오는 50개의 가느다란 고무줄 — 무용수가 잡으면 공간의 형태가 변형.",
            "얼음 블록 — 공연 시간에 따라 녹으며 무대 표면의 마찰계수가 실시간으로 변화.",
        ];

        return {
            lighting: this._pickRandom(lightingPool),
            costume: this._pickRandom(costumePool),
            props: this._pickRandom(propsPool)
        };
    }

    async step6_PresentationBuilder(titles, concept, narrative, music, stage) {
        await new Promise(r => setTimeout(r, 500));
        return [
            { slide_num: 1, title: "Title & Mood", script: `작품 [${titles.scientific?.en || '—'}] 기획안입니다.` },
            { slide_num: 2, title: "Artistic Philosophy", script: concept.artisticPhilosophy },
            { slide_num: 3, title: "Storyline", script: "4막 구조(기승전결)를 통한 감정의 레이어 빌드업 과정입니다." },
            { slide_num: 4, title: "Emotion Flow", script: "시간에 따른 텐션 곡선으로, 클라이맥스에서의 폭발적 해소를 시각화했습니다." },
            { slide_num: 5, title: "Movement Narrative", script: "플로어 워크에서 시작해 다이렉트한 공중 도약으로 이어집니다." },
            { slide_num: 6, title: "Music & Sound", script: `BPM 변화와 질감: ${music.soundTexture}` },
            { slide_num: 7, title: "Stage Design", script: `조명과 의상: ${stage.costume}` },
            { slide_num: 8, title: "Conclusion", script: "이 시대에 필요한 실존적 질문을 무대 위에 던집니다." }
        ];
    }

    async step7_PamphletDesigner(titles, concept, narrative, music, stage) {
        await new Promise(r => setTimeout(r, 500));

        // ═══ 콩쿠르 모드: 심사위원 제출용 작품 계획서 포맷 ═══
        if (this.isCompetition) {
            const compNotes = [
                "본 작품은 라반 움직임 분석(LMA)의 에포트 체계를 기반으로, 2~4분의 압축된 시간 안에서 신체적 기량과 예술적 깊이를 동시에 증명하고자 합니다.",
                "도리스 험프리의 '비대칭은 생명력이다(Asymmetry is vitality)' 원칙에 따라, 모든 공간 구성에서 의도적 불균형을 추구했습니다.",
                "이 안무는 '발표(Presentation)'가 아닌 '증명(Demonstration)'입니다. 기술적 정확성과 예술적 설득력의 교차점에서 심사위원과 대화하고자 합니다.",
            ];

            return {
                coverTitle: `심사위원 제출용 작품 계획서 — ${titles.scientific?.en || '—'}`,
                performanceDesc: `[콩쿠르 출전작] 본 작품은 ${narrative?.lma?.space || 'Direct'} 공간 설계와 ${narrative?.lma?.weight || 'Strong'} 무게 에포트의 극단적 대비를 통해, 무용수의 기술적 범위(technical range)와 예술적 해석력을 동시에 심사위원에게 전달하는 2~4분 압축형 안무입니다.`,
                artisticStatement: concept.artisticStatement,
                choreographerNote: this._pickRandom(compNotes),
                musicCredits: `Music Strategy: ${music.style} / Ref: ${music.referenceArtists} / 절정부 전략적 침묵 삽입`,
                cast: "Solo Performer (Competition Entry)",
                layoutInstructions: "Competition Formal: serif body text, jury-addressed tone, include LMA Effort analysis table. Header: [심사위원 제출용 작품 계획서].",
                isCompetition: true
            };
        }
        
        const choreographerNotes = [
            "무대 위의 몸은 거짓말을 하지 않는다. 나는 고요함 속의 가장 거대한 소리를 표현하고 싶었다.",
            "안무란 결국 시간에 상처를 내는 행위다. 이 공연은 그 흉터의 지도다.",
            "관객이 이해하기를 원하지 않는다. 관객의 근육이 기억하기를 원한다.",
            "나는 '완성된 동작'을 불신한다. 이 작품의 모든 움직임은 영원히 미완성이다.",
        ];

        return {
            coverTitle: titles.scientific?.en || '—',
            performanceDesc: "단절된 시공간 속에서 인간 내면의 원초적 감정이 상호작용하며 새로운 자아로 재구성되는 작품.",
            artisticStatement: concept.artisticStatement,
            choreographerNote: this._pickRandom(choreographerNotes),
            musicCredits: `Music Style: ${music.style} / Ref: ${music.referenceArtists}`,
            cast: "Dancers (Total Cast: TBA)",
            layoutInstructions: "Minimalist black-and-white print, large Serif typography for titles, plenty of negative space."
        };
    }
}

// 추출된 독립 함수: Frontend UI에서 타이밍 수정 시 스테이지 맵 새로고침 용도
export function generateFlowFromTimeline(timeline, dancersCount, mood = "", chanceEngine = null, constraints = null) {
    const formationPool = [
        "Diagonal Split", "Unbalanced Cluster", "Explosive Scatter",
        "Asymmetric V", "Linear Exit", "Spiral Arm",
        "Scattered Nuclei", "Compressed Knot", "Tangential Lines",
        "Concentric Orbits"
    ];

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    // 재활용 가능한 generateFlowAnalysis (순수 함수 버전)
    const generateAnalysis = (form) => {
        const analysisPool = {
            "Diagonal Split": { en: "A diagonal division emphasizing disconnection and opposition.", kr: "단절과 대립을 강조하는 대각선 분리 구도." },
            "Unbalanced Cluster": { en: "An atypical cluster expressing psychological pressure and instability.", kr: "불안정함과 심리적 압박을 표현하는 비정형 군집." },
            "Explosive Scatter": { en: "A scattered formation visualizing a sudden burst of energy.", kr: "순간적인 에너지 폭발을 시각화한 산개 대형." },
            "Asymmetric V": { en: "An asymmetric V formation showing a shift in power.", kr: "비대칭적 권력의 이동을 보여주는 V 포메이션." },
            "Linear Exit": { en: "Controlled exit. A linear composition severing all lingering attachments.", kr: "통제된 퇴장. 모든 미련을 단절시키는 직선적 구도." },
            "Spiral Arm": { en: "Swirling energy. A circular sense expanding from center to periphery.", kr: "소용돌이치는 에너지. 중심에서 외곽으로 확장." },
            "Scattered Nuclei": { en: "Multi-focus. Multiple small-scale events occurring simultaneously.", kr: "다중 포커스. 무대 위 여러 개의 소규모 사건이 동시 다발적으로 발생." },
            "Compressed Knot": { en: "Extreme density. Tangled bodies with no room to breathe.", kr: "극도의 밀집. 숨 쉴 공간조차 압축된 신체들의 얽힘." },
            "Tangential Lines": { en: "Parallel and tangential lines that brush past without meeting.", kr: "서로 만나지 않고 스쳐 지나가는 평행과 접선의 구도." },
            "Concentric Orbits": { en: "Concentric orbits bound by invisible gravity.", kr: "보이지 않는 중력에 결속된 동심원 궤도의 움직임." }
        };
        return analysisPool[form] || { en: "Structural pattern of motion.", kr: "구조적 움직임의 패턴." };
    };

    const flow_pattern = timeline.map((tItem, idx) => {
        const formation = pickRandom(formationPool);
        const stageName = typeof tItem.stage === 'object' ? tItem.stage.en : tItem.stage;
        
        // Use provided progress, or calculate linearly
        const _progress = Math.floor((idx / (timeline.length - 1 || 1)) * 100);

        let dancers = [];
        for (let i = 0; i < dancersCount; i++) {
            let x = 50, y = 50;
            if (formation === "Diagonal Split") {
                x = i < dancersCount/2 ? 15 + i*5 : 85 - (i - Math.floor(dancersCount/2))*5;
                y = i < dancersCount/2 ? 15 : 85;
            } else if (formation === "Unbalanced Cluster") {
                x = 30 + (i * 8) + (Math.random() * 10 - 5);
                y = 40 + (Math.random() * 20);
            } else if (formation === "Explosive Scatter") {
                const angle = (i / dancersCount) * Math.PI * 2;
                const dist = 30 + Math.random() * 15;
                x = 50 + Math.cos(angle) * dist;
                y = 50 + Math.sin(angle) * dist;
            } else if (formation === "Spiral Arm") {
                const angle = (i / dancersCount) * Math.PI * 3;
                const dist = 10 + (i / dancersCount) * 35;
                x = 50 + Math.cos(angle) * dist;
                y = 50 + Math.sin(angle) * dist;
            } else if (formation === "Scattered Nuclei") {
                const nuclei = [[25, 30], [65, 50], [40, 75]];
                const nucleus = nuclei[i % nuclei.length];
                x = nucleus[0] + (Math.random() * 12 - 6);
                y = nucleus[1] + (Math.random() * 12 - 6);
            } else if (formation === "Compressed Knot") {
                x = 45 + Math.random() * 10;
                y = 45 + Math.random() * 10;
            } else if (formation === "Tangential Lines") {
                const lineIdx = i % 3;
                x = lineIdx === 0 ? 10 + (i / dancersCount) * 30 : lineIdx === 1 ? 50 + Math.random() * 20 : 80 - Math.random() * 15;
                y = 10 + (i / dancersCount) * 80;
            } else if (formation === "Concentric Orbits") {
                const orbit = (i % 3) + 1;
                const angle = (i / dancersCount) * Math.PI * 2 + Math.random() * 0.5;
                x = 50 + Math.cos(angle) * (orbit * 12);
                y = 50 + Math.sin(angle) * (orbit * 12);
            } else {
                const mid = Math.floor(dancersCount / 2);
                const offset = i - mid;
                x = 50 + offset * 12 + (Math.random() * 6 - 3);
                y = 30 + Math.abs(offset) * 15 + (Math.random() * 5);
            }

            dancers.push({ id: i + 1, x, y });
        }

        if (chanceEngine && constraints) {
            dancers = chanceEngine.applyToFlowPattern(dancers, constraints);
        }

        const rogueIdx = Math.floor(Math.random() * dancersCount);
        dancers[rogueIdx] = {
            ...dancers[rogueIdx],
            x: Math.random() * 90 + 5,
            y: Math.random() * 90 + 5,
            isRogue: true
        };

        return {
            time: tItem.time,
            _progress,
            stage: stageName,
            formation,
            dancers,
            analysis: generateAnalysis(formation)
        };
    });

    return { flow_pattern };
}
