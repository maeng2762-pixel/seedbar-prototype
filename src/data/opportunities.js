export const getOpportunities = () => [
  {
    id: 1,
    type: { EN: "Workshop & Audition", KR: "워크숍 & 오디션" },
    institution: { EN: "NDT (Nederlands Dans Theater)", KR: "네덜란드 댄스 시어터 (NDT)" },
    location: { EN: "The Hague, Netherlands", KR: "네덜란드, 헤이그" },
    title: { EN: "2026 NDT Summer Intensive", KR: "2026 NDT 썸머 인텐시브" },
    period: "2026.07.15 - 2026.08.02",
    deadline: "2026.04.30",
    desc: { 
      EN: "Intensive training program focusing on NDT repertoire and creative processes. Exceptional participants may be invited to closed auditions.", 
      KR: "NDT 레퍼토리와 창작 과정을 중심으로 한 집중 훈련 프로그램입니다. 우수 참가자는 비공개 오디션에 초대될 수 있습니다." 
    },
    link: "https://www.ndt.nl/en/participate/ndt-summer-intensive/",
    cost: {
      estimated: "€850 ~ €1,200",
      breakdown: {
        registration: "€50",
        tuition: "€800",
        accommodation: "€350 (Optional Campus)",
        transport: "Not Included"
      }
    },
    benefits: { EN: "Partial Scholarship available for 2 dancers", KR: "우수자 2인 부분 장학금 지원" },
    isFree: false,
    hasSupport: true,
    genre: "Contemporary",
    status: "OPEN"
  },
  {
    id: 2,
    type: { EN: "Open Call", KR: "국제 공모" },
    institution: { EN: "SIDance", KR: "서울세계무용축제 (SIDance)" },
    location: { EN: "Seoul, South Korea", KR: "대한민국, 서울" },
    title: { EN: "International Co-production Open Call", KR: "국제 공동제작 공모전 오픈콜" },
    period: "2026.09.01 - 2026.09.20",
    deadline: "2026.05.15",
    desc: { 
      EN: "Seeking innovative contemporary dance pieces for international collaboration and premiering at SIDance.", 
      KR: "혁신적이고 독창적인 컨템포러리 무용 작품을 위한 국제 협업 공모전입니다. 최종 선정작은 초연 기회가 주어집니다." 
    },
    link: "http://www.sidance.org/",
    cost: {
      estimated: "None",
      breakdown: {
        registration: "Free",
        tuition: "N/A",
        accommodation: "Provided",
        transport: "Flight Partially Covered"
      }
    },
    benefits: { EN: "Production budget up to $10,000, Flight & Accommodation", KR: "제작 지원금 최대 1,000만원, 항공 및 숙박 제공" },
    isFree: true,
    hasSupport: true,
    genre: "Contemporary",
    status: "OPEN"
  },
  {
    id: 3,
    type: { EN: "Residency", KR: "레지던시" },
    institution: { EN: "Pina Bausch Foundation", KR: "피나 바우쉬 재단" },
    location: { EN: "Wuppertal, Germany", KR: "독일, 부퍼탈" },
    title: { EN: "2026 Pina Bausch Fellowship", KR: "2026 피나 바우쉬 펠로우십" },
    period: "2026.10.01 - 2027.03.31 (Flexible)",
    deadline: "2026.06.01",
    desc: { 
      EN: "A fellowship grant for dance and choreography supporting temporary residency at an internationally renowned institution of the dancer's choice.", 
      KR: "자유롭게 선택한 해외 최정상급 무용 기관에서의 체류 및 연구를 지원하는 안무가/무용수 대상 펠로우십입니다." 
    },
    link: "https://fellowship.pinabausch.org/en/fellowship",
    cost: {
      estimated: "None (Funded)",
      breakdown: {
        registration: "Free",
        tuition: "N/A",
        accommodation: "Covered by Allowance",
        transport: "Flight Covered"
      }
    },
    benefits: { EN: "Monthly allowance €1,500 + Travel expenses", KR: "월 체류비 €1,500 및 왕복 항공료 전액 지원" },
    isFree: true,
    hasSupport: true,
    genre: "All",
    status: "OPEN"
  },
  {
    id: 4,
    type: { EN: "Audition", KR: "오디션" },
    institution: { EN: "Akram Khan Company", KR: "아크람 칸 컴퍼니" },
    location: { EN: "London, UK", KR: "영국, 런던" },
    title: { EN: "Company Dancer Audition for New Creation", KR: "신작 창작을 위한 정단원 오디션" },
    period: "2026.08.10 - 2026.08.12",
    deadline: "2026.05.20",
    desc: { 
      EN: "Seeking highly skilled contemporary dancers with a strong classical or traditional background for a new touring production.", 
      KR: "새로운 글로벌 투어 작품에 참여할 클래식/전통 무용 기반의 탄탄한 컨템포러리 무용수를 찾습니다." 
    },
    link: "https://www.akramkhancompany.net/opportunities/",
    cost: {
      estimated: "£0 (Audition) + Travel",
      breakdown: {
        registration: "Free",
        tuition: "N/A",
        accommodation: "Not Included for Audition",
        transport: "Not Included"
      }
    },
    benefits: { EN: "Full-time contract with UK standard Equity rates", KR: "영국 노조 기준 풀타임 정식 계약 및 사례비" },
    isFree: true,
    hasSupport: false,
    genre: "Contemporary",
    status: "OPEN"
  }
];

export const getLastUpdatedTime = () => {
  // Use a simulated date that is close to the current system time dynamically for realistic effect.
  // We'll fix it to the current day 09:00 AM for visual consistency.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}.${month}.${day} 09:00`;
};
