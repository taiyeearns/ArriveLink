// Quick check: how much data is in the old database?
const SUPABASE_URL = 'https://nlqdzkwqaqlzuausumvs.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scWR6a3dxYXFsenVhdXN1bXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzQ1MDI1NSwiZXhwIjoyMDk5MDI2MjU1fQ.lHTKGDrsTld8fNbacc7bsHsoUvdFzAs53ZoVNIs12Oc';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
};

const tables = ['profiles', 'operators', 'routes', 'trips', 'bookings', 'locations', 'states', 'regions', 'support_tickets', 'ratings'];

for (const table of tables) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id&limit=1000`, { headers });
    if (res.ok) {
      const data = await res.json();
      console.log(`${table}: ${data.length} rows`);
    } else {
      console.log(`${table}: HTTP ${res.status}`);
    }
  } catch (e) {
    console.log(`${table}: error - ${e.message}`);
  }
}
