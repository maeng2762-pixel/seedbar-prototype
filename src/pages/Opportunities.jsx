import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import useStore from '../store/useStore';
import LanguageToggle from '../components/LanguageToggle';
import { getOpportunities, getLastUpdatedTime } from '../data/opportunities';

const i18n = {
  EN: {
    title: 'Global Dance Opportunities',
    desc: 'Explore auditions, workshops, festivals, and residencies worldwide.',
    filterType: 'Type',
    filterRegion: 'Region',
    filterGenre: 'Genre',
    filterCost: 'Cost',
    filterSupport: 'Support',
    sortOptions: 'Sort by',
    all: 'All',
    viewDetails: 'View Details',
    deadline: 'Deadline',
    noLinkAlert: 'The link is currently unavailable or expired.',
  },
  KR: {
    title: '글로벌 무용 기회',
    desc: '전 세계의 주요 오디션, 워크숍, 페스티벌, 레지던시 정보를 탐색하세요.',
    filterType: '유형',
    filterRegion: '지역',
    filterGenre: '장르',
    filterCost: '비용',
    filterSupport: '지원금',
    sortOptions: '정렬',
    all: '전체',
    viewDetails: '자세히 보기',
    deadline: '지원 마감',
    noLinkAlert: '현재 링크를 불러올 수 없거나 만료된 공고입니다.',
  }
};

const TYPES = ['All', 'Workshop & Audition', 'Open Call', 'Residency', 'Audition', 'Performance'];
const GENRES = ['All', 'Contemporary', 'Ballet', 'Korean Dance', 'All'];
const REGIONS = ['All', 'The Hague, Netherlands', 'Seoul, South Korea', 'Wuppertal, Germany', 'London, UK'];
const COSTS = ['All', 'Free', 'Paid'];
const SUPPORTS = ['All', 'Has Support', 'No Support'];

