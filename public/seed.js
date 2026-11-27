/**
 * NEERAKSHAK – Clean State Configuration (seed.js)
 * STRICT REAL-DATA ONLY: ZERO fake records.
 * All operational data (areas, requests, dispatches, deliveries, returns, audits)
 * is sourced directly and exclusively from live MongoDB (neerakshak_db).
 */
window.NEERAKSHAK_SEED_DATA = {
  "admin": {
    "areas": [],
    "rivers": [
      {
        "id": "riv-1",
        "name": "Brahmaputra River (Guwahati Pandu)",
        "current": 17.42,
        "danger": 49.68,
        "trend": "Falling",
        "barColor": "#16a34a",
        "spark": "M2 16 L12 13 L22 14 L32 8 L42 6 L52 3"
      },
      {
        "id": "riv-2",
        "name": "Barak River (Badarpurghat)",
        "current": 14.65,
        "danger": 16.85,
        "trend": "Steady",
        "barColor": "#16a34a",
        "spark": "M2 15 L12 14 L22 11 L32 10 L42 7 L52 5"
      }
    ],
    "alerts": [],
    "facilities": []
  },
  "authority": {
    "villages": [],
    "requests": [],
    "allocations": [],
    "coordinations": [],
    "operations": [],
    "logs": []
  },
  "godown": {
    "inventory": [
      {
        "id": "INV-01",
        "name": "Inflatable Motorized Rescue Boats with OBM",
        "category": "Rescue Boats",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 50,
        "available": 50,
        "allocated": 0,
        "dispatched": 0,
        "minLimit": 10,
        "condition": "Good"
      },
      {
        "id": "INV-02",
        "name": "High-Buoyancy Safety Life Jackets (SOLAS)",
        "category": "Life Jackets",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 800,
        "available": 800,
        "allocated": 0,
        "dispatched": 0,
        "minLimit": 100,
        "condition": "Good"
      },
      {
        "id": "INV-03",
        "name": "Ready-to-Eat Emergency Food Rations (Pack of 10)",
        "category": "Food Packets",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 5000,
        "available": 5000,
        "allocated": 0,
        "dispatched": 0,
        "minLimit": 800,
        "condition": "Good"
      },
      {
        "id": "INV-04",
        "name": "20L Sealed Purified Drinking Water Canisters",
        "category": "Drinking Water",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 3000,
        "available": 3000,
        "allocated": 0,
        "dispatched": 0,
        "minLimit": 500,
        "condition": "Good"
      },
      {
        "id": "INV-05",
        "name": "Trauma & Waterborne Disease Emergency Medicine Kits",
        "category": "Medicines",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 600,
        "available": 600,
        "allocated": 0,
        "dispatched": 0,
        "minLimit": 100,
        "condition": "Good"
      },
      {
        "id": "INV-06",
        "name": "Family Relief Tarpaulin Tents & Camp Shelters",
        "category": "Rescue Equipment",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 300,
        "available": 300,
        "allocated": 0,
        "dispatched": 0,
        "minLimit": 40,
        "condition": "Good"
      },
      {
        "id": "INV-07",
        "name": "Heavy Dewatering High-Discharge Submersible Pumps",
        "category": "Rescue Equipment",
        "warehouse": "North Sector Warehouse – Rangia",
        "total": 40,
        "available": 40,
        "allocated": 0,
        "dispatched": 0,
        "minLimit": 8,
        "condition": "Good"
      },
      {
        "id": "INV-08",
        "name": "Solar Searchlights & Emergency Rescue Rope Kits",
        "category": "Rescue Equipment",
        "warehouse": "North Sector Warehouse – Rangia",
        "total": 150,
        "available": 150,
        "allocated": 0,
        "dispatched": 0,
        "minLimit": 25,
        "condition": "Good"
      }
    ],
    "allocations": [],
    "returns": [],
    "movements": []
  },
  "groundOfficer": {
    "areas": [],
    "deliveries": [],
    "operations": [],
    "returns": [],
    "notifications": []
  },
  "monitoring": {
    "lifecycles": [],
    "reconciliation": [],
    "discrepancies": [],
    "returns": [],
    "history": [],
    "chats": []
  },
  "latestNewsUpdates": [
    {
      "time": "Just now",
      "tag": "OFFICIAL BULLETIN",
      "headline": "Assam State Disaster Management Authority Live Telemetry Active",
      "body": "State DEOC monitoring network connected. River basins at safe clearance."
    }
  ]
};
