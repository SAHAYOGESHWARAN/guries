import React, { useState, useCallback } from 'react';
import { useData } from '../hooks/useData';

interface TestResult {
    test: string;
    status: 'PASS' | 'FAIL' | 'PENDING';
    message: string;
    details?: any;
    timestamp?: string;
}

export const DatabaseTestPanel: React.FC = () => {
    const [results, setResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTest, setSelectedTest] = useState<string>('');
    const { data: assets } = useData('assetLibrary');
    const { data: services } = useData('services');
    const { data: keywords } = useData('keywords');

    const runTest = useCallback(async (testName: string) => {
        setLoading(true);
        const newResult: TestResult = {
            test: testName,
            status: 'PENDING',
            message: 'Running test...',
            timestamp: new Date().toISOString()
        };

        try {
            let response;
            const baseUrl = '/api';

            switch (testName) {
                case 'connection':
                    response = await fetch(`${baseUrl}/health`);
                    break;

                case 'create-asset':
                    response = await fetch(`${baseUrl}/test-endpoints?test=create-asset`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ asset_name: `Test Asset ${Date.now()}` })
                    });
                    break;

                case 'read-assets':
                    response = await fetch(`${baseUrl}/test-endpoints?test=read-assets`);
                    break;

                case 'persistence':
                    response = await fetch(`${baseUrl}/test-endpoints?test=persistence`);
                    break;

                case 'schema':
                    response = await fetch(`${baseUrl}/test-endpoints?test=schema`);
                    break;

                case 'performance':
                    response = await fetch(`${baseUrl}/test-endpoints?test=performance`, {
                        method: 'POST'
                    });
                    break;

                default:
                    throw new Error('Unknown test');
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            newResult.status = data.status === 'PASS' ? 'PASS' : 'FAIL';
            newResult.message = data.message || 'Test completed';
            newResult.details = data;
        } catch (error: any) {
            newResult.status = 'FAIL';
            newResult.message = error.message;
        }

        setResults(prev => [newResult, ...prev]);
        setLoading(false);
    }, []);

    const runAllTests = useCallback(async () => {
        const tests = ['connection', 'create-asset', 'read-assets', 'persistence', 'schema'];
        for (const test of tests) {
            await runTest(test);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }, [runTest]);

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginTop: '20px' }}>
            <h3>Database & Real-Time Verification Panel</h3>

            {/* Data Summary */}
            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
                <h4>Current Data Status</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div>
                        <strong>Assets:</strong> {assets.length}
                    </div>
                    <div>
                        <strong>Services:</strong> {services.length}
                    </div>
                    <div>
                        <strong>Keywords:</strong> {keywords.length}
                    </div>
                </div>
            </div>

            {/* Test Controls */}
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => runTest('connection')}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    Test Connection
                </button>

                <button
                    onClick={() => runTest('create-asset')}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    Create Test Asset
                </button>

                <button
                    onClick={() => runTest('persistence')}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    Check Persistence
                </button>

                <button
                    onClick={() => runTest('schema')}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    Validate Schema
                </button>

                <button
                    onClick={runAllTests}
                    disabled={loading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    Run All Tests
                </button>
            </div>

            {/* Test Results */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <h4>Test Results</h4>
                {results.length === 0 ? (
                    <p style={{ color: '#666' }}>No tests run yet. Click a button above to start testing.</p>
                ) : (
                    results.map((result, index) => (
                        <div
                            key={index}
                            style={{
                                marginBottom: '10px',
                                padding: '10px',
                                backgroundColor: result.status === 'PASS' ? '#d4edda' : result.status === 'FAIL' ? '#f8d7da' : '#e2e3e5',
                                borderLeft: `4px solid ${result.status === 'PASS' ? '#28a745' : result.status === 'FAIL' ? '#dc3545' : '#6c757d'}`,
                                borderRadius: '4px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong>{result.test}</strong>
                                <span style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    backgroundColor: result.status === 'PASS' ? '#28a745' : result.status === 'FAIL' ? '#dc3545' : '#6c757d',
                                    color: 'white'
                                }}>
                                    {result.status}
                                </span>
                            </div>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{result.message}</p>
                            {result.details && (
                                <details style={{ marginTop: '5px', fontSize: '12px' }}>
                                    <summary>Details</summary>
                                    <pre style={{ backgroundColor: '#fff', padding: '5px', borderRadius: '3px', overflow: 'auto', maxHeight: '150px' }}>
                                        {JSON.stringify(result.details, null, 2)}
                                    </pre>
                                </details>
                            )}
                            {result.timestamp && (
                                <small style={{ color: '#666' }}>
                                    {new Date(result.timestamp).toLocaleTimeString()}
                                </small>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Real-Time Data Display */}
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
                <h4>Real-Time Data Display</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div>
                        <h5>Recent Assets</h5>
                        <ul style={{ fontSize: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                            {assets.slice(0, 5).map((asset: any) => (
                                <li key={asset.id}>
                                    {asset.name || asset.asset_name} (ID: {asset.id})
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5>Recent Services</h5>
                        <ul style={{ fontSize: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                            {services.slice(0, 5).map((service: any) => (
                                <li key={service.id}>
                                    {service.service_name} (ID: {service.id})
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5>Recent Keywords</h5>
                        <ul style={{ fontSize: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                            {keywords.slice(0, 5).map((keyword: any) => (
                                <li key={keyword.id}>
                                    {keyword.keyword_name} (ID: {keyword.id})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseTestPanel;
