import{u as Q,r as o,j as e}from"./index.Cgn8UqAd.js";function z(){const{refresh:t}=Q("assetLibrary");return{refreshAssetLibrary:o.useCallback(async()=>{t()},[t])}}const $=()=>{const[t,k]=o.useState([]),[d,R]=o.useState(null),[v,c]=o.useState(null),[i,f]=o.useState("pending"),[g,N]=o.useState(!0),[h,y]=o.useState(null),[C,m]=o.useState(!1),[S,n]=o.useState(null),[q,x]=o.useState(null),j="/api/v1",{refreshAssetLibrary:w}=z();o.useEffect(()=>{b(),p()},[i]);const b=async()=>{N(!0),y(null);try{const a=await fetch(`${j}/qc-review/pending?status=${i==="all"?"all":i==="pending"?"Pending":"Rework"}&limit=50`);if(!a.ok)throw new Error("Failed to fetch pending assets");const u=await a.json();k(u.assets)}catch(r){const a=r instanceof Error?r.message:"Failed to load pending assets";y(a),console.error("Error fetching pending assets:",r)}finally{N(!1)}},p=async()=>{try{const r=await fetch(`${j}/qc-review/statistics`);if(!r.ok)throw new Error("Failed to fetch statistics");const a=await r.json();R(a)}catch(r){console.error("Error fetching statistics:",r)}},E=async(r,a,u)=>{m(!0),n(null),x(null);try{const s=await fetch(`${j}/qc-review/approve`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({asset_id:r,qc_remarks:a,qc_score:u})});if(!s.ok){const P=await s.json();throw new Error(P.error||"Failed to approve asset")}const l=await s.json();x("Asset approved successfully! Status updated to Published."),c(null),console.log("[QCReviewPage] Immediate refresh after approval"),b(),p(),w(),setTimeout(()=>{console.log("[QCReviewPage] Delayed refresh after approval (300ms)"),b(),p(),w(),window.dispatchEvent(new CustomEvent("assetQCApproved",{detail:{assetId:r,result:l}}))},300)}catch(s){const l=s instanceof Error?s.message:"Failed to approve asset";n(l),console.error("[QCReviewPage] Error approving asset:",s)}finally{m(!1)}},A=async(r,a,u)=>{if(!a.trim()){n("Remarks are required for rejection");return}m(!0),n(null),x(null);try{const s=await fetch(`${j}/qc-review/reject`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({asset_id:r,qc_remarks:a,qc_score:u})});if(!s.ok){const l=await s.json();throw new Error(l.error||"Failed to reject asset")}x("Asset rejected successfully!"),c(null),console.log("[QCReviewPage] Immediate refresh after rejection"),b(),p(),w(),setTimeout(()=>{console.log("[QCReviewPage] Delayed refresh after rejection (300ms)"),b(),p(),w(),window.dispatchEvent(new CustomEvent("assetQCRejected",{detail:{assetId:r}}))},300)}catch(s){const l=s instanceof Error?s.message:"Failed to reject asset";n(l),console.error("[QCReviewPage] Error rejecting asset:",s)}finally{m(!1)}},_=async(r,a,u)=>{if(!a.trim()){n("Remarks are required for rework request");return}m(!0),n(null),x(null);try{if(!(await fetch(`${j}/qc-review/rework`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({asset_id:r,qc_remarks:a,qc_score:u})})).ok)throw new Error("Failed to request rework");x("Rework requested successfully!"),c(null),console.log("[QCReviewPage] Immediate refresh after rework request"),b(),p(),w(),setTimeout(()=>{console.log("[QCReviewPage] Delayed refresh after rework request (300ms)"),b(),p(),w(),window.dispatchEvent(new CustomEvent("assetQCRework",{detail:{assetId:r}}))},300)}catch(s){const l=s instanceof Error?s.message:"Failed to request rework";n(l),console.error("[QCReviewPage] Error requesting rework:",s)}finally{m(!1)}};return e.jsxs("div",{className:"qc-review-page",children:[e.jsx("h1",{children:"QC Review Dashboard"}),d&&e.jsxs("div",{className:"statistics-grid",children:[e.jsxs("div",{className:"stat-card pending",children:[e.jsx("div",{className:"stat-number",children:d.pending}),e.jsx("div",{className:"stat-label",children:"Pending Review"})]}),e.jsxs("div",{className:"stat-card approved",children:[e.jsx("div",{className:"stat-number",children:d.approved}),e.jsx("div",{className:"stat-label",children:"Approved"})]}),e.jsxs("div",{className:"stat-card rejected",children:[e.jsx("div",{className:"stat-number",children:d.rejected}),e.jsx("div",{className:"stat-label",children:"Rejected"})]}),e.jsxs("div",{className:"stat-card rework",children:[e.jsx("div",{className:"stat-number",children:d.rework}),e.jsx("div",{className:"stat-label",children:"Rework"})]}),e.jsxs("div",{className:"stat-card rate",children:[e.jsxs("div",{className:"stat-number",children:[d.approvalRate,"%"]}),e.jsx("div",{className:"stat-label",children:"Approval Rate"})]})]}),e.jsxs("div",{className:"qc-content",children:[e.jsxs("div",{className:"assets-list",children:[e.jsxs("div",{className:"list-header",children:[e.jsx("h2",{children:"Assets for Review"}),e.jsxs("div",{className:"filter-buttons",children:[e.jsx("button",{className:`filter-btn ${i==="pending"?"active":""}`,onClick:()=>f("pending"),children:"Pending"}),e.jsx("button",{className:`filter-btn ${i==="rework"?"active":""}`,onClick:()=>f("rework"),children:"Rework"}),e.jsx("button",{className:`filter-btn ${i==="all"?"active":""}`,onClick:()=>f("all"),children:"All"})]})]}),h&&e.jsx("div",{className:"alert alert-error",children:h}),g?e.jsx("div",{className:"loading",children:"Loading assets..."}):t.length===0?e.jsx("div",{className:"empty-state",children:"No assets to review"}):e.jsx("div",{className:"assets-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Asset Name"}),e.jsx("th",{children:"Type"}),e.jsx("th",{children:"Category"}),e.jsx("th",{children:"Submitted"}),e.jsx("th",{children:"SEO Score"}),e.jsx("th",{children:"Grammar Score"}),e.jsx("th",{children:"Rework Count"}),e.jsx("th",{children:"Action"})]})}),e.jsx("tbody",{children:t.map(r=>e.jsxs("tr",{className:v?.id===r.id?"selected":"",children:[e.jsx("td",{className:"asset-name",children:r.name}),e.jsx("td",{children:r.asset_type}),e.jsx("td",{children:r.asset_category}),e.jsx("td",{children:new Date(r.submitted_at||"").toLocaleDateString()}),e.jsx("td",{children:e.jsxs("span",{className:`score ${(r.seo_score||0)>=80?"high":(r.seo_score||0)>=60?"medium":"low"}`,children:[r.seo_score||0,"/100"]})}),e.jsx("td",{children:e.jsxs("span",{className:`score ${(r.grammar_score||0)>=80?"high":(r.grammar_score||0)>=60?"medium":"low"}`,children:[r.grammar_score||0,"/100"]})}),e.jsx("td",{children:r.rework_count||0}),e.jsx("td",{children:e.jsx("button",{className:"btn-review",onClick:()=>c(r),children:"Review"})})]},r.id))})]})})]}),v&&e.jsx(F,{asset:v,onApprove:E,onReject:A,onRework:_,onClose:()=>c(null),loading:C,error:S,success:q})]}),e.jsx("style",{children:`
                .qc-review-page {
                    padding: 2rem;
                    background-color: #f8f9fa;
                    min-height: 100vh;
                }

                .qc-review-page h1 {
                    margin-bottom: 2rem;
                    color: #333;
                }

                .statistics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 8px;
                    padding: 1.5rem;
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .stat-number {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.9rem;
                    color: #6c757d;
                }

                .stat-card.pending .stat-number { color: #ffc107; }
                .stat-card.approved .stat-number { color: #28a745; }
                .stat-card.rejected .stat-number { color: #dc3545; }
                .stat-card.rework .stat-number { color: #fd7e14; }
                .stat-card.rate .stat-number { color: #007bff; }

                .qc-content {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 2rem;
                }

                .assets-list {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .list-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .list-header h2 {
                    margin: 0;
                    font-size: 1.3rem;
                }

                .filter-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .filter-btn {
                    padding: 0.5rem 1rem;
                    border: 1px solid #dee2e6;
                    background: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .filter-btn:hover {
                    border-color: #007bff;
                    color: #007bff;
                }

                .filter-btn.active {
                    background-color: #007bff;
                    color: white;
                    border-color: #007bff;
                }

                .assets-table {
                    overflow-x: auto;
                }

                .assets-table table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .assets-table th {
                    background-color: #f8f9fa;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid #dee2e6;
                    font-size: 0.9rem;
                }

                .assets-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #dee2e6;
                }

                .assets-table tr:hover {
                    background-color: #f8f9fa;
                }

                .assets-table tr.selected {
                    background-color: #e7f3ff;
                }

                .asset-name {
                    font-weight: 600;
                    color: #333;
                }

                .score {
                    padding: 0.25rem 0.75rem;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .score.high {
                    background-color: #d4edda;
                    color: #155724;
                }

                .score.medium {
                    background-color: #fff3cd;
                    color: #856404;
                }

                .score.low {
                    background-color: #f8d7da;
                    color: #721c24;
                }

                .btn-review {
                    padding: 0.5rem 1rem;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: background-color 0.3s ease;
                }

                .btn-review:hover {
                    background-color: #0056b3;
                }

                .loading,
                .empty-state {
                    padding: 2rem;
                    text-align: center;
                    color: #6c757d;
                }

                .alert {
                    padding: 1rem;
                    margin: 1rem;
                    border-radius: 4px;
                }

                .alert-error {
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                }

                @media (max-width: 1200px) {
                    .qc-content {
                        grid-template-columns: 1fr;
                    }
                }
            `})]})},F=({asset:t,onApprove:k,onReject:d,onRework:R,onClose:v,loading:c,error:i,success:f})=>{const[g,N]=o.useState(""),[h,y]=o.useState(t.seo_score||0),C=()=>k(t.id,g,h),m=()=>d(t.id,g,h),S=()=>R(t.id,g,h);return e.jsxs("div",{className:"qc-review-panel",children:[e.jsxs("div",{className:"panel-header",children:[e.jsx("h3",{children:"Review Asset"}),e.jsx("button",{className:"close-btn",onClick:v,children:"✕"})]}),e.jsxs("div",{className:"panel-content",children:[i&&e.jsx("div",{className:"alert alert-error",children:i}),f&&e.jsx("div",{className:"alert alert-success",children:f}),e.jsxs("div",{className:"asset-info",children:[e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"label",children:"Name:"}),e.jsx("span",{className:"value",children:t.name})]}),e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"label",children:"Type:"}),e.jsx("span",{className:"value",children:t.asset_type})]}),e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"label",children:"SEO Score:"}),e.jsxs("span",{className:"value",children:[t.seo_score||0,"/100"]})]}),e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"label",children:"Grammar Score:"}),e.jsxs("span",{className:"value",children:[t.grammar_score||0,"/100"]})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"qc-score",children:"QC Score"}),e.jsx("input",{id:"qc-score",type:"number",min:"0",max:"100",value:h,onChange:n=>y(Number(n.target.value)),disabled:c,className:"form-control"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{htmlFor:"remarks",children:"Remarks"}),e.jsx("textarea",{id:"remarks",value:g,onChange:n=>N(n.target.value),disabled:c,className:"form-control",rows:4,placeholder:"Add your review remarks..."})]}),e.jsxs("div",{className:"action-buttons",children:[e.jsx("button",{className:"btn btn-approve",onClick:C,disabled:c,children:"✅ Approve"}),e.jsx("button",{className:"btn btn-rework",onClick:S,disabled:c,children:"🔄 Rework"}),e.jsx("button",{className:"btn btn-reject",onClick:m,disabled:c,children:"❌ Reject"})]})]}),e.jsx("style",{children:`
                .qc-review-panel {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    position: sticky;
                    top: 2rem;
                    max-height: calc(100vh - 4rem);
                    overflow-y: auto;
                }

                .panel-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #dee2e6;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .panel-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6c757d;
                }

                .panel-content {
                    padding: 1.5rem;
                }

                .asset-info {
                    margin-bottom: 1.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid #dee2e6;
                }

                .info-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    font-size: 0.9rem;
                }

                .info-item .label {
                    font-weight: 600;
                    color: #6c757d;
                }

                .info-item .value {
                    color: #333;
                }

                .form-group {
                    margin-bottom: 1rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .form-control {
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 0.9rem;
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

                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .btn {
                    padding: 0.75rem;
                    border: none;
                    border-radius: 4px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.9rem;
                }

                .btn-approve {
                    background-color: #28a745;
                    color: white;
                }

                .btn-approve:hover:not(:disabled) {
                    background-color: #218838;
                }

                .btn-rework {
                    background-color: #fd7e14;
                    color: white;
                }

                .btn-rework:hover:not(:disabled) {
                    background-color: #e56a00;
                }

                .btn-reject {
                    background-color: #dc3545;
                    color: white;
                }

                .btn-reject:hover:not(:disabled) {
                    background-color: #c82333;
                }

                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .alert {
                    padding: 0.75rem;
                    border-radius: 4px;
                    margin-bottom: 1rem;
                    font-size: 0.85rem;
                }

                .alert-error {
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                }

                .alert-success {
                    background-color: #d4edda;
                    border: 1px solid #c3e6cb;
                    color: #155724;
                }
            `})]})};export{$ as default};
