// Mock database for testing Service & Asset Linking features
// This simulates the database operations without requiring actual database setup

const mockServices: any[] = [];

const mockSubServices: any[] = [];

const mockAssets: any[] = [];

const mockServiceAssetLinks: any[] = [];

const mockAssetQcReviews: any[] = [];

const mockUsers: any[] = [];

const mockTasks: any[] = [];

// Keywords table mock
const mockKeywords: any[] = [];

// Subservice asset links (used by some tests)
const mockSubserviceAssetLinks: any[] = [];

// Mock query function that simulates database responses
export const mockPool = {
    query: async (sql: string, params?: any[]) => {
        console.log(`Mock Query: ${sql}`, params);

        // Simulate tasks query (MUST come BEFORE users query to avoid matching 'users' in LEFT JOIN)
        if (sql.includes('FROM tasks')) {
            if (sql.includes('WHERE id =')) {
                const taskId = params?.[0];
                const task = mockTasks.find(t => t.id === taskId);
                return { rows: task ? [task] : [] };
            }
            return { rows: mockTasks };
        }

        // Simulate services query
        if (sql.includes('SELECT') && sql.includes('services')) {
            
            if (sql.includes("WHERE id =")) {
                const serviceId = params?.[0];
                const service = mockServices.find(s => Number(s.id) === Number(serviceId));
                return { rows: service ? [service] : [] };
            }

            if (/WHERE\s+meta_keywords\s*=\s*'\[\]'/.test(sql)) {
                const rows = mockServices.filter(s => s.meta_keywords === '[]');
                return { rows };
            }

            if (/WHERE\s+meta_keywords\s+IS\s+NOT\s+NULL\s+AND\s+meta_keywords\s+!=\s*'\[\]'/.test(sql) || /meta_keywords\s+!=\s*'\[\]'/.test(sql)) {
                const rows = mockServices.filter(s => s.meta_keywords && s.meta_keywords !== '[]');
                return { rows };
            }

            if (/WHERE\s+meta_keywords\s+IS\s+NOT\s+NULL/.test(sql)) {
                const rows = mockServices.filter(s => s.meta_keywords != null);
                return { rows };
            }

            return { rows: mockServices };
        }

        // Simulate sub-services query
        if (sql.includes('SELECT') && sql.includes('sub_services')) {
            if (sql.includes('WHERE parent_service_id =')) {
                const parentId = params?.[0];
                const subServices = mockSubServices.filter(ss => Number(ss.parent_service_id) === Number(parentId));
                return { rows: subServices };
            }

            if (/WHERE\s+meta_keywords\s*=\s*'\[\]'/.test(sql)) {
                const rows = mockSubServices.filter(s => s.meta_keywords === '[]');
                return { rows };
            }

            if (/WHERE\s+meta_keywords\s+IS\s+NOT\s+NULL\s+AND\s+meta_keywords\s+!=\s*'\[\]'/.test(sql) || /meta_keywords\s+!=\s*'\[\]'/.test(sql)) {
                const rows = mockSubServices.filter(s => s.meta_keywords && s.meta_keywords !== '[]');
                return { rows };
            }

            if (/WHERE\s+meta_keywords\s+IS\s+NOT\s+NULL/.test(sql)) {
                const rows = mockSubServices.filter(s => s.meta_keywords != null);
                return { rows };
            }

            return { rows: mockSubServices };
        }

        // Simulate users query
        if (sql.includes('SELECT') && sql.includes('users')) {
            if (sql.includes('WHERE id =')) {
                const userId = params?.[0];
                const user = mockUsers.find(u => Number(u.id) === Number(userId));
                return { rows: user ? [user] : [] };
            }
            return { rows: mockUsers };
        }

        // Simulate assets query with joins and filters
        if (sql.includes('SELECT') && sql.toLowerCase().includes('from assets')) {
            const q = sql;

            // Handle JOIN with services and sub_services returning a.*, s.service_name, sub.sub_service_name WHERE a.id = ?
            if (/join\s+services\s+/i.test(q) && /join\s+sub_services\s+/i.test(q) && /where\s+.*id\s*=\s*\?/i.test(q)) {
                const idParam = params?.[params.length - 1] ?? params?.[0];
                const asset = mockAssets.find(a => Number(a.id) === Number(idParam));
                if (!asset) return { rows: [] };
                // Coerce id types to Number to avoid string/number mismatches from different inserts
                const service = mockServices.find(s => Number(s.id) === Number(asset.linked_service_id)) || null;
                const sub = mockSubServices.find(ss => Number(ss.id) === Number(asset.linked_sub_service_id)) || null;
                const row = { ...asset } as any;
                if (service) row.service_name = service.service_name;
                if (sub) row.sub_service_name = sub.sub_service_name;
                return { rows: [row] };
            }

            // Handle SELECT a.* FROM assets a JOIN service_asset_links sal ON a.id = sal.asset_id WHERE sal.service_id = ? AND a.linking_active = 1
            if (/service_asset_links\s+sal\s+ON\s+a\.id\s*=\s*sal\.asset_id/i.test(q) && /where\s+sal\.service_id\s*=\s*\?/i.test(q)) {
                const serviceId = params?.[0];
                const links = mockServiceAssetLinks.filter(l => Number(l.service_id) === Number(serviceId));
                const linkedAssets = links.map(l => {
                    const a = mockAssets.find(a => Number(a.id) === Number(l.asset_id));
                    if (!a) return null;
                    return { ...a, link_is_static: l.is_static, linked_at: l.created_at, service_id: l.service_id };
                }).filter(Boolean).filter(a => Number(a.linking_active) === 1);
                return { rows: linkedAssets };
            }

            // Handle subservice asset links join
            if (/subservice_asset_links\s+sal\s+ON\s+a\.id\s*=\s*sal\.asset_id/i.test(q) && /where\s+sal\.sub_service_id\s*=\s*\?/i.test(q)) {
                const subServiceId = params?.[0];
                const links = mockSubserviceAssetLinks.filter(l => Number(l.sub_service_id) === Number(subServiceId));
                const linkedAssets = links.map(l => {
                    const a = mockAssets.find(a => Number(a.id) === Number(l.asset_id));
                    if (!a) return null;
                    return { ...a, link_is_static: l.is_static, linked_at: l.created_at, sub_service_id: l.sub_service_id };
                }).filter(Boolean);
                return { rows: linkedAssets };
            }

            // Handle qc_status IN (...) queries, possibly with AND id = ?
            const qcInMatch = q.match(/WHERE\s+qc_status\s+IN\s*\(([^)]+)\)\s*(AND\s+id\s*=\s*\?)?/i);
            if (qcInMatch) {
                const statusesRaw = qcInMatch[1];
                const statuses = statusesRaw.split(',').map(s => s.replace(/['"\s]/g, '').trim());
                let rows = mockAssets.filter(a => statuses.includes((a.qc_status || '').toString()));
                if (/AND\s+id\s*=\s*\?/i.test(q)) {
                    const idParam = params?.[params.length - 1] ?? params?.[0];
                    rows = rows.filter(r => Number(r.id) === Number(idParam));
                }
                return { rows };
            }

            // Generic WHERE id = ? or WHERE a.id = ? handling
            const idWhereMatch = q.match(/WHERE[\s\S]*?(?:\b|\W)(?:a\.)?id\s*=\s*\?/i);
            if (idWhereMatch) {
                const assetId = params?.[params.length - 1] ?? params?.[0];
                const asset = mockAssets.find(a => Number(a.id) === Number(assetId));
                return { rows: asset ? [asset] : [] };
            }

            // Default: return all assets (useful for summaries)
            return { rows: mockAssets };
        }

        // Simulate service asset links query
            if (sql.includes('SELECT') && sql.includes('service_asset_links')) {
            if (sql.includes('WHERE service_id =')) {
                const serviceId = params?.[0];
                const links = mockServiceAssetLinks.filter(link => Number(link.service_id) === Number(serviceId));
                const linkedAssets = links.map(link => mockAssets.find(asset => Number(asset.id) === Number(link.asset_id))).filter(Boolean);
                return { rows: linkedAssets };
            }
            return { rows: mockServiceAssetLinks };
        }

        // Simulate keywords queries
        if (sql.includes('keywords')) {
            // SELECT id FROM keywords WHERE keyword = ?
            if (/SELECT\s+id\s+FROM\s+keywords\s+WHERE\s+keyword\s*=\s*\?/i.test(sql)) {
                const kw = params?.[0];
                const found = mockKeywords.find(k => k.keyword === kw);
                return { rows: found ? [{ id: found.id }] : [] };
            }

            // SELECT * FROM keywords WHERE mapped_sub_service_id = ?
            if (/SELECT\s+\*\s+FROM\s+keywords\s+WHERE\s+mapped_sub_service_id\s*=\s*\?/i.test(sql)) {
                const id = params?.[0];
                const rows = mockKeywords.filter(k => Number(k.mapped_sub_service_id) === Number(id));
                return { rows };
            }

            // Generic keywords select
            if (sql.toUpperCase().includes('SELECT')) {
                return { rows: mockKeywords };
            }
        }

        // Simulate asset_qc_reviews selects
        if (sql.includes('asset_qc_reviews')) {
            // SELECT ... FROM asset_qc_reviews WHERE asset_id = ?
            if (/WHERE\s+asset_id\s*=\s*\?/i.test(sql)) {
                const aid = params?.[0];
                const rows = mockAssetQcReviews.filter(r => Number(r.asset_id) === Number(aid)).map(r => ({ ...r }));
                // Add reviewer name/email if user exists
                rows.forEach(r => {
                    const u = mockUsers.find(u => Number(u.id) === Number(r.qc_reviewer_id));
                    if (u) {
                        r.reviewer_name = u.name;
                        r.reviewer_email = u.email;
                    }
                });
                return { rows };
            }
            return { rows: mockAssetQcReviews };
        }

        // Simulate QC weightage configs query
        if (sql.includes('SELECT') && sql.includes('qc_weightage_configs')) {
            const mockQCWeightageConfigs = [
                {
                    id: 1,
                    config_name: 'Default Content QC',
                    description: 'Default weightage configuration for content quality checks',
                    total_weight: 100,
                    is_valid: 1,
                    status: 'active',
                    item_count: 7,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                },
                {
                    id: 2,
                    config_name: 'Strict Quality Control',
                    description: 'High-quality standards for critical content',
                    total_weight: 100,
                    is_valid: 1,
                    status: 'active',
                    item_count: 5,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
            return { rows: mockQCWeightageConfigs };
        }

        // Simulate QC weightage items query
        if (sql.includes('SELECT') && sql.includes('qc_weightage_items')) {
            const mockQCWeightageItems = [
                {
                    id: 1,
                    config_id: 1,
                    checklist_id: 1,
                    checklist_type: 'Content',
                    weight_percentage: 25,
                    is_mandatory: 1,
                    applies_to_stage: null,
                    item_order: 1,
                    checklist_name: 'Content Quality Check'
                },
                {
                    id: 2,
                    config_id: 1,
                    checklist_id: 2,
                    checklist_type: 'SEO',
                    weight_percentage: 20,
                    is_mandatory: 1,
                    applies_to_stage: null,
                    item_order: 2,
                    checklist_name: 'SEO Compliance'
                },
                {
                    id: 3,
                    config_id: 1,
                    checklist_id: 3,
                    checklist_type: 'Design',
                    weight_percentage: 15,
                    is_mandatory: 0,
                    applies_to_stage: null,
                    item_order: 3,
                    checklist_name: 'Design Review'
                }
            ];
            return { rows: mockQCWeightageItems };
        }

        // Simulate audit checklists query
        if (sql.includes('SELECT') && sql.includes('audit_checklists')) {
            const mockAuditChecklists = [
                {
                    id: 1,
                    checklist_name: 'Content Quality Check',
                    checklist_type: 'Content',
                    checklist_category: 'Quality',
                    status: 'active'
                },
                {
                    id: 2,
                    checklist_name: 'SEO Compliance',
                    checklist_type: 'SEO',
                    checklist_category: 'Technical',
                    status: 'active'
                },
                {
                    id: 3,
                    checklist_name: 'Design Review',
                    checklist_type: 'Design',
                    checklist_category: 'Visual',
                    status: 'active'
                },
                {
                    id: 4,
                    checklist_name: 'Grammar & Spelling',
                    checklist_type: 'Content',
                    checklist_category: 'Quality',
                    status: 'active'
                },
                {
                    id: 5,
                    checklist_name: 'Brand Guidelines',
                    checklist_type: 'Brand',
                    checklist_category: 'Compliance',
                    status: 'active'
                }
            ];
            return { rows: mockAuditChecklists };
        }

        // Generic SELECT COUNT(*) as count FROM <table>
        const countMatch = sql.match(/SELECT\s+COUNT\(\*\)\s+AS\s+COUNT\s+FROM\s+([a-zA-Z0-9_]+)/i);
        if (countMatch) {
            const tableName = (countMatch[1] || '').toLowerCase();
            let count = 0;
            if (tableName === 'assets') count = mockAssets.length;
            else if (tableName === 'services') count = mockServices.length;
            else if (tableName === 'users') count = mockUsers.length;
            else if (tableName === 'keywords') count = mockKeywords.length;
            else if (tableName === 'service_asset_links') count = mockServiceAssetLinks.length;
            return { rows: [{ count }] };
        }

        // Simulate INSERT operations - map column list to params and push into appropriate mock array
        if (sql.toUpperCase().includes('INSERT')) {
            const tableMatch = sql.match(/INSERT INTO\s+([a-zA-Z0-9_]+)/i);
            const table = tableMatch ? tableMatch[1].toLowerCase() : null;

            const getNextId = (arr: any[]) => (arr.reduce((m, it) => Math.max(m, Number(it.id || 0)), 0) + 1);

            // parse column list if present
            const colsMatch = sql.match(/INSERT INTO\s+[a-zA-Z0-9_]+\s*\(([^)]+)\)\s*VALUES/i);
            const columns = colsMatch ? colsMatch[1].split(',').map((c: string) => c.trim()) : null;
            const valuesMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);
            const valueTokens = valuesMatch ? valuesMatch[1].split(/,(?=(?:[^']*'[^']*')*[^']*$)/).map((v: string) => v.trim()) : null;

            const buildObjFromParams = (cols: string[] | null, paramsArr: any[] = []) => {
                const arrTarget = table === 'assets' ? mockAssets
                    : table === 'services' ? mockServices
                    : table === 'sub_services' ? mockSubServices
                    : table === 'users' ? mockUsers
                        : table === 'service_asset_links' ? mockServiceAssetLinks
                        : table === 'subservice_asset_links' ? mockSubserviceAssetLinks
                        : table === 'asset_qc_reviews' ? mockAssetQcReviews
                        : table === 'keywords' ? mockKeywords
                    : null;

                const newId = arrTarget ? getNextId(arrTarget) : Math.floor(Math.random() * 1000) + 1;
                const obj: any = { id: newId };

                if (cols && cols.length) {
                    let paramIndex = 0;
                    cols.forEach((col: string, idx: number) => {
                        const cleanCol = col.replace(/`/g, '').trim();
                        const valToken = valueTokens && valueTokens[idx] ? valueTokens[idx] : '?';

                        let val: any;
                        if (/^\?$/.test(valToken)) {
                            val = paramsArr[paramIndex++];
                        } else if (/CURRENT_TIMESTAMP/i.test(valToken)) {
                            val = new Date().toISOString();
                        } else {
                            const litMatch = valToken.match(/^'(.*)'$/s);
                            if (litMatch) val = litMatch[1];
                            else if (/^[0-9]+$/.test(valToken)) val = Number(valToken);
                            else val = valToken;
                        }

                        if (Array.isArray(val) || typeof val === 'object') {
                            try { val = JSON.stringify(val); } catch { }
                        }

                        obj[cleanCol] = val;
                    });
                }

                // Set sensible defaults for certain tables/fields
                if (table === 'assets') {
                    if (obj.linking_active === undefined) obj.linking_active = 0;
                    if (obj.rework_count === undefined) obj.rework_count = 0;
                    if (obj.workflow_log === undefined || obj.workflow_log === '[]') {
                        const createdEntry = {
                            action: 'created',
                            timestamp: new Date().toISOString(),
                            user_id: obj.created_by || obj.submitted_by || null,
                            status: obj.status || obj.qc_status || null,
                            workflow_stage: obj.workflow_stage || null
                        };
                        obj.workflow_log = JSON.stringify([createdEntry]);
                    }
                }
                if (table === 'service_asset_links') {
                    if (obj.is_static === undefined) obj.is_static = 0;
                }

                if (arrTarget) arrTarget.push(obj);
                return { obj, newId };
            };

            const paramsArr = Array.isArray(params) ? params : [];
            const { obj, newId } = buildObjFromParams(columns, paramsArr);

            // Return the inserted object so tests can read rows[0].id
            return { rows: [obj], insertId: newId, lastID: newId, lastIDValue: newId };
        }

        // Simulate UPDATE operations - apply simple SET parsing for id-based updates
        if (sql.toUpperCase().includes('UPDATE')) {
            try {
                const idMatch = /WHERE\s+id\s*=\s*\?/i.test(sql);
                const keywordEqMatch = /WHERE\s+keyword\s*=\s*\?/i.test(sql);
                const keywordInMatch = /WHERE\s+keyword\s+IN\s*\(/i.test(sql);
                const keywordAndMappedMatch = /WHERE\s+keyword\s*=\s*\?\s+AND\s+mapped_sub_service_id\s*=\s*\?/i.test(sql);

                // Determine target table and setClause
                const tableMatch2 = sql.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+([\s\S]+?)\s+WHERE\s+/i);
                const table = tableMatch2 ? tableMatch2[1].toLowerCase() : null;
                const setClause = tableMatch2 ? tableMatch2[2] : null;

                const targetArr = table === 'assets' ? mockAssets
                    : table === 'services' ? mockServices
                    : table === 'users' ? mockUsers
                    : table === 'service_asset_links' ? mockServiceAssetLinks
                    : table === 'keywords' ? mockKeywords
                    : null;

                if (targetArr && setClause) {
                    // handle keywords IN (...) bulk nullification
                    if (table === 'keywords' && keywordInMatch) {
                        const kws: string[] = Array.isArray(params) ? params.filter(p => typeof p === 'string') : [];
                        kws.forEach(kw => {
                            const kitem = mockKeywords.find(k => k.keyword === kw);
                            if (kitem) {
                                kitem.mapped_sub_service_id = null;
                                kitem.mapped_sub_service = null;
                            }
                        });
                        return { rows: [], changedRows: kws.length };
                    }

                    let item: any = null;

                    if (keywordAndMappedMatch) {
                        const keywordParam = params?.[0];
                        const mappedParam = params?.[1];
                            item = mockKeywords.find(k => k.keyword === keywordParam && Number(k.mapped_sub_service_id) === Number(mappedParam));
                    } else if (keywordEqMatch) {
                        // keyword = ? - keyword param is typically the last param
                        const keywordParam = Array.isArray(params) ? params[params.length - 1] : undefined;
                        item = mockKeywords.find(k => k.keyword === keywordParam);
                    } else if (idMatch) {
                        const idParam = Array.isArray(params) ? params[params.length - 1] : undefined;
                        item = targetArr.find((it: any) => Number(it.id) === Number(idParam));
                    }

                    if (item) {
                        const parts = setClause.split(/,(?=(?:[^']*'[^']*')*[^']*$)/);
                        const paramsCopy = Array.isArray(params) ? params.slice() : [];
                        parts.forEach((p: string) => {
                            const assign = p.split('=');
                            if (assign.length >= 2) {
                                let key = assign[0].trim().replace(/`/g, '');
                                let valueRaw = assign.slice(1).join('=').trim();
                                let value: any = undefined;

                                if (/=\s*\?\s*$/i.test(p) || /^\?$/i.test(valueRaw)) {
                                    value = paramsCopy.shift();
                                } else if (/CURRENT_TIMESTAMP/i.test(valueRaw)) {
                                    value = new Date().toISOString();
                                } else {
                                    const incMatch = valueRaw.match(/([a-zA-Z0-9_]+)\s*\+\s*(\d+)/);
                                    if (incMatch && key === incMatch[1]) {
                                        const inc = parseInt(incMatch[2], 10);
                                        item[key] = (Number(item[key]) || 0) + inc;
                                        return;
                                    }

                                    const stringMatch = valueRaw.match(/^'(.*)'$/s);
                                    if (stringMatch) {
                                        value = stringMatch[1];
                                    } else if (/^[0-9]+$/.test(valueRaw)) {
                                        value = Number(valueRaw);
                                    } else if (/^\[.*\]$/.test(valueRaw)) {
                                        try { value = JSON.parse(valueRaw); } catch { value = valueRaw; }
                                    } else {
                                        value = valueRaw;
                                    }
                                }

                                // stringify objects for JSON fields
                                if (typeof value === 'object') {
                                    try { value = JSON.stringify(value); } catch { }
                                }

                                item[key] = value;
                            }
                        });

                        return { rows: [], changedRows: 1 };
                    }
                }
            } catch (e) {
                // fallthrough to generic response
            }

            return { rows: [], changedRows: 0 };
        }

        // Simulate DELETE operations - remove from arrays when possible
        if (/DELETE\s+FROM/i.test(sql)) {
            const match = sql.match(/DELETE FROM\s+([a-zA-Z0-9_]+)\s+WHERE\s+id\s*=\s*\?/i);
            const table = match ? match[1].toLowerCase() : null; 
            const idParam = params?.[0];
            const targetArr = table === 'assets' ? mockAssets
                : table === 'services' ? mockServices
                : table === 'users' ? mockUsers
                : table === 'service_asset_links' ? mockServiceAssetLinks
                : null;
            if (targetArr) {
                const idx = targetArr.findIndex((it: any) => Number(it.id) === Number(idParam));
                if (idx !== -1) targetArr.splice(idx, 1);
            }
            // Also remove any links pointing to deleted assets
            if (table === 'assets') {
                for (let i = mockServiceAssetLinks.length - 1; i >= 0; i--) {
                    if (mockServiceAssetLinks[i].asset_id === idParam) mockServiceAssetLinks.splice(i, 1);
                }
                // Remove any subservice-asset links as well
                for (let i = mockSubserviceAssetLinks.length - 1; i >= 0; i--) {
                    if (mockSubserviceAssetLinks[i].asset_id === idParam) mockSubserviceAssetLinks.splice(i, 1);
                }
            }
            return { rows: [], affectedRows: 1 };
        }

        // Support DELETE FROM <table> WHERE asset_id = ? (used for asset_qc_reviews cleanup)
        if (/DELETE\s+FROM\s+([a-zA-Z0-9_]+)\s+WHERE\s+asset_id\s*=\s*\?/i.test(sql)) {
            const match2 = sql.match(/DELETE FROM\s+([a-zA-Z0-9_]+)\s+WHERE\s+asset_id\s*=\s*\?/i);
            const table2 = match2 ? match2[1].toLowerCase() : null;
            const assetIdParam = params?.[0];
            if (table2 === 'asset_qc_reviews') {
                for (let i = mockAssetQcReviews.length - 1; i >= 0; i--) {
                    if (mockAssetQcReviews[i].asset_id === assetIdParam) mockAssetQcReviews.splice(i, 1);
                }
            }
            return { rows: [], affectedRows: 1 };
        }

        // Default response
        return { rows: [] };
    },

    end: async () => {
        console.log('Mock database connection closed');
    }
};

export default mockPool;
