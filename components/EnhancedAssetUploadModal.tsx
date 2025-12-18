import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../hooks/useData';
import AssetCategoryMasterModal from './AssetCategoryMasterModal';
import AssetFormatMasterModal from './AssetFormatMasterModal';
import type { AssetLibraryItem, Service, SubServiceItem, User, AssetFormat } from '../types';

interface AssetCategoryMasterItem {
    id: number;
    brand: string;
    category_name: string;
    word_count: number;
    status: string;
    created_at?: string;
    updated_at?: string;
}

interface EnhancedAssetUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editingAsset?: AssetLibraryItem | null;
}

type UploadStep = 'application-type' | 'application-fields' | 'upload-file' | 'asset-details' | 'final-review';

const EnhancedAssetUploadModal: React.FC<EnhancedAssetUploadModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    editingAsset
}) => {
    const { create: createAsset, update: updateAsset } = useData<AssetLibraryItem>('assetLibrary');
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices