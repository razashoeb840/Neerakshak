export const SEED_DATA = {
  "admin": {
    "areas": [
      {
        "id": "area-1795703600630",
        "name": "Police Colony",
        "block": "Kahara, Saharsa",
        "severity": "Normal",
        "pop": 2200,
        "lat": 25.8828,
        "lng": 86.5896,
        "notes": "tfgbjmk"
      },
      {
        "id": "area-1795424567980",
        "name": "Flood Sector",
        "block": "Palasbari, Kamrup",
        "severity": "Critical",
        "pop": 2200,
        "lat": 26.1427,
        "lng": 91.5611,
        "notes": "incrasing"
      }
    ],
    "rivers": [
      {
        "id": "riv-1",
        "name": "Brahmaputra River",
        "current": 10.8,
        "danger": 18,
        "trend": "Rising",
        "barColor": "#16a34a",
        "spark": "M2 16 L12 13 L22 14 L32 8 L42 6 L52 3"
      },
      {
        "id": "riv-2",
        "name": "Kolong River",
        "current": 14.6,
        "danger": 15,
        "trend": "Rising",
        "barColor": "#eab308",
        "spark": "M2 15 L12 14 L22 11 L32 10 L42 7 L52 5"
      },
      {
        "id": "riv-3",
        "name": "Kakang River",
        "current": 12.8,
        "danger": 14.5,
        "trend": "Steady",
        "barColor": "#16a34a",
        "spark": "M2 12 L12 13 L22 10 L32 11 L42 9 L52 9"
      }
    ],
    "alerts": [
      {
        "id": "alt-1",
        "title": "Flood risk increasing",
        "location": "Chaygaon, North Kamrup",
        "severity": "High",
        "desc": "River water rising near northern embankment; low-lying residents advised to move to relief shelters."
      },
      {
        "id": "alt-2",
        "title": "Water level rising",
        "location": "Palashbari, Kamrup",
        "severity": "Moderate",
        "desc": "Continuous upstream rainfall; waterlogging watch active across riverside wards."
      }
    ],
    "facilities": [
      {
        "id": "fac-1",
        "name": "District Civil Emergency Hospital",
        "category": "Hospital",
        "distance": "2.4 km • Kamrup Sadar",
        "contact": "108"
      },
      {
        "id": "fac-2",
        "name": "Palashbari Sadar Police Station",
        "category": "Police Station",
        "distance": "1.8 km • Palashbari",
        "contact": "112"
      },
      {
        "id": "fac-3",
        "name": "Chaygaon Higher Secondary Relief Camp",
        "category": "Relief Camp",
        "distance": "3.1 km • Chaygaon Circle",
        "contact": "1077"
      }
    ],
    "weather": {
      "rainfall": "142 mm / 24h",
      "advisory": "Orange Alert (Heavy Rain)",
      "humidity": "94% Humidity • 18 km/h NW",
      "forecast": "Intense spells expected over upper catchment"
    }
  },
  "authority": {
    "villages": [
      {
        "id": "V-01",
        "name": "Palashbari Riverside Ward 2",
        "block": "Palashbari Circle",
        "severity": "Critical",
        "pop": 4200,
        "lat": 26.132,
        "lng": 91.515,
        "waterStatus": "Brahmaputra at 18.20 m (0.60 m Above Danger Level • Rising)",
        "assessedNeed": {
          "boats": 4,
          "jackets": 60,
          "food": 500,
          "meds": 80
        }
      },
      {
        "id": "V-02",
        "name": "Chaygaon Lowland Belt",
        "block": "Chaygaon Circle",
        "severity": "High",
        "pop": 3650,
        "lat": 26.052,
        "lng": 91.225,
        "waterStatus": "Kolong Basin at 14.60 m (0.30 m Below Danger Mark • Influx Warning)",
        "assessedNeed": {
          "boats": 2,
          "jackets": 30,
          "food": 450,
          "meds": 65
        }
      },
      {
        "id": "V-03",
        "name": "Goroimari Char Cluster",
        "block": "Goroimari Circle",
        "severity": "Moderate",
        "pop": 2800,
        "lat": 26.095,
        "lng": 91.34,
        "waterStatus": "Waterlogging watch on feeder approach road; ferry access functional",
        "assessedNeed": {
          "boats": 1,
          "jackets": 15,
          "food": 250,
          "meds": 40
        }
      },
      {
        "id": "V-04",
        "name": "Boko Upland Sector",
        "block": "Boko Circle",
        "severity": "Normal",
        "pop": 1780,
        "lat": 25.98,
        "lng": 91.24,
        "waterStatus": "Kakang River Gauge at 12.80 m (Safe Margin 2.40 m • Steady)",
        "assessedNeed": {
          "boats": 0,
          "jackets": 0,
          "food": 100,
          "meds": 20
        }
      },
      {
        "id": "area-1795461725956",
        "name": "Police Colony",
        "block": "Kahara, Saharsa",
        "severity": "Normal",
        "pop": 2200,
        "waterStatus": "tfgbjmk",
        "assessedNeed": {
          "boats": 1,
          "jackets": 33,
          "food": 264,
          "meds": 44
        },
        "lat": 25.8828,
        "lng": 86.5896
      },
      {
        "id": "area-1795424567980",
        "name": "Flood Sector",
        "block": "Palasbari, Kamrup",
        "severity": "Critical",
        "pop": 2200,
        "waterStatus": "incrasing",
        "assessedNeed": {
          "boats": 3,
          "jackets": 33,
          "food": 264,
          "meds": 44
        },
        "lat": 26.1427,
        "lng": 91.5611
      }
    ],
    "requests": [
      {
        "id": "REQ-204",
        "from": "Ground Officer R. K. Kalita (GO-KAM-04)",
        "village": "Palashbari Riverside Ward 2",
        "items": "4 Rescue Boats, 60 Life Jackets",
        "urgency": "Critical",
        "status": "Pending",
        "reason": "Embankment breach at Ward 2 primary school; 140 families stranded on rooftops.",
        "timestamp": "Today, 10:30 AM"
      },
      {
        "id": "REQ-205",
        "from": "Relief Camp Desk – Chaygaon HS",
        "village": "Chaygaon Lowland Belt",
        "items": "450 Food Packets, 65 Medicine Kits",
        "urgency": "High",
        "status": "Pending",
        "reason": "Drinking water contamination and infant formula shortage reported by Camp Doctor.",
        "timestamp": "Today, 09:45 AM"
      },
      {
        "id": "REQ-201",
        "from": "DEOC Field Sector Desk",
        "village": "Goroimari Char Cluster",
        "items": "250 Food Packets, 40 Medicine Kits",
        "urgency": "Moderate",
        "status": "Approved",
        "reason": "Approved per DDMA flood severity matrix & routed to Godown Manager (ALC-503).",
        "timestamp": "Today, 08:30 AM"
      }
    ],
    "allocations": [
      {
        "id": "ALC-575",
        "village": "Police Colony",
        "summary": "1 Boats, 33 Jackets, 264 Food, 44 Meds",
        "godownStatus": "Updated by Authority • Preparing Dispatch",
        "deliveryProgress": 25,
        "timestamp": "08:05 pm"
      },
      {
        "id": "ALC-501",
        "village": "Palashbari Riverside Ward 2",
        "summary": "5 Boats, 70 Jackets, 600 Food, 100 Meds",
        "godownStatus": "Dispatched (DSP-2026-941) • En-Route",
        "deliveryProgress": 75,
        "timestamp": "09:49 pm",
        "timeline": [
          {
            "step": "Departed Central Godown",
            "time": "09:49 pm",
            "status": "done",
            "detail": "Gate-pass #DSP-2026-941 issued; vehicle Heavy Truck AS-01-EC-4210 departed Central Godown."
          },
          {
            "step": "Allocation Order Adjusted",
            "time": "Just now",
            "status": "done",
            "detail": "Emergency supplies updated by District Authority to: 5 Boats, 70 Jackets, 600 Food, 100 Meds"
          }
        ]
      },
      {
        "id": "ALC-502",
        "village": "Chaygaon Lowland Belt",
        "summary": "2 Boats, 30 Jackets, 450 Food, 65 Meds",
        "godownStatus": "Departed Godown • En-Route",
        "deliveryProgress": 50,
        "timestamp": "Today, 09:30 AM",
        "assignedGodown": "Central Relief Godown – Mirza (Bay 1)",
        "vehicle": "Medium Truck #AS-01-GC-4821 (Tata 407)",
        "driver": "Biren Barman (Ph: +91 94351-78201)",
        "escortOfficer": "Constable N. Sarma (Traffic & Route Security)",
        "itemsDetail": [
          {
            "name": "Inflatable Rescue Boats",
            "qty": 2,
            "unit": "Boats"
          },
          {
            "name": "High-Buoyancy Life Jackets",
            "qty": 30,
            "unit": "Jackets"
          },
          {
            "name": "Dry Ration Food Packets",
            "qty": 450,
            "unit": "Packets"
          },
          {
            "name": "Emergency Water Purification & Meds",
            "qty": 65,
            "unit": "Kits"
          }
        ],
        "timeline": [
          {
            "step": "DDMA Allocation Approved",
            "time": "09:30 AM",
            "status": "done",
            "detail": "Emergency relief request approved by DDMA Controller."
          },
          {
            "step": "Stock Verified & Pallets Loaded",
            "time": "10:00 AM",
            "status": "done",
            "detail": "Inspected and loaded by Mirza Depot Shift B team."
          },
          {
            "step": "Departed Central Godown",
            "time": "10:15 AM",
            "status": "done",
            "detail": "Cleared outbound weighbridge; route advised via Gumi-Chaygaon bypass."
          },
          {
            "step": "Crossed Sector Checkpoint",
            "time": "10:45 AM (ETA)",
            "status": "active",
            "detail": "Moving through Chaygaon South approach road."
          },
          {
            "step": "Camp Intake & Final Distribution",
            "time": "11:20 AM (ETA)",
            "status": "pending",
            "detail": "Scheduled delivery at Chaygaon Community Hall Relief Intake Center."
          }
        ]
      },
      {
        "id": "ALC-503",
        "village": "Goroimari Char Cluster",
        "summary": "1 Boat, 15 Jackets, 250 Food, 40 Meds",
        "godownStatus": "Delivered & Confirmed at Camp",
        "deliveryProgress": 100,
        "timestamp": "Today, 08:15 AM",
        "assignedGodown": "North Sector Warehouse – Rangia",
        "vehicle": "Pickup #AS-14-B-9912 & Motorized Country Barge",
        "driver": "Abdul Munnaf (+91 97060-44129)",
        "escortOfficer": "Home Guard J. Medhi",
        "itemsDetail": [
          {
            "name": "Rescue Boat with 15HP OBM",
            "qty": 1,
            "unit": "Boat"
          },
          {
            "name": "Life Jackets",
            "qty": 15,
            "unit": "Jackets"
          },
          {
            "name": "Dry Ration Packets",
            "qty": 250,
            "unit": "Packets"
          },
          {
            "name": "First Aid & Halogen Lights",
            "qty": 40,
            "unit": "Kits"
          }
        ],
        "timeline": [
          {
            "step": "DDMA Allocation Approved",
            "time": "08:15 AM",
            "status": "done",
            "detail": "Sanctioned early morning per Brahmaputra flood wave advisory."
          },
          {
            "step": "Stock Verified & Pallets Loaded",
            "time": "08:35 AM",
            "status": "done",
            "detail": "Loaded at Rangia auxiliary relief post."
          },
          {
            "step": "Departed Central Godown",
            "time": "08:50 AM",
            "status": "done",
            "detail": "Road dispatch to Goroimari river ferry point."
          },
          {
            "step": "Ferry Transfer & Sector Crossing",
            "time": "09:30 AM",
            "status": "done",
            "detail": "Transferred safely to motorized river barge."
          },
          {
            "step": "Camp Intake & Final Distribution",
            "time": "10:10 AM",
            "status": "done",
            "detail": "100% receipt verified by Village Headman & Ground Officer; signed manifest uploaded."
          }
        ]
      }
    ],
    "coordinations": [
      {
        "id": "CORD-101",
        "agency": "NDRF (1st Battalion, Patgaon)",
        "commander": "Inspector Vikram Rathore",
        "designation": "Team Alpha Incident Commander",
        "contact": "VHF Wireless Ch-07 (\"EAGLE-1\") / +91 94350-11234",
        "strength": "28 Deep-Water Personnel • 4 Inflatable Zodiacs • 2 OBMs",
        "sector": "Palashbari Riverside Ward 2 & Embankment Breach",
        "status": "Deployed On Water",
        "timestamp": "10:15 AM",
        "callLog": "Spoke with Insp. Vikram Rathore on VHF Ch-7. DEOC requested 2 immediate boat sorties behind primary school where 85 citizens are marooned. Team Alpha committed all 4 Zodiacs; 140 persons evacuated so far. Medical evacuation of 2 pregnant women prioritized to Mirza PHC."
      },
      {
        "id": "CORD-102",
        "agency": "SDRF District Unit (Guwahati Central)",
        "commander": "Sub-Inspector Manoj Baruah",
        "designation": "SDRF Quick Response Unit Lead",
        "contact": "Mobile: +91 98540-33211 / DEOC Hotline Line 2",
        "strength": "18 Divers & Rescuers • 2 Aluminium Boats • 1 Mobile Generator",
        "sector": "Chaygaon Lowland Belt & Gumi Road Junction",
        "status": "Active Rescue Sortie",
        "timestamp": "09:30 AM",
        "callLog": "Direct telephone coordination with SI Manoj Baruah. SDRF unit arrived at Chaygaon ferry crossing. Clearing submerged approach road of driftwood to open access for food trucks. Assisting local administration in ferry shuttles for elderly citizens."
      },
      {
        "id": "CORD-103",
        "agency": "Indian Army (Red Horns Division)",
        "commander": "Major Ankit Swaminathan",
        "designation": "Flood Relief Column Commander",
        "contact": "Army Tactical Line / Sat-Phone: +88216-992384",
        "strength": "1 Task Force Column (45 Jawans) • 6 BAUTs • 1 Mobile Field Hospital",
        "sector": "Goroimari Char Cluster & Island Villages",
        "status": "On Standby at Staging Area",
        "timestamp": "08:45 AM",
        "callLog": "Conference call with Army Liaison Officer Maj. Swaminathan. Standby requisition acknowledged. Army column positioned at Mirza Stadium staging base. Requisition triggers if Brahmaputra crosses 18.50 m or if embankment breaches in West Kamrup."
      }
    ],
    "operations": [
      {
        "id": "OP-301",
        "title": "Palashbari Embankment Deep-Water Evacuation",
        "officer": "Inspector Vikram Rathore (NDRF)",
        "status": "Ongoing",
        "rescued": 142,
        "summary": "142 residents evacuated to Palashbari Govt. HS Relief Camp; 4 NDRF boat shuttles operational round-the-clock.",
        "timestamp": "Active"
      },
      {
        "id": "OP-302",
        "title": "Chaygaon Lowland Medical & Baby Food Airlift/Shuttle",
        "officer": "SI Manoj Baruah (SDRF) & Ground Officer",
        "status": "Ongoing",
        "rescued": 68,
        "summary": "First batch of 300 emergency food packets & ORS delivered to cutoff hamlets via motorized rafts.",
        "timestamp": "Active"
      },
      {
        "id": "OP-303",
        "title": "Goroimari Char Evacuation Drill & Pre-emptive Move",
        "officer": "Circle Officer Goroimari & Village Defense Party",
        "status": "Completed",
        "rescued": 95,
        "summary": "All elderly and livestock moved from low-lying char to elevated school bund; zero casualties.",
        "timestamp": "Completed"
      }
    ],
    "logs": [
      {
        "id": "LOG-MWXRCYJJ",
        "time": "09:49 pm",
        "actor": "District Authority (DDMA)",
        "note": "Updated allocation (5 Boats, 70 Jackets, 600 Food, 100 Meds) for Palashbari Riverside Ward 2 (ALC-501)."
      },
      {
        "id": "LOG-MWXNNCBW",
        "time": "08:05 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (1 Boats, 33 Jackets, 264 Food, 44 Meds) assigned to Police Colony."
      },
      {
        "id": "LOG-MWXNMCF8",
        "time": "08:05 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (1 Boats, 33 Jackets, 264 Food, 44 Meds) assigned to Police Colony."
      },
      {
        "id": "LOG-MWVZNFEN",
        "time": "04:06 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (4 Boats, 60 Jackets, 500 Food, 80 Meds) assigned to Palashbari Riverside Ward 2."
      },
      {
        "id": "LOG-MWVZN9U3",
        "time": "04:06 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (4 Boats, 60 Jackets, 500 Food, 80 Meds) assigned to Palashbari Riverside Ward 2."
      },
      {
        "id": "LOG-MWVZMKNA",
        "time": "04:05 pm",
        "actor": "District Authority (DDMA)",
        "note": "Updated allocation (4 Boats, 60 Jackets, 500 Food, 80 Meds) for Palashbari Riverside Ward 2 (ALC-501); notified Godown Manager."
      },
      {
        "id": "LOG-MWVZC81L",
        "time": "03:57 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (4 Boats, 60 Jackets, 500 Food, 80 Meds) assigned to Palashbari Riverside Ward 2."
      },
      {
        "id": "LOG-MWVZC693",
        "time": "03:57 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (4 Boats, 60 Jackets, 500 Food, 80 Meds) assigned to Palashbari Riverside Ward 2."
      },
      {
        "id": "LOG-MWVZC62Y",
        "time": "03:57 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (4 Boats, 60 Jackets, 500 Food, 80 Meds) assigned to Palashbari Riverside Ward 2."
      },
      {
        "id": "LOG-MWVZC5Y7",
        "time": "03:57 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (4 Boats, 60 Jackets, 500 Food, 80 Meds) assigned to Palashbari Riverside Ward 2."
      },
      {
        "id": "LOG-MWVZC5TE",
        "time": "03:57 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (4 Boats, 60 Jackets, 500 Food, 80 Meds) assigned to Palashbari Riverside Ward 2."
      },
      {
        "id": "LOG-MWVZC5OQ",
        "time": "03:57 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (4 Boats, 60 Jackets, 500 Food, 80 Meds) assigned to Palashbari Riverside Ward 2."
      },
      {
        "id": "LOG-MWVZC4NB",
        "time": "03:57 pm",
        "actor": "District Authority (DDMA)",
        "note": "Direct allocation (4 Boats, 60 Jackets, 500 Food, 80 Meds) assigned to Palashbari Riverside Ward 2."
      },
      {
        "id": "LOG-01",
        "time": "10:40 AM",
        "actor": "District Authority (DDMA Controller)",
        "note": "Assessed Palashbari Ward 2; approved ALC-501 (4 Boats, 60 Jackets, 500 Rations) to Godown Manager."
      },
      {
        "id": "LOG-02",
        "time": "10:15 AM",
        "actor": "District Authority (DDMA)",
        "note": "VHF coordination with NDRF 1st Bn (Insp. Rathore) for 4 boat sorties in Palashbari breach zone."
      },
      {
        "id": "LOG-03",
        "time": "09:30 AM",
        "actor": "District Authority (DDMA)",
        "note": "Approved direct allocation ALC-502 for Chaygaon Lowland Belt and tasked SDRF for route escort."
      },
      {
        "id": "LOG-04",
        "time": "08:45 AM",
        "actor": "District Authority (DDMA)",
        "note": "Briefed Indian Army Red Horns Division on staging readiness at Mirza base."
      }
    ]
  },
  "godown": {
    "inventory": [
      {
        "id": "INV-01",
        "name": "Inflatable Rescue Boats with OBM",
        "category": "Rescue Boats",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 18,
        "available": 11,
        "allocated": 4,
        "dispatched": 3,
        "minLimit": 5,
        "condition": "Good"
      },
      {
        "id": "INV-02",
        "name": "High-Buoyancy Life Jackets",
        "category": "Life Jackets",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 420,
        "available": 290,
        "allocated": 60,
        "dispatched": 70,
        "minLimit": 100,
        "condition": "Good"
      },
      {
        "id": "INV-03",
        "name": "Dry Ration Food Packets",
        "category": "Food Packets",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 3500,
        "available": 2150,
        "allocated": 500,
        "dispatched": 850,
        "minLimit": 800,
        "condition": "Good"
      },
      {
        "id": "INV-04",
        "name": "20L Drinking Water Canisters",
        "category": "Drinking Water",
        "warehouse": "North Sector Warehouse – Rangia",
        "total": 600,
        "available": 110,
        "allocated": 150,
        "dispatched": 340,
        "minLimit": 150,
        "condition": "Low Stock"
      },
      {
        "id": "INV-05",
        "name": "Essential Flood Medicine Kits",
        "category": "Medicines",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 450,
        "available": 280,
        "allocated": 80,
        "dispatched": 90,
        "minLimit": 100,
        "condition": "Good"
      },
      {
        "id": "INV-06",
        "name": "Trauma First-Aid Kits",
        "category": "First Aid Kits",
        "warehouse": "North Sector Warehouse – Rangia",
        "total": 160,
        "available": 28,
        "allocated": 30,
        "dispatched": 102,
        "minLimit": 40,
        "condition": "Low Stock"
      },
      {
        "id": "INV-07",
        "name": "Solar Searchlights & Rope Kits",
        "category": "Rescue Equipment",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 95,
        "available": 65,
        "allocated": 10,
        "dispatched": 20,
        "minLimit": 25,
        "condition": "Good"
      },
      {
        "id": "INV-08",
        "name": "Heavy Dewatering Submersible Pumps",
        "category": "Rescue Equipment",
        "warehouse": "North Sector Warehouse – Rangia",
        "total": 24,
        "available": 16,
        "allocated": 4,
        "dispatched": 4,
        "minLimit": 6,
        "condition": "Good"
      },
      {
        "id": "INV-09",
        "name": "Family Relief Tarpaulin Tents",
        "category": "Rescue Equipment",
        "warehouse": "Central Relief Godown – Mirza",
        "total": 120,
        "available": 85,
        "allocated": 20,
        "dispatched": 15,
        "minLimit": 30,
        "condition": "Good"
      }
    ],
    "allocations": [
      {
        "id": "ALC-575",
        "destination": "Police Colony",
        "block": "Kahara, Saharsa",
        "severity": "Normal",
        "lat": 25.8828,
        "lng": 86.5896,
        "summary": "1 Boats, 33 Jackets, 264 Food, 44 Meds",
        "needs": {
          "boats": 1,
          "jackets": 33,
          "food": 264,
          "meds": 44
        },
        "assignedGodown": "Central Relief Godown – Mirza",
        "status": "Pending Dispatch",
        "vehicle": "Heavy Truck AS-01-EC-4210",
        "driver": "Rajesh Das (+91 98640-21943)",
        "escortOfficer": "ASI D. Kalita (District Police)",
        "refNo": "—",
        "dispatchTime": "—",
        "progress": 20
      },
      {
        "id": "ALC-501",
        "destination": "Palashbari Riverside Ward 2",
        "block": "Palashbari Circle",
        "severity": "Critical",
        "lat": 26.132,
        "lng": 91.515,
        "summary": "5 Boats, 70 Jackets, 600 Food, 100 Meds",
        "needs": {
          "boats": 5,
          "jackets": 70,
          "food": 600,
          "meds": 100
        },
        "assignedGodown": "Central Relief Godown – Mirza",
        "status": "Dispatched",
        "vehicle": "Heavy Truck AS-01-EC-4210",
        "driver": "Rajesh Das (+91 98640-21943)",
        "escortOfficer": "ASI D. Kalita (District Police)",
        "refNo": "DSP-2026-941",
        "dispatchTime": "Just now",
        "progress": 75
      },
      {
        "id": "ALC-502",
        "destination": "Chaygaon Lowland Belt",
        "block": "Chaygaon Circle",
        "severity": "High",
        "lat": 26.052,
        "lng": 91.225,
        "summary": "2 Boats, 30 Jackets, 450 Food, 65 Meds",
        "needs": {
          "boats": 2,
          "jackets": 30,
          "food": 450,
          "meds": 65
        },
        "assignedGodown": "Central Relief Godown – Mirza (Bay 1)",
        "status": "Dispatched",
        "vehicle": "Medium Truck AS-01-GC-4821",
        "driver": "Biren Barman (+91 94351-78201)",
        "escortOfficer": "Constable N. Sarma",
        "refNo": "DSP-2026-884",
        "dispatchTime": "Today, 09:40 AM",
        "progress": 75
      },
      {
        "id": "ALC-503",
        "destination": "Goroimari Char Cluster",
        "block": "Goroimari Circle",
        "severity": "Moderate",
        "lat": 26.095,
        "lng": 91.34,
        "summary": "1 Boat, 15 Jackets, 250 Food, 40 Meds",
        "needs": {
          "boats": 1,
          "jackets": 15,
          "food": 250,
          "meds": 40
        },
        "assignedGodown": "North Sector Warehouse – Rangia",
        "status": "Dispatched",
        "vehicle": "Pickup AS-14-B-9912 & Motorized Barge",
        "driver": "Abdul Munnaf (+91 97060-44129)",
        "escortOfficer": "Home Guard J. Medhi",
        "refNo": "DSP-2026-884",
        "dispatchTime": "Today, 08:15 AM",
        "progress": 75
      }
    ],
    "returns": [
      {
        "id": "RET-301",
        "resourceId": "INV-01",
        "resourceName": "Inflatable Rescue Boats",
        "from": "Boko Relief Sector",
        "good": 2,
        "damaged": 0,
        "missing": 0,
        "date": "Yesterday, 06:15 PM"
      }
    ],
    "movements": [
      {
        "time": "Just now",
        "type": "DISPATCH",
        "item": "undefined undefined",
        "party": "To: Palashbari Riverside Ward 2",
        "note": "Ref: DSP-2026-941 • Vehicle Heavy Truck AS-01-EC-4210"
      },
      {
        "time": "Today, 09:40 AM",
        "type": "DISPATCH",
        "item": "450 Food Packets, 30 Jackets, 2 Boats",
        "party": "To: Chaygaon Lowland Belt",
        "note": "Ref: DSP-2026-884 • Vehicle: AS-01-GC-4821 (Awaiting Ground Officer Receipt)"
      },
      {
        "time": "Today, 08:30 AM",
        "type": "STOCK IN",
        "item": "150 Essential Flood Medicine Kits",
        "party": "From: State SDMA Supply",
        "note": "Received at Central Relief Godown – Mirza (Bay 2)"
      },
      {
        "time": "Yesterday, 06:15 PM",
        "type": "RETURN",
        "item": "2 Inflatable Rescue Boats (Good)",
        "party": "From: Boko Relief Sector",
        "note": "Condition verified Good; restocked to Available"
      }
    ],
    "warehouses": [
      {
        "id": "WH-MIRZA",
        "name": "Central Relief Godown – Mirza",
        "manager": "Kamal Sarma (Depot Custodian)",
        "phone": "+91 94350-11204",
        "address": "NH-17 Logistics Corridor, Mirza, Kamrup",
        "coords": [
          26.082,
          91.531
        ],
        "bays": 4,
        "capacity": "12,000 m³"
      },
      {
        "id": "WH-RANGIA",
        "name": "North Sector Warehouse – Rangia",
        "manager": "Pranjal Deka (Sub-depot Officer)",
        "phone": "+91 98641-44589",
        "address": "Industrial Area, Rangia, Kamrup",
        "coords": [
          26.435,
          91.618
        ],
        "bays": 2,
        "capacity": "6,500 m³"
      }
    ]
  },
  "groundOfficer": {
    "areas": [
      {
        "id": "ASN-01",
        "village": "Palashbari Riverside Ward 2",
        "block": "Palashbari Circle",
        "severity": "Critical",
        "priority": "Urgent",
        "status": "Active Field Duty",
        "coords": "26.1320° N, 91.5150° E",
        "deadline": "Today, 02:00 PM",
        "task": "Verify DSP-2026-884 food & water delivery + submit afternoon flood depth report."
      },
      {
        "id": "ASN-02",
        "village": "Chaygaon Lowland Belt",
        "block": "Chaygaon Circle",
        "severity": "High",
        "priority": "High",
        "status": "Verification Pending",
        "coords": "26.0520° N, 91.2250° E",
        "deadline": "Today, 04:00 PM",
        "task": "Confirm receipt of 200 blankets & report stranded households in Ward 3."
      },
      {
        "id": "ASN-03",
        "village": "Goroimari Char Cluster",
        "block": "Goroimari Circle",
        "severity": "Moderate",
        "priority": "Normal",
        "status": "Monitoring",
        "coords": "26.0950° N, 91.3400° E",
        "deadline": "Today, 06:00 PM",
        "task": "Inspect embankment seepage & verify returned life jackets from morning shift."
      }
    ],
    "deliveries": [
      {
        "dispatchId": "DSP-2026-884",
        "destination": "Palashbari Riverside Ward 2",
        "resource": "Dry Ration Food Packets",
        "dispatched": 500,
        "received": null,
        "damaged": 0,
        "shortage": 0,
        "status": "Pending Verification",
        "remarks": "Awaiting physical count at Palashbari HS Relief Camp"
      },
      {
        "dispatchId": "DSP-2026-885",
        "destination": "Chaygaon Lowland Belt",
        "resource": "Thermal Relief Blankets",
        "dispatched": 200,
        "received": null,
        "damaged": 0,
        "shortage": 0,
        "status": "Pending Verification",
        "remarks": "Vehicle AS-01-GC-4821 arrived at Chaygaon checkpoint"
      },
      {
        "dispatchId": "DSP-2026-879",
        "destination": "Palashbari Riverside Ward 2",
        "resource": "1L Drinking Water Bottles",
        "dispatched": 1000,
        "received": 1000,
        "damaged": 0,
        "shortage": 0,
        "status": "Verified",
        "remarks": "All 1000 bottles received intact at camp store."
      }
    ],
    "fieldReports": [
      {
        "refId": "FR-2026-412",
        "village": "Palashbari Riverside Ward 2",
        "severity": "Critical",
        "water": "4.2 ft inundation",
        "affected": "320 Households",
        "stranded": 45,
        "road": "Blocked (Boat Only)",
        "needs": "Rescue boats, drinking water & ORS",
        "coords": "26.1320° N, 91.5150° E",
        "time": "Today, 10:15 AM",
        "reviewStatus": "Approved / Reviewed"
      },
      {
        "refId": "FR-2026-409",
        "village": "Chaygaon Lowland Belt",
        "severity": "High",
        "water": "2.8 ft waterlogging",
        "affected": "210 Households",
        "stranded": 18,
        "road": "Partially Accessible",
        "needs": "Dry rations & mosquito nets",
        "coords": "26.0520° N, 91.2250° E",
        "time": "Today, 08:50 AM",
        "reviewStatus": "Pending Review"
      }
    ],
    "operations": [
      {
        "opId": "OP-NDRF-11",
        "location": "Palashbari Riverside Ward 2",
        "agency": "NDRF 1st Bn (Independent Command)",
        "rescued": 142,
        "stranded": 45,
        "status": "In Progress",
        "notes": "2 motorized boats operating between Ward 2 and Palashbari HS Camp."
      },
      {
        "opId": "OP-SDRF-07",
        "location": "Chaygaon Lowland Belt",
        "agency": "SDRF District Unit (Independent Command)",
        "rescued": 68,
        "stranded": 18,
        "status": "In Progress",
        "notes": "Evacuating elderly residents from submerged approach road."
      }
    ],
    "returns": [
      {
        "retId": "RV-108",
        "item": "Inflatable Rescue Boats",
        "location": "Palashbari Riverside Ward 2",
        "good": 8,
        "damaged": 1,
        "missing": 1,
        "remarks": "1 boat pontoon damaged; 1 paddle set missing during night evacuation.",
        "time": "Yesterday, 06:30 PM"
      },
      {
        "retId": "RV-109",
        "item": "High-Buoyancy Life Jackets",
        "location": "Chaygaon Lowland Belt",
        "good": 95,
        "damaged": 5,
        "missing": 0,
        "remarks": "5 buckles broken; tagged for Godown repair bay.",
        "time": "Today, 07:45 AM"
      }
    ],
    "notifications": [
      {
        "title": "New Delivery Dispatched (DSP-2026-884)",
        "detail": "Godown Manager dispatched 500 Food Packets to Palashbari Ward 2. Verify physical receipt.",
        "priority": "Critical"
      },
      {
        "title": "Urgent Field Report Requested",
        "detail": "District Authority requested updated stranded population count for Chaygaon Ward 3.",
        "priority": "High"
      }
    ]
  },
  "monitoring": {
    "reconciliation": [
      {
        "allocId": "ALC-501",
        "dispatchId": "DSP-2026-884",
        "resource": "Dry Ration Food Packets",
        "destination": "Palashbari Ward 2",
        "approved": 500,
        "dispatched": 500,
        "received": 480,
        "status": "Shortage"
      },
      {
        "allocId": "ALC-502",
        "dispatchId": "DSP-2026-879",
        "resource": "20L Drinking Water Bottles",
        "destination": "Palashbari Ward 2",
        "approved": 1000,
        "dispatched": 1000,
        "received": 1000,
        "status": "Matched"
      },
      {
        "allocId": "ALC-503",
        "dispatchId": "DSP-2026-885",
        "resource": "High-Buoyancy Life Jackets",
        "destination": "Chaygaon Lowland",
        "approved": 200,
        "dispatched": 200,
        "received": 180,
        "status": "Shortage"
      },
      {
        "allocId": "ALC-504",
        "dispatchId": "DSP-2026-888",
        "resource": "Essential Flood Medicine Kits",
        "destination": "Goroimari Char",
        "approved": 80,
        "dispatched": 80,
        "received": 80,
        "status": "Matched"
      },
      {
        "allocId": "ALC-505",
        "dispatchId": "DSP-2026-882",
        "resource": "Inflatable Rescue Boats",
        "destination": "Palashbari Ward 2",
        "approved": 4,
        "dispatched": 4,
        "received": 4,
        "status": "Matched"
      }
    ],
    "discrepancies": [
      {
        "id": "DSC-01",
        "ref": "DSP-2026-884",
        "destination": "Palashbari Ward 2",
        "issue": "20 Food Packets missing between Godown dispatch (500) and Ground receipt (480). Transit boat seepage reported.",
        "targetRole": "ground",
        "status": "Clarification Requested"
      },
      {
        "id": "DSC-02",
        "ref": "DSP-2026-885",
        "destination": "Chaygaon Lowland",
        "issue": "20 Life Jackets short-delivered at Chaygaon relief camp intake checkpoint.",
        "targetRole": "godown",
        "status": "Open"
      }
    ],
    "returns": [
      {
        "resource": "Inflatable Rescue Boats",
        "dispatched": 10,
        "returnedGood": 8,
        "damaged": 1,
        "missing": 1,
        "syncStatus": "Verified & Restocked (8 Good)"
      },
      {
        "resource": "High-Buoyancy Life Jackets",
        "dispatched": 100,
        "returnedGood": 95,
        "damaged": 5,
        "missing": 0,
        "syncStatus": "Verified & Restocked (95 Good)"
      },
      {
        "resource": "Portable Water Purifiers",
        "dispatched": 15,
        "returnedGood": 15,
        "damaged": 0,
        "missing": 0,
        "syncStatus": "100% Returned Intact"
      }
    ],
    "operations": [
      {
        "opId": "OP-NDRF-11",
        "location": "Palashbari Ward 2",
        "officer": "R. K. Kalita (GO-KAM-04)",
        "status": "Active • 142 Rescued",
        "notes": "2 boat shuttles active; afternoon field report submitted."
      },
      {
        "opId": "OP-SDRF-07",
        "location": "Chaygaon Lowland",
        "officer": "R. K. Kalita (GO-KAM-04)",
        "status": "Active • 68 Rescued",
        "notes": "Evacuation ongoing; awaiting life jacket shortage clarification."
      },
      {
        "opId": "OP-MED-03",
        "location": "Goroimari Char",
        "officer": "Dr. B. Goswami (Health Unit)",
        "status": "Active • Camp Set Up",
        "notes": "Temporary mobile health camp operational on elevated school mound."
      }
    ],
    "logs": [
      {
        "user": "GO-KAM-04 (Ground Officer)",
        "action": "Submitted delivery receipt for DSP-2026-884 (480/500 Food Packets)",
        "time": "Today, 10:25 AM"
      },
      {
        "user": "GD-MIRZA-01 (Godown Manager)",
        "action": "Dispatched 200 Life Jackets via AS-01-GC-4821 (DSP-2026-885)",
        "time": "Today, 09:40 AM"
      },
      {
        "user": "DDMA-AUTH-01 (Authority)",
        "action": "Approved ALC-501 & ALC-502 for Palashbari Ward 2",
        "time": "Today, 08:50 AM"
      },
      {
        "user": "ADM-GIS-01 (Admin)",
        "action": "Marked Palashbari Ward 2 as Critical flood zone (18.2 m)",
        "time": "Today, 08:15 AM"
      }
    ],
    "escalations": [
      {
        "id": "ESC-12",
        "title": "Unresolved Food Packet Shortage (DSP-2026-884)",
        "detail": "Escalated to District Authority after 20-packet mismatch at Palashbari Ward 2.",
        "status": "Escalated to Authority"
      },
      {
        "id": "ESC-13",
        "title": "Transit Life Jacket Discrepancy (DSP-2026-885)",
        "detail": "Flagged 20-unit mismatch between Mirza central godown manifest and Chaygaon receipt.",
        "status": "Under Review"
      }
    ],
    "chats": {
      "ground": [
        {
          "sender": "outgoing",
          "text": "Hi GO-KAM-04, DSP-2026-884 shows 500 Food Packets dispatched but 480 received. Was 1 carton damaged in transit?",
          "time": "10:28 AM"
        },
        {
          "sender": "incoming",
          "text": "Officer GO-KAM-04: Yes, 1 carton (20 packets) got water-damaged on the ferry transfer. Photo evidence uploaded.",
          "time": "10:31 AM"
        }
      ],
      "godown": [
        {
          "sender": "outgoing",
          "text": "Godown Mirza, please confirm vehicle loading count for DSP-2026-885 (200 Life Jackets) to Chaygaon.",
          "time": "09:55 AM"
        },
        {
          "sender": "incoming",
          "text": "Godown Manager: Gate-pass shows 4 bales of 50 life jackets loaded. Checking driver manifest now.",
          "time": "10:02 AM"
        }
      ],
      "authority": [
        {
          "sender": "outgoing",
          "text": "DDMA Authority: Flagged 20-unit food shortage on DSP-2026-884 for audit review.",
          "time": "10:33 AM"
        },
        {
          "sender": "incoming",
          "text": "District Authority: Noted. Approving replacement buffer stock for Palashbari Ward 2.",
          "time": "10:36 AM"
        }
      ],
      "admin": [
        {
          "sender": "outgoing",
          "text": "Admin GIS Desk: Please verify if Goroimari Char road access is still blocked for DSP-2026-888.",
          "time": "10:12 AM"
        },
        {
          "sender": "incoming",
          "text": "Admin Portal: Approach road still submerged; boat transfer required at Goroimari ghat.",
          "time": "10:15 AM"
        }
      ]
    }
  },
  "riverTelemetry": [
    {
      "id": "brahmaputra",
      "name": "Brahmaputra (Kamrup)",
      "level": "18.2 m",
      "status": "Dangerous",
      "severity": "danger",
      "iconType": "waves",
      "arrow": "↑"
    },
    {
      "id": "kolong",
      "name": "Kolong (Kamrup)",
      "level": "14.6 m",
      "status": "Warning",
      "severity": "warning",
      "iconType": "bar",
      "barColor": "amber",
      "arrow": "↑"
    },
    {
      "id": "kakang",
      "name": "Kakang (Kamrup)",
      "level": "12.8 m",
      "status": "Normal",
      "severity": "normal",
      "iconType": "bar",
      "barColor": "green",
      "arrow": "→"
    }
  ],
  "liveNewsTicker": [
    "Kamrup: Water level of Brahmaputra crosses danger level",
    "Relief camp set up in Chaygaon",
    "NDRF deployed in Palashbari",
    "Heavy rainfall expected in next 24 hours"
  ],
  "districtStats": [
    {
      "id": "stat-rivers",
      "label": "Rivers Monitored",
      "value": "3",
      "icon": "fas fa-water",
      "theme": "blue"
    },
    {
      "id": "stat-alerts",
      "label": "Active Alerts",
      "value": "2",
      "icon": "fas fa-triangle-exclamation",
      "theme": "red"
    },
    {
      "id": "stat-affected",
      "label": "People Affected",
      "value": "12,430",
      "icon": "fas fa-users",
      "theme": "cyan"
    },
    {
      "id": "stat-camps",
      "label": "Relief Camps",
      "value": "18",
      "icon": "fas fa-campground",
      "theme": "orange"
    },
    {
      "id": "stat-rescue",
      "label": "Rescue Teams Deployed",
      "value": "6",
      "icon": "fas fa-ship",
      "theme": "indigo"
    },
    {
      "id": "stat-kits",
      "label": "Relief Kits Dispatched",
      "value": "1,250",
      "icon": "fas fa-box-open",
      "theme": "green"
    }
  ],
  "rawCollections": {
    "reliefcamps": [
      {
        "name": "Rampur Community Shelter Hall",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Rampur Block Gate",
        "lat": 26.108,
        "lng": 91.475,
        "capacity": 450,
        "currentOccupants": 310,
        "contactPerson": "T. Sarma, VDP Secretary",
        "contactNumber": "+91 94351 10003",
        "facilitiesAvailable": [
          "Safe Water Tanker",
          "Sanitary Kits",
          "Baby Food Supplies"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.102Z",
        "__v": 0
      },
      {
        "name": "Chaygaon College Relief Center",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Chaygaon College Campus",
        "lat": 26.065,
        "lng": 91.435,
        "capacity": 850,
        "currentOccupants": 620,
        "contactPerson": "K. Kalita, Coordinator",
        "contactNumber": "+91 94351 10002",
        "facilitiesAvailable": [
          "Solar Power Backup",
          "Water Purification Unit",
          "Doctor on Call",
          "Dry Ration Storage"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.101Z",
        "__v": 0
      },
      {
        "name": "Palashbari Higher Secondary School Relief Camp",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Palashbari Town",
        "lat": 26.126,
        "lng": 91.512,
        "capacity": 600,
        "currentOccupants": 480,
        "contactPerson": "M. Borah, Headmaster",
        "contactNumber": "+91 94351 10001",
        "facilitiesAvailable": [
          "Safe Drinking Water",
          "Community Kitchen",
          "Medical First Aid Post",
          "Sanitation Blocks",
          "Child Care"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.100Z",
        "__v": 0
      },
      {
        "name": "Hajo Multipurpose Cyclone & Flood Shelter",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Hajo Circular Road",
        "lat": 26.242,
        "lng": 91.53,
        "capacity": 700,
        "currentOccupants": 390,
        "contactPerson": "D. Choudhury",
        "contactNumber": "+91 94351 10004",
        "facilitiesAvailable": [
          "Raised Ground Floor",
          "Medical Post",
          "Drinking Water Cistern"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.103Z",
        "__v": 0
      },
      {
        "name": "Mirza Public High School Shelter",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Mirza Town Center",
        "lat": 26.101,
        "lng": 91.545,
        "capacity": 500,
        "currentOccupants": 260,
        "contactPerson": "A. Medhi",
        "contactNumber": "+91 94351 10005",
        "facilitiesAvailable": [
          "Kitchen Shed",
          "Medical Tent",
          "Rest Rooms"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.105Z",
        "__v": 0
      },
      {
        "name": "Goroimari Rural Relief Camp",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Goroimari Block HQ",
        "lat": 26.02,
        "lng": 91.31,
        "capacity": 550,
        "currentOccupants": 320,
        "contactPerson": "S. Ahmed",
        "contactNumber": "+91 94351 10006",
        "facilitiesAvailable": [
          "Chlorinated Water",
          "Tarpaulin Sheds"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.105Z",
        "__v": 0
      },
      {
        "name": "Boko Higher Secondary School Camp",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Boko Town",
        "lat": 25.98,
        "lng": 91.22,
        "capacity": 600,
        "currentOccupants": 290,
        "contactPerson": "N. Rabha",
        "contactNumber": "+91 94351 10007",
        "facilitiesAvailable": [
          "Mobile Health Unit",
          "Drinking Water Facility"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.106Z",
        "__v": 0
      },
      {
        "name": "Rangia Relief Camp 1 (Town Hall)",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Rangia Sub-division",
        "lat": 26.435,
        "lng": 91.62,
        "capacity": 650,
        "currentOccupants": 310,
        "contactPerson": "P. Deka",
        "contactNumber": "+91 94351 10008",
        "facilitiesAvailable": [
          "First Aid Post",
          "Cooked Meal Counter"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.107Z",
        "__v": 0
      },
      {
        "name": "Rangia High School Relief Camp 2",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Station Road Rangia",
        "lat": 26.442,
        "lng": 91.632,
        "capacity": 500,
        "currentOccupants": 220,
        "contactPerson": "B. Goswami",
        "contactNumber": "+91 94351 10009",
        "facilitiesAvailable": [
          "Emergency Lighting",
          "Purified Water"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.107Z",
        "__v": 0
      },
      {
        "name": "Sualkuchi Weavers Relief Center",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Sualkuchi Riverside",
        "lat": 26.175,
        "lng": 91.57,
        "capacity": 550,
        "currentOccupants": 280,
        "contactPerson": "R. Baishya",
        "contactNumber": "+91 94351 10010",
        "facilitiesAvailable": [
          "Dry Storage",
          "Mobile Medical Team"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.108Z",
        "__v": 0
      },
      {
        "name": "North Guwahati Government High School Shelter",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Amingaon-North Guwahati",
        "lat": 26.205,
        "lng": 91.71,
        "capacity": 500,
        "currentOccupants": 190,
        "contactPerson": "J. Das",
        "contactNumber": "+91 94351 10011",
        "facilitiesAvailable": [
          "Power Generator",
          "Clean Water"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.109Z",
        "__v": 0
      },
      {
        "name": "Boko BDO Office Relief Shelter",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Boko Complex",
        "lat": 25.985,
        "lng": 91.228,
        "capacity": 450,
        "currentOccupants": 180,
        "contactPerson": "M. Marak",
        "contactNumber": "+91 94351 10012",
        "facilitiesAvailable": [
          "Blanket & Mat Distribution",
          "Kitchen"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.110Z",
        "__v": 0
      },
      {
        "name": "Palashbari Municipal Community Center",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Ward 4 Palashbari",
        "lat": 26.13,
        "lng": 91.515,
        "capacity": 450,
        "currentOccupants": 230,
        "contactPerson": "H. Talukdar",
        "contactNumber": "+91 94351 10014",
        "facilitiesAvailable": [
          "Cooked Food",
          "Medical Inspection"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.112Z",
        "__v": 0
      },
      {
        "name": "Chaygaon Girls High School Center",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Chaygaon Bazaar",
        "lat": 26.068,
        "lng": 91.439,
        "capacity": 400,
        "currentOccupants": 210,
        "contactPerson": "R. Begum",
        "contactNumber": "+91 94351 10013",
        "facilitiesAvailable": [
          "Sanitary Supplies",
          "Female Health Attendant"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.111Z",
        "__v": 0
      },
      {
        "name": "Kukurmara Flood Relief Center",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Kukurmara Riverfront",
        "lat": 26.082,
        "lng": 91.41,
        "capacity": 350,
        "currentOccupants": 175,
        "contactPerson": "S. Boro",
        "contactNumber": "+91 94351 10015",
        "facilitiesAvailable": [
          "Drinking Water Pouches",
          "Solar Lamp"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.114Z",
        "__v": 0
      },
      {
        "name": "Amingaon Relief & Staging Camp",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Amingaon Ground",
        "lat": 26.195,
        "lng": 91.685,
        "capacity": 550,
        "currentOccupants": 215,
        "contactPerson": "A. Saikia",
        "contactNumber": "+91 94351 10018",
        "facilitiesAvailable": [
          "Central Transport Hub",
          "24x7 Ambulance Bay"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.118Z",
        "__v": 0
      },
      {
        "name": "Maniari Tiniali Relief Point",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Palashbari Link Rd",
        "lat": 26.115,
        "lng": 91.52,
        "capacity": 350,
        "currentOccupants": 150,
        "contactPerson": "U. Nath",
        "contactNumber": "+91 94351 10016",
        "facilitiesAvailable": [
          "First Aid Kit",
          "Water Jerrycans"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.115Z",
        "__v": 0
      },
      {
        "name": "Kamalpur Block Relief Shelter",
        "district": "Kamrup",
        "subDivision": "Palashbari",
        "location": "Kamalpur Chowk",
        "lat": 26.34,
        "lng": 91.68,
        "capacity": 400,
        "currentOccupants": 160,
        "contactPerson": "T. Lahkar",
        "contactNumber": "+91 94351 10017",
        "facilitiesAvailable": [
          "Shelter Tents",
          "Dry Ration Packets"
        ],
        "status": "Operational",
        "updatedAt": "2026-11-18T19:54:17.117Z",
        "__v": 0
      }
    ],
    "dispatchrecords": [
      {
        "dispatchNumber": "DSP-KMP-2024-001",
        "allocationId": "6afe026987e9f161e08e9354",
        "allocationNumber": "ALC-KMP-2024-001",
        "targetLocation": "Palashbari Lowland Sector",
        "dispatchedItems": [
          {
            "itemId": "6afe026987e9f161e08e9342",
            "itemName": "Inflatable Rescue Boat (IRB) with 40HP OBM",
            "category": "Rescue Boats",
            "quantityDispatched": 4,
            "unit": "Units"
          },
          {
            "itemId": "6afe026987e9f161e08e9343",
            "itemName": "SOLAS Approved Adult Life Jackets (150N)",
            "category": "Life Jackets",
            "quantityDispatched": 60,
            "unit": "Units"
          },
          {
            "itemId": "6afe026987e9f161e08e9344",
            "itemName": "Emergency Dry Food Ration Kits (Family 3-Day Pack)",
            "category": "Food Packets",
            "quantityDispatched": 500,
            "unit": "Packets"
          },
          {
            "itemId": "6afe026987e9f161e08e9345",
            "itemName": "Packaged Drinking Water (20 Litre Sealed Cans)",
            "category": "Drinking Water",
            "quantityDispatched": 300,
            "unit": "Units"
          }
        ],
        "vehicleNumber": "AS-01-EC-4412 (Govt Truck)",
        "driverName": "Ramen Das",
        "driverContact": "+91 98640 55412",
        "dispatchedBy": "Pranjal Saikia (Godown Manager)",
        "godownSource": "Central Relief Godown, Amingaon",
        "dispatchDate": "2026-11-18T17:54:17.250Z",
        "status": "Delivered & Verified",
        "remarks": "Dispatched with police escort up to Palashbari bridge.",
        "__v": 0
      },
      {
        "dispatchNumber": "DSP-KMP-2026-002",
        "allocationId": "6afe057787e9f161e08e93a3",
        "allocationNumber": "ALC-KMP-2026-002",
        "targetLocation": "Chaygaon Riverine Belt",
        "dispatchedItems": [
          {
            "itemId": "6afe026987e9f161e08e9342",
            "itemName": "Inflatable Rescue Boat (IRB) with 40HP OBM",
            "category": "Rescue Boats",
            "quantityDispatched": 3,
            "unit": "Units"
          }
        ],
        "vehicleNumber": "AS-01-GC-9901",
        "driverName": "Dipankar Medhi",
        "driverContact": "+91 94350 77881",
        "dispatchedBy": "System Quality Tester",
        "godownSource": "NEERAKSHAK Technical Operations & Evaluation Unit",
        "dispatchDate": "2026-11-18T20:07:19.146Z",
        "status": "Discrepancy Reported",
        "remarks": "Priority river convoy with SDRF escorts",
        "__v": 0
      }
    ],
    "deliveryverifications": [
      {
        "verificationNumber": "DVR-KMP-2024-001",
        "dispatchId": "6afe026987e9f161e08e9356",
        "dispatchNumber": "DSP-KMP-2024-001",
        "allocationNumber": "ALC-KMP-2024-001",
        "targetLocation": "Palashbari Lowland Sector",
        "verifiedBy": "Bhaskar Jyoti Das (Ground Officer)",
        "verifierDesignation": "Circle Field Disaster Officer",
        "itemsVerified": [
          {
            "itemName": "Inflatable Rescue Boat (IRB) with 40HP OBM",
            "category": "Rescue Boats",
            "quantityDispatched": 4,
            "quantityReceived": 4,
            "quantityShortage": 0,
            "condition": "Good",
            "remarks": "All 4 IRBs and motors tested operational"
          },
          {
            "itemName": "SOLAS Approved Adult Life Jackets (150N)",
            "category": "Life Jackets",
            "quantityDispatched": 60,
            "quantityReceived": 60,
            "quantityShortage": 0,
            "condition": "Good",
            "remarks": "60 life jackets distributed to volunteer teams"
          },
          {
            "itemName": "Emergency Dry Food Ration Kits (Family 3-Day Pack)",
            "category": "Food Packets",
            "quantityDispatched": 500,
            "quantityReceived": 490,
            "quantityShortage": 10,
            "condition": "Damaged",
            "remarks": "10 cartons suffered transit water damage. 490 intact packets handed to camp in-charge"
          },
          {
            "itemName": "Packaged Drinking Water (20 Litre Sealed Cans)",
            "category": "Drinking Water",
            "quantityDispatched": 300,
            "quantityReceived": 300,
            "quantityShortage": 0,
            "condition": "Good",
            "remarks": "Seal unbroken, stock stored at school hall"
          }
        ],
        "hasShortage": true,
        "hasDamage": true,
        "shortageSummary": "Shortage of 10 food packets due to rain water seepage on truck tarpaulin during transit.",
        "fieldSituationNotes": "Ground water level is steady at 2.4 ft. 4 rescue boats actively ferrying families from stranded ward to relief camp.",
        "verificationTimestamp": "2026-11-18T18:54:17.260Z",
        "status": "Shortage / Discrepancy Flagged",
        "__v": 0
      },
      {
        "verificationNumber": "DVR-KMP-2026-002",
        "dispatchId": "6afe057787e9f161e08e93ab",
        "dispatchNumber": "DSP-KMP-2026-002",
        "allocationNumber": "ALC-KMP-2026-002",
        "targetLocation": "Chaygaon Riverine Belt",
        "verifiedBy": "System Quality Tester",
        "verifierDesignation": "Platform Verification & End-to-End QA Evaluator",
        "itemsVerified": [
          {
            "itemName": "Inflatable Rescue Boat (IRB) with 40HP OBM",
            "category": "Rescue Boats",
            "quantityDispatched": 3,
            "quantityReceived": 2,
            "quantityShortage": 1,
            "condition": "Good",
            "remarks": "2 boats delivered safely. 1 boat held up at ferry ghat due to current."
          }
        ],
        "hasShortage": true,
        "hasDamage": false,
        "shortageSummary": "Inflatable Rescue Boat (IRB) with 40HP OBM: 1 shortage",
        "fieldSituationNotes": "2 rescue boats actively deployed in Chaygaon lowlands.",
        "status": "Shortage / Discrepancy Flagged",
        "verificationTimestamp": "2026-11-18T20:07:19.288Z",
        "__v": 0
      }
    ],
    "rivers": [
      {
        "name": "Kolong",
        "station": "Kamrup East Station",
        "district": "Kamrup",
        "currentLevel": 14.6,
        "dangerLevel": 15,
        "warningLevel": 14,
        "trend": "rising",
        "status": "Warning",
        "lat": 26.142,
        "lng": 91.89,
        "lastUpdated": "2026-11-18T19:54:17.052Z",
        "__v": 0
      },
      {
        "name": "Kakang",
        "station": "Kamrup Rural Basin",
        "district": "Kamrup",
        "currentLevel": 12.8,
        "dangerLevel": 14,
        "warningLevel": 13,
        "trend": "steady",
        "status": "Normal",
        "lat": 26.085,
        "lng": 91.56,
        "lastUpdated": "2026-11-18T19:54:17.052Z",
        "__v": 0
      },
      {
        "name": "Brahmaputra",
        "station": "Guwahati / Kamrup Gauge",
        "district": "Kamrup",
        "currentLevel": 18.2,
        "dangerLevel": 17.5,
        "warningLevel": 16.8,
        "trend": "rising",
        "status": "Dangerous",
        "lat": 26.185,
        "lng": 91.745,
        "lastUpdated": "2026-11-18T19:54:17.051Z",
        "__v": 0
      }
    ],
    "emergencyfacilities": [
      {
        "type": "Hospital",
        "name": "Gauhati Medical College & Hospital (GMCH)",
        "district": "Kamrup",
        "address": "Narakasur Hilltop, Bhangagarh, Guwahati",
        "lat": 26.155,
        "lng": 91.77,
        "contactNumber": "0361-2529457",
        "capacityOrStrength": "1500 Beds (24x7 Flood Trauma Emergency)",
        "availableServices": [
          "ICU",
          "Trauma Surgery",
          "Blood Bank",
          "Epidemic Response Unit"
        ],
        "__v": 0
      },
      {
        "type": "NDRF Base",
        "name": "1st Battalion NDRF Station HQ",
        "district": "Kamrup",
        "address": "Patgaon, Azara, Guwahati",
        "lat": 26.118,
        "lng": 91.615,
        "contactNumber": "0361-2849005",
        "capacityOrStrength": "18 Specialized Flood Rescue Teams",
        "availableServices": [
          "Deep Water Rescue",
          "Inflatable Motor Boats",
          "Paramedic Extraction"
        ],
        "__v": 0
      },
      {
        "type": "Police Station",
        "name": "Palashbari Police Station",
        "district": "Kamrup",
        "address": "NH-17, Palashbari Town",
        "lat": 26.127,
        "lng": 91.51,
        "contactNumber": "0361-2840233",
        "capacityOrStrength": "Active Wireless Dispatch Desk",
        "availableServices": [
          "Patrol Boats Coordination",
          "Traffic Diversions",
          "Evacuation Escort"
        ],
        "__v": 0
      },
      {
        "type": "Hospital",
        "name": "Palashbari Sub-Divisional Civil Hospital",
        "district": "Kamrup",
        "address": "Mirza-Palashbari Road",
        "lat": 26.11,
        "lng": 91.53,
        "contactNumber": "0361-2840222",
        "capacityOrStrength": "100 Beds (Anti-Venom & Waterborne Disease Clinic)",
        "availableServices": [
          "Emergency Ward",
          "Mobile Ambulance",
          "ORS & Water Testing"
        ],
        "__v": 0
      },
      {
        "type": "SDRF Unit",
        "name": "Assam SDRF Regional Quick Reaction Base",
        "district": "Kamrup",
        "address": "Fire Service Headquarters, Panbazar",
        "lat": 26.188,
        "lng": 91.748,
        "contactNumber": "101 / 0361-2540222",
        "capacityOrStrength": "6 Quick Deployment Flood Columns",
        "availableServices": [
          "Life Saving Inflatables",
          "Underwater Divers",
          "Tree Clearing Saws"
        ],
        "__v": 0
      }
    ],
    "inventoryitems": [
      {
        "itemName": "SOLAS Approved Adult Life Jackets (150N)",
        "category": "Life Jackets",
        "unit": "Units",
        "totalStock": 450,
        "availableStock": 290,
        "allocatedStock": 100,
        "dispatchedStock": 60,
        "godownLocation": "Bay B2, Amingaon Central Godown",
        "thresholdAlert": 50,
        "lastUpdated": "2026-11-18T19:54:17.204Z",
        "__v": 0
      },
      {
        "itemName": "Inflatable Rescue Boat (IRB) with 40HP OBM",
        "category": "Rescue Boats",
        "unit": "Units",
        "totalStock": 25,
        "availableStock": 12,
        "allocatedStock": 6,
        "dispatchedStock": 7,
        "godownLocation": "Bay A1, Amingaon Central Godown",
        "thresholdAlert": 5,
        "lastUpdated": "2026-11-18T19:54:17.203Z",
        "__v": 0
      },
      {
        "itemName": "Emergency Dry Food Ration Kits (Family 3-Day Pack)",
        "category": "Food Packets",
        "unit": "Packets",
        "totalStock": 5000,
        "availableStock": 3250,
        "allocatedStock": 1000,
        "dispatchedStock": 750,
        "godownLocation": "Bay C1 (Dry Storage), Amingaon Godown",
        "thresholdAlert": 500,
        "lastUpdated": "2026-11-18T19:54:17.204Z",
        "__v": 0
      },
      {
        "itemName": "Emergency Flood Trauma & Medical Relief Kit",
        "category": "Medicines & First Aid",
        "unit": "Kits",
        "totalStock": 150,
        "availableStock": 95,
        "allocatedStock": 35,
        "dispatchedStock": 20,
        "godownLocation": "Pharmacy Vault, Amingaon Godown",
        "thresholdAlert": 20,
        "lastUpdated": "2026-11-18T19:54:17.205Z",
        "__v": 0
      },
      {
        "itemName": "Packaged Drinking Water (20 Litre Sealed Cans)",
        "category": "Drinking Water",
        "unit": "Units",
        "totalStock": 3000,
        "availableStock": 1800,
        "allocatedStock": 700,
        "dispatchedStock": 500,
        "godownLocation": "Bay C3, Amingaon Godown",
        "thresholdAlert": 300,
        "lastUpdated": "2026-11-18T19:54:17.205Z",
        "__v": 0
      },
      {
        "itemName": "Diesel High-Discharge Dewatering Mud Pump (5 HP)",
        "category": "Dewatering Pumps",
        "unit": "Units",
        "totalStock": 30,
        "availableStock": 18,
        "allocatedStock": 7,
        "dispatchedStock": 5,
        "godownLocation": "Heavy Equipment Yard, Amingaon",
        "thresholdAlert": 6,
        "lastUpdated": "2026-11-18T19:54:17.206Z",
        "__v": 0
      },
      {
        "itemName": "High-Power Rechargeable LED Searchlights (1000m Beam)",
        "category": "Emergency Lighting",
        "unit": "Units",
        "totalStock": 120,
        "availableStock": 80,
        "allocatedStock": 25,
        "dispatchedStock": 15,
        "godownLocation": "Electrical Tool Crib, Amingaon Godown",
        "thresholdAlert": 15,
        "lastUpdated": "2026-11-18T19:54:17.207Z",
        "__v": 0
      },
      {
        "itemName": "Heavy Duty Waterproof Tarpaulins (24ft x 18ft)",
        "category": "Tents & Tarpaulins",
        "unit": "Units",
        "totalStock": 600,
        "availableStock": 420,
        "allocatedStock": 120,
        "dispatchedStock": 60,
        "godownLocation": "Bay D1, Amingaon Godown",
        "thresholdAlert": 50,
        "lastUpdated": "2026-11-18T19:54:17.207Z",
        "__v": 0
      }
    ],
    "newsupdates": [
      {
        "title": "NDRF team deployed for rescue operations in Chaygaon",
        "tag": "Rescue",
        "summary": "1st Battalion NDRF flood rescue columns deployed with inflatable motorized boats to assist district administration.",
        "imageUrl": "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=600&q=80",
        "isTicker": true,
        "createdAt": "2026-11-18T19:54:17.288Z",
        "__v": 0
      },
      {
        "title": "Water level in Brahmaputra crosses danger mark in Kamrup",
        "tag": "River Update",
        "summary": "Central Water Commission gauge records 18.2 meters against warning mark of 16.8 meters. High alert in low-lying riverside areas.",
        "imageUrl": "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
        "isTicker": true,
        "createdAt": "2026-11-18T19:54:17.288Z",
        "__v": 0
      },
      {
        "title": "Heavy rainfall expected in next 24 hours across Kamrup district",
        "tag": "Weather",
        "summary": "IMD regional advisory alerts of intense convective showers. Citizens advised to remain vigilant near river tributaries.",
        "imageUrl": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=600&q=80",
        "isTicker": true,
        "createdAt": "2026-11-18T19:54:17.289Z",
        "__v": 0
      },
      {
        "title": "Relief camp operational in Palashbari, capacity: 500 persons",
        "tag": "Relief",
        "summary": "Designated shelter equipped with clean drinking water, community kitchen, baby food, and 24x7 medical assistance.",
        "imageUrl": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=80",
        "isTicker": true,
        "createdAt": "2026-11-18T19:54:17.289Z",
        "__v": 0
      }
    ],
    "resourceallocations": [
      {
        "allocationNumber": "ALC-KMP-2024-001",
        "requestId": "6afe026987e9f161e08e9352",
        "district": "Kamrup",
        "targetLocation": "Palashbari Lowland Sector",
        "allocatedItems": [
          {
            "itemId": "6afe026987e9f161e08e9342",
            "itemName": "Inflatable Rescue Boat (IRB) with 40HP OBM",
            "category": "Rescue Boats",
            "quantity": 4,
            "unit": "Units"
          },
          {
            "itemId": "6afe026987e9f161e08e9343",
            "itemName": "SOLAS Approved Adult Life Jackets (150N)",
            "category": "Life Jackets",
            "quantity": 60,
            "unit": "Units"
          },
          {
            "itemId": "6afe026987e9f161e08e9344",
            "itemName": "Emergency Dry Food Ration Kits (Family 3-Day Pack)",
            "category": "Food Packets",
            "quantity": 500,
            "unit": "Packets"
          },
          {
            "itemId": "6afe026987e9f161e08e9345",
            "itemName": "Packaged Drinking Water (20 Litre Sealed Cans)",
            "category": "Drinking Water",
            "quantity": 300,
            "unit": "Units"
          }
        ],
        "priority": "Critical",
        "authorityOfficer": "Dr. Smita Kakati, IAS",
        "status": "Dispatched",
        "notes": "Priority convoy. Deliver directly to Palashbari Circle Ground Staging Point.",
        "createdAt": "2026-11-18T17:24:17.241Z",
        "__v": 0
      },
      {
        "allocationNumber": "ALC-KMP-2026-002",
        "requestId": "6afe057687e9f161e08e939a",
        "district": "Kamrup",
        "targetLocation": "Chaygaon Riverine Belt",
        "allocatedItems": [
          {
            "itemId": "6afe026987e9f161e08e9342",
            "itemName": "Inflatable Rescue Boat (IRB) with 40HP OBM",
            "category": "Rescue Boats",
            "quantity": 3,
            "unit": "Units"
          }
        ],
        "priority": "Critical",
        "authorityOfficer": "System Quality Tester",
        "status": "Dispatched",
        "notes": "Sanctioned against REQ-KMP-2026-002. Sanctioned for immediate deployment.",
        "createdAt": "2026-11-18T20:07:19.096Z",
        "__v": 0
      }
    ],
    "auditlogs": [
      {
        "actionType": "NDRF_COORDINATION_LOG",
        "module": "Authority Coordination",
        "performedBy": "Dr. Smita Kakati, IAS",
        "userRole": "authority",
        "description": "Logged official coordination update from 1st Bn NDRF: 385 citizens safely evacuated in Sector B.",
        "details": {
          "recordNumber": "COR-KMP-2024-001",
          "agency": "NDRF",
          "evacuated": 385
        },
        "timestamp": "2026-11-18T19:00:17.297Z",
        "__v": 0
      },
      {
        "actionType": "CREATE_ALERT",
        "module": "Admin Monitoring",
        "performedBy": "Er. Ranjit Baruah",
        "userRole": "admin",
        "description": "Published Critical Flood Alert: Brahmaputra crossed danger level at Kamrup gauge (18.2m).",
        "details": {
          "gauge": "Guwahati / Kamrup",
          "level": 18.2,
          "status": "Dangerous"
        },
        "timestamp": "2026-11-18T15:54:17.297Z",
        "__v": 0
      },
      {
        "actionType": "VERIFY_DELIVERY",
        "module": "Ground Verification",
        "performedBy": "Bhaskar Jyoti Das",
        "userRole": "ground",
        "description": "Completed Physical Delivery Verification for DSP-KMP-2024-001. Flagged 10 food packets water-damaged in transit.",
        "details": {
          "verificationNumber": "DVR-KMP-2024-001",
          "shortage": 10,
          "condition": "Damaged"
        },
        "timestamp": "2026-11-18T18:54:17.297Z",
        "__v": 0
      },
      {
        "actionType": "DISPATCH_RESOURCE",
        "module": "Godown Dispatch",
        "performedBy": "Pranjal Saikia",
        "userRole": "godown",
        "description": "Dispatched Consignment DSP-KMP-2024-001 via Govt Truck AS-01-EC-4412 to Palashbari.",
        "details": {
          "dispatchNumber": "DSP-KMP-2024-001",
          "vehicle": "AS-01-EC-4412"
        },
        "timestamp": "2026-11-18T17:54:17.297Z",
        "__v": 0
      },
      {
        "actionType": "APPROVE_RESOURCE",
        "module": "Authority Decisions",
        "performedBy": "Dr. Smita Kakati, IAS",
        "userRole": "authority",
        "description": "Approved Resource Request REQ-KMP-2024-001 for Palashbari Sector (4 Boats, 60 Life Jackets, 500 Food Packets, 300 Water Cans).",
        "details": {
          "requestNumber": "REQ-KMP-2024-001",
          "priority": "Critical"
        },
        "timestamp": "2026-11-18T16:54:17.297Z",
        "__v": 0
      },
      {
        "actionType": "REQUEST_RESOURCE",
        "module": "Ground Field Requisition",
        "performedBy": "System Quality Tester",
        "userRole": "tester",
        "description": "Raised Field Resource Request REQ-KMP-2026-002 for Chaygaon Riverine Belt (Urgency: Critical).",
        "details": {
          "requestNumber": "REQ-KMP-2026-002",
          "targetLocation": "Chaygaon Riverine Belt",
          "itemCount": 1
        },
        "timestamp": "2026-11-18T20:07:19.000Z",
        "__v": 0
      },
      {
        "actionType": "APPROVE_RESOURCE",
        "module": "Authority Decision Support",
        "performedBy": "System Quality Tester",
        "userRole": "tester",
        "description": "APPROVED Resource Request REQ-KMP-2026-002 for Chaygaon Riverine Belt. Remarks: \"Sanctioned for immediate deployment.\".",
        "details": {
          "requestId": "6afe057687e9f161e08e939a",
          "action": "Approved",
          "allocationNumber": "ALC-KMP-2026-002"
        },
        "timestamp": "2026-11-18T20:07:19.102Z",
        "__v": 0
      },
      {
        "actionType": "DISPATCH_RESOURCE",
        "module": "Godown Dispatch Management",
        "performedBy": "System Quality Tester",
        "userRole": "tester",
        "description": "Dispatched Consignment DSP-KMP-2026-002 (Alloc: ALC-KMP-2026-002) to Chaygaon Riverine Belt via AS-01-GC-9901 (Driver: Dipankar Medhi).",
        "details": {
          "dispatchNumber": "DSP-KMP-2026-002",
          "allocationNumber": "ALC-KMP-2026-002",
          "vehicleNumber": "AS-01-GC-9901"
        },
        "timestamp": "2026-11-18T20:07:19.162Z",
        "__v": 0
      },
      {
        "actionType": "FLAG_DISCREPANCY",
        "module": "Ground Field Verification",
        "performedBy": "System Quality Tester",
        "userRole": "tester",
        "description": "Ground Verification DVR-KMP-2026-002 submitted for DSP-KMP-2026-002. Discrepancy: FLAGGED.",
        "details": {
          "verificationNumber": "DVR-KMP-2026-002",
          "dispatchNumber": "DSP-KMP-2026-002",
          "isDiscrepant": true,
          "shortageSummary": [
            "Inflatable Rescue Boat (IRB) with 40HP OBM: 1 shortage"
          ]
        },
        "timestamp": "2026-11-18T20:07:19.298Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "System Quality Tester",
        "userRole": "tester",
        "description": "User System Quality Tester logged into TESTER portal.",
        "details": {
          "email": "tester@neeraksh.gov.in",
          "designation": "Platform Verification & End-to-End QA Evaluator"
        },
        "timestamp": "2026-11-18T20:26:24.947Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Er. Ranjit Baruah",
        "userRole": "admin",
        "description": "User Er. Ranjit Baruah logged into ADMIN portal.",
        "details": {
          "email": "admin@neeraksh.gov.in",
          "designation": "GIS Flood Intelligence Admin"
        },
        "timestamp": "2026-11-18T20:27:23.904Z",
        "__v": 0
      },
      {
        "actionType": "UPDATE_AFFECTED_AREA",
        "module": "Admin Flood Data Management",
        "performedBy": "Er. Ranjit Baruah",
        "userRole": "admin",
        "description": "Updated status for Hajo Lowland Farming Ward: Status=Improving, Severity=Moderate.",
        "details": {
          "areaId": "6afe026987e9f161e08e930b",
          "status": "Improving",
          "severity": "Moderate"
        },
        "timestamp": "2026-11-18T20:27:30.000Z",
        "__v": 0
      },
      {
        "actionType": "UPDATE_AFFECTED_AREA",
        "module": "Admin Flood Data Management",
        "performedBy": "Er. Ranjit Baruah",
        "userRole": "admin",
        "description": "Updated status for Hajo Lowland Farming Ward: Status=Active, Severity=Moderate.",
        "details": {
          "areaId": "6afe026987e9f161e08e930b",
          "status": "Active",
          "severity": "Moderate"
        },
        "timestamp": "2026-11-18T20:27:30.918Z",
        "__v": 0
      },
      {
        "actionType": "UPDATE_AFFECTED_AREA",
        "module": "Admin Flood Data Management",
        "performedBy": "Er. Ranjit Baruah",
        "userRole": "admin",
        "description": "Updated status for Hajo Lowland Farming Ward: Status=Improving, Severity=Moderate.",
        "details": {
          "areaId": "6afe026987e9f161e08e930b",
          "status": "Improving",
          "severity": "Moderate"
        },
        "timestamp": "2026-11-18T20:27:31.872Z",
        "__v": 0
      },
      {
        "actionType": "UPDATE_AFFECTED_AREA",
        "module": "Admin Flood Data Management",
        "performedBy": "Er. Ranjit Baruah",
        "userRole": "admin",
        "description": "Updated status for Hajo Lowland Farming Ward: Status=Active, Severity=Moderate.",
        "details": {
          "areaId": "6afe026987e9f161e08e930b",
          "status": "Active",
          "severity": "Moderate"
        },
        "timestamp": "2026-11-18T20:27:33.651Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Dr. Smita Kakati, IAS",
        "userRole": "authority",
        "description": "User Dr. Smita Kakati, IAS logged into AUTHORITY portal.",
        "details": {
          "email": "authority@neeraksh.gov.in",
          "designation": "Additional District Magistrate & DDMA In-Charge"
        },
        "timestamp": "2026-11-18T20:28:43.762Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Bhaskar Jyoti Das",
        "userRole": "ground",
        "description": "User Bhaskar Jyoti Das logged into GROUND portal.",
        "details": {
          "email": "ground@neeraksh.gov.in",
          "designation": "Circle Field Disaster Officer"
        },
        "timestamp": "2026-11-18T20:29:39.771Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Dr. Smita Kakati, IAS",
        "userRole": "authority",
        "description": "User Dr. Smita Kakati, IAS logged into AUTHORITY portal.",
        "details": {
          "email": "authority@neeraksh.gov.in",
          "designation": "Additional District Magistrate & DDMA In-Charge"
        },
        "timestamp": "2026-11-18T20:37:36.577Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Dr. Smita Kakati, IAS",
        "userRole": "authority",
        "description": "User Dr. Smita Kakati, IAS logged into AUTHORITY portal.",
        "details": {
          "email": "authority@neeraksh.gov.in",
          "designation": "Additional District Magistrate & DDMA In-Charge"
        },
        "timestamp": "2026-11-18T20:42:59.952Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Er. Ranjit Baruah",
        "userRole": "admin",
        "description": "User Er. Ranjit Baruah logged into ADMIN portal.",
        "details": {
          "email": "admin@neeraksh.gov.in",
          "designation": "GIS Flood Intelligence Admin"
        },
        "timestamp": "2026-11-18T20:43:06.531Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Pranjal Saikia",
        "userRole": "godown",
        "description": "User Pranjal Saikia logged into GODOWN portal.",
        "details": {
          "email": "godown@neeraksh.gov.in",
          "designation": "Central Relief Godown Superintendent"
        },
        "timestamp": "2026-11-18T20:43:06.612Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Bhaskar Jyoti Das",
        "userRole": "ground",
        "description": "User Bhaskar Jyoti Das logged into GROUND portal.",
        "details": {
          "email": "ground@neeraksh.gov.in",
          "designation": "Circle Field Disaster Officer"
        },
        "timestamp": "2026-11-18T20:43:06.683Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Nabanita Hazarika",
        "userRole": "monitoring",
        "description": "User Nabanita Hazarika logged into MONITORING portal.",
        "details": {
          "email": "monitoring@neeraksh.gov.in",
          "designation": "District Audit & Compliance Inspector"
        },
        "timestamp": "2026-11-18T20:43:06.758Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Dr. Smita Kakati, IAS",
        "userRole": "authority",
        "description": "User Dr. Smita Kakati, IAS logged into AUTHORITY portal.",
        "details": {
          "email": "authority@neeraksh.gov.in",
          "designation": "Additional District Magistrate & DDMA In-Charge"
        },
        "timestamp": "2026-11-18T20:51:13.684Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Pranjal Saikia",
        "userRole": "godown",
        "description": "User Pranjal Saikia logged into GODOWN portal.",
        "details": {
          "email": "godown@neeraksh.gov.in",
          "designation": "Central Relief Godown Superintendent"
        },
        "timestamp": "2026-11-18T20:51:13.795Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Bhaskar Jyoti Das",
        "userRole": "ground",
        "description": "User Bhaskar Jyoti Das logged into GROUND portal.",
        "details": {
          "email": "ground@neeraksh.gov.in",
          "designation": "Circle Field Disaster Officer"
        },
        "timestamp": "2026-11-18T20:51:13.887Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Nabanita Hazarika",
        "userRole": "monitoring",
        "description": "User Nabanita Hazarika logged into MONITORING portal.",
        "details": {
          "email": "monitoring@neeraksh.gov.in",
          "designation": "District Audit & Compliance Inspector"
        },
        "timestamp": "2026-11-18T20:51:13.974Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Er. Ranjit Baruah",
        "userRole": "admin",
        "description": "User Er. Ranjit Baruah logged into ADMIN portal.",
        "details": {
          "email": "admin@neeraksh.gov.in",
          "designation": "GIS Flood Intelligence Admin"
        },
        "timestamp": "2026-11-18T20:56:20.885Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "System Quality Tester",
        "userRole": "tester",
        "description": "User System Quality Tester logged into TESTER portal.",
        "details": {
          "email": "tester@neeraksh.gov.in",
          "designation": "Platform Verification & End-to-End QA Evaluator"
        },
        "timestamp": "2026-11-18T20:57:02.159Z",
        "__v": 0
      },
      {
        "actionType": "USER_LOGIN",
        "module": "Authentication",
        "performedBy": "Er. Ranjit Baruah",
        "userRole": "admin",
        "description": "User Er. Ranjit Baruah logged into ADMIN portal.",
        "details": {
          "email": "admin@neeraksh.gov.in",
          "designation": "GIS Flood Intelligence Admin"
        },
        "timestamp": "2026-11-18T21:03:03.728Z",
        "__v": 0
      }
    ],
    "coordinationrecords": [
      {
        "recordNumber": "COR-KMP-2024-001",
        "agency": "NDRF",
        "unitDesignation": "1st Battalion NDRF, Patgaon Unit",
        "contactOfficer": "Assistant Commandant S. K. Nair",
        "contactPhone": "+91 94359 88123",
        "officialChannel": "District Emergency Operation Center (DEOC) Hotline",
        "operationLocation": "Palashbari & Chaygaon Lowlands",
        "assistanceRequested": "Deployment of specialized swift-water flood rescue columns and mechanized OBM boats for deep-cut water evacuation.",
        "teamStrength": "3 Rescue Teams (45 Personnel, 6 Deep-V Boats)",
        "operationalStatus": "On-Site Rescuing",
        "evacuatedCitizensCount": 385,
        "latestCoordinationBrief": "NDRF teams commenced deep water evacuation at 07:30 AM. 385 citizens safely shifted to Palashbari Higher Secondary School relief camp. Operations ongoing in Sector B.",
        "recordedByAuthority": "Dr. Smita Kakati, IAS (Authority)",
        "updatedAt": "2026-11-18T18:24:17.269Z",
        "__v": 0
      },
      {
        "recordNumber": "COR-KMP-2024-002",
        "agency": "SDRF",
        "unitDesignation": "Assam SDRF River Column 2",
        "contactOfficer": "Inspector B. Kalita",
        "contactPhone": "+91 94359 88456",
        "officialChannel": "Official Encrypted Wireless Net",
        "operationLocation": "Chaygaon Riverine Belt",
        "assistanceRequested": "Assistance in erecting emergency sandbag bunds and shifting domestic livestock.",
        "teamStrength": "2 Rescue Teams (24 Personnel, 4 Inflatables)",
        "operationalStatus": "Dispatched / In Route",
        "evacuatedCitizensCount": 140,
        "latestCoordinationBrief": "SDRF team en route with heavy dewatering equipment. Contact reconfirmed via wireless net.",
        "recordedByAuthority": "Dr. Smita Kakati, IAS (Authority)",
        "updatedAt": "2026-11-18T19:06:17.274Z",
        "__v": 0
      }
    ],
    "floodalerts": [
      {
        "title": "CRITICAL: Brahmaputra River Surpasses Danger Level at Kamrup Gauge (18.2m)",
        "district": "Kamrup",
        "location": "Palashbari, Chaygaon & Guwahati Embankment Sectors",
        "severity": "Critical",
        "advisory": "Residents within 500m of low-lying embankments advised to move to designated relief shelters immediately. Avoid plying mechanized boats near swirling river bends.",
        "issuedBy": "DDMA Kamrup & CWC Hydrology Division",
        "isActive": true,
        "createdAt": "2026-11-18T19:54:17.084Z",
        "__v": 0
      },
      {
        "title": "ORANGE WARNING: Intense Heavy Rainfall Forecast across Lower Assam in next 24h",
        "district": "Kamrup",
        "location": "Kamrup Rural & Metropolitan Sub-divisions",
        "severity": "High",
        "advisory": "Regional Meteorological Centre (IMD) predicts 90-140 mm localized rainfall. District emergency response teams kept on full standby alert.",
        "issuedBy": "State Disaster Management Control Room",
        "isActive": true,
        "createdAt": "2026-11-18T19:54:17.085Z",
        "__v": 0
      }
    ],
    "citizenincidents": [
      {
        "incidentNumber": "INC-2024-002",
        "citizenName": "Anowar Hussain",
        "citizenContact": "+91 94355 88990",
        "location": "Chaygaon Char Bazaar Link Road",
        "district": "Kamrup",
        "incidentType": "Embankment Breach",
        "severity": "Critical",
        "description": "Secondary mud embankment developed a 4-meter breach; water gushing into adjacent paddy fields and school road.",
        "status": "Under Review",
        "assignedToRole": "Authority / Water Resources Dept",
        "actionRemarks": "Water Resources Executive Engineer alerted; sandbag reinforcement team dispatched.",
        "createdAt": "2026-11-18T19:54:17.280Z",
        "__v": 0
      },
      {
        "incidentNumber": "INC-2024-001",
        "citizenName": "Bipul Talukdar",
        "citizenContact": "+91 98642 11234",
        "location": "Ward No. 3, Near Sluice Gate, Palashbari",
        "district": "Kamrup",
        "incidentType": "Trapped Citizens / Evacuation",
        "severity": "High",
        "description": "Family of 6 including 2 senior citizens and an infant trapped on terrace due to 3-foot swirling water entering the ground floor.",
        "status": "Dispatched for Action",
        "assignedToRole": "Ground Officer (Bhaskar Jyoti Das)",
        "actionRemarks": "NDRF Team Bravo boat diverted to location for immediate extraction.",
        "createdAt": "2026-11-18T19:54:17.279Z",
        "__v": 0
      }
    ],
    "users": [
      {
        "name": "Nabanita Hazarika",
        "email": "monitoring@neeraksh.gov.in",
        "password": "$2a$10$N5hZm9hm1v1uwyWKqB7SKOSq4Y8u30.k0le7ZDT591hpKstJuRTN6",
        "role": "monitoring",
        "designation": "District Audit & Compliance Inspector",
        "department": "Disaster Operations Monitoring Cell",
        "district": "Kamrup",
        "contactNumber": "+91 94350 55005",
        "createdAt": "2026-11-18T19:54:16.943Z",
        "__v": 0
      },
      {
        "name": "Pranjal Saikia",
        "email": "godown@neeraksh.gov.in",
        "password": "$2a$10$N5hZm9hm1v1uwyWKqB7SKOSq4Y8u30.k0le7ZDT591hpKstJuRTN6",
        "role": "godown",
        "designation": "Central Relief Godown Superintendent",
        "department": "Relief & Rehabilitation Branch, Amingaon",
        "district": "Kamrup",
        "contactNumber": "+91 94350 33003",
        "createdAt": "2026-11-18T19:54:16.941Z",
        "__v": 0
      },
      {
        "name": "Bhaskar Jyoti Das",
        "email": "ground@neeraksh.gov.in",
        "password": "$2a$10$N5hZm9hm1v1uwyWKqB7SKOSq4Y8u30.k0le7ZDT591hpKstJuRTN6",
        "role": "ground",
        "designation": "Circle Field Disaster Officer",
        "department": "Palashbari Revenue Circle",
        "district": "Kamrup",
        "contactNumber": "+91 94350 44004",
        "createdAt": "2026-11-18T19:54:16.942Z",
        "__v": 0
      },
      {
        "name": "Er. Ranjit Baruah",
        "email": "admin@neeraksh.gov.in",
        "password": "$2a$10$N5hZm9hm1v1uwyWKqB7SKOSq4Y8u30.k0le7ZDT591hpKstJuRTN6",
        "role": "admin",
        "designation": "GIS Flood Intelligence Admin",
        "department": "Assam State Disaster Management Authority (ASDMA)",
        "district": "Kamrup",
        "contactNumber": "+91 94350 11001",
        "createdAt": "2026-11-18T19:54:16.935Z",
        "__v": 0
      },
      {
        "name": "Dr. Smita Kakati, IAS",
        "email": "authority@neeraksh.gov.in",
        "password": "$2a$10$N5hZm9hm1v1uwyWKqB7SKOSq4Y8u30.k0le7ZDT591hpKstJuRTN6",
        "role": "authority",
        "designation": "Additional District Magistrate & DDMA In-Charge",
        "department": "District Administration Kamrup",
        "district": "Kamrup",
        "contactNumber": "+91 94350 22002",
        "createdAt": "2026-11-18T19:54:16.940Z",
        "__v": 0
      },
      {
        "name": "System Quality Tester",
        "email": "tester@neeraksh.gov.in",
        "password": "$2a$10$N5hZm9hm1v1uwyWKqB7SKOSq4Y8u30.k0le7ZDT591hpKstJuRTN6",
        "role": "tester",
        "designation": "Platform Verification & End-to-End QA Evaluator",
        "department": "NEERAKSHAK Technical Operations & Evaluation Unit",
        "district": "Kamrup",
        "contactNumber": "+91 94350 99999",
        "createdAt": "2026-11-18T19:54:16.944Z",
        "__v": 0
      }
    ],
    "resourcerequests": [
      {
        "requestNumber": "REQ-KMP-2024-001",
        "requestedBy": "Bhaskar Jyoti Das (Ground Officer)",
        "requesterRole": "Ground Officer",
        "district": "Kamrup",
        "targetLocation": "Palashbari Lowland Sector",
        "urgency": "Critical",
        "items": [
          {
            "itemId": "6afe026987e9f161e08e9342",
            "itemName": "Inflatable Rescue Boat (IRB) with 40HP OBM",
            "category": "Rescue Boats",
            "quantityRequested": 4,
            "unit": "Units"
          },
          {
            "itemId": "6afe026987e9f161e08e9343",
            "itemName": "SOLAS Approved Adult Life Jackets (150N)",
            "category": "Life Jackets",
            "quantityRequested": 60,
            "unit": "Units"
          },
          {
            "itemId": "6afe026987e9f161e08e9344",
            "itemName": "Emergency Dry Food Ration Kits (Family 3-Day Pack)",
            "category": "Food Packets",
            "quantityRequested": 500,
            "unit": "Packets"
          },
          {
            "itemId": "6afe026987e9f161e08e9345",
            "itemName": "Packaged Drinking Water (20 Litre Sealed Cans)",
            "category": "Drinking Water",
            "quantityRequested": 300,
            "unit": "Units"
          }
        ],
        "purpose": "Rapid evacuation of 480 marooned villagers in Majortop and distribution of clean water and trauma supplies.",
        "status": "Approved",
        "approvalRemarks": "Sanctioned under District Flood Relief Contingency Fund. Dispatch immediately via NH-17 convoy.",
        "reviewedBy": "Dr. Smita Kakati, IAS (Authority)",
        "reviewedAt": "2026-11-18T16:54:17.225Z",
        "createdAt": "2026-11-18T15:54:17.225Z",
        "__v": 0
      },
      {
        "requestNumber": "REQ-KMP-2026-002",
        "requestedBy": "System Quality Tester",
        "requesterRole": "Ground Officer",
        "district": "Kamrup",
        "targetLocation": "Chaygaon Riverine Belt",
        "urgency": "Critical",
        "items": [
          {
            "itemId": "6afe026987e9f161e08e9342",
            "itemName": "Inflatable Rescue Boat (IRB) with 40HP OBM",
            "category": "Rescue Boats",
            "quantityRequested": 3,
            "unit": "Units"
          }
        ],
        "purpose": "Urgent deep-water evacuation of 40 families near breached bund.",
        "status": "Approved",
        "approvalRemarks": "Sanctioned for immediate deployment.",
        "reviewedBy": "System Quality Tester",
        "createdAt": "2026-11-18T20:07:18.991Z",
        "__v": 0,
        "reviewedAt": "2026-11-18T20:07:19.048Z"
      }
    ],
    "returnrecords": [],
    "affectedareas": [
      {
        "villageName": "Palashbari Lowland Sector",
        "subDivision": "Palashbari Circle",
        "district": "Kamrup",
        "lat": 26.128,
        "lng": 91.505,
        "severity": "Critical",
        "affectedPopulation": 4850,
        "waterLevelDescription": "Overtopping embankment at 2.4 ft above river bank level",
        "evacuationStatus": "In Progress",
        "status": "Active",
        "markedBy": "Er. Ranjit Baruah (Admin)",
        "updatedAt": "2026-11-18T19:54:17.068Z",
        "__v": 0
      },
      {
        "villageName": "Hajo Lowland Farming Ward",
        "subDivision": "Hajo Circle",
        "district": "Kamrup",
        "lat": 26.245,
        "lng": 91.525,
        "severity": "Moderate",
        "affectedPopulation": 1650,
        "waterLevelDescription": "Agricultural waterlogging, drainage channels near capacity",
        "evacuationStatus": "Advised",
        "status": "Active",
        "markedBy": "Er. Ranjit Baruah (Admin)",
        "updatedAt": "2026-11-18T20:27:33.648Z",
        "__v": 0
      },
      {
        "villageName": "Rampur Char Village",
        "subDivision": "Palashbari Circle",
        "district": "Kamrup",
        "lat": 26.105,
        "lng": 91.47,
        "severity": "High",
        "affectedPopulation": 2310,
        "waterLevelDescription": "River island sandbar inundation; boat connectivity essential",
        "evacuationStatus": "In Progress",
        "status": "Active",
        "markedBy": "Er. Ranjit Baruah (Admin)",
        "updatedAt": "2026-11-18T19:54:17.069Z",
        "__v": 0
      },
      {
        "villageName": "Chaygaon Riverine Belt",
        "subDivision": "Chaygaon Circle",
        "district": "Kamrup",
        "lat": 26.06,
        "lng": 91.43,
        "severity": "High",
        "affectedPopulation": 3620,
        "waterLevelDescription": "Submerged access roads; 1.8 ft standing water in low-lying settlement",
        "evacuationStatus": "In Progress",
        "status": "Active",
        "markedBy": "Er. Ranjit Baruah (Admin)",
        "updatedAt": "2026-11-18T19:54:17.069Z",
        "__v": 0
      }
    ]
  }
};
