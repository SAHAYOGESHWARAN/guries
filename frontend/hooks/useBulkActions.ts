import { useState, useCallback, useMemo } from 'react';

export interface BulkActionState<T> {
    selectedIds: Set<number>;
    selectAll: boolean;
    isSelecting: boolean;
}

export interface BulkActionMethods<T> {
    toggleSelect: (id: number) => void;
    toggleSelectAll: (items: T[]) => void;
    clearSelection: () => void;
    getSelectedCount: () => number;
    isSelected: (id: number) => boolean;
    getSelectedItems: (items: T[]) => T[];
}

export const useBulkActions = <T extends { id: number }>(
    initialSelected: Set<number> = new Set()
): [BulkActionState<T>, BulkActionMethods<T>] => {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(initialSelected);
    const [selectAll, setSelectAll] = useState(false);

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const toggleSelectAll = useCallback((items: T[]) => {
        if (selectAll) {
            setSelectedIds(new Set());
            setSelectAll(false);
        } else {
            setSelectedIds(new Set(items.map(item => item.id)));
            setSelectAll(true);
        }
    }, [selectAll]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
        setSelectAll(false);
    }, []);

    const getSelectedCount = useCallback(() => selectedIds.size, [selectedIds]);

    const isSelected = useCallback((id: number) => selectedIds.has(id), [selectedIds]);

    const getSelectedItems = useCallback((items: T[]) => {
        return items.filter(item => selectedIds.has(item.id));
    }, [selectedIds]);

    const state: BulkActionState<T> = {
        selectedIds,
        selectAll,
        isSelecting: selectedIds.size > 0
    };

    const methods: BulkActionMethods<T> = {
        toggleSelect,
        toggleSelectAll,
        clearSelection,
        getSelectedCount,
        isSelected,
        getSelectedItems
    };

    return [state, methods];
};
