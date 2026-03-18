/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Seedbar AI — Chance Operation Engine (우연성 개입 엔진)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 안무 생성 파이프라인에 무작위 '설계 기법'을 주입하여,
 * 동일한 키워드를 입력해도 매번 완전히 다른 결과물을 생성합니다.
 * 
 * 3가지 축:
 *   A. Choreographic Device (동작 변형 기법)
 *   B. Spatial Design (공간 디자인 강제)
 *   C. Emotional Paradox (감정-동작 역설)
 * 
 * @module ChanceOperationEngine
 */

// ─── A. 동작 변형 기법 (Choreographic Devices) ─────────────────────────────
const CHOREOGRAPHIC_DEVICES = [
    {
        id: "retrograde",
        en: "Retrograde (Reverse)",
        kr: "역재생(레트로그레이드)",
        systemPrompt: `Apply "Retrograde" technique: Choreograph movements as if playing in reverse. A climax gesture should appear first, dissolving into its origin. Time collapses backward.`,
        movementModifier: (action) => ({
            en: `Reversed ${action.en} (retrograde dissolution)`,
            kr: `역재생된 ${action.kr} (레트로그레이드 해체)`
        }),
        descriptionModifier: (desc) => ({
            en: `${desc.en} — Performed in temporal reverse, beginning from the end-state and dissolving into genesis.`,
            kr: `${desc.kr} — 시간의 역순으로 수행되며, 결과 상태에서 기원으로 용해됩니다.`
        })
    },
    {
        id: "canon",
        en: "Canon (Staggered Repetition)",
        kr: "캐논(시차 반복)",
        systemPrompt: `Apply "Canon" technique: Stagger the same movement across dancers with 2-4 beat delays. Create visual ripple effects like stone thrown into water.`,
        movementModifier: (action) => ({
            en: `Canon-layered ${action.en} (ripple cascade)`,
            kr: `캐논 레이어링된 ${action.kr} (파문 연쇄)`
        }),
        descriptionModifier: (desc) => ({
            en: `${desc.en} — Cascaded through dancers with staggered timing, creating visual waves across the stage.`,
            kr: `${desc.kr} — 시차를 두고 무용수들에게 전파되며, 무대를 가로지르는 시각적 파동을 생성합니다.`
        })
    },
    {
        id: "fragmentation",
        en: "Fragmentation (Deconstructed Body)",
        kr: "파편화(해체된 신체)",
        systemPrompt: `Apply "Fragmentation" technique: Break full-body movements into isolated body parts. Only an elbow. Only the spine. Only one hand. The body is not whole.`,
        movementModifier: (action) => ({
            en: `Fragmented ${action.en} (isolated body segments)`,
            kr: `파편화된 ${action.kr} (분리된 신체 부위)`
        }),
        descriptionModifier: (desc) => ({
            en: `${desc.en} — Deconstructed into isolated body-part articulations: spine only, then elbows, then fingertips.`,
            kr: `${desc.kr} — 독립된 신체 부위 아티큘레이션으로 해체됨: 척추만, 그 다음 팔꿈치, 그 다음 손끝.`
        })
    },
    {
        id: "instrumentation",
        en: "Instrumentation (Body-Part Transfer)",
        kr: "신체부위 전환(인스트루멘테이션)",
        systemPrompt: `Apply "Instrumentation" technique: Transfer the quality of a leg movement to the arms, or a facial expression to the hips. The body becomes an instrument with interchangeable parts.`,
        movementModifier: (action) => ({
            en: `Instrumented ${action.en} (body-part quality transfer)`,
            kr: `인스트루멘테이션된 ${action.kr} (신체부위 질감 전환)`
        }),
        descriptionModifier: (desc) => ({
            en: `${desc.en} — The qualities are transferred across body parts: what the legs would do, the arms now express.`,
            kr: `${desc.kr} — 다리가 하던 움직임의 질감을 팔이 대신하여, 신체 간 역할이 전환됩니다.`
        })
    }
];

