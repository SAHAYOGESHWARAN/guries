import React from 'react';
import WebAssetUploadView from './WebAssetUploadView';

interface AssetEditViewProps {
    assetId?: number;
    onNavigate?: (view: string, id?: number) => void;
}

const AssetEditView: React.FC<AssetEditViewProps> = ({ assetId, onNavigate }) => {
    return <WebAssetUploadView editAssetId={assetId} onNavigate={onNavigate} />;
};

export default AssetEditView;
