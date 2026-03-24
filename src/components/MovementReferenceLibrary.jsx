import React, { useState, useMemo, useRef } from 'react';

// ──────────────────────────────────────────────────────
// MOVEMENT REFERENCE LIBRARY — v2 (Generative / Contextual)
// ──────────────────────────────────────────────────────
// 핵심 변경사항:
// 1. 하드코딩 레퍼런스 → 프로젝트 입력값(장르, 분위기, 인원, 감정, 의도 등)을
//    기반으로 동적으로 레퍼런스를 생성/조합하는 방식으로 전환
// 2. 7가지 범주(BODY / SPACE / RHYTHM / FLOOR / PARTNERING / SUSPENSION / RELEASE)를
//    라운드-로빈으로 섞어 매번 다양한 구성
// 3. novelty score로 최근 프로젝트와의 유사도가 높은 항목 우선순위 하강
// 4. 안무가에게 바로 영감을 줄 수 있는 창의적 한 줄 맥락 생성

// ──── 범주 정의 ────
const CATEGORIES = ['Body', 'Space', 'Rhythm', 'Floor', 'Partnering', 'Suspension', 'Release'];

const CATEGORY_COLORS = {
  Body: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
  Space: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10',
  Rhythm: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  Floor: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  Partnering: 'text-pink-400 border-pink-400/30 bg-pink-400/10',
  Suspension: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
  Release: 'text-violet-400 border-violet-400/30 bg-violet-400/10',
};

const CATEGORY_ICONS = {
  Body: 'accessibility_new',
  Space: 'open_with',
  Rhythm: 'music_note',
  Floor: 'download',
  Partnering: 'group',
  Suspension: 'cloud',
  Release: 'water_drop',
};

// ──── 고정 YouTube 풀 (각 범주별 확장) ────
const YOUTUBE_POOL = [
  // Floor
  { id: 'yt-floor-1', category: 'Floor', keyword: 'Floor Work', yt: '1tvmezJh5uY', score: 95 },
  { id: 'yt-floor-2', category: 'Floor', keyword: 'Release Floor', yt: 'nR393C6ZBos', score: 92 },
  // Body
  { id: 'yt-body-1', category: 'Body', keyword: 'Spiral Motion', yt: 'TMrcOz5fSbE', score: 94 },
  // Space / Suspension
  { id: 'yt-space-1', category: 'Suspension', keyword: 'Six Dynamics', yt: 'Lrfti_j54Mw', score: 93 },
  // Rhythm
  { id: 'yt-rhythm-1', category: 'Rhythm', keyword: 'Syncopation', yt: 'q42220s6Q08', score: 96 },
  { id: 'yt-rhythm-2', category: 'Rhythm', keyword: 'Contra-tempo', yt: 'ttML4q5HrBE', score: 88 },
];

// ──── 프로젝트 기반 동적 레퍼런스 생성 풀 ────
// 각 범주 × 장르/분위기 조합별 다양한 레퍼런스 템플릿

