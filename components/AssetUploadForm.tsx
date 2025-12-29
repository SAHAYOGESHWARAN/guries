import React, { useState, useRef, useMemo } from 'react';
import type { AssetLibraryItem, Service, SubServiceItem, User, AssetCategoryMasterItem, AssetTypeMasterItem, Campaign, Project, Task } from '../types';

interface AssetUploadFormProps {
    // Data
    services: Service[];
    subServices: SubServiceItem[];
    users: User[];
    assetCategories: AssetCategoryMasterItem[];
    assetTypes: AssetTypeMasterItem[];
    campaigns: Campaign[];
    projects: Project[];
    tasks: Task[];
    
    // State
    newAsset: Partial<AssetLibraryItem>;
    setNewAsset: (asset: Partial<AssetLibraryItem>) => void;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    previewUrl: string;
    setPreviewUrl: (url: string) =