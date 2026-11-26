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
  ]
};
export default SEED_DATA;
