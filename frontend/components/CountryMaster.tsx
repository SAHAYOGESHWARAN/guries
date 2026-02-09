import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';
import CountryMasterModal from './CountryMasterModal';
import { API_BASE_URL } from '../constants';

interface Country {
    id: number;
    country_name: string;
    iso_code: string;
    region: string;
    default_language: string;
    allowed_for_backlinks: number;
    allowed_for_content_targeting: number;
    allowed_for_smm_targeting: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export default function CountryMaster() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [regions, setRegions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCountry, setEditingCountry] = useState<Country | null>(null);
    const [regionFilter, setRegionFilter] = useState('All Regions');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCountries();
        fetchRegions();
    }, []);

    const fetchCountries = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/country-master`);
            const data = await response.json();
            setCountries(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error fetching countries:', error);
            setCountries([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRegions = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/country-master/list/regions`);
            const data = await response.json();
            setRegions(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error fetching regions:', error);
            setRegions([]);
        }
    };

    const filteredCountries = (countries || []).filter(country => {
        if (!country) return false;
        const matchesSearch = (country.country_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (country.iso_code || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = regionFilter === 'All Regions' || country.region === regionFilter;
        const matchesStatus = statusFilter === 'All Status' || country.status === statusFilter;
        return matchesSearch && matchesRegion && matchesStatus;
    });

    const handleAddCountry = () => {
        setEditingCountry(null);
        setShowModal(true);
    };

    const handleEditCountry = (country: Country) => {
        setEditingCountry(country);
        setShowModal(true);
    };

    const handleDeleteCountry = async (id: number) => {
        if (confirm('Are you sure you want to delete this country?')) {
            try {
                await fetch(`${API_BASE_URL}/country-master/${id}`, {
                    method: 'DELETE'
                });
                fetchCountries();
            } catch (error) {
                console.error('Error deleting country:', error);
            }
        }
    };

    const handleSaveCountry = async (countryData: any) => {
        try {
            const method = editingCountry ? 'PUT' : 'POST';
            const url = editingCountry
                ? `${API_BASE_URL}/country-master/${editingCountry.id}`
                : `${API_BASE_URL}/country-master`;

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(countryData)
            });

            setShowModal(false);
            fetchCountries();
        } catch (error) {
            console.error('Error saving country:', error);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Country Master</h1>
                        <p className="text-gray-600 mt-1">Manage country configurations, regional settings, and targeting permissions</p>
                    </div>
                    <button
                        onClick={handleAddCountry}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Add Country
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search by country name or ISO code..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                            <select
                                value={regionFilter}
                                onChange={(e) => setRegionFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>All Regions</option>
                                {regions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option>All Status</option>
                                <option>active</option>
                                <option>inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Countries Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Country Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ISO Code</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Region</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Backlinks</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Content</th>
                                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">SMM</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCountries.map((country) => (
                                <tr key={country.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{country.country_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{country.iso_code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{country.region}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${country.allowed_for_backlinks ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {country.allowed_for_backlinks ? '✓' : '✗'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${country.allowed_for_content_targeting ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {country.allowed_for_content_targeting ? '✓' : '✗'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${country.allowed_for_smm_targeting ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {country.allowed_for_smm_targeting ? '✓' : '✗'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${country.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {country.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditCountry(country)}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCountry(country.id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredCountries.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500">No countries found. Create one to get started.</p>
                    </div>
                )}

                {/* Summary */}
                <div className="mt-6 grid grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 text-sm">Total Countries</p>
                        <p className="text-2xl font-bold text-gray-900">{countries.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 text-sm">Backlinks Enabled</p>
                        <p className="text-2xl font-bold text-green-600">{countries.filter(c => c.allowed_for_backlinks).length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 text-sm">Content Targeting</p>
                        <p className="text-2xl font-bold text-green-600">{countries.filter(c => c.allowed_for_content_targeting).length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <p className="text-gray-600 text-sm">SMM Targeting</p>
                        <p className="text-2xl font-bold text-green-600">{countries.filter(c => c.allowed_for_smm_targeting).length}</p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <CountryMasterModal
                    country={editingCountry}
                    regions={regions}
                    onSave={handleSaveCountry}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
