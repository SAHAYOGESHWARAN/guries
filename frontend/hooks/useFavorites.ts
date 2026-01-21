import { useState, useCallback, useEffect } from 'react';

const FAVORITES_STORAGE_KEY = 'app_favorites';

export interface UseFavoritesReturn {
    favorites: Set<number>;
    isFavorite: (id: number) => boolean;
    toggleFavorite: (id: number) => void;
    addFavorite: (id: number) => void;
    removeFavorite: (id: number) => void;
    clearFavorites: () => void;
    getFavoriteCount: () => number;
}

export const useFavorites = (namespace: string = 'default'): UseFavoritesReturn => {
    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    // Load favorites from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(`${FAVORITES_STORAGE_KEY}_${namespace}`);
            if (stored) {
                setFavorites(new Set(JSON.parse(stored)));
            }
        } catch (error) {
            console.error('Failed to load favorites:', error);
        }
    }, [namespace]);

    // Save favorites to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(
                `${FAVORITES_STORAGE_KEY}_${namespace}`,
                JSON.stringify(Array.from(favorites))
            );
        } catch (error) {
            console.error('Failed to save favorites:', error);
        }
    }, [favorites, namespace]);

    const isFavorite = useCallback((id: number) => favorites.has(id), [favorites]);

    const toggleFavorite = useCallback((id: number) => {
        setFavorites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const addFavorite = useCallback((id: number) => {
        setFavorites(prev => new Set(prev).add(id));
    }, []);

    const removeFavorite = useCallback((id: number) => {
        setFavorites(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    }, []);

    const clearFavorites = useCallback(() => {
        setFavorites(new Set());
    }, []);

    const getFavoriteCount = useCallback(() => favorites.size, [favorites]);

    return {
        favorites,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearFavorites,
        getFavoriteCount
    };
};