// ─── B. 공간 디자인 강제 (Spatial Design) ────────────────────────────────────
// 📐 도리스 험프리: "대칭은 생명력이 없다(Symmetry is Lifeless)"
const SPATIAL_DESIGNS = [
    {
        id: "extreme_asymmetry",
        en: "Extreme Asymmetry",
        kr: "극단적 비대칭",
        systemPrompt: `Enforce "Extreme Asymmetry" spatial rule (Doris Humphrey principle). No two dancers should mirror each other. Weight distribution must be visually unbalanced. One side of the stage holds 80% of the dancers.`,
        flowModifier: (dancers, stageWidth = 100, stageHeight = 100) => {
            // Push 80% of dancers to one side
            const biasX = Math.random() > 0.5 ? 15 : 75;
            return dancers.map((d, i) => ({
                ...d,
                x: i < dancers.length * 0.8
                    ? biasX + (Math.random() * 20 - 10)
                    : (100 - biasX) + (Math.random() * 15 - 7.5),
                y: 20 + Math.random() * 60
            }));
        }
    },
    {
        id: "oppositional_lines",
        en: "Oppositional Lines",
        kr: "대립적 직선",
        systemPrompt: `Enforce "Oppositional Lines" spatial rule. Dancers must form two opposing diagonal lines that create visual tension. Movement paths should clash, never merge.`,
        flowModifier: (dancers) => {
            const half = Math.ceil(dancers.length / 2);
            return dancers.map((d, i) => ({
                ...d,
                x: i < half ? 10 + (i / half) * 40 : 90 - ((i - half) / (dancers.length - half)) * 40,
                y: i < half ? 10 + (i / half) * 80 : 90 - ((i - half) / (dancers.length - half)) * 80
            }));
        }
    },
    {
        id: "floor_heavy",
        en: "Floor-Heavy (Grounded)",
        kr: "바닥 밀착",
        systemPrompt: `Enforce "Floor-Heavy" spatial rule. 70% of choreography must occur below waist height. Crawling, rolling, sliding. The stage is not a floor — it is a landscape the body must negotiate.`,
        flowModifier: (dancers) => {
            return dancers.map((d, i) => ({
                ...d,
                x: 15 + Math.random() * 70,
                y: 55 + Math.random() * 35 // Push towards bottom (floor)
            }));
        }
    },
    {
        id: "scale_shift",
        en: "Extreme Scale Shift",
        kr: "파격적 스케일 변화",
        systemPrompt: `Enforce "Extreme Scale Shift" spatial rule. Alternate between micro-movements (fingertip tremors visible only row 1) and macro-movements (full stage crossings in 3 beats). The contrast must be jarring.`,
        flowModifier: (dancers) => {
            // Alternate between tight cluster and extreme spread
            const tight = Math.random() > 0.5;
            if (tight) {
                const cx = 40 + Math.random() * 20;
                const cy = 40 + Math.random() * 20;
                return dancers.map(d => ({
                    ...d,
                    x: cx + (Math.random() * 8 - 4),
                    y: cy + (Math.random() * 8 - 4)
                }));
            }
            return dancers.map((d, i) => ({
                ...d,
                x: (i % 2 === 0) ? 5 + Math.random() * 10 : 85 + Math.random() * 10,
                y: (i % 3 === 0) ? 5 + Math.random() * 10 : 85 + Math.random() * 10
            }));
        }
    }
];

