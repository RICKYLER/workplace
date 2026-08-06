import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.udluqqebhubfswvgodvh:rickycontiga123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require";

const sql = postgres(connectionString, { ssl: { rejectUnauthorized: false } });

async function seedData() {
  try {
    console.log("Seeding initial Ara OS Phase 1 data into Supabase...");

    // 1. Projects
    await sql`
      INSERT INTO projects (reference, client, model, quantity, agent, manager, stage, status, priority, target_delivery, next_action, progress)
      VALUES
        ('CV-2026-001', 'City Emergency Response Fleet', 'H-100 Ambulance', 3, 'Kath', 'Robespierre T. Agir', 9, 'In Fabrication', 'Urgent', 'Aug 12, 2026', 'Confirm body fabrication progress', 64),
        ('CV-2026-002', 'Provincial Mobile Services', 'HD65 Wing Van', 2, 'RAM', 'Robespierre T. Agir', 11, 'For PDI', 'High', 'Aug 08, 2026', 'Complete mechanical inspection', 78),
        ('CV-2026-003', 'Municipal Rescue Upgrade', 'Porter II Rescue Vehicle', 1, 'Ergem', 'Robespierre T. Agir', 7, 'Pending Documents', 'Normal', 'Aug 17, 2026', 'Follow up acceptance requirements', 42),
        ('CV-2026-004', 'Regional Logistics Support', 'HD78 Dropside', 4, 'Darnet', 'Robespierre T. Agir', 13, 'Delivery Scheduling', 'High', 'Aug 06, 2026', 'Confirm trucking and receiving team', 88)
      ON CONFLICT DO NOTHING;
    `;

    // 2. Units (Source of Truth)
    await sql`
      INSERT INTO units (cs_number, vin_number, engine_number, model_description, color, location, status, sales_consultant, dealers_price)
      VALUES
        ('CS-98124', 'VIN-8912412', 'ENG-49120', 'HD65 Cab & Chassis', 'White', 'Davao Yard', 'Available', 'RAM', 1850000),
        ('CS-87421', 'VIN-1248192', 'ENG-88124', 'H-100 Shuttle', 'Silver', 'Fabricator', 'Assigned', 'Kath', 1220000),
        ('CS-65239', 'VIN-7712395', 'ENG-33190', 'HD78 Dropside', 'White', 'Davao Yard', 'For Review', 'Darnet', 2100000)
      ON CONFLICT (cs_number) DO NOTHING;
    `;

    // 3. People Directory (Reference Data)
    await sql`
      INSERT INTO people (full_name, role, department, contact_number, email, active_status)
      VALUES
        ('Ara Mae Marcillo', 'CV Sales Admin', 'Sales Admin', '0917-000-0000', 'ara@cars.com', 'Active'),
        ('Robespierre T. Agir', 'General Sales Manager', 'Sales Management', '0918-111-2222', 'robespierre@cars.com', 'Active'),
        ('RAM', 'Sales Consultant', 'Sales', '0919-222-3333', 'ram@cars.com', 'Active'),
        ('Kath', 'Sales Consultant', 'Sales', '0920-333-4444', 'kath@cars.com', 'Active'),
        ('Darnet', 'Sales Consultant', 'Sales', '0921-444-5555', 'darnet@cars.com', 'Active'),
        ('Ergem', 'Sales Consultant', 'Sales', '0922-555-6666', 'ergem@cars.com', 'Active')
      ON CONFLICT DO NOTHING;
    `;

    console.log("🎉 SUCCESS! Live Supabase database populated with initial Ara OS projects, units, and people records!");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await sql.end();
  }
}

seedData();
