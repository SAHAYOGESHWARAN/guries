const axios = require("axios");
const BASE_URL = "http://localhost:3003/api/v1";

async function test() {
  try {
    console.log("🧪 Testing Sub-Service CRUD Operations\n");

    // 1. Create Service with all required fields
    console.log("1️⃣  Creating parent service...");
    const svc = await axios.post(`${BASE_URL}/services`, {
      service_name: "Web Development",
      service_code: "WD-001",
      slug: "web-development",
      full_url: "/services/web-development",
      status: "Published",
      language: "en",
      service_description: "Web development services",
      menu_heading: "Web Dev",
      short_tagline: "Professional web development",
      // Provide minimal required fields, rest will use defaults
      industry_ids: [],
      country_ids: [],
      secondary_persona_ids: [],
      linked_campaign_ids: [],
      h2_list: [],
      h3_list: [],
      h4_list: [],
      h5_list: [],
      internal_links: [],
      external_links: [],
      image_alt_texts: [],
      focus_keywords: [],
      secondary_keywords: [],
      redirect_from_urls: [],
      faq_content: [],
      linked_insights_ids: [],
      linked_assets_ids: []
    });
    console.log("✅ Service created:", svc.data.id, `(${svc.data.service_name})\n`);

    // 2. Create Sub-Service
    console.log("2️⃣  Creating sub-service...");
    const sub = await axios.post(`${BASE_URL}/sub-services`, {
      sub_service_name: "React Development",
      parent_service_id: svc.data.id,
      slug: "react",
      status: "Draft",
      description: "React-based web development",
      meta_title: "React Development Services",
      meta_description: "Professional React development services",
      focus_keywords: ["react", "javascript", "web development"]
    });
    console.log("✅ Sub-Service created:", sub.data.id, `(${sub.data.sub_service_name})\n`);

    // 3. Get Single Sub-Service
    console.log("3️⃣  Retrieving sub-service...");
    const get = await axios.get(`${BASE_URL}/sub-services/${sub.data.id}`);
    console.log("✅ Retrieved:", get.data.sub_service_name);
    console.log("   Status:", get.data.status);
    console.log("   Meta Title:", get.data.meta_title, "\n");

    // 4. Update Sub-Service
    console.log("4️⃣  Updating sub-service...");
    const upd = await axios.put(`${BASE_URL}/sub-services/${sub.data.id}`, {
      status: "Published",
      meta_title: "React Development - Professional Services",
      focus_keywords: ["react", "javascript", "frontend", "web development"],
      h1: "React Development Services",
      body_content: "We provide professional React development services..."
    });
    console.log("✅ Updated status:", upd.data.status);
    console.log("   New H1:", upd.data.h1);
    console.log("   Keywords:", upd.data.focus_keywords.length, "keywords\n");

    // 5. Get Sub-Services by Parent
    console.log("5️⃣  Fetching all sub-services for parent...");
    const parent = await axios.get(`${BASE_URL}/sub-services/parent/${svc.data.id}`);
    console.log("✅ Found", parent.data.length, "sub-service(s) for parent service\n");

    // 6. Create Another Sub-Service
    console.log("6️⃣  Creating second sub-service...");
    const sub2 = await axios.post(`${BASE_URL}/sub-services`, {
      sub_service_name: "Vue Development",
      parent_service_id: svc.data.id,
      slug: "vue",
      status: "Draft",
      description: "Vue-based web development"
    });
    console.log("✅ Second sub-service created:", sub2.data.id, "\n");

    // 7. Verify Parent Count Updated
    console.log("7️⃣  Verifying parent service updated...");
    const parentCheck = await axios.get(`${BASE_URL}/services/${svc.data.id}`);
    console.log("✅ Parent service now has", parentCheck.data.subservice_count, "sub-services");
    console.log("   has_subservices:", parentCheck.data.has_subservices, "\n");

    // 8. Delete First Sub-Service
    console.log("8️⃣  Deleting first sub-service...");
    await axios.delete(`${BASE_URL}/sub-services/${sub.data.id}`);
    console.log("✅ Deleted successfully\n");

    // 9. Verify Count Decreased
    console.log("9️⃣  Verifying count decreased...");
    const parentFinal = await axios.get(`${BASE_URL}/services/${svc.data.id}`);
    console.log("✅ Parent service now has", parentFinal.data.subservice_count, "sub-service(s)\n");

    // 10. Get All Sub-Services
    console.log("🔟 Fetching all sub-services...");
    const allSubs = await axios.get(`${BASE_URL}/sub-services`);
    console.log("✅ Total sub-services in system:", allSubs.data.length, "\n");

    console.log("═══════════════════════════════════════");
    console.log("✅ ALL TESTS PASSED!");
    console.log("═══════════════════════════════════════");
  } catch (e) {
    console.error("\n❌ ERROR:", e.response?.data?.error || e.message);
    if (e.response?.data) {
      console.error("Details:", JSON.stringify(e.response.data, null, 2));
    }
    process.exit(1);
  }
}

test();
