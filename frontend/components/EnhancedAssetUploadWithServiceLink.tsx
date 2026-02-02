import React, { useState, useRef, useCallback } from 'react';
import AssetServiceLinker from './AssetServiceLinker';
import type { AssetLibraryItem } from '../types';

interface EnhancedAssetUploadWithServiceLinkProps {
    onUpload: (asset: Partial<AssetLibraryItem>, file: File) => Promise<void>;
    onCancel: () => void;
    isUploading?: boolean;
}

const EnhancedAssetUploadWithServiceLink: React.FC<EnhancedAssetUploadWithServiceLinkProps> = ({
    onUpload,
    onCancel,
    isUploading = false
}) => {
    const [formData, setFormData] = useState<Partial<AssetLibraryItem>>({
        name: '',
        application_type: 'web',
        type: 'article',
        status: 'Draft'
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [linkedServiceId, setLinkedServiceId] = useState<number | null>(null);
    const [linkedSubServiceIds, setLinkedSubServiceIds] = useState<number[]>([]);
    const [error, setError] = useState<string>('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle file selection
    const handleFileSelect = useCallback((file: File) => {
        setError('');
        setValidationErrors({});

        // Validate file
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            setError('File size exceeds 50MB limit');
            return;
        }

        setSelectedFile(file);
        setFormData(prev => ({
            ...prev,
            name: prev.name || file.name.replace(/\.[^/.]+$/, ''),
            file_size: file.size,
            file_type: file.type
        }));

        // Generate preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle service selection
    const handleServiceSelect = (serviceId: number, subServiceIds: number[]) => {
        setLinkedServiceId(serviceId);
        setLinkedSubServiceIds(subServiceIds);
        setFormData(prev => ({
            ...prev,
            linked_service_id: serviceId,
            linked_sub_service_ids: subServiceIds
        }));
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            errors.name = 'Asset name is required';
        }

        if (!selectedFile) {
            errors.file = 'Please select a file to upload';
        }

        if (!linkedServiceId) {
            errors.service = 'Please select a service to link this asset to';
        }

        if (!formData.application_type) {
            errors.application_type = 'Please select an application type';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Please fix the validation errors below');
            return;
        }

        if (!selectedFile) {
            setError('No file selected');
            return;
        }

        try {
            setError('');
            await onUpload(formData, selectedFile);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        }
    };

    return (
        <div className="enhanced-asset-upload">
            <form onSubmit={handleSubmit} className="upload-form">
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* File Upload Section */}
                <div className="form-section">
                    <h3>Upload Asset File</h3>

                    <div
                        className="file-drop-zone"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {previewUrl ? (
                            <div className="preview-container">
                                <img src={previewUrl} alt="Preview" className="preview-image" />
                                <p className="preview-filename">{selectedFile?.name}</p>
                            </div>
                        ) : (
                            <div className="drop-zone-content">
                                <div className="drop-icon">📁</div>
                                <p className="drop-text">Drag and drop your file here or click to browse</p>
                                <small>Max file size: 50MB</small>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
                    </div>
                    {validationErrors.file && (
                        <div className="error-message">{validationErrors.file}</div>
                    )}
                </div>

                {/* Asset Details Section */}
                <div className="form-section">
                    <h3>Asset Details</h3>

                    <div className="form-group">
                        <label htmlFor="name" className="form-label">
                            Asset Name <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleInputChange}
                            placeholder="Enter asset name"
                            className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                            disabled={isUploading}
                        />
                        {validationErrors.name && (
                            <div className="error-message">{validationErrors.name}</div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="application_type" className="form-label">
                                Application Type <span className="text-danger">*</span>
                            </label>
                            <select
                                id="application_type"
                                name="application_type"
                                value={formData.application_type || ''}
                                onChange={handleInputChange}
                                className={`form-control ${validationErrors.application_type ? 'is-invalid' : ''}`}
                                disabled={isUploading}
                            >
                                <option value="">-- Select Type --</option>
                                <option value="web">Web Asset</option>
                                <option value="seo">SEO Asset</option>
                                <option value="smm">Social Media Asset</option>
                            </select>
                            {validationErrors.application_type && (
                                <div className="error-message">{validationErrors.application_type}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="type" className="form-label">
                                Asset Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type || ''}
                                onChange={handleInputChange}
                                className="form-control"
                                disabled={isUploading}
                            >
                                <option value="article">Article</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                                <option value="infographic">Infographic</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Service Linking Section */}
                <div className="form-section">
                    <h3>Link to Service</h3>
                    <AssetServiceLinker
                        onServiceSelect={handleServiceSelect}
                        selectedServiceId={linkedServiceId || undefined}
                        selectedSubServiceIds={linkedSubServiceIds}
                        disabled={isUploading}
                    />
                    {validationErrors.service && (
                        <div className="error-message">{validationErrors.service}</div>
                    )}
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-secondary"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isUploading}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Asset'}
                    </button>
                </div>
            </form>

            <style>{`
                .enhanced-asset-upload {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .upload-form {
                    background-color: white;
                    border-radius: 8px;
                    padding: 2rem;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .form-section {
                    margin-bottom: 2rem;
                }

                .form-section h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #333;
                    border-bottom: 2px solid #007bff;
                    padding-bottom: 0.5rem;
                }

                .file-drop-zone {
                    border: 2px dashed #007bff;
                    border-radius: 8px;
                    padding: 2rem;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background-color: #f8f9fa;
                }

                .file-drop-zone:hover {
                    border-color: #0056b3;
                    background-color: #e7f3ff;
                }

                .drop-zone-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .drop-icon {
                    font-size: 2.5rem;
                }

                .drop-text {
                    font-weight: 500;
                    color: #333;
                    margin: 0;
                }

                .preview-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                }

                .preview-image {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 4px;
                }

                .preview-filename {
                    font-size: 0.9rem;
                    color: #666;
                    margin: 0;
                    word-break: break-all;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .form-label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    color: #333;
                }

                .form-control {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.95rem;
                    font-family: inherit;
                }

                .form-control:focus {
                    outline: none;
                    border-color: #007bff;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
                }

                .form-control:disabled {
                    background-color: #e9ecef;
                    cursor: not-allowed;
                }

                .form-control.is-invalid {
                    border-color: #dc3545;
                }

                .error-message {
                    color: #dc3545;
                    font-size: 0.85rem;
                    margin-top: 0.25rem;
                }

                .alert {
                    padding: 1rem;
                    border-radius: 4px;
                    margin-bottom: 1rem;
                }

                .alert-danger {
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                }

                .form-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #ddd;
                }

                .btn {
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .btn-primary {
                    background-color: #007bff;
                    color: white;
                }

                .btn-primary:hover:not(:disabled) {
                    background-color: #0056b3;
                }

                .btn-secondary {
                    background-color: #6c757d;
                    color: white;
                }

                .btn-secondary:hover:not(:disabled) {
                    background-color: #545b62;
                }

                .text-danger {
                    color: #dc3545;
                }

                @media (max-width: 600px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .upload-form {
                        padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default EnhancedAssetUploadWithServiceLink;