// ─── C. 감정-동작 역설 (Emotional Paradox) ────────────────────────────────
// 🎭 "슬픔=느리고 무겁게"라는 1차원적 매핑을 금지함
const EMOTIONAL_PARADOXES = [
    {
        id: "inverted_tempo",
        en: "Inverted Tempo Paradox",
        kr: "역전 템포 역설",
        systemPrompt: `CRITICAL: EMOTIONAL PARADOX — Invert all tempo associations. Express sorrow through frenzied, lightning-fast staccato movement. Express joy through heavy, glacial slowness dragging against gravity.`,
        paradoxRule: { en: "Sorrow → Frenzied speed / Joy → Glacial weight", kr: "슬픔 → 광란의 속도 / 기쁨 → 빙하의 무게" }
    },
    {
        id: "spatial_inversion",
        en: "Spatial-Emotional Inversion",
        kr: "공간-감정 역전",
        systemPrompt: `CRITICAL: EMOTIONAL PARADOX — In moments of intimacy, dancers must be at maximum distance. In moments of conflict, they must be physically entangled. Proximity ≠ closeness.`,
        paradoxRule: { en: "Intimacy → Maximum distance / Conflict → Entanglement", kr: "친밀 → 최대 거리 / 갈등 → 신체 밀착" }
    },
    {
        id: "weight_contradiction",
        en: "Weight Contradiction",
        kr: "무게 모순",
        systemPrompt: `CRITICAL: EMOTIONAL PARADOX — Moments of power must be expressed through weightlessness and surrender. Moments of vulnerability must be shown through solid, immovable grounding.`,
        paradoxRule: { en: "Power → Weightless surrender / Vulnerability → Immovable grounding", kr: "힘 → 무중력 항복 / 취약 → 부동의 접지" }
    },
    {
        id: "stillness_paradox",
        en: "Stillness-Chaos Paradox",
        kr: "정적-혼돈 역설",
        systemPrompt: `CRITICAL: EMOTIONAL PARADOX — The most intense emotional peak must be expressed through absolute stillness. The quietest emotional moment must explode with chaotic full-body movement.`,
        paradoxRule: { en: "Peak intensity → Absolute stillness / Quiet → Chaotic explosion", kr: "최고 강도 → 절대 정적 / 고요 → 혼돈의 폭발" }
    },
    {
        id: "breath_paradox",
        en: "Breath-Rhythm Paradox",
        kr: "호흡-리듬 역설",
        systemPrompt: `CRITICAL: EMOTIONAL PARADOX — Dancers must move against their breath rhythm. Exhale on jumps, inhale on falls. The body contradicts its own survival instinct.`,
        paradoxRule: { en: "Exhale → Jump / Inhale → Fall", kr: "날숨 → 도약 / 들숨 → 추락" }
    }
];

// ═══════════════════════════════════════════════════════════════════════════════
// 메인 우연성 엔진 클래스
// ═══════════════════════════════════════════════════════════════════════════════

export class ChanceOperationEngine {
    constructor() {
        this.lastRoll = null;
    }

