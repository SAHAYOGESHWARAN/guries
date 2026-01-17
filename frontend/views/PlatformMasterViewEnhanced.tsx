import React, { useState, useMemo } from 'react';
import Table from '../components/Table';
import AddPlatformModal from '../components/AddPlatformModal';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { PlatformMasterItem } from '../types';

const SCHEDULING_OPTIONS = ['All Scheduling', 'Manual', 'Auto', 'Both'];
const STATUS_OPTIONS = ['All Status', 'active', 'inactive'];

const PlatformMasterViewEnhanced: React.FC = () => {
    const { data: platforms, create, update, remove, isLoading } = useData<PlatformMasterItem>('platforms');
    
    // State management
    const [searchQuery, setSearchQuery] = useState('');
    const [schedulingFilter, setSchedulingFilter] = useState('All Scheduling');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PlatformMasterItem | null>(null);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    // Filter data
    const filteredData = useMemo(() => {
        return platforms.filter(item => {
            const matchesSearch = item.platform_name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesScheduling = schedulingFilter === 'All Scheduling' || item.scheduling === schedulingFilter;
            const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
            return matchesSearch && matchesScheduling && matchesStatus;
        });
    }, [platforms, searchQuery, schedulingFilter, statusFilter]);

    // Handlers
    const handleEdit = (item: PlatformMasterItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this platform? This action cannot be undone.')) {
            try {
                await remove(id);
            } catch (error) {
                console.error('Error deleting platform:', error);
                alert('Failed to delete platform');
            }
        }
    };

    const handleSave = async (formData: Partial<PlatformMasterItem>) => {
        setIsSaving(true);
        try {
            if (editingItem) {
                await update(editingItem.id, formData);
            } else {
                await create(formData as any);
            }
            setIsModalOpen(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Error saving platform:', error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        if (filteredData.length === 0) {
            alert('No data to export');
            return;
        }
        exportToCSV(filteredData, 'platform_master_export');
    };

    const handleBulkStatusChange = async (newStatus: string) => {
        if (selectedItems.size === 0) {
            alert('Please select platforms to update');
            return;
        }

        if (confirm(`Update status to "${newStatus}" for ${selectedItems.size} platform(s)?`)) {
            try {
                setIsSaving(true);
                const ids = Array.from(selectedItems);
                // Call bulk update endpoint
                const response = await fetch('/api/v1/platforms/bulk/update-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids, status: newStatus })
                });

                if (!response.ok) throw new Error('Failed to update status');
                
                setSelectedItems(new Set());
                // Refresh data
                window.location.reload();
            } catch (error) {
                console.error('Error updating status:', error);
                alert('Failed to update platform status');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedItems.size === filteredData.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredData.map(p => p.id)));
        }
    };

    const toggleSelect = (id: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
  