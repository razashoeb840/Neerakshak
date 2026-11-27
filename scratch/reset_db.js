// Scratch script: Complete MongoDB Reset & Inventory Stocking
// Clears all operational collections to 0/empty and establishes fresh full warehouse inventory.

import { getDatabase } from '../server/lib/mongodb.js';

async function resetAllData() {
  console.log('🔄 Connecting to MongoDB for total clean reset...');
  const db = await getDatabase();
  if (!db) {
    console.error('❌ Failed to connect to MongoDB');
    process.exit(1);
  }

  const collectionsToClear = [
    'affectedareas',
    'resourceallocations',
    'resourcerequests',
    'coordinationrecords',
    'authority_operations',
    'auditlogs',
    'returnrecords',
    'dispatchrecords',
    'groundreturns',
    'fieldreports',
    'groundoperations',
    'deliveryverifications',
    'floodalerts',
    'broadcast_announcements',
    'monitoring_chats',
    'monitoring_discrepancies',
    'monitoring_escalations',
    'monitoring_return_cases',
    'monitoring_history_cases',
    'emergencyfacilities',
    'inventoryitems'
  ];

  console.log('🧹 Clearing operational collections...');
  for (const collName of collectionsToClear) {
    try {
      const res = await db.collection(collName).deleteMany({});
      console.log(`  ✓ Cleared ${collName}: ${res.deletedCount} records deleted`);
    } catch (e) {
      console.warn(`  Notice for ${collName}:`, e.message);
    }
  }

  console.log('\n📦 Populating Fresh Central Warehouse Inventory...');
  const freshInventory = [
    {
      id: 'INV-01',
      name: 'Inflatable Motorized Rescue Boats with OBM',
      category: 'Rescue Boats',
      warehouse: 'Central Relief Godown – Mirza',
      total: 50,
      available: 50,
      allocated: 0,
      dispatched: 0,
      minLimit: 10,
      condition: 'Good',
      supplier: 'National Disaster Response Supply Depot',
      lastRestocked: new Date().toLocaleDateString('en-IN')
    },
    {
      id: 'INV-02',
      name: 'High-Buoyancy Safety Life Jackets (SOLAS)',
      category: 'Life Jackets',
      warehouse: 'Central Relief Godown – Mirza',
      total: 800,
      available: 800,
      allocated: 0,
      dispatched: 0,
      minLimit: 100,
      condition: 'Good',
      supplier: 'Assam SDMA Central Store',
      lastRestocked: new Date().toLocaleDateString('en-IN')
    },
    {
      id: 'INV-03',
      name: 'Ready-to-Eat Emergency Food Rations (Pack of 10)',
      category: 'Food Packets',
      warehouse: 'Central Relief Godown – Mirza',
      total: 5000,
      available: 5000,
      allocated: 0,
      dispatched: 0,
      minLimit: 800,
      condition: 'Good',
      supplier: 'FCI State Reserve Depot',
      lastRestocked: new Date().toLocaleDateString('en-IN')
    },
    {
      id: 'INV-04',
      name: '20L Sealed Purified Drinking Water Canisters',
      category: 'Drinking Water',
      warehouse: 'Central Relief Godown – Mirza',
      total: 3000,
      available: 3000,
      allocated: 0,
      dispatched: 0,
      minLimit: 500,
      condition: 'Good',
      supplier: 'Public Health Engineering Dept (PHED)',
      lastRestocked: new Date().toLocaleDateString('en-IN')
    },
    {
      id: 'INV-05',
      name: 'Trauma & Waterborne Disease Emergency Medicine Kits',
      category: 'Medicines',
      warehouse: 'Central Relief Godown – Mirza',
      total: 600,
      available: 600,
      allocated: 0,
      dispatched: 0,
      minLimit: 100,
      condition: 'Good',
      supplier: 'National Health Mission (NHM Assam)',
      lastRestocked: new Date().toLocaleDateString('en-IN')
    },
    {
      id: 'INV-06',
      name: 'Family Relief Tarpaulin Tents & Camp Shelters',
      category: 'Rescue Equipment',
      warehouse: 'Central Relief Godown – Mirza',
      total: 300,
      available: 300,
      allocated: 0,
      dispatched: 0,
      minLimit: 40,
      condition: 'Good',
      supplier: 'NDRF Base Logistics',
      lastRestocked: new Date().toLocaleDateString('en-IN')
    },
    {
      id: 'INV-07',
      name: 'Heavy Dewatering High-Discharge Submersible Pumps',
      category: 'Rescue Equipment',
      warehouse: 'North Sector Warehouse – Rangia',
      total: 40,
      available: 40,
      allocated: 0,
      dispatched: 0,
      minLimit: 8,
      condition: 'Good',
      supplier: 'Irrigation & Flood Control Board',
      lastRestocked: new Date().toLocaleDateString('en-IN')
    },
    {
      id: 'INV-08',
      name: 'Solar Searchlights & Emergency Rescue Rope Kits',
      category: 'Rescue Equipment',
      warehouse: 'North Sector Warehouse – Rangia',
      total: 150,
      available: 150,
      allocated: 0,
      dispatched: 0,
      minLimit: 25,
      condition: 'Good',
      supplier: 'SDRF Logistics Unit',
      lastRestocked: new Date().toLocaleDateString('en-IN')
    }
  ];

  const insertRes = await db.collection('inventoryitems').insertMany(freshInventory);
  console.log(`  ✓ Inserted ${insertRes.insertedCount} fresh inventory items into inventoryitems collection.`);

  // Initial stock-in movement
  const initialMovements = freshInventory.map(item => ({
    time: 'Today, 08:00 AM',
    type: 'STOCK IN',
    item: `${item.available} ${item.name}`,
    party: item.supplier,
    note: `Initial fresh stock verified at ${item.warehouse}`
  }));
  await db.collection('dispatchrecords').insertMany(initialMovements);
  console.log(`  ✓ Inserted ${initialMovements.length} initial stock receipt logs.`);

  console.log('\n✅ TOTAL RESET COMPLETED SUCCESSFULLY!');
  console.log('Database is now in a 100% clean, fresh state ready for you to create new areas and workflows from scratch.');
  process.exit(0);
}

resetAllData().catch(err => {
  console.error('Reset failed:', err);
  process.exit(1);
});
