const API_BASE = "http://127.0.0.1:3000/api";

async function runValidation() {
  console.log("=== STARTING CMS API & PUBLISHING LOOP VALIDATION ===");

  const testId = `n_test_${Math.random().toString(36).substring(2, 9)}`;
  const testNewsletter = {
    id: testId,
    title: "Validation Test: Fed Policy Pivot",
    subtitle: "A detailed test briefing analyzing recent macro projections.",
    slug: `validation-test-fed-policy-pivot-${Math.random().toString(36).substring(2, 5)}`,
    category: "Macro",
    template: "Standard Report",
    authorId: "u1", // admin user from seeds
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800",
    readingTime: 4,
    status: "draft",
    visibility: "monthly",
    blocks: [
      { id: "b1", type: "heading", data: { level: 2, text: "Macro Outlook" } },
      { id: "b2", type: "paragraph", data: { text: "The Fed keeps holding interest rates steady as inflation numbers remain sticky." } }
    ],
    stats: { opens: 0, clicks: 0, openRate: 0, clickRate: 0, reads: 0 }
  };

  try {
    // 1. Test Creating Newsletter
    console.log("\n[Step 1] Creating new newsletter draft...");
    const createRes = await fetch(`${API_BASE}/newsletters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testNewsletter),
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create draft. Status: ${createRes.status}`);
    }
    const created: any = await createRes.json();
    console.log(`✔ Draft created successfully! ID: ${created.id}, Status: ${created.status}`);

    // 2. Test Fetching Single Newsletter
    console.log("\n[Step 2] Fetching draft by slug...");
    const fetchRes = await fetch(`${API_BASE}/newsletters/${testNewsletter.slug}`);
    if (!fetchRes.ok) {
      throw new Error(`Failed to retrieve draft by slug. Status: ${fetchRes.status}`);
    }
    const retrieved: any = await fetchRes.json();
    if (retrieved.title !== testNewsletter.title) {
      throw new Error("Retrieved newsletter title does not match original.");
    }
    console.log(`✔ Draft retrieved successfully! Title: "${retrieved.title}"`);

    // 3. Test Updating Newsletter Content (Step 3 Content changes)
    console.log("\n[Step 3] Updating content and adding rich block modules...");
    const updatedPayload = {
      ...testNewsletter,
      title: "Validation Test: Fed Policy Pivot (Updated)",
      blocks: [
        { id: "b1", type: "heading", data: { level: 2, text: "Macro Outlook (Revised)" } },
        { id: "b2", type: "paragraph", data: { text: "The Fed keeps holding interest rates steady as inflation numbers remain sticky." } },
        { id: "b3", type: "number-highlight", data: { value: "5.25%", label: "Federal Funds Rate", trend: "neutral" } },
        { id: "b4", type: "stocks-to-watch", data: { items: [{ ticker: "SPY", change: "+1.2%", note: "Rallied on pivot hopes" }] } }
      ]
    };

    const updateRes = await fetch(`${API_BASE}/newsletters/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPayload),
    });
    if (!updateRes.ok) {
      throw new Error(`Failed to update newsletter. Status: ${updateRes.status}`);
    }
    const updated: any = await updateRes.json();
    console.log(`✔ Newsletter updated successfully! New Title: "${updated.title}"`);
    console.log(`✔ Blocks length in database: ${updated.blocks.length}`);

    // 4. Test Publishing
    console.log("\n[Step 4] Publishing newsletter...");
    const publishPayload = {
      ...updatedPayload,
      status: "published",
      publishDate: new Date().toISOString()
    };
    const publishRes = await fetch(`${API_BASE}/newsletters/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(publishPayload),
    });
    if (!publishRes.ok) {
      throw new Error(`Failed to publish newsletter. Status: ${publishRes.status}`);
    }
    const published: any = await publishRes.json();
    console.log(`✔ Status transitioned to: ${published.status}`);

    // 5. Verify published list
    console.log("\n[Step 5] Verifying retrieval from published briefings API...");
    const publishedListRes = await fetch(`${API_BASE}/newsletters/published`);
    if (!publishedListRes.ok) {
      throw new Error("Failed to load published briefings.");
    }
    const publishedList = (await publishedListRes.json()) as any[];
    const found = publishedList.find((n) => n.id === testId);
    if (!found) {
      throw new Error("Published newsletter not found in the published briefings list.");
    }
    console.log(`✔ Found published briefing in reader listing! Title: "${found.title}"`);

    // 6. Test Deletion
    console.log("\n[Step 6] Cleaning up test newsletter...");
    const deleteRes = await fetch(`${API_BASE}/newsletters/${testId}`, {
      method: "DELETE"
    });
    if (!deleteRes.ok) {
      throw new Error(`Failed to delete newsletter. Status: ${deleteRes.status}`);
    }
    console.log("✔ Newsletter cleaned up successfully!");

    console.log("\n=== ALL INTEGRATION FLOW CHECKS PASSED SUCCESSFULLY! ===");
  } catch (err: any) {
    console.error("\n❌ VALIDATION FAILED:", err.message);
    process.exit(1);
  }
}

runValidation();