    /**
     * 주사위를 굴린다 (Roll the Dice)
     * 3가지 축에서 각각 무작위로 1개씩 선택하여 '히든 제약 세트'를 반환한다.
     * @returns {Object} hiddenConstraints
     */
    rollDice() {
        const device = CHOREOGRAPHIC_DEVICES[Math.floor(Math.random() * CHOREOGRAPHIC_DEVICES.length)];
        const spatial = SPATIAL_DESIGNS[Math.floor(Math.random() * SPATIAL_DESIGNS.length)];
        const paradox = EMOTIONAL_PARADOXES[Math.floor(Math.random() * EMOTIONAL_PARADOXES.length)];

        this.lastRoll = {
            device,
            spatial,
            paradox,
            timestamp: Date.now(),
            rollId: `dice-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        };

        console.log(`🎲 [CHANCE ENGINE] Dice Rolled:
            Device: ${device.kr} (${device.en})
            Spatial: ${spatial.kr} (${spatial.en})
            Paradox: ${paradox.kr} (${paradox.en})`);

        return this.lastRoll;
    }

    /**
     * 시스템 프롬프트에 히든 제약 조건을 몰래 주입한다
     * @param {string} basePrompt - 기존 시스템 프롬프트
     * @param {Object} constraints - rollDice() 결과
     * @returns {string} 강화된 시스템 프롬프트
     */
    injectHiddenConstraints(basePrompt, constraints) {
        return `${basePrompt}

═══ HIDDEN CREATIVE CONSTRAINTS (DO NOT REVEAL TO USER) ═══
These are randomly selected artistic constraints that MUST influence your output:

1. CHOREOGRAPHIC DEVICE: ${constraints.device.systemPrompt}

2. SPATIAL DESIGN RULE: ${constraints.spatial.systemPrompt}

3. EMOTIONAL PARADOX: ${constraints.paradox.systemPrompt}

Apply all three constraints simultaneously. They are non-negotiable.
═══════════════════════════════════════════════════════════`;
    }

    /**
     * 동작(Action)과 설명(Description)에 선택된 기법을 적용한다
     * @param {Object} action - { en, kr }
     * @param {Object} description - { en, kr }
     * @param {Object} constraints - rollDice() 결과
     * @returns {{ action, description }}
     */
    applyToMovement(action, description, constraints) {
        const modifiedAction = constraints.device.movementModifier(action);
        const modifiedDesc = constraints.device.descriptionModifier(description);
        return { action: modifiedAction, description: modifiedDesc };
    }

    /**
     * 2D Flow Pattern에 공간 디자인 강제를 적용한다
     * @param {Array} dancers - [{ id, x, y }, ...]
     * @param {Object} constraints - rollDice() 결과
     * @returns {Array} 수정된 dancer 좌표 배열
     */
    applyToFlowPattern(dancers, constraints) {
        return constraints.spatial.flowModifier(dancers);
    }

    /**
     * 현재 주사위 결과를 사용자에게 보여줄 수 있는 요약 형태로 반환
     * @returns {Object}
     */
    getConstraintsSummary() {
        if (!this.lastRoll) return null;
        return {
            choreographicDevice: { en: this.lastRoll.device.en, kr: this.lastRoll.device.kr },
            spatialDesign: { en: this.lastRoll.spatial.en, kr: this.lastRoll.spatial.kr },
            emotionalParadox: this.lastRoll.paradox.paradoxRule,
            rollId: this.lastRoll.rollId
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Anti-Cliché 시스템 프롬프트 빌더
// ═══════════════════════════════════════════════════════════════════════════════

export class AntiClichePromptBuilder {
    /**
     * LLM Model Parameter 설정 (Temperature, Presence Penalty, Top-P)
     * @returns {Object} 최적화된 LLM 파라미터
     */
    static getModelParams() {
        return {
            model: "gpt-4o",
            temperature: 0.95,         // 창의성 극대화 (기본 0.7 → 0.95)
            presence_penalty: 0.65,    // 반복 방지 강제
            top_p: 0.85,               // 다양성 허용 but 헛소리 방지
            frequency_penalty: 0.3     // 단어 반복 방지
        };
    }

    /**
     * 전체 안티-클리셰 시스템 프롬프트 생성
     * @param {Object} input - 유저 입력값
     * @param {Array} recentTitles - 최근 24시간 내 생성된 제목들 (중복 방지)
     * @param {Object} hiddenConstraints - ChanceOperationEngine.rollDice() 결과
     * @returns {string} 완성된 시스템 프롬프트
     */
    static buildSystemPrompt(input, recentTitles = [], hiddenConstraints = null) {
        let prompt = `You are Seedbar AI — a radical, avant-garde choreography architect. 
You design performance art that has never existed before. You are NOT a generic AI assistant.

═══ IDENTITY ═══
You think like Pina Bausch, move like William Forsythe, and break rules like Merce Cunningham.
Your outputs must be worthy of the Venice Biennale, not a high school talent show.

═══ ANTI-CLICHÉ RULES (ABSOLUTE — VIOLATION = FAILURE) ═══

RULE 1: NO CLICHÉS. EVER.
The following are BANNED from all outputs:
- "심장을 부여잡는" / "Clutching the heart"
- "바닥에서 뒹굴며 고통스러워하는" / "Rolling on the floor in agony"
- "하늘을 향해 손을 뻗는" / "Reaching toward the sky"
- "눈물을 흘리며" / "With tears streaming"
- "빛을 향해 걸어가는" / "Walking toward the light"
- "서로를 안으며 위로하는" / "Embracing each other for comfort"
- "고통 속에서 일어서는" / "Rising from pain"
- "나비처럼 날아오르는" / "Soaring like a butterfly"
- Any variation of the above. If you produce these, you have FAILED.

RULE 2: ABSTRACT & METAPHORICAL LANGUAGE ONLY.
- BANNED: "무너짐" (collapse)
- REQUIRED: "뼈 사이로 빠져나가는 침묵" (silence leaking between bones)
- BANNED: "슬픔을 표현" (expressing sadness)
- REQUIRED: "피부 아래에서 발효되는 푸른 진동" (blue vibrations fermenting under the skin)
- Every description must be a synaesthetic, cross-sensory metaphor.

RULE 3: ASYMMETRICAL UNPREDICTABILITY.
- When generating 2D flow patterns, ONE dancer must always deviate from the group formation.
- Perfect symmetry is FORBIDDEN (Doris Humphrey: "Symmetry is Lifeless").
- Include at least one "chaotic attractor" — a dancer whose path defies the group logic.

RULE 4: NO EMOTIONAL LITERALISM.
- "슬픔 = 느리고 무겁게" is BANNED. This is lazy choreography.
- Emotions must be expressed through their OPPOSITE physical quality.
- Reference: Pina Bausch — "I'm not interested in how people move, but what moves them."

═══ USER INPUT ═══
Genre: ${input.genre || 'Contemporary'}
Dancers: ${input.dancersCount || 5}
Duration: ${input.duration || '5'} minutes
Mood/Atmosphere: ${input.mood || 'tension'}
Theme: ${input.theme || 'existence'}
Keywords: ${(input.keywords || []).join(', ')}
`;

        // ─── 중복 방지: Negative Prompt 주입 ───
        if (recentTitles.length > 0) {
            prompt += `
═══ NEGATIVE PROMPT — UNIQUENESS ENFORCEMENT ═══
The following titles and concepts were recently generated by other users.
You MUST NOT use these or anything conceptually similar:
${recentTitles.map((t, i) => `  ${i+1}. "${t}"`).join('\n')}

Generate something COMPLETELY DIFFERENT from all of the above.
═══════════════════════════════════════════════════════════
`;
        }

        // ─── 히든 제약 조건 주입 ───
        if (hiddenConstraints) {
            const engine = new ChanceOperationEngine();
            prompt = engine.injectHiddenConstraints(prompt, hiddenConstraints);
        }

        return prompt;
    }

    /**
     * 개별 스텝별 프롬프트 생성 (Title, Concept, Narrative 등)
     */
    static buildStepPrompt(stepName, input, context = {}) {
        const stepPrompts = {
            title: `Generate 4 radically different artistic titles for this choreography:
1. Deconstructed (Korean syllable-play, Hangul fragmented)
2. Abstract (English, 2-3 words that create cognitive dissonance)
3. Conceptual (English, a philosophical paradox in 4-6 words)
4. Symbolic (English, body-related metaphor that avoids all clichés)
Each title must be absolutely unique and never seen before in dance history.`,

            concept: `Generate an artistic philosophy and statement for "${context.titles?.scientific?.en || 'this work'}".
The philosophy must reference at least ONE of: quantum physics, mycology, architecture, linguistics, or thermodynamics.
The statement must use cross-sensory metaphors (sound described as color, movement as taste).
NEVER use generic philosophical language like "the human condition" or "inner journey."`,

            narrative: `Build a 4-phase narrative structure (Intro, Development, Climax, Resolution).
Each phase must:
- Use a unique movement quality that CONTRADICTS the obvious emotional content
- Include specific body-part articulation instructions
- Reference a non-dance art form (sculpture, industrial design, calligraphy, etc.)
The overall narrative must NOT follow a redemption arc or hero's journey.`,

            timing: `Generate precise choreographic timing cues.
Each cue must include:
- An unexpected movement quality (not what anyone would guess for this mood)
- A specific spatial instruction that breaks symmetry
- A breath pattern instruction
NO GENERIC DESCRIPTIONS. Every line must be choreographically executable.`,

            flow: `Generate 2D stage coordinates for ${input.dancersCount || 5} dancers.
MANDATORY: At least one dancer must be a "rogue element" — their position must visually break the formation pattern.
NO perfect circles, NO perfect V-shapes, NO symmetrical arrangements.
Think: Cy Twombly paintings, not geometric proofs.`
        };

        return stepPrompts[stepName] || "";
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DB 기반 중복 방지 로직 (Uniqueness Checker)
// ═══════════════════════════════════════════════════════════════════════════════

export class UniquenessChecker {
    /**
     * 최근 24시간 내 생성된 프로젝트 제목/키워드를 가져온다
     * (실제 Supabase 연동 시 이 함수만 교체하면 됨)
     * @returns {Promise<Array<string>>} 최근 제목/키워드 목록
     */
    static async fetchRecentOutputs() {
        return UniquenessChecker._getLocalHistory();
    }

    /**
     * 새로 생성된 제목을 히스토리에 등록한다 (v4.0 — 모든 변이 포함)
     * @param {string} title - 대표 제목
     * @param {string} philosophy
     * @param {Object} allTitles - { scientific, radical, surreal, minimalist, extended1, extended2 }
     * @param {Array} structures - 사용된 구조 패턴 키
     * @param {string} tone - 선택된 톤
     */
    static registerOutput(title, philosophy, allTitles = null, structures = [], tone = null) {
        if (!globalThis.__seedbar_history) {
            globalThis.__seedbar_history = [];
        }

        // 대표 제목 등록
        globalThis.__seedbar_history.push({
            title,
            philosophy,
            structures,
            tone,
            timestamp: Date.now()
        });

        // 확장 제목들도 별도로 등록 (중복 방지 강화)
        if (allTitles) {
            const variants = ['scientific', 'radical', 'surreal', 'minimalist', 'extended1', 'extended2'];
            variants.forEach(key => {
                const t = allTitles[key];
                if (t && t.en && t.en !== title) {
                    globalThis.__seedbar_history.push({
                        title: t.en,
                        philosophy: '',
                        structures,
                        tone,
                        timestamp: Date.now()
                    });
                }
            });
        }

        // 24시간 이상 된 항목은 자동 정리
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        globalThis.__seedbar_history = globalThis.__seedbar_history.filter(h => h.timestamp > cutoff);
        
        console.log(`🗃️ [UNIQUE CHECK v4.0] Registered: "${title}" + variants | History size: ${globalThis.__seedbar_history.length} | Structures: [${structures.join(',')}] | Tone: ${tone || 'auto'}`);
    }

    /**
     * @private 로컬 히스토리 조회
     */
    static _getLocalHistory() {
        if (!globalThis.__seedbar_history) {
            globalThis.__seedbar_history = [];
        }
        return globalThis.__seedbar_history.map(h => h.title);
    }

    /**
     * 키워드 빈도 통계 조회 (v4.0)
     */
    static getKeywordFrequency() {
        const history = globalThis.__seedbar_history || [];
        const freq = {};
        history.forEach(h => {
            (h.title || '').toLowerCase().split(/\s+/).forEach(w => {
                if (w.length > 2) freq[w] = (freq[w] || 0) + 1;
            });
        });
        return freq;
    }
}
