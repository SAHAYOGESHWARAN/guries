import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '../hooks/useData';
import type { Service, SubServiceItem } from '../types';

interface AssetServiceLinkerProps {
    onServiceSelect: (serviceId: number, subServiceIds: number[]) => void;
    selectedServiceId?: number;
    selectedSubServiceIds?: number[];
    disabled?: boolean;
}

const AssetServiceLinker: React.FC<AssetServiceLinkerProps> = ({
    onServiceSelect,
    selectedServiceId,
    selectedSubServiceIds = [],
    disabled = false
}) => {
    const { data: services = [] } = useData<Service>('services');
    const { data: subServices = [] } = useData<SubServiceItem>('subServices');

    const [selectedService, setSelectedService] = useState<number | null>(selectedServiceId || null);
    const [selectedSubServices, setSelectedSubServices] = useState<Set<number>>(
        new Set(selectedSubServiceIds)
    );

    // Filter sub-services for selected service
    const filteredSubServices = useMemo(() => {
        if (!selectedService) return [];
        return subServices.filter(s => Number(s.parent_service_id) === Number(selectedService));
    }, [subServices, selectedService]);

    // Handle service selection
    const handleServiceChange = useCallback((serviceId: string) => {
        const id = serviceId ? Number(serviceId) : null;
        setSelectedService(id);
        setSelectedSubServices(new Set()); // Clear sub-services when service changes
        if (id) {
            onServiceSelect(id, []);
        }
    }, [onServiceSelect]);

    // Handle sub-service selection
    const handleSubServiceToggle = useCallback((subServiceId: number) => {
        const newSelected = new Set(selectedSubServices);
        if (newSelected.has(subServiceId)) {
            newSelected.delete(subServiceId);
        } else {
            newSelected.add(subServiceId);
        }
        setSelectedSubServices(newSelected);
        if (selectedService) {
            onServiceSelect(selectedService, Array.from(newSelected));
        }
    }, [selectedService, selectedSubServices, onServiceSelect]);

    return (
        <div className="asset-service-linker">
            <div className="form-group">
                <label htmlFor="service-select" className="form-label">
                    Link to Service <span className="text-danger">*</span>
                </label>
                <select
                    id="service-select"
                    value={selectedService || ''}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    disabled={disabled}
                    className="form-control"
                >
                    <option value="">-- Select a Service --</option>
                    {services.map(service => (
                        <option key={service.id} value={service.id}>
                            {service.service_name}
                        </option>
                    ))}
                </select>
                <small className="form-text text-muted">
                    This link will be static and cannot be removed after upload.
                </small>
            </div>

            {selectedService && filteredSubServices.length > 0 && (
                <div className="form-group">
                    <label className="form-label">
                        Link to Sub-Services (Optional)
                    </label>
                    <div className="sub-service-list">
                        {filteredSubServices.map(subService => (
                            <div key={subService.id} className="form-check">
                                <input
                                    type="checkbox"
                                    id={`subservice-${subService.id}`}
                                    className="form-check-input"
                                    checked={selectedSubServices.has(subService.id)}
                                    onChange={() => handleSubServiceToggle(subService.id)}
                                    disabled={disabled}
                                />
                                <label
                                    htmlFor={`subservice-${subService.id}`}
                                    className="form-check-label"
                                >
                                    {subService.sub_service_name}
                                </label>
                            </div>
                        ))}
                    </div>
                    <small className="form-text text-muted">
                        Select sub-services where this asset should appear. These links will also be static.
                    </small>
                </div>
            )}

            {selectedService && (
                <div className="alert alert-info">
                    <strong>Static Link Notice:</strong> Once this asset is linked to the selected service(s),
                    the link cannot be removed. The asset will automatically appear on the service page and
                    in the Web Repository.
                </div>
            )}

            <style>{`
                .asset-service-linker {
                    padding: 1rem;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                    margin-bottom: 1rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    display: block;
                    color: #333;
                }

                .form-control {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.95rem;
                }

                .form-control:disabled {
                    background-color: #e9ecef;
                    cursor: not-allowed;
                }

                .form-text {
                    display: block;
                    margin-top: 0.25rem;
                    font-size: 0.85rem;
                    color: #6c757d;
                }

                .sub-service-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    background-color: white;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .form-check {
                    display: flex;
                    align-items: center;
                }

                .form-check-input {
                    margin-right: 0.5rem;
                    cursor: pointer;
                }

                .form-check-label {
                    margin-bottom: 0;
                    cursor: pointer;
                    flex: 1;
                }

                .alert {
                    padding: 0.75rem 1rem;
                    border-radius: 4px;
                    margin-bottom: 0;
                }

                .alert-info {
                    background-color: #d1ecf1;
                    border: 1px solid #bee5eb;
                    color: #0c5460;
                }

                .text-danger {
                    color: #dc3545;
                }
            `}</style>
        </div>
    );
};

export default AssetServiceLinker;
