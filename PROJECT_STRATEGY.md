# 🎭 프로젝트 전략 보고서: Seedbar AI Creative Production Engine

본 문서는 무용/공연 예술 분야의 디지털 혁신을 주도하는 **"Seedbar AI 기획 및 도록 생성 SaaS"**의 프로젝트 정의, 사업 전략 및 시스템 명세에 대해 기술합니다.

---

## 1. 프로젝트 정의 (Project Definition)
### **"안무가의 파편화된 영감을 완결된 기획서로, 5분 만의 기적"**
Seedbar는 무용 전공자 및 창작자들이 겪는 **기획의 고통(아이디어 구체화, 학술적 문서화, 디자인)**을 AI 기술로 해결하는 **NotebookLM 스타일의 RAG 입력 엔진 기반 SaaS**입니다. 3D 애니메이션이나 모션 캡처가 아닌, **'공연 기획 문서'와 '발표용 PPT/팜플렛' 생성**에 100% 집중하여 창작자가 본질적인 '움직임'에만 전념할 수 있도록 돕습니다.

---

## 2. 핵심 방향성 (Core Focus)

### **① 7단계 AI 프롬프트 체인 (7-Step Chain of Prompts)**
단순한 텍스트 생성이 아닌, 이전 단계의 문맥을 학습하여 다음 단계를 생성하는 정교한 파이프라인을 구축합니다.
1. **Artistic Titles**: 단어 분해형, 추상형 등 4가지 예술적 제목 제안.
2. **Concept & Philosophy**: 작품의 근간이 되는 철학적 질문과 예술가적 선언(Statement).
3. **Narrative Architecture**: 기승전결 구조와 타임라인 감정 흐름 곡선(Chart.js).
4. **Soundscape Analysis**: 분위기에 최적화된 음악 스타일 및 BPM, 사운드 텍스처 분석.
5. **Visual Scenography**: AI 생성 이미지를 통한 무대 조명 및 의상 컨셉 시안.
6. **Presentation Building**: 발표용 PPT 8슬라이드 기획 및 대본 자동 생성.
7. **Pamphlet Design**: 실제 인쇄 가능한 수준의 공연 팜플렛 레이아웃 및 텍스트 구성.

### **② Contemporary Art Catalog UI Design**
*   **미니멀리즘**: 불필요한 장식을 배제하고 폰트와 여백을 통해 전문성을 강조.
*   **가독성**: 실제 미술관 도록(Catalog)을 보는 듯한 타이포그래피와 레이아웃.
*   **고급감**: 다크 모드와 글래스모피즘, 화이트 섹션의 대비를 통한 프리미엄 경험 제공.

---

## 3. 사업 수익 모델 (Business Model)

### **① 코인 기반 페이월 (Coin-based Paywall)**
*   **Free Preview**: 1~5단계(제목, 기획서, 감정 곡선, 음악, 시각 시안)는 무료 열람.
*   **Premium Export**: 최종 산출물인 **[ PPT 파일 + PDF 팜플렛 번들 ]** 내보내기 시 **250 Coins** 차감.

### **② 타겟 세그먼트**
*   **예술 대학 전공자**: 과제 제출 및 졸업 작품 기획서 작성 시간 90% 단축.
*   **독립 안무가**: 정부 지원 사업 및 공모전 신청용 전문 문서 자동 생성.
*   **퍼포먼스 디렉터**: 빠른 시안 확정 및 팀원/클라이언드 공유용 시각화 자료.

---

## 4. 시스템 아키텍처 (System Architecture)

*   **Frontend**: Next.js(React), Tailwind CSS, Framer Motion, Chart.js.
*   **Backend**: Supabase (Auth, Database, Transaction Logging).
*   **AI Engine**: OpenAI GPT-4o 리전 체이닝 기술 (Chain-of-Thoughts Prompting).
*   **Document Engine**: PPTX/PDF 자동 변환 및 클라우드 스토리지 연동.

---

**보고자**: Antigravity AI Lead Architect
**최종 업데이트**: 2026-03-07
**프로젝트 상태**: V2.0 Core Pipeline Implementation Complete