const MOVEMENT_BUILDERS = {
  Body: {
    keywords: ['isolation', 'spiral', 'articulation', 'weight shift', 'body wave', 'breath control', 'segmentation', 'core impulse', 'contraction-release', 'body percussion'],
    generate: (ctx, isKr, seedKey) => {
      const g = ctx.genre || (isKr ? '움직임' : 'movement');
      const e = ctx.emotionTone || (isKr ? '감정' : 'emotion');
      const m = ctx.mood || (isKr ? '분위기' : 'mood');
      const i = ctx.intention || (isKr ? '의도' : 'intention');
      const pool = [
        {
          name: isKr ? `[${g}] 파편화된 신체 분절` : `[${g}] Fragmented Body Isolation`,
          cue: isKr ? `신체가 독립 영역으로 갈라진다. [${e}]을/를 각 사지가 다르게 표현한다.` : `The body breaks into independent zones. Each limb expresses [${e}] differently.`,
          ctx: isKr ? `${m} 모먼트, 내면의 충돌과 정체성 해체` : `${m} moments, internal conflict and identity fragmentation`
        },
        {
          name: isKr ? `[${e}] 코어 진동과 호흡파` : `[${e}] Core Tremor & Breath Wave`,
          cue: isKr ? `명치에서 시작된 ${g} 특유의 떨림이 바깥으로 퍼진다. 억압된 ${e}의 폭발.` : `A tremor unique to ${g} begins at the core and radiates. An explosion of suppressed ${e}.`,
          ctx: isKr ? `감정의 정점, 폭발 직전의 ${m}한 상황` : `Emotional peak, ${m} situation right before an explosion`
        },
        {
          name: isKr ? `따뜻한 나선 확장 (${i})` : `Warm Spiral Expansion (${i})`,
          cue: isKr ? `웅크린 자세에서 척추가 나선형으로 열린다. ${i}를 향한 갈망을 몸으로 보여준다.` : `From a curled position, the spine spirals open, physically showing the yearning for ${i}.`,
          ctx: isKr ? `전환점, ${e}에 압도되는 구간` : `Transition point, overwhelmed by ${e}`
        },
        {
          name: isKr ? `무게 중심 전이와 [${g}] 텍스처` : `Weight Transfer & [${g}] Texture`,
          cue: isKr ? `한 발로 서서 버티다 무너지듯 무게를 옮긴다. 이 하나의 이동으로 작품 전체의 ${m} 분위기가 반전된다.` : `Balance on one foot, then collapse the weight. This single transfer flips the entire ${m} mood of the piece.`,
          ctx: isKr ? `성찰, 불균형의 미학, 극적인 전환` : `Introspection, aesthetics of imbalance, dramatic shift`
        },
        {
          name: isKr ? `호흡 주도 컨트랙션 (Contraction)` : `Breath-Led Contraction`,
          cue: isKr ? `${e}의 깊이를 날숨 한 번에 압축하여 신체 중심으로 빨아들인다.` : `Compress the depth of ${e} into a single exhale, pulling everything into the core.`,
          ctx: isKr ? `감정의 수렴, ${m} 스퀀스의 종착지` : `Convergence of emotion, endpoint of the ${m} sequence`
        }
      ];
      return pool[hashSeed(seedKey) % pool.length];
    }
  },
  Space: {
    keywords: ['pathway design', 'level change', 'kinesphere', 'spatial tension', 'diagonal pull', 'spatial canon', 'proximity shift', 'counter-space', 'linear architecture'],
    generate: (ctx, isKr, seedKey) => {
      const g = ctx.genre || (isKr ? '움직임' : 'movement');
      const e = ctx.emotionTone || (isKr ? '감정' : 'emotion');
      const m = ctx.mood || (isKr ? '분위기' : 'mood');
      const i = ctx.intention || (isKr ? '의도' : 'intention');
      const c = ctx.dancerCount || 1;
      const countText = typeof c === 'number' && c > 1 ? (isKr ? `${c}인의 다인원` : `${c}-dancer`) : (isKr ? `솔로` : `solo`);
      
      const pool = [
        {
          name: isKr ? `붕괴하는 공간 건축 (${countText})` : `Collapsing Spatial Architecture (${countText})`,
          cue: isKr ? `정형화된 ${g} 대형으로 시작해 공간 전체가 내폭하며 질서가 ${m}한 혼돈으로 무너진다.` : `Starting with formalized ${g} formations, the entire space implodes, dissolving order into ${m} chaos.`,
          ctx: isKr ? `파괴 시퀀스, 구조가 ${e}으로 인해 무너지는 장면` : `Destruction sequence, where structure breaks down due to ${e}`
        },
        {
          name: isKr ? `대각선 호흡 라인과 공간 장악` : `Diagonal Breath Line & Spatial Takeover`,
          cue: isKr ? `가장 긴 대각선 경로를 사용해 무대를 가로지른다. ${e} 감정이 휩쓸고 지나간 자리를 시각화한다.` : `Travel across the stage using the longest diagonal pathway. Visualizing the wake left by ${e} emotion.`,
          ctx: isKr ? `여정의 시작 혹은 끝, ${m} 맥락의 스케일 확장` : `Beginning or end of a journey, scaling up the ${m} context`
        },
        {
          name: isKr ? `[${m}] 중앙 방사형 폭발` : `[${m}] Central Radial Explosion`,
          cue: isKr ? `모든 움직임이 무대 중앙 좁은 공간에 밀집했다가, ${i}의 에너지를 담아 사방으로 발사된다.` : `All movement compresses into a tight center stage space, then launches outward carrying the energy of ${i}.`,
          ctx: isKr ? `클라이맥스, 제한된 ${m}에서 해방되는 순간` : `Climax, liberating from a restricted ${m}`
        },
        {
          name: isKr ? `그림자 복도 항해 (Spatial Limits)` : `Shadow Corridor Navigation (Spatial Limits)`,
          cue: isKr ? `보이지 않는 좁은 벽 사이를 이동하듯 공간을 제한적으로 사용한다. ${e}적 압박감을 극대화한다.` : `Move as if confined between invisible narrow walls. Maximizes the ${e} pressure.`,
          ctx: isKr ? `심리적 억압, 내면의 구속, 긴장감이 높은 ${m} 씬` : `Psychological confinement, inner restriction, high tension ${m} scene`
        },
        {
          name: isKr ? `[${g}] 공간의 정지와 여백` : `[${g}] Spatial Stillness & Void`,
          cue: isKr ? `한쪽 구석의 정지된 무용수, 그리고 텅 빈 반대편. 그 빈 공간 자체로 ${e}를 말한다.` : `A suspended dancer in one corner, and the empty vastness opposite. The void itself speaks of ${e}.`,
          ctx: isKr ? `극적인 공백, 관객에게 ${m} 분위기를 곱씹게 하는 순간` : `Dramatic void, a moment making the audience chew on the ${m} mood`
        }
      ];
      return pool[hashSeed(seedKey) % pool.length];
    }
  },
  Rhythm: {
    keywords: ['polyrhythm', 'syncopation', 'silence', 'pulse shift', 'breath rhythm', 'staccato-legato', 'counterpoint', 'rhythmic canon', 'beat displacement'],
    generate: (ctx, isKr, seedKey) => {
      const g = ctx.genre || (isKr ? '안무' : 'choreography');
      const e = ctx.emotionTone || (isKr ? '감정' : 'emotion');
      const m = ctx.mood || (isKr ? '분위기' : 'mood');
      const i = ctx.intention || (isKr ? '의도' : 'intention');
      
      const pool = [
        {
          name: isKr ? `고장난 시계 폴리리듬: [${e}]` : `Broken Clock Polyrhythm: [${e}]`,
          cue: isKr ? `각 신체 부위가 다른 템포로 째깍인다. ${g}의 리듬 체계가 균열하면서 ${m}한 혼란을 만든다.` : `Each body part ticks at a different tempo. The rhythmic system of ${g} fractures, creating ${m} chaos.`,
          ctx: isKr ? `시간과 인지가 왜곡되는 씬, 극도의 ${e} 표출` : `Scene where time and perception warp, extreme expression of ${e}`
        },
        {
          name: isKr ? `음악을 배제한 호흡 프레이징` : `Music-less Breath Phrasing`,
          cue: isKr ? `카운트를 버리고 무용수의 거친 숨소리에 맞춰 움직임이 발생한다. 오직 ${i}만을 쫓는다.` : `Abandon counts and let movement arise strictly from the dancer's raw breath. Chasing only ${i}.`,
          ctx: isKr ? `정적 구간, 생동감과 날것의 ${m} 에너지가 필요한 곳` : `Silent section, where raw ${m} energy and vitality are needed`
        },
        {
          name: isKr ? `[${g}] 기관총 스타카토` : `[${g}] Machine-Gun Staccato`,
          cue: isKr ? `모든 연속적인 악센트가 날카로운 타격점이다. 몸이 만들어내는 정밀하고 빠른 ${m} 타격감.` : `Every successive accent is a sharp impact point. A precise, rapid ${m} percussive quality produced by the body.`,
          ctx: isKr ? `공격적 에너지 분출, 곡의 리듬 브레이크다운 구간` : `Aggressive energy eruption, rhythm breakdown section of the track`
        },
        {
          name: isKr ? `절대 정적과 폭발의 순환` : `Cycle of Absolute Silence & Eruption`,
          cue: isKr ? `3박자의 완전한 멈춤 후 1박자에 모든 ${e}을 폭발시킨다. 멈춤이 길어질수록 서스펜스가 증가한다.` : `Three beats of complete halt, followed by an explosion of all ${e} in one beat. As the halt lengthens, suspense grows.`,
          ctx: isKr ? `관객의 몰입도를 끌어올리는 텐션-릴리즈, ${m} 임팩트` : `Tension-release pulling audience immersion, ${m} impact`
        },
        {
          name: isKr ? `[${m}] 엇박자 (Syncopation) 유희` : `[${m}] Syncopated Playfulness`,
          cue: isKr ? `정박을 피하고 음악 사이의 틈(Off-beat)만을 골라 타며 ${g}적인 위트 혹은 ${e}적 불안감을 조성한다.` : `Avoid the downbeat entirely and ride only the off-beats, creating ${g}-like wit or ${e} anxiety.`,
          ctx: isKr ? `예측 불가능성을 요구하는 부분, 장르 해체적 구간` : `Sections craving unpredictability, genre-deconstructive moments`
        }
      ];
      return pool[hashSeed(seedKey) % pool.length];
    }
  },
  Floor: {
    keywords: ['floorwork', 'roll', 'slide', 'crawl', 'inversion', 'ground contact', 'fall-recovery', 'low level', 'earth connection'],
    generate: (ctx, isKr, seedKey) => {
      const g = ctx.genre || (isKr ? '움직임' : 'movement');
      const e = ctx.emotionTone || (isKr ? '감정' : 'emotion');
      const m = ctx.mood || (isKr ? '분위기' : 'mood');
      
      const pool = [
        {
          name: isKr ? `중력에 항복하는 붕괴 플로어` : `Gravity-Surrendering Collapse Floor`,
          cue: isKr ? `마치 ${g}의 제어를 잃은 것처럼 수직성을 포기한다. ${e}에 짓눌려 슬로모션으로 쓰러지듯 접지.` : `Abandoning verticality entirely as if losing ${g} control. Crushed by ${e}, melting to the floor in slow motion.`,
          ctx: isKr ? `완전한 패배 혹은 절망, 서사의 가장 낮은 ${m} 바닥` : `Complete defeat or despair, the absolute lowest ${m} point of the narrative`
        },
        {
          name: isKr ? `[${m}] 유기체적 액체 슬라이드` : `[${m}] Organic Liquid Slide`,
          cue: isKr ? `관절의 마찰을 없애고 물감처럼 바닥에 스며든다. 바닥을 저항이 아닌 ${e}의 연장선으로 사용.` : `Erase joint friction and seep into the floor like paint. Using the floor as an extension of ${e}, not resistance.`,
          ctx: isKr ? `유연한 전환, 장면에 부드럽지만 기묘한 분위기 부여` : `Fluid transition, imparting a soft yet strange atmosphere`
        },
        {
          name: isKr ? `파괴적 반발 (Rebound) 어택` : `Destructive Rebound Attack`,
          cue: isKr ? `바닥으로 추락하자마자 그 충격량을 스프링처럼 전환해 다시 튕겨오른다. ${g} 특유의 맹렬함 표출.` : `Crash into the floor and instantly convert the impact into a spring-like rebound. Emitting the distinctive ferocity of ${g}.`,
          ctx: isKr ? `운동능력의 극대화, 분노나 생명력의 ${e} 폭발` : `Maximization of athleticism, the ${e} explosion of rage or vitality`
        },
        {
          name: isKr ? `원초적 크롤(Crawl)과 짐승의 시선` : `Primal Crawl & Beast's Gaze`,
          cue: isKr ? `매우 낮고 납작한 자세로 공간을 횡단한다. 인간성에서 벗어난 날것의 ${e}를 표현한다.` : `Traverse the space in an extremely low, flattened crawl. Expressing raw ${e} devoid of civilized humanity.`,
          ctx: isKr ? `원초적 본능, 적대감 혹은 생존의 처절한 ${m} 연출` : `Primal instinct, hostility, or desperate ${m} staging of survival`
        },
        {
          name: isKr ? `바닥에 새기는 [${g}] 궤적` : `[${g}] Trajectories Engraved in Floor`,
          cue: isKr ? `계속해서 구르고 미끄러지며 연속적인 회전력으로 무대를 쓸어 담는다. 거칠 것 없는 ${m}.` : `Continuously rolling and sliding, sweeping the stage with uninterrupted rotational momentum. Unstoppable ${m}.`,
          ctx: isKr ? `멈출 수 없는 시간/상황의 흐름, 이동과 궤적 중심` : `Unstoppable flow of time/situation, focus on travel and momentum`
        }
      ];
      return pool[hashSeed(seedKey) % pool.length];
    }
  },
  Partnering: {
    keywords: ['lift', 'counterbalance', 'contact improv', 'weight sharing', 'trust fall', 'mirroring', 'shadow play', 'entanglement', 'duel'],
    generate: (ctx, isKr, seedKey) => {
      const g = ctx.genre || '';
      const e = ctx.emotionTone || (isKr ? '감정' : 'emotion');
      const m = ctx.mood || (isKr ? '분위기' : 'mood');
      const i = ctx.intention || (isKr ? '메시지' : 'message');
      
      const pool = [
        {
          name: isKr ? `독성 얽힘 (Toxic Entanglement)` : `Toxic Entanglement`,
          cue: isKr ? `서로 떼어낼 수 없는 구속적 관계. 접촉할수록 파괴되는 ${e}의 양면성을 ${g} 움직임으로 짠다.` : `An inseparable, binding relationship. Weaving the duality of ${e} where touch destroys, framed within ${g} movement.`,
          ctx: isKr ? `갈등, 족쇄처럼 묶인 관계, 깊고 어두운 ${m}` : `Conflict, shackled relationships, deep and dark ${m}`
        },
        {
          name: isKr ? `극단적 텐션의 카운터밸런스` : `Extreme Tension Counterbalance`,
          cue: isKr ? `둘 중 하나가 손을 놓으면 완전히 쓰러지는 각도. 서로의 몸무게로 아슬아슬하게 직립을 유지하며 ${i}를 논한다.` : `An angle where if one lets go, both fall completely. Arguing ${i} while precariously maintaining uprightness through shared weight.`,
          ctx: isKr ? `깨지기 쉬운 신뢰, 두 세력 간의 팽팽한 ${e} 균형` : `Fragile trust, tightly strung ${e} balance between two forces`
        },
        {
          name: isKr ? `절대적 신뢰 (Trust Fall) 대화` : `Absolute Trust-Fall Dialogue`,
          cue: isKr ? `눈을 감은 채 파트너를 향해 몸을 던지고 받아낸다. 언어 없는 상호 작용 속 피어나는 ${m} 감각.` : `Throwing the body toward the partner with closed eyes. The ${m} sensation blooming within this wordless interaction.`,
          ctx: isKr ? `친밀감 형성, 치유, 연대의 ${e}이 중심이 될 때` : `Building intimacy, healing, when the ${e} of solidarity is central`
        },
        {
          name: isKr ? `[${g}] 파워 리프트 캐논` : `[${g}] Power Lift Canon`,
          cue: isKr ? `누가 더 높이 띄우는가 대결하듯 수직 공간을 지배한다. ${e}적 고조를 극단적인 신체 역학으로 구현.` : `Dominating vertical space as if competing to throw higher. Manifesting ${e} climax through extreme physical mechanics.`,
          ctx: isKr ? `경쟁 구조, 화려하고 박력 넘치는 체공 액션 씬` : `Competitive structure, flashy and vigorous anti-gravity action scene`
        },
        {
          name: isKr ? `그림자 근접 복제 (Shadow Play)` : `Shadow Proximity Mirroring`,
          cue: isKr ? `60cm 간격을 항상 유지하며 절대로 닿지 않고 상대의 디테일을 똑같이 따라하며 ${m}한 여운을 남긴다.` : `Maintaining a strict 2-foot distance without ever touching, perfectly mirroring detailed nuances leaving a ${m} impression.`,
          ctx: isKr ? `이루어질 수 없는 관계, 내면의 자아와의 싸움, ${e}적 잔상` : `Unrequited relations, battling the inner self, ${e} afterimages`
        }
      ];
      return pool[hashSeed(seedKey) % pool.length];
    }
  },
  Suspension: {
    keywords: ['hang time', 'balance hold', 'freeze', 'arrested motion', 'top of jump', 'sustained extension', 'anti-gravity', 'levitation', 'peak moment'],
    generate: (ctx, isKr, seedKey) => {
      const g = ctx.genre || (isKr ? '움직임' : 'movement');
      const e = ctx.emotionTone || (isKr ? '감정' : 'emotion');
      const m = ctx.mood || (isKr ? '분위기' : 'mood');
      const i = ctx.intention || (isKr ? '의도' : 'intention');
      
      const pool = [
        {
          name: isKr ? `정지된 추락 타블로 (Arrested Fall)` : `Arrested Fall Tableau`,
          cue: isKr ? `떨어지는 과정의 가장 불안정한 각도에서 몸을 굳힌다. 충돌 직전의 순간에 ${e} 공포를 박제한다.` : `Solidifying the body at the most unstable angle of a fall. Taxidermying the ${e} terror right before impact.`,
          ctx: isKr ? `긴장감 최고조, 서스펜스가 폭발하기 전의 벼랑 끝 ${m}` : `Peak tension, the cliff edge ${m} before suspense explodes`
        },
        {
          name: isKr ? `부유하는 확장과 공중 체공` : `Floating Extension & Levitation`,
          cue: isKr ? `점프나 를르베의 가장 최정점(Apex)에서 시간이 느려진 듯 한 프레임 더 오래 머분다. 중력을 속이는 ${g}.` : `Slowing time at the absolute apex of a jump or relevé, staying one frame longer. Defying gravity in ${g} style.`,
          ctx: isKr ? `기적, 초월, 꿈을 꾸는 듯한 ${m} 시퀀스` : `Miracles, transcendence, dreamlike ${m} sequences`
        },
        {
          name: isKr ? `[${e}] 저항의 숨참기 서스펜션` : `[${e}] Breath-Hold Defiant Suspension`,
          cue: isKr ? `호흡을 흡수한 상태로 발끝 혹은 기이한 코어축에 의지해 밸런스를 견딘다. 떨려오는 근육이 ${i}를 대변한다.` : `Holding inhaled breath, suffering a balance on toes or a bizarre core axis. The trembling muscles advocate for ${i}.`,
          ctx: isKr ? `내면적 고뇌, 연약함 속의 굳은 의지가 돋보이는 구간` : `Internal agony, sections highlighting firm resolve within fragility`
        },
        {
          name: isKr ? `근육 잠금 (Muscle Lock) 피크` : `Apex Muscle-Lock Peak`,
          cue: isKr ? `시퀀스의 에너지가 극으로 치달았을 때, 모든 뼈마디를 동시에 락킹(Locking)하며 ${m} 에너지를 가둔다.` : `When sequence energy peaks, simultaneously locking every joint, trapping the ${m} energy inside.`,
          ctx: isKr ? `강렬한 악센트, 아이코닉한 포스터형 정지 화면` : `Intense accent, iconic poster-like freeze frame`
        },
        {
          name: isKr ? `저속 이탈 (Slow-motion Detachment)` : `Slow-motion Detachment`,
          cue: isKr ? `무게 중심이 한 곳에서 다른 곳으로 넘어가는 그 허공의 찰나를, 최대한 길게 끌어당기며 ${e}를 음미한다.` : `Stretching the momentary void of transferring weight to its maximum length, savoring the ${e}.`,
          ctx: isKr ? `시간 왜곡 연출, 디테일이 필요한 서정적/기괴한 ${m}` : `Time distortion staging, lyrical/grotesque ${m} requiring detail`
        }
      ];
      return pool[hashSeed(seedKey) % pool.length];
    }
  },
  Release: {
    keywords: ['release technique', 'letting go', 'fall', 'drop', 'breath exhale', 'surrender', 'unwinding', 'de-tension', 'organic flow'],
    generate: (ctx, isKr, seedKey) => {
      const g = ctx.genre || (isKr ? '움직임' : 'movement');
      const e = ctx.emotionTone || (isKr ? '감정' : 'emotion');
      const m = ctx.mood || (isKr ? '분위기' : 'mood');
      
      const pool = [
        {
          name: isKr ? `제어된 붕괴 (Controlled Cascade)` : `Controlled Cascade Shutdown`,
          cue: isKr ? `정수리부터 경추, 흉추, 요추 순으로 스위치가 꺼지듯 체계적으로 녹아내린다. ${g} 기법을 해체시키는 과정.` : `Systematically melting top-down, turning off switches from head to lumbar. The process of disassembling ${g} techniques.`,
          ctx: isKr ? `시스템의 정지, 모든 ${e} 동력이 상실된 허무함` : `System shutdown, the emptiness where all ${e} motive power is lost`
        },
        {
          name: isKr ? `날숨을 타는 카타르시스 릴리즈` : `Cathartic Exhale Release`,
          cue: isKr ? `모든 억눌림을 단 한 번의 거대한 한숨과 함께 뱉어내며 공간에 신체를 맡긴다. 얽매였던 ${e}에서의 해방.` : `Spitting out all suppression with a single massive sigh, surrendering the body to space. Liberation from bound ${e}.`,
          ctx: isKr ? `해결점 도달, 갈등 융화 후 평화와 수용의 ${m}` : `Reaching resolution, the ${m} of peace and acceptance after friction`
        },
        {
          name: isKr ? `[${m}] 텐션 스냅 (Snap & Drop)` : `[${m}] Tension Snap & Drop`,
          cue: isKr ? `고무줄을 끝까지 당겼다 놓는 것처럼 팽팽한 저항 끝에 순식간에 중력의 늪으로 떨어지는 날카로운 릴리즈.` : `Like snapping a fully stretched rubber band, a sharp drop into gravity's swamp after taut resistance.`,
          ctx: isKr ? `짜릿한 시각적 타격감, 극적인 감정의 반전구간` : `Thrilling visual impact, section marking a dramatic reversal of emotion`
        },
        {
          name: isKr ? `[${e}] 중력으로의 양보 (Yielding)` : `[${e}] Yielding to Gravity`,
          cue: isKr ? `버티지 않고, 중력이 다음 경로를 지시하게 둔다. 몸의 중심을 외부 힘에 위임함으로써 오는 기묘한 자유로움.` : `No resistance, letting gravity dictate the next path. The strange freedom of surrendering core control to external forces.`,
          ctx: isKr ? `부드러운 전환기, 의지를 버리는 휴지기 역할` : `Soft transitional phase, serving as a rest period where will is abandoned`
        },
        {
          name: isKr ? `점진적 용해 (Progressive Melting)` : `Progressive Melting`,
          cue: isKr ? `신체 말단부터 손끝, 발끝에서 시작된 릴리즈가 심장 방향으로 서서히 전이된다. 무거워지는 ${e} 무게감 연출.` : `Release starting from extremities—fingertips, toes—slowly transferring toward the heart. Staging a heavy ${e} weight.`,
          ctx: isKr ? `수면, 죽음, 부패 혹은 부드러운 전환을 상징하는 ${m} 씬` : `Scene symbolizing sleep, death, decay, or soft transition with a ${m} tone`
        }
      ];
      return pool[hashSeed(seedKey) % pool.length];
    }
  }
};

