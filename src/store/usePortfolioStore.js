import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const usePortfolioStore = create(
    persist(
        (set, get) => ({
            portfolioItems: [],
            heroItemId: null,

            addToPortfolio: (item) => set((state) => {
                // item: { id: string, type: 'PROJECT' | 'DOCUMENT', projectId: string, title: string, docType?: string, date: string, coverImage?: string }
                // Avoid duplicates
                if (state.portfolioItems.find(i => i.id === item.id)) return state;
                return { portfolioItems: [item, ...state.portfolioItems] };
            }),

            removeFromPortfolio: (id) => set((state) => ({
                portfolioItems: state.portfolioItems.filter(item => item.id !== id),
                heroItemId: state.heroItemId === id ? null : state.heroItemId,
            })),

            setHeroItem: (id) => set({ heroItemId: id }),

            renameItem: (id, newTitle) => set((state) => ({
                portfolioItems: state.portfolioItems.map(item => 
                    item.id === id ? { ...item, title: newTitle } : item
                )
            })),

            updatePortfolioItem: (id, updates) => set((state) => ({
                portfolioItems: state.portfolioItems.map(item =>
                    item.id === id ? { ...item, ...updates } : item
                )
            })),
        }),
        {
            name: 'seedbar-portfolio-storage',
        }
    )
);

export default usePortfolioStore;