export default function Opportunities() {
  const navigate = useNavigate();
  const { language } = useStore();
  const t = i18n[language] || i18n.EN;

  const [typeFilter, setTypeFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [genreFilter, setGenreFilter] = useState('All');
  const [costFilter, setCostFilter] = useState('All');
  const [supportFilter, setSupportFilter] = useState('All');
  const [sortBy, setSortBy] = useState('deadlineAsc');

  const ALL_OPPORTUNITIES = getOpportunities();

  const handleLinkClick = (link) => {
    if (!link) {
      alert(t.noLinkAlert);
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredData = ALL_OPPORTUNITIES.filter(item => {
    if (typeFilter !== 'All' && item.type.EN !== typeFilter) return false;
    // Location contains the region loosely
    if (regionFilter !== 'All' && item.location.EN !== regionFilter) return false;
    if (genreFilter !== 'All' && item.genre !== genreFilter) return false;
    if (costFilter === 'Free' && !item.isFree) return false;
    if (costFilter === 'Paid' && item.isFree) return false;
    if (supportFilter === 'Has Support' && !item.hasSupport) return false;
    if (supportFilter === 'No Support' && item.hasSupport) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'deadlineAsc') {
      return new Date(a.deadline) - new Date(b.deadline);
    } else {
      // newest
      return b.id - a.id;
    }
  });

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-background-dark font-display text-slate-100 pb-20">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(91,19,236,0.15),transparent_40%),linear-gradient(180deg,#120f1d_0%,#09070f_100%)]" />
      </div>

      <div className="relative z-20 flex items-center justify-between px-6 pb-5 pt-12">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">{t.title}</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">{language === 'KR' ? `마지막 업데이트: ${getLastUpdatedTime()}` : `Last Updated: ${getLastUpdatedTime()}`}</p>
          </div>
        </div>
        <LanguageToggle />
      </div>

      <div className="relative z-20 px-6 pb-28">
        
        {/* Filters */}
        <div className="mb-6 space-y-3 p-4 bg-white/[0.03] border border-white/10 rounded-2xl">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-semibold w-12">{t.filterType}:</span>
            <div className="flex flex-wrap gap-2 flex-1">
              {['All', 'Workshop & Audition', 'Open Call', 'Residency', 'Audition'].map(type => {
                const labelMapKR = {
                    'All': '전체', 'Workshop & Audition': '워크숍 & 오디션', 'Open Call': '국제 공모', 'Residency': '레지던시', 'Audition': '오디션'
                };
                return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${typeFilter === type ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  {language === 'KR' ? labelMapKR[type] || type : type}
                </button>
              )})}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-semibold w-12">{t.filterGenre}:</span>
            <div className="flex flex-wrap gap-2 flex-1">
              {['All', 'Contemporary', 'All Genre'].map(genre => {
                const labelMapKR = {
                    'All': '전체', 'Contemporary': '현대무용', 'All Genre': '모든 장르'
                };
                return (
                <button
                  key={genre}
                  onClick={() => setGenreFilter(genre === 'All Genre' ? 'All' : genre)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${genreFilter === (genre === 'All Genre' ? 'All' : genre) ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  {language === 'KR' ? labelMapKR[genre] || genre : genre}
                </button>
              )})}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-semibold w-12">{t.filterCost}:</span>
            <div className="flex flex-wrap gap-2 flex-1">
              {['All', 'Free', 'Paid'].map(cost => {
                const labelMapKR = { 'All': '전체', 'Free': '무료', 'Paid': '유료' };
                return (
                <button
                  key={cost}
                  onClick={() => setCostFilter(cost)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${costFilter === cost ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  {language === 'KR' ? labelMapKR[cost] : cost}
                </button>
              )})}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-semibold w-12">{t.filterSupport}:</span>
            <div className="flex flex-wrap gap-2 flex-1">
              {['All', 'Has Support', 'No Support'].map(sup => {
                 const labelMapKR = { 'All': '전체', 'Has Support': '지원금/혜택 있음', 'No Support': '지원금 없음' };
                 return (
                <button
                  key={sup}
                  onClick={() => setSupportFilter(sup)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${supportFilter === sup ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  {language === 'KR' ? labelMapKR[sup] : sup}
                </button>
              )})}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-white/5 mt-2">
            <span className="text-xs text-slate-400 font-semibold w-12">{t.sortOptions}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-black border border-white/10 rounded-md text-slate-300 text-[11px] p-1.5 outline-none"
            >
              <option value="deadlineAsc">{language === 'KR' ? '마감일 임박순' : 'Deadline First'}</option>
              <option value="newest">{language === 'KR' ? '최신 등록순' : 'Newest Added'}</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-4">
          {filteredData.map((opp) => (
            <div key={opp.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-5 transition-colors hover:bg-white/[0.08] flex flex-col h-full relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-rose-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                      <span className="rounded bg-primary/20 px-2 py-1 text-[9px] uppercase tracking-widest text-primary-light font-bold">
                        {language === 'KR' ? opp.type.KR : opp.type.EN}
                      </span>
                      {opp.hasSupport && (
                          <span className="rounded bg-teal-500/20 px-2 py-1 text-[9px] uppercase tracking-widest text-teal-300 font-bold border border-teal-500/30">
                            {language === 'KR' ? '지원금/혜택' : 'FUNDED'}
                          </span>
                      )}
                  </div>
                  <div className="flex flex-col items-end">
                      <p className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20 flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                        <span className="material-symbols-outlined text-[11px]">event_busy</span>
                        D-DAY: {opp.deadline}
                      </p>
                  </div>
                </div>
                
                <h3 className="text-base font-bold text-white leading-tight mb-2 drop-shadow-md pr-12 break-keep">
                  {language === 'KR' ? opp.title.KR : opp.title.EN}
                </h3>
                
                <div className="flex flex-col gap-2 mb-4 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-300 mb-1">
                      <span className="material-symbols-outlined text-[13px] text-slate-500 shrink-0">apartment</span>
                      <span className="font-semibold text-white truncate">{language === 'KR' ? opp.institution.KR : opp.institution.EN}</span>
                      <span className="text-slate-600 shrink-0">|</span>
                      <span className="material-symbols-outlined text-[13px] text-slate-500 shrink-0">location_on</span>
                      <span className="truncate flex-1">{language === 'KR' ? opp.location.KR : opp.location.EN}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <span className="material-symbols-outlined text-[13px] text-slate-500">calendar_month</span>
                        <span>{language === 'KR' ? '일정' : 'Period'}:</span>
                        <span className="font-mono text-[10px]">{opp.period}</span>
                    </div>

                    <div className="flex bg-white/5 rounded-lg p-3 mt-1 flex-col gap-2">
                        <div className="flex items-start gap-2 text-[11px] text-slate-300">
                            <span className="material-symbols-outlined text-[13px] text-indigo-400 shrink-0 mt-0.5">account_balance_wallet</span>
                            <div className="flex flex-col w-full">
                                <span className="flex items-center justify-between gap-1 text-indigo-300 font-bold mb-1 border-b border-indigo-500/20 pb-1">
                                    <span>{language === 'KR' ? 'AI 예상 비용' : 'AI Est. Cost'}</span>
                                    <span>{opp.cost.estimated}</span>
                                </span>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[9px] text-slate-400 p-1">
                                    <div className="flex justify-between"><span>{language === 'KR' ? '등록비' : 'Registration'}:</span><span className="text-white">{opp.cost.breakdown.registration}</span></div>
                                    <div className="flex justify-between"><span>{language === 'KR' ? '참가/학비' : 'Tuition'}:</span><span className="text-white">{opp.cost.breakdown.tuition}</span></div>
                                    <div className="flex justify-between"><span>{language === 'KR' ? '숙소비' : 'Accommodation'}:</span><span className="text-white truncate" title={opp.cost.breakdown.accommodation}>{opp.cost.breakdown.accommodation}</span></div>
                                    <div className="flex justify-between"><span>{language === 'KR' ? '교통비' : 'Transport'}:</span><span className="text-white truncate" title={opp.cost.breakdown.transport}>{opp.cost.breakdown.transport}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {opp.hasSupport && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-300 mt-1 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                            <span className="material-symbols-outlined text-[13px] text-yellow-500">redeem</span>
                            <span className="text-yellow-400 font-medium">
                                {language === 'KR' ? opp.benefits.KR : opp.benefits.EN}
                            </span>
                        </div>
                    )}
                </div>
                
                <p className="text-[12px] leading-relaxed text-slate-400 mb-5 flex-1 line-clamp-2 pr-2">
                  {language === 'KR' ? opp.desc.KR : opp.desc.EN}
                </p>
                
                <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleLinkClick(opp.link)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary/20 py-3 text-[11px] font-bold text-primary-light transition-colors hover:bg-primary/30 active:scale-[0.98] border border-primary/30"
                    >
                      {language === 'KR' ? '공식 안내 열기' : 'Official Page'}
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </button>
                    {opp.hasSupport && (
                        <div className="w-8 h-8 rounded-full border border-yellow-500/30 flex items-center justify-center bg-yellow-500/10 text-yellow-500" title="Funding Available">
                            <span className="material-symbols-outlined text-[16px]">stars</span>
                        </div>
                    )}
                </div>
              </div>
          ))}
          
          {filteredData.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm border border-white/10 rounded-2xl bg-white/5 border-dashed">
              <span className="material-symbols-outlined text-4xl mb-3 text-slate-500 opacity-50">search_off</span>
              <p>{language === 'KR' ? '조건에 맞는 공고가 없습니다.' : 'No opportunities found matching your criteria.'}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