// ──── 해시 유틸리티 ────
function hashSeed(input = '') {
  let hash = 0;
  const text = String(input || 'seedbar');
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed, salt = '') {
  const v = hashSeed(`${seed}:${salt}`);
  return (v % 10000) / 10000;
}

function shuffleWithSeed(arr, seed) {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, `shuf:${i}`) * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

// ──── 분위기 감지 ────
function detectMoodCluster(ctx) {
  const blob = [
    ctx.mood || '', ctx.genre || '', ctx.emotionTone || '', ctx.intention || '',
    ctx.titleTone || '', ...(ctx.keywords || []),
  ].join(' ').toLowerCase();

  if (/dark|horror|gloomy|anger|pain|death|fear|sorrow|tragic|agony|despair|bleak|noir|melanchol/.test(blob)) return 'dark';
  if (/intense|power|fire|explosion|battle|fierce|aggressive|war|rage|violent|energy|강렬|폭발/.test(blob)) return 'intense';
  if (/minimal|silence|still|quiet|empty|void|méditation|zen|subtle|소리없|고요|미니멀/.test(blob)) return 'minimal';
  return 'warm';
}

// ──── 인원수에 따른 범주 가중치 ────
function getDancerCountWeights(ctx) {
  const count = Number(ctx.dancerCount || ctx.headCount || ctx.performers || 1);
  if (count >= 6) return { Partnering: 2, Space: 2, Floor: 1, Body: 1, Rhythm: 1, Suspension: 1, Release: 1 };
  if (count >= 2) return { Partnering: 3, Body: 1, Space: 1, Rhythm: 1, Floor: 1, Suspension: 1, Release: 1 };
  return { Body: 3, Floor: 2, Suspension: 2, Release: 2, Space: 1, Rhythm: 1, Partnering: 0 };
}

