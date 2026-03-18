import React, { useState, useEffect, useRef } from 'react';

const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.toString().split(':');
    return parseInt(parts[0] || '0') * 60 + parseInt(parts[1] || '0');
};

const formatTime = (seconds) => {
    const s = Math.max(0, Math.round(seconds));
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

const MAX_DURATION = 300; // 5 minutes track duration max

export default function TimelineNavigator({
    items = [],
    selectedTime = null,
    beatMarkers = [],
    onJump,
    onChange
}) {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const [localItems, setLocalItems] = useState([]);
    const [zoom, setZoom] = useState(1);
    const [selectedItemId, setSelectedItemId] = useState(null);

    // Click distinction
    const [pointerDownInfo, setPointerDownInfo] = useState(null);

    // Drag states
    const [draggingId, setDraggingId] = useState(null);
    const [resizingId, setResizingId] = useState(null);
    const [startX, setStartX] = useState(0);
    const [activeItemInitialStart, setActiveItemInitialStart] = useState(0);
    const [activeItemInitialDuration, setActiveItemInitialDuration] = useState(0);

    const [isKr] = useState(() => typeof window !== 'undefined' ? window.navigator.language.startsWith('ko') : false);

    // Initialize block segments from items
    useEffect(() => {
        let sorted = [...items].sort((a, b) => parseTime(a.time) - parseTime(b.time));
        const newLocal = sorted.map((item, idx) => {
            const start = parseTime(item.time);
            let duration = item.duration;
            if (duration == null) {
                if (idx < sorted.length - 1) {
                    duration = parseTime(sorted[idx+1].time) - start;
                } else {
                    duration = 30; // default length
                }
            }
            return {
                id: item.id || `temp-${idx}`,
                originalItem: item,
                start,
                duration: Math.max(5, duration) // ensure minimum 5 seconds
            };
        });
        setLocalItems(newLocal);
    }, [items]);

    const getStageName = (item) => {
        return typeof item.originalItem.stage === 'object' 
            ? (item.originalItem.stage[isKr?'kr':'en'] || item.originalItem.stage.en || item.originalItem.stage.kr) 
            : item.originalItem.stage;
    };

    const handlePointerDown = (e, id, type) => {
        e.preventDefault();
        e.stopPropagation();
        
        const item = localItems.find(i => i.id === id);
        if (!item) return;

        setPointerDownInfo({ x: e.clientX, y: e.clientY, time: Date.now(), id });

        setStartX(e.clientX);
        setActiveItemInitialStart(item.start);
        setActiveItemInitialDuration(item.duration);

        if (type === 'move') {
            setDraggingId(id);
        } else if (type === 'resize') {
            setResizingId(id);
        }
    };

    const emitChange = (updatedItems) => {
        const sorted = [...updatedItems].sort((a, b) => a.start - b.start);
        if (onChange) {
            const exportItems = sorted.map(itm => ({
                ...itm.originalItem,
                time: formatTime(itm.start),
                duration: itm.duration
            }));
            onChange(exportItems);
        }
    };

    useEffect(() => {
        const handlePointerMove = (e) => {
            if (!draggingId && !resizingId) return;
            if (!trackRef.current) return;
            const trackRect = trackRef.current.getBoundingClientRect();
            // width goes with zoom. trackRect.width is the total SCALED width.
            const timePerPixel = MAX_DURATION / trackRect.width;
            
            const deltaX = e.clientX - startX;
            const deltaTime = deltaX * timePerPixel;

            setLocalItems(prev => prev.map(item => {
                if (draggingId && item.id === draggingId) {
                    let newStart = activeItemInitialStart + deltaTime;
                    newStart = Math.max(0, Math.min(newStart, MAX_DURATION - item.duration));
                    return { ...item, start: Math.round(newStart) };
                }
                if (resizingId && item.id === resizingId) {
                    let newDuration = activeItemInitialDuration + deltaTime;
                    newDuration = Math.max(5, Math.min(newDuration, MAX_DURATION - item.start));
                    return { ...item, duration: Math.round(newDuration) };
                }
                return item;
            }));
        };

        const handlePointerUp = (e) => {
            if (pointerDownInfo && (draggingId === pointerDownInfo.id || resizingId === pointerDownInfo.id)) {
                const timeDiff = Date.now() - pointerDownInfo.time;
                const distDist = Math.hypot(e.clientX - pointerDownInfo.x, e.clientY - pointerDownInfo.y);
                // If the pointer didn't move much and was quick, treat it as a tap
                if (timeDiff < 400 && distDist < 10) {
                    setSelectedItemId(pointerDownInfo.id);
                    const itm = localItems.find(i => i.id === pointerDownInfo.id);
                    if (itm && onJump) onJump(itm.originalItem);
                }
            }

            if (draggingId || resizingId) {
                setDraggingId(null);
                setResizingId(null);
                setLocalItems(prev => {
                    const updated = [...prev].sort((a, b) => a.start - b.start);
                    emitChange(updated);
                    return updated;
                });
            }
            setPointerDownInfo(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [draggingId, resizingId, startX, activeItemInitialStart, activeItemInitialDuration, pointerDownInfo, localItems, onChange, onJump]);

    const handleAdjustTime = (delta) => {
        if (!selectedItemId) return;
        setLocalItems(prev => {
            const updated = prev.map(item => {
                if (item.id === selectedItemId) {
                    let newStart = Math.max(0, Math.min(item.start + delta, MAX_DURATION - item.duration));
                    return { ...item, start: newStart };
                }
                return item;
            });
            emitChange(updated);
            return updated;
        });
    };

    const handleAdjustDuration = (delta) => {
        if (!selectedItemId) return;
        setLocalItems(prev => {
            const updated = prev.map(item => {
                if (item.id === selectedItemId) {
                    let newDuration = Math.max(5, Math.min(item.duration + delta, MAX_DURATION - item.start));
                    return { ...item, duration: newDuration };
                }
                return item;
            });
            emitChange(updated);
            return updated;
        });
    };

    const handleMoveOrder = (dir) => {
        if (!selectedItemId) return;
        let sorted = [...localItems].sort((a, b) => a.start - b.start);
        const idx = sorted.findIndex(i => i.id === selectedItemId);
        if (dir === 'left' && idx > 0) {
            let leftItem = sorted[idx - 1];
            let currentItem = sorted[idx];
            let tempStart = leftItem.start;
            let currentStart = currentItem.start;
            currentItem.start = tempStart;
            leftItem.start = currentStart;
        } else if (dir === 'right' && idx < sorted.length - 1) {
            let rightItem = sorted[idx + 1];
            let currentItem = sorted[idx];
            let tempStart = currentItem.start;
            currentItem.start = rightItem.start;
            rightItem.start = tempStart;
        }
        emitChange(sorted);
        setLocalItems(sorted);
    };

    const handleFocusItem = (itemStart) => {
        if (!containerRef.current || !trackRef.current) return;
        const width = trackRef.current.clientWidth;
        const leftPercent = itemStart / MAX_DURATION;
        const scrollLeft = (width * leftPercent) - (containerRef.current.clientWidth / 2);
        containerRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    };

    useEffect(() => {
        if (zoom > 1 && selectedItemId) {
            const itm = localItems.find(i => i.id === selectedItemId);
            if (itm) {
                setTimeout(() => handleFocusItem(itm.start), 50);
            }
        }
    }, [zoom, selectedItemId]);

    const selectedItem = localItems.find(i => i.id === selectedItemId);

    return (
        <div className="bg-black/20 border border-white/10 p-4 sm:p-5 rounded-md flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#5B13EC] font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    {isKr ? "타임라인 에디터" : "Timeline Editor"}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors" title="Zoom Out">
                        <span className="material-symbols-outlined text-[16px]">zoom_out</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(4, z + 0.5))} className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors" title="Zoom In">
                        <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                    </button>
                </div>
            </div>

            <div className="text-[10px] text-teal-400/80 font-sans sm:hidden tracking-wider bg-teal-500/10 p-2 rounded border border-teal-500/20 flex gap-2 items-center">
                <span className="material-symbols-outlined text-[14px]">touch_app</span>
                {isKr ? "탭하여 편집 / 버튼으로 시간 조정" : "Tap to edit / use buttons to adjust time"}
            </div>

            {/* Track UI */}
            <div 
                ref={containerRef}
                className="overflow-x-auto overflow-y-hidden pb-4 scroll-smooth custom-scrollbar w-full"
                style={{ scrollbarWidth: 'thin' }}
            >
                <div 
                    ref={trackRef}
                    className="relative h-20 bg-white/5 border border-white/10 rounded overflow-hidden select-none touch-none shadow-inner transition-width duration-300 ease-out"
                    style={{ width: `${zoom * 100}%`, minWidth: '100%' }}
                >
                    {/* Major Grid Lines & Time Markers */}
                    {[0, 60, 120, 180, 240, 300].map(t => (
                        <div 
                            key={t}
                            className="absolute top-0 bottom-0 border-l border-white/10 pointer-events-none"
                            style={{ left: `${(t / MAX_DURATION) * 100}%` }}
                        >
                            <span className="absolute top-1 left-1 text-[9px] text-slate-500 font-mono tracking-widest">
                                {formatTime(t)}
                            </span>
                        </div>
                    ))}

                    {/* Timeline Sections (Blocks) */}
                    {localItems.map((item) => {
                        const leftPercent = (item.start / MAX_DURATION) * 100;
                        const widthPercent = (item.duration / MAX_DURATION) * 100;
                        const isSelected = selectedTime === item.originalItem.time || selectedItemId === item.id;
                        const isInteracting = draggingId === item.id || resizingId === item.id;
                        const stageName = getStageName(item);

                        return (
                            <div
                                key={item.id}
                                style={{
                                    left: `${Math.max(0, Math.min(leftPercent, 100))}%`,
                                    width: `${Math.max(0.5, Math.min(widthPercent, 100 - leftPercent))}%`,
                                    minWidth: '70px'
                                }}
                                className={`absolute top-4 bottom-2 rounded border transition-colors cursor-grab active:cursor-grabbing flex flex-col justify-center px-2 group shadow-lg ${
                                    isInteracting 
                                        ? 'bg-[#5B13EC]/60 border-[#5B13EC] z-20 scale-[1.02]'
                                        : isSelected
                                          ? 'bg-[#5B13EC]/40 border-[#5B13EC] z-10'
                                          : 'bg-teal-500/20 border-teal-500/30 hover:bg-teal-500/40 hover:border-teal-500/60 z-0'
                                }`}
                                onPointerDown={(e) => handlePointerDown(e, item.id, 'move')}
                            >
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest truncate mix-blend-plus-lighter pointer-events-none">
                                    {stageName}
                                </span>
                                <span className="text-[8px] text-slate-300 font-mono opacity-90 mt-0.5 pointer-events-none truncate">
                                    {formatTime(item.start)} - {formatTime(item.start + item.duration)}
                                </span>

                                {/* Resize Handle */}
                                <div 
                                    className="absolute right-0 top-0 bottom-0 w-5 cursor-col-resize hover:bg-white/30 border-l border-white/20 flex items-center justify-center transition-colors"
                                    onPointerDown={(e) => handlePointerDown(e, item.id, 'resize')}
                                >
                                    <span className="material-symbols-outlined text-[12px] text-white opacity-60 pointer-events-none transform rotate-90 scale-y-150">drag_handle</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile / Tap Edit Panel */}
            {selectedItem && (
                <div className="bg-[#111] border border-[#5B13EC]/40 rounded-md p-4 animate-in fade-in slide-in-from-top-2 mt-2">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-white text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#5B13EC] text-[16px]">edit_note</span>
                            {isKr ? "상세 편집 패널" : "Edit Panel"} - {getStageName(selectedItem)}
                        </span>
                        <button onClick={() => setSelectedItemId(null)} className="text-slate-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        {/* Start Time Adjust */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400">{isKr ? "시작 시간" : "Start Time"} ({formatTime(selectedItem.start)})</span>
                            <div className="flex gap-1">
                                <button onClick={() => handleAdjustTime(-5)} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded py-2 text-xs font-mono text-white transition-colors">-5s</button>
                                <button onClick={() => handleAdjustTime(5)} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded py-2 text-xs font-mono text-white transition-colors">+5s</button>
                            </div>
                        </div>

                        {/* Duration Adjust */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400">{isKr ? "길이" : "Duration"} ({formatTime(selectedItem.duration)})</span>
                            <div className="flex gap-1">
                                <button onClick={() => handleAdjustDuration(-5)} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded py-2 text-xs font-mono text-white transition-colors">-5s</button>
                                <button onClick={() => handleAdjustDuration(5)} className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded py-2 text-xs font-mono text-white transition-colors">+5s</button>
                            </div>
                        </div>

                        {/* Order Adjust */}
                        <div className="flex flex-col gap-2">
                            <span className="text-[9px] uppercase tracking-widest text-slate-400">{isKr ? "순서 이동" : "Change Order"}</span>
                            <div className="flex gap-1">
                                <button onClick={() => handleMoveOrder('left')} className="flex-1 bg-white/10 hover:bg-[#5B13EC]/40 border border-[#5B13EC]/30 rounded py-2 text-[10px] uppercase font-bold text-white transition-colors flex items-center justify-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">arrow_back</span>
                                    {isKr ? "앞으로" : "Move Left"}
                                </button>
                                <button onClick={() => handleMoveOrder('right')} className="flex-1 bg-white/10 hover:bg-[#5B13EC]/40 border border-[#5B13EC]/30 rounded py-2 text-[10px] uppercase font-bold text-white transition-colors flex items-center justify-center gap-1">
                                    {isKr ? "뒤로" : "Move Right"}
                                    <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
                        {/* Action Name */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-teal-400">{isKr ? "움직임 프롬프트" : "Movement Prompt"}</span>
                            <input 
                                className="bg-black/50 border border-teal-500/30 rounded p-2 text-xs text-white outline-none focus:border-teal-500 transition-colors w-full mt-1"
                                value={
                                    typeof selectedItem.originalItem.action === 'object' 
                                    ? (selectedItem.originalItem.action[isKr ? 'kr' : 'en'] || "") 
                                    : (selectedItem.originalItem.action || "")}
                                onChange={(e) => {
                                    const updatedItem = { ...selectedItem.originalItem };
                                    if (typeof updatedItem.action === 'object') {
                                        updatedItem.action[isKr ? 'kr' : 'en'] = e.target.value;
                                    } else {
                                        updatedItem.action = e.target.value;
                                    }
                                    selectedItem.originalItem = updatedItem;
                                    emitChange(localItems);
                                    setLocalItems([...localItems]); // triggers re-render
                                }}
                                placeholder={isKr ? "동작 키워드 수정" : "Edit Keywords"}
                            />
                        </div>

                        {/* Emotion Intensity Input */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-teal-400">{isKr ? "감정 강도" : "Emotion Intensity"}</span>
                            <div className="flex items-center gap-3 bg-black/50 border border-teal-500/30 rounded px-3 py-1 mt-1">
                                <input 
                                    type="range"
                                    min="1" max="100"
                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-400"
                                    value={selectedItem.originalItem.emotionIntensity || 50}
                                    onChange={(e) => {
                                        const updatedItem = { ...selectedItem.originalItem };
                                        updatedItem.emotionIntensity = Number(e.target.value);
                                        selectedItem.originalItem = updatedItem;
                                        emitChange(localItems);
                                        setLocalItems([...localItems]); // trigger re-render
                                    }}
                                />
                                <span className="text-white text-xs font-mono w-6 text-center">{selectedItem.originalItem.emotionIntensity || 50}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="hidden sm:flex justify-between text-[8px] sm:text-[10px] text-slate-500 font-sans tracking-widest uppercase mt-1">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px] sm:text-[12px]">drag_pan</span> Drag block to move</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px] sm:text-[12px]">compare_arrows</span> Drag right edge to resize</span>
            </div>
        </div>
    );
}