// ──── Novelty Score 계산 ────
function computeNoveltyScore(ref, existingCategories, existingKeywords, seed) {
  let novelty = 70 + seededRandom(seed, `nov:${ref.id}`) * 30;
  if (existingCategories.has(ref.category)) novelty -= 15;
  const kwLower = (ref.keyword || '').toLowerCase();
  for (const ek of existingKeywords) {
    if (ek.toLowerCase().includes(kwLower) || kwLower.includes(ek.toLowerCase())) {
      novelty -= 10;
      break;
    }
  }
  return Math.min(100, Math.max(0, Math.round(novelty)));
}

// ──── 메인 컴포넌트 ────
export default function MovementReferenceLibrary({ isKr, onAddReference, projectSeed = '', projectContext = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const [videoErrors, setVideoErrors] = useState({});
  const videoRefs = useRef({});

  const t = (val) => (val && typeof val === 'object') ? (val[isKr ? 'kr' : 'en'] || val.en || '') : (val || '');

  const projectSignature = useMemo(() => {
    const parts = [
      projectSeed,
      projectContext?.genre || '',
      projectContext?.mood || '',
      projectContext?.emotionTone || '',
      projectContext?.intention || '',
      projectContext?.titleTone || '',
      projectContext?.dancerCount || '',
      projectContext?.duration || '',
      ...(Array.isArray(projectContext?.keywords) ? projectContext.keywords : []),
    ];
    return parts.join('|');
  }, [projectSeed, projectContext]);

  const moodCluster = useMemo(() => detectMoodCluster(projectContext), [projectContext]);
  const dancerWeights = useMemo(() => getDancerCountWeights(projectContext), [projectContext]);

  // ──── 동적 레퍼런스 생성 ────
  const generatedReferences = useMemo(() => {
    const results = [];
    let idCounter = 0;
    // 각 범주에서 프로젝트에 맞는 레퍼런스를 선택
    for (const category of CATEGORIES) {
      const builder = MOVEMENT_BUILDERS[category];
      if (!builder) continue;

      const weight = dancerWeights[category] || 1;
      if (weight === 0) continue;

      const pickCount = Math.max(1, Math.min(3, weight));
      const usedIndices = new Set();

      for (let i = 0; i < pickCount; i++) {
        let tpl;
        for (let tries = 0; tries < 5; tries++) {
           const subSeed = `${projectSignature}:${category}:${i}:${tries}`;
           tpl = builder.generate(projectContext || {}, isKr, subSeed);
           const nameStr = tpl.name;
           if (!usedIndices.has(nameStr)) {
               usedIndices.add(nameStr);
               break;
           }
        }

        const relatedKeyword = builder.keywords[
          Math.floor(seededRandom(projectSignature, `kw:${category}:${i}`) * builder.keywords.length)
        ];

        const noveltyBase = 60 + Math.round(seededRandom(projectSignature, `score:${category}:${i}`) * 35);

        results.push({
          id: `gen-${category.toLowerCase()}-${idCounter++}`,
          category,
          keyword: relatedKeyword,
          name: tpl.name,
          oneLineDesc: tpl.cue,
          applicableContext: tpl.ctx,
          score: Math.min(99, noveltyBase + (weight > 1 ? 5 : 0)),
          noveltyScore: 0,
          moodMatch: moodCluster,
          isGenerated: true,
          imageUrl: null,
          videoUrl: null,
        });
      }
    }

    return results;
  }, [projectSignature, moodCluster, dancerWeights]);

  // ──── YouTube 고정 풀에서 관련 영상 추가 ────
  const ytReferences = useMemo(() => {
    return YOUTUBE_POOL
      .filter(yt => !videoErrors[yt.id])
      .map(yt => ({
        ...yt,
        name: { en: yt.keyword, kr: yt.keyword },
        oneLineDesc: { en: `Watch ${yt.keyword} technique in action — real dancers, real movement.`, kr: `${yt.keyword} 테크닉을 실제 무용수의 움직임으로 확인하세요.` },
        applicableContext: { en: 'Watch for movement quality and phrasing inspiration', kr: '동작 질감과 프레이징 영감을 위해 시청하세요' },
        noveltyScore: 0,
        isGenerated: false,
        imageUrl: `https://i.ytimg.com/vi/${yt.yt}/hqdefault.jpg`,
        mediaType: 'embed',
        videoUrl: `https://www.youtube.com/embed/${yt.yt}?autoplay=1&mute=1&rel=0&modestbranding=1`,
      }));
  }, [videoErrors]);

  // ──── 최종 큐레이션 (anti-repetition + novelty + round-robin) ────
  const curatedReferences = useMemo(() => {
    const all = [...generatedReferences, ...ytReferences];

    // 검색 필터
    let filtered = all;
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      filtered = all.filter(r =>
        r.keyword.toLowerCase().includes(lower) ||
        t(r.name).toLowerCase().includes(lower) ||
        t(r.oneLineDesc).toLowerCase().includes(lower) ||
        r.category.toLowerCase().includes(lower)
      );
    }

    // Novelty Score 계산
    const seenCategories = new Set();
    const seenKeywords = new Set();
    filtered = filtered.map(ref => {
      const ns = computeNoveltyScore(ref, seenCategories, seenKeywords, projectSignature);
      seenCategories.add(ref.category);
      seenKeywords.add(ref.keyword);
      return { ...ref, noveltyScore: ns };
    });

    // 가중 스코어 정렬
    filtered.sort((a, b) => {
      const aWeight = (a.score * 0.6) + (a.noveltyScore * 0.4);
      const bWeight = (b.score * 0.6) + (b.noveltyScore * 0.4);
      return bWeight - aWeight;
    });

    // Round-Robin 다양성 배치
    const grouped = {};
    CATEGORIES.forEach(c => { grouped[c] = []; });
    filtered.forEach(r => {
      if (grouped[r.category]) grouped[r.category].push(r);
    });

    const diverse = [];
    const catOrder = shuffleWithSeed(CATEGORIES, projectSignature);
    let hasMore = true;
    while (hasMore && diverse.length < 2) {
      hasMore = false;
      for (const cat of catOrder) {
        if (diverse.length >= 2) break;
        if (grouped[cat] && grouped[cat].length > 0) {
          diverse.push(grouped[cat].shift());
          hasMore = true;
        }
      }
    }

    return diverse;
  }, [generatedReferences, ytReferences, searchTerm, projectSignature, t]);

  const diversityScore = useMemo(() => {
    const cats = new Set(curatedReferences.map(r => r.category));
    const kws = new Set(curatedReferences.map(r => r.keyword));
    const avgNovelty = curatedReferences.length
      ? Math.round(curatedReferences.reduce((s, r) => s + (r.noveltyScore || 0), 0) / curatedReferences.length)
      : 0;
    return Math.min(100, 20 + cats.size * 10 + kws.size * 5 + avgNovelty * 0.2);
  }, [curatedReferences]);

  const handlePlay = (id) => {
    setPlayingId(id);
    Object.keys(videoRefs.current).forEach(key => {
      if (key !== id && videoRefs.current[key] && typeof videoRefs.current[key].pause === 'function') {
        videoRefs.current[key].pause();
      }
    });
  };

  const handleVideoError = (id) => {
    setVideoErrors(prev => ({ ...prev, [id]: true }));
    setPlayingId(null);
  };

  const isPlaying = (id) => playingId === id && !videoErrors[id];

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden transition-all duration-700 my-10 shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/8 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
        <div>
          <h2 className="text-[12px] uppercase tracking-[0.3em] font-bold text-teal-400 mb-2 flex items-center gap-3">
            <span className="w-5 h-[2px] bg-teal-400"></span>
            Movement Reference Library
          </h2>
          <p className="text-sm text-slate-400 font-light">
            {isKr
              ? '프로젝트의 장르·분위기·감정에 맞춰 매번 새롭게 큐레이션됩니다. 안무에 바로 적용할 수 있는 움직임 아이디어를 찾아보세요.'
              : 'Dynamically curated for your project\'s genre, mood, and emotion. Find movement ideas you can apply to your choreography right now.'}
          </p>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-[11px] uppercase tracking-[0.24em] text-teal-300/80">
              {isKr ? `다양성 점수 ${diversityScore}` : `Diversity Score ${diversityScore}`}
            </span>
            <span className="text-[10px] px-2 py-0.5 border border-white/10 rounded text-white/30 uppercase tracking-widest">
              {isKr ? `분위기: ${moodCluster}` : `Mood: ${moodCluster}`}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isKr ? "Floor, 파트너링, 서스펜션, 릴리즈 등 검색..." : "Search 'Floor', 'Partnering', 'Suspension'..."}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/10 transition-all font-light placeholder:text-slate-500"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px] pointer-events-none">search</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {curatedReferences.map(ref => (
          <div key={ref.id} className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden flex flex-col group hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-900/20">

            {/* Media / Visual Area */}
            <div className="relative h-48 overflow-hidden flex items-center justify-center bg-black">
              {isPlaying(ref.id) && ref.videoUrl ? (
                <iframe
                  src={ref.videoUrl}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full object-cover border-0"
                  title={t(ref.name)}
                  onError={() => handleVideoError(ref.id)}
                />
              ) : ref.imageUrl ? (
                <>
                  <img
                    src={ref.imageUrl}
                    alt={t(ref.name)}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 cursor-pointer"
                    onClick={() => ref.videoUrl && handlePlay(ref.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 pointer-events-none" />
                  {ref.videoUrl && !videoErrors[ref.id] && (
                    <button
                      onClick={() => handlePlay(ref.id)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-teal-500 hover:border-teal-400 z-20 cursor-pointer"
                      aria-label="Play"
                    >
                      <span className="material-symbols-outlined text-white text-[24px] ml-1">play_arrow</span>
                    </button>
                  )}
                </>
              ) : (
                /* Generated reference → Abstract visual */
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${
                    ref.moodMatch === 'dark' ? 'from-slate-900 via-red-950 to-black' :
                    ref.moodMatch === 'intense' ? 'from-orange-950 via-rose-900 to-black' :
                    ref.moodMatch === 'minimal' ? 'from-slate-800 via-slate-900 to-black' :
                    'from-teal-950 via-slate-900 to-black'
                  }`} />
                  <span className={`material-symbols-outlined text-5xl opacity-30 ${CATEGORY_COLORS[ref.category]?.split(' ')[0] || 'text-white'}`}>
                    {CATEGORY_ICONS[ref.category] || 'gesture'}
                  </span>
                  <p className="text-[9px] mt-2 uppercase tracking-[0.3em] text-white/20 font-bold">{ref.category}</p>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2 pointer-events-none z-10">
                <span className={`px-2 py-1 rounded text-[9px] uppercase tracking-widest font-bold border backdrop-blur-md ${CATEGORY_COLORS[ref.category] || CATEGORY_COLORS.Body}`}>
                  {ref.category}
                </span>
                {ref.noveltyScore > 0 && (
                  <span className={`backdrop-blur-md px-2 py-1 rounded text-[9px] font-bold border flex items-center gap-1 ${
                    ref.noveltyScore >= 80 ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' :
                    ref.noveltyScore >= 60 ? 'text-sky-400 border-sky-400/30 bg-sky-400/10' :
                    'text-white/40 border-white/10 bg-black/30'
                  }`}>
                    <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                    {ref.noveltyScore}
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-teal-400 text-[10px] uppercase tracking-widest font-bold opacity-80">{ref.keyword}</span>
              </div>
              <h3 className="text-white font-semibold text-base mb-3 group-hover:text-teal-300 transition-colors leading-snug">{t(ref.name)}</h3>

              <div className="space-y-3 flex-1 mb-5">
                {/* Creative cue — 안무 즉시 적용 가능한 한 줄 */}
                <div className="bg-gradient-to-r from-teal-500/10 to-transparent rounded-lg p-3 border border-teal-500/10">
                  <p className="text-[10px] text-teal-500/70 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">tips_and_updates</span>
                    {isKr ? '안무 큐' : 'Choreography Cue'}
                  </p>
                  <p className="text-teal-100/90 text-xs font-medium leading-relaxed italic">"{t(ref.oneLineDesc)}"</p>
                </div>

                <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{isKr ? '적용 맥락' : 'Context'}</p>
                  <p className="text-slate-300 text-xs font-light leading-relaxed">{t(ref.applicableContext)}</p>
                </div>
              </div>

              <button
                onClick={() => onAddReference(ref)}
                className="w-full bg-white/5 hover:bg-teal-500 text-slate-300 hover:text-white border border-white/10 hover:border-teal-400 rounded-lg py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group/btn"
              >
                <span className="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">add_circle</span>
                {isKr ? "타임라인에 추가" : "Add to Timeline"}
              </button>
            </div>
          </div>
        ))}
        {curatedReferences.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-2xl bg-black/20">
            <span className="material-symbols-outlined text-4xl mb-3 opacity-50">search_off</span>
            <p className="text-sm">{isKr ? "조건에 맞는 레퍼런스를 찾지 못했습니다. 검색어를 바꾸거나 지워서 더 넓은 움직임 풀을 확인해보세요." : "No references matched this search yet. Try another keyword or clear the search to explore a wider movement pool."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
