/**
 * ==============================================================================
 * NEERAKSHAK – INTEGRATED FLOOD MONITORING & DISASTER COORDINATION PLATFORM
 * Central Demonstration & Telemetry Seed Configuration (seed.js)
 * ==============================================================================
 * 
 * NOTE FOR USERS / DEVELOPERS:
 * This file serves as the single source of truth for all demonstration and seed records
 * across both the Public Portal (1index.html) and Admin Portal (2admin.html).
 * 
 * TO CLEAR / RESET FAKE DATA:
 * Simply empty any of the arrays below (e.g., areas: [], rivers: [], alerts: []).
 * Both portals will automatically detect empty lists and display clean standby states!
 */

window.NEERAKSHAK_SEED_DATA = {
    // =========================================================================
    // PART 1: PUBLIC PORTAL TELEMETRY (1index.html)
    // =========================================================================

    // 1. River Water Level Telemetry Card (Hero section)
    riverTelemetry: [
        {
            id: 'brahmaputra',
            name: 'Brahmaputra (Kamrup)',
            level: '18.2 m',
            status: 'Dangerous',
            severity: 'danger',      // 'danger' | 'warning' | 'normal'
            iconType: 'waves',        // 'waves' | 'bar'
            arrow: '↑'
        },
        {
            id: 'kolong',
            name: 'Kolong (Kamrup)',
            level: '14.6 m',
            status: 'Warning',
            severity: 'warning',
            iconType: 'bar',
            barColor: 'amber',
            arrow: '↑'
        },
        {
            id: 'kakang',
            name: 'Kakang (Kamrup)',
            level: '12.8 m',
            status: 'Normal',
            severity: 'normal',
            iconType: 'bar',
            barColor: 'green',
            arrow: '→'
        }
    ],

    // 2. Continuous Scrolling Live News Bulletin Ticker
    liveNewsTicker: [
        "Kamrup: Water level of Brahmaputra crosses danger level",
        "Relief camp set up in Chaygaon",
        "NDRF deployed in Palashbari",
        "Heavy rainfall expected in next 24 hours"
    ],

    // 3. 6 Key District Overview Stats Cards
    districtStats: [
        {
            id: 'stat-rivers',
            label: 'Rivers Monitored',
            value: '3',
            icon: 'fas fa-water',
            theme: 'blue'
        },
        {
            id: 'stat-alerts',
            label: 'Active Alerts',
            value: '2',
            icon: 'fas fa-triangle-exclamation',
            theme: 'red'
        },
        {
            id: 'stat-affected',
            label: 'People Affected',
            value: '12,430',
            icon: 'fas fa-users',
            theme: 'cyan'
        },
        {
            id: 'stat-camps',
            label: 'Relief Camps',
            value: '18',
            icon: 'fas fa-campground',
            theme: 'orange'
        },
        {
            id: 'stat-rescue',
            label: 'Rescue Teams Deployed',
            value: '6',
            icon: 'fas fa-ship',
            theme: 'indigo'
        },
        {
            id: 'stat-kits',
            label: 'Relief Kits Dispatched',
            value: '1,250',
            icon: 'fas fa-box-open',
            theme: 'green'
        }
    ],

    // 4. Latest Updates & News with Media Thumbnails
    latestNewsUpdates: [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=400&q=80',
            category: 'River Update',
            categoryClass: 'cat-river',
            headline: 'Water level in Brahmaputra crosses danger mark in Kamrup',
            timestamp: 'Today, 10:20 AM',
            details: 'Water level in river Brahmaputra at Kamrup station has crossed the official danger mark of 18.2 m. Continuous gauge monitoring active with district sluice gates monitored.'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80',
            category: 'Rescue',
            categoryClass: 'cat-rescue',
            headline: 'NDRF team deployed for rescue operations in Chaygaon',
            timestamp: 'Today, 09:15 AM',
            details: 'NDRF rescue team equipped with motorized inflatable boats has been deployed for flood response operations in Chaygaon.'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=400&q=80',
            category: 'Relief',
            categoryClass: 'cat-relief',
            headline: 'Relief camp operational in Palashbari, capacity: 500 persons',
            timestamp: 'Today, 08:40 AM',
            details: 'Designated relief camp is now fully operational in Palashbari with capacity for 500 persons, providing food, clean drinking water, and first-aid.'
        }
    ],

    // =========================================================================
    // PART 2: ADMIN PORTAL COMMAND & GIS TELEMETRY (2admin.html)
    // =========================================================================
    admin: {
        // Marked flood-affected zones and villages on district map
        areas: [
            {
                name: 'Palashbari Riverside Ward 2',
                block: 'Palashbari Circle',
                severity: 'Critical',
                pop: 4200,
                lat: 26.1320,
                lng: 91.5150,
                notes: 'Embankment seepage watch; low-lying homes evacuated.'
            },
            {
                name: 'Chaygaon Lowland Belt',
                block: 'Chaygaon Circle',
                severity: 'High',
                pop: 3650,
                lat: 26.0520,
                lng: 91.2250,
                notes: 'Approach road under 2.5 ft water; relief camp active.'
            },
            {
                name: 'Goroimari Char Cluster',
                block: 'Goroimari Circle',
                severity: 'Moderate',
                pop: 2800,
                lat: 26.0950,
                lng: 91.3400,
                notes: 'Riverbank waterlogging watch; ferry restricted.'
            },
            {
                name: 'Boko Upland Sector',
                block: 'Boko Circle',
                severity: 'Normal',
                pop: 1780,
                lat: 25.9800,
                lng: 91.2400,
                notes: 'Drainage normal; monitoring rainfall runoff.'
            }
        ],

        // River gauge station telemetry & sparkline trends
        rivers: [
            {
                name: 'Brahmaputra River',
                current: 18.2,
                danger: 18.0,
                trend: 'Rising',
                barColor: '#dc2626',
                spark: 'M2 16 L12 13 L22 14 L32 8 L42 6 L52 3'
            },
            {
                name: 'Kolong River',
                current: 14.6,
                danger: 15.0,
                trend: 'Rising',
                barColor: '#eab308',
                spark: 'M2 15 L12 14 L22 11 L32 10 L42 7 L52 5'
            },
            {
                name: 'Kakang River',
                current: 12.8,
                danger: 14.5,
                trend: 'Steady',
                barColor: '#16a34a',
                spark: 'M2 12 L12 13 L22 10 L32 11 L42 9 L52 9'
            }
        ],

        // Active citizen flood warnings & public safety broadcasts
        alerts: [
            {
                title: 'Flood risk increasing',
                location: 'Chaygaon, North Kamrup',
                severity: 'High',
                desc: 'River water rising near northern embankment; low-lying residents advised to move to relief shelters.'
            },
            {
                title: 'Water level rising',
                location: 'Palashbari, Kamrup',
                severity: 'Moderate',
                desc: 'Continuous upstream rainfall; waterlogging watch active across riverside wards.'
            }
        ],

        // Pinned emergency facilities (Hospitals, Police, Relief Shelters)
        facilities: [
            {
                name: 'District Civil Emergency Hospital',
                category: 'Hospital',
                distance: '2.4 km • Kamrup Sadar',
                contact: '108'
            },
            {
                name: 'Palashbari Sadar Police Station',
                category: 'Police Station',
                distance: '1.8 km • Palashbari',
                contact: '112'
            },
            {
                name: 'Palashbari HS Relief Camp',
                category: 'Relief Camp',
                distance: '3.1 km • Cap: 500',
                contact: '1077'
            }
        ],

        // Meteorological & catchment rainfall advisory
        weather: {
            rainfall: '78 mm (Heavy)',
            advisory: 'Orange Alert – Heavy Rain',
            humidity: '89% • 24 km/h Wind',
            forecast: 'Showers next 24 hrs'
        }
    },

    // =========================================================================
    // PART 3: DISTRICT DISASTER MANAGEMENT AUTHORITY (DDMA) TELEMETRY (3authority.html)
    // =========================================================================
    authority: {
        // Flood-affected villages with assessed resource requirements
        villages: [
            {
                id: 'V-01',
                name: 'Palashbari Riverside Ward 2',
                block: 'Palashbari Circle',
                severity: 'Critical',
                pop: 4200,
                waterStatus: 'Brahmaputra at 18.2 m (Above Danger Level)',
                assessedNeed: { boats: 4, jackets: 60, food: 500, meds: 80 }
            },
            {
                id: 'V-02',
                name: 'Chaygaon Lowland Belt',
                block: 'Chaygaon Circle',
                severity: 'High',
                pop: 3650,
                waterStatus: 'Kolong Basin at 14.6 m (Rising)',
                assessedNeed: { boats: 2, jackets: 30, food: 450, meds: 65 }
            },
            {
                id: 'V-03',
                name: 'Goroimari Char Cluster',
                block: 'Goroimari Circle',
                severity: 'Moderate',
                pop: 2800,
                waterStatus: 'Waterlogging watch on approach road',
                assessedNeed: { boats: 1, jackets: 15, food: 250, meds: 40 }
            },
            {
                id: 'V-04',
                name: 'Boko Upland Sector',
                block: 'Boko Circle',
                severity: 'Normal',
                pop: 1780,
                waterStatus: 'Kakang Gauge at 12.8 m (Normal)',
                assessedNeed: { boats: 0, jackets: 0, food: 100, meds: 20 }
            }
        ],

        // Resource requests from field officers & relief desks awaiting approval
        requests: [
            {
                id: 'REQ-204',
                from: 'Ground Officer – Palashbari',
                village: 'Palashbari Riverside Ward 2',
                items: '4 Rescue Boats, 60 Life Jackets',
                urgency: 'Critical',
                status: 'Pending',
                reason: 'Awaiting Authority review'
            },
            {
                id: 'REQ-205',
                from: 'Relief Camp Desk – Chaygaon',
                village: 'Chaygaon Lowland Belt',
                items: '450 Food Packets, 65 Medicine Kits',
                urgency: 'High',
                status: 'Pending',
                reason: 'Awaiting Authority review'
            },
            {
                id: 'REQ-201',
                from: 'DEOC Field Desk',
                village: 'Goroimari Char Cluster',
                items: '250 Food Packets, 40 Medicine Kits',
                urgency: 'Moderate',
                status: 'Approved',
                reason: 'Approved & routed to Godown Manager'
            }
        ],

        // Approved allocations transmitted to Godown Manager with dispatch status
        allocations: [
            {
                id: 'ALC-501',
                village: 'Palashbari Riverside Ward 2',
                summary: '4 Boats, 60 Jackets, 500 Food, 80 Meds',
                godownStatus: 'Sent to Godown Manager • Preparing Dispatch',
                deliveryProgress: 65
            },
            {
                id: 'ALC-502',
                village: 'Chaygaon Lowland Belt',
                summary: '2 Boats, 30 Jackets, 450 Food, 65 Meds',
                godownStatus: 'Dispatched by Godown • En-Route',
                deliveryProgress: 85
            }
        ],

        // Multi-agency disaster coordination records (NDRF, SDRF, Army, Police)
        coordinations: [
            {
                agency: 'NDRF (1st Bn)',
                sector: 'Palashbari Riverside Ward 2',
                update: 'Coordinated via DEOC Control Room; 2 NDRF boat teams evacuating stranded families under independent command.'
            },
            {
                agency: 'SDRF District Unit',
                sector: 'Chaygaon Lowland Belt',
                update: 'Official requisition acknowledged; 1 SDRF unit stationed at Chaygaon ferry point.'
            }
        ],

        // Active field rescue operations & logistical movement
        operations: [
            {
                title: 'Palashbari Embankment Evacuation',
                status: 'Ongoing',
                summary: '140 residents evacuated to Palashbari Govt. HS Relief Camp; boat shuttle active.'
            },
            {
                title: 'Chaygaon Medical & Ration Supply Run',
                status: 'Completed',
                summary: 'First batch of 300 food packets & drinking water verified by Ground Officer.'
            }
        ],

        // DDMA Authority executive audit & activity log stream
        logs: [
            {
                time: '10:40 AM',
                actor: 'District Authority (DDMA)',
                note: 'Assessed Palashbari Ward 2 and transmitted allocation ALC-501 to Godown Manager.'
            },
            {
                time: '09:55 AM',
                actor: 'District Authority (DDMA)',
                note: 'Logged NDRF 1st Bn official coordination update for Palashbari sector.'
            }
        ]
    },

    // =========================================================================
    // PART 4: GODOWN & RELIEF SUPPLY DEPOT TELEMETRY (4godown.html)
    // =========================================================================
    godown: {
        // Physical relief inventory across district warehouses
        inventory: [
            { id: 'INV-01', name: 'Inflatable Rescue Boats', category: 'Rescue Boats', warehouse: 'Central Relief Godown – Mirza', total: 18, available: 11, allocated: 4, dispatched: 3, minLimit: 5, condition: 'Good' },
            { id: 'INV-02', name: 'High-Buoyancy Life Jackets', category: 'Life Jackets', warehouse: 'Central Relief Godown – Mirza', total: 420, available: 290, allocated: 60, dispatched: 70, minLimit: 100, condition: 'Good' },
            { id: 'INV-03', name: 'Dry Ration Food Packets', category: 'Food Packets', warehouse: 'Central Relief Godown – Mirza', total: 3500, available: 2150, allocated: 500, dispatched: 850, minLimit: 800, condition: 'Good' },
            { id: 'INV-04', name: '20L Drinking Water Canisters', category: 'Drinking Water', warehouse: 'North Sector Warehouse – Rangia', total: 600, available: 110, allocated: 150, dispatched: 340, minLimit: 150, condition: 'Low Stock' },
            { id: 'INV-05', name: 'Essential Flood Medicine Kits', category: 'Medicines', warehouse: 'Central Relief Godown – Mirza', total: 450, available: 280, allocated: 80, dispatched: 90, minLimit: 100, condition: 'Good' },
            { id: 'INV-06', name: 'Trauma First-Aid Kits', category: 'First Aid Kits', warehouse: 'North Sector Warehouse – Rangia', total: 160, available: 28, allocated: 30, dispatched: 102, minLimit: 40, condition: 'Low Stock' },
            { id: 'INV-07', name: 'Solar Searchlights & Rope Kits', category: 'Rescue Equipment', warehouse: 'Central Relief Godown – Mirza', total: 95, available: 65, allocated: 10, dispatched: 20, minLimit: 25, condition: 'Good' }
        ],

        // Authority-approved allocation orders pending/dispatched
        allocations: [
            { id: 'ALC-501', destination: 'Palashbari Riverside Ward 2', resourceId: 'INV-01', resourceName: 'Inflatable Rescue Boats', qty: 4, priority: 'Critical', stockVerified: true, status: 'Pending Dispatch', vehicle: '—', dispatchTime: '—', refNo: '—' },
            { id: 'ALC-502', destination: 'Palashbari Riverside Ward 2', resourceId: 'INV-02', resourceName: 'High-Buoyancy Life Jackets', qty: 60, priority: 'Critical', stockVerified: true, status: 'Pending Dispatch', vehicle: '—', dispatchTime: '—', refNo: '—' },
            { id: 'ALC-503', destination: 'Chaygaon Lowland Belt', resourceId: 'INV-03', resourceName: 'Dry Ration Food Packets', qty: 450, priority: 'High', stockVerified: true, status: 'Dispatched', vehicle: 'AS-01-GC-4821', dispatchTime: 'Today, 09:40 AM', refNo: 'DSP-2026-884' },
            { id: 'ALC-504', destination: 'Goroimari Char Cluster', resourceId: 'INV-04', resourceName: '20L Drinking Water Canisters', qty: 150, priority: 'Moderate', stockVerified: false, status: 'Shortage Flagged', vehicle: '—', dispatchTime: '—', refNo: '—' }
        ],

        // Equipment returns from completed rescue sectors
        returns: [
            { id: 'RET-301', resourceId: 'INV-01', resourceName: 'Inflatable Rescue Boats', from: 'Boko Relief Sector', good: 2, damaged: 0, missing: 0, date: 'Yesterday, 06:15 PM' }
        ],

        // Stock movement, dispatch logs and SDMA receipts
        movements: [
            { time: 'Today, 09:40 AM', type: 'DISPATCH', item: '450 Dry Ration Food Packets', party: 'To: Chaygaon Lowland Belt', note: 'Ref: DSP-2026-884 • Vehicle AS-01-GC-4821' },
            { time: 'Today, 08:30 AM', type: 'STOCK IN', item: '150 Essential Flood Medicine Kits', party: 'From: State SDMA Supply', note: 'Received at Central Relief Godown – Mirza' },
            { time: 'Yesterday, 06:15 PM', type: 'RETURN', item: '2 Inflatable Rescue Boats (Good)', party: 'From: Boko Relief Sector', note: 'Condition verified Good; restocked to Available' }
        ]
    },

    // =========================================================================
    // PART 5: GROUND OFFICER & FIELD RESCUE VERIFICATION TELEMETRY (5groundofficer.html)
    // =========================================================================
    groundOfficer: {
        areas: [
            { id: 'ASN-01', village: 'Palashbari Riverside Ward 2', block: 'Palashbari Circle', severity: 'Critical', priority: 'Urgent', status: 'Active Field Duty', coords: '26.1320° N, 91.5150° E', deadline: 'Today, 02:00 PM', task: 'Verify DSP-2026-884 food & water delivery + submit afternoon flood depth report.' },
            { id: 'ASN-02', village: 'Chaygaon Lowland Belt', block: 'Chaygaon Circle', severity: 'High', priority: 'High', status: 'Verification Pending', coords: '26.0520° N, 91.2250° E', deadline: 'Today, 04:00 PM', task: 'Confirm receipt of 200 blankets & report stranded households in Ward 3.' },
            { id: 'ASN-03', village: 'Goroimari Char Cluster', block: 'Goroimari Circle', severity: 'Moderate', priority: 'Normal', status: 'Monitoring', coords: '26.0950° N, 91.3400° E', deadline: 'Today, 06:00 PM', task: 'Inspect embankment seepage & verify returned life jackets from morning shift.' }
        ],
        deliveries: [
            { dispatchId: 'DSP-2026-884', destination: 'Palashbari Riverside Ward 2', resource: 'Dry Ration Food Packets', dispatched: 500, received: null, damaged: 0, shortage: 0, status: 'Pending Verification', remarks: 'Awaiting physical count at Palashbari HS Relief Camp' },
            { dispatchId: 'DSP-2026-885', destination: 'Chaygaon Lowland Belt', resource: 'Thermal Relief Blankets', dispatched: 200, received: null, damaged: 0, shortage: 0, status: 'Pending Verification', remarks: 'Vehicle AS-01-GC-4821 arrived at Chaygaon checkpoint' },
            { dispatchId: 'DSP-2026-879', destination: 'Palashbari Riverside Ward 2', resource: '1L Drinking Water Bottles', dispatched: 1000, received: 1000, damaged: 0, shortage: 0, status: 'Verified', remarks: 'All 1000 bottles received intact at camp store.' }
        ],
        fieldReports: [
            { refId: 'FR-2026-412', village: 'Palashbari Riverside Ward 2', severity: 'Critical', water: '4.2 ft inundation', affected: '320 Households', stranded: 45, road: 'Blocked (Boat Only)', needs: 'Rescue boats, drinking water & ORS', coords: '26.1320° N, 91.5150° E', time: 'Today, 10:15 AM', reviewStatus: 'Approved / Reviewed' },
            { refId: 'FR-2026-409', village: 'Chaygaon Lowland Belt', severity: 'High', water: '2.8 ft waterlogging', affected: '210 Households', stranded: 18, road: 'Partially Accessible', needs: 'Dry rations & mosquito nets', coords: '26.0520° N, 91.2250° E', time: 'Today, 08:50 AM', reviewStatus: 'Pending Review' }
        ],
        operations: [
            { opId: 'OP-NDRF-11', location: 'Palashbari Riverside Ward 2', agency: 'NDRF 1st Bn (Independent Command)', rescued: 142, stranded: 45, status: 'In Progress', notes: '2 motorized boats operating between Ward 2 and Palashbari HS Camp.' },
            { opId: 'OP-SDRF-07', location: 'Chaygaon Lowland Belt', agency: 'SDRF District Unit (Independent Command)', rescued: 68, stranded: 18, status: 'In Progress', notes: 'Evacuating elderly residents from submerged approach road.' }
        ],
        returns: [
            { retId: 'RV-108', item: 'Inflatable Rescue Boats', location: 'Palashbari Riverside Ward 2', good: 8, damaged: 1, missing: 1, remarks: '1 boat pontoon damaged; 1 paddle set missing during night evacuation.', time: 'Yesterday, 06:30 PM' },
            { retId: 'RV-109', item: 'High-Buoyancy Life Jackets', location: 'Chaygaon Lowland Belt', good: 95, damaged: 5, missing: 0, remarks: '5 buckles broken; tagged for Godown repair bay.', time: 'Today, 07:45 AM' }
        ],
        notifications: [
            { title: 'New Delivery Dispatched (DSP-2026-884)', detail: 'Godown Manager dispatched 500 Food Packets to Palashbari Ward 2. Verify physical receipt.', priority: 'Critical' },
            { title: 'Urgent Field Report Requested', detail: 'District Authority requested updated stranded population count for Chaygaon Ward 3.', priority: 'High' }
        ]
    }
,
    // =========================================================================
    // PART 6: MONITORING & AUDIT OFFICER TELEMETRY (6monitoring.html)
    // =========================================================================
    monitoring: {
        reconciliation: [
            { allocId: 'ALC-501', dispatchId: 'DSP-2026-884', resource: 'Dry Ration Food Packets', destination: 'Palashbari Ward 2', approved: 500, dispatched: 500, received: 480, status: 'Shortage' },
            { allocId: 'ALC-502', dispatchId: 'DSP-2026-879', resource: '20L Drinking Water Bottles', destination: 'Palashbari Ward 2', approved: 1000, dispatched: 1000, received: 1000, status: 'Matched' },
            { allocId: 'ALC-503', dispatchId: 'DSP-2026-885', resource: 'High-Buoyancy Life Jackets', destination: 'Chaygaon Lowland', approved: 200, dispatched: 200, received: 180, status: 'Shortage' },
            { allocId: 'ALC-504', dispatchId: 'DSP-2026-888', resource: 'Essential Flood Medicine Kits', destination: 'Goroimari Char', approved: 80, dispatched: 80, received: 80, status: 'Matched' },
            { allocId: 'ALC-505', dispatchId: 'DSP-2026-882', resource: 'Inflatable Rescue Boats', destination: 'Palashbari Ward 2', approved: 4, dispatched: 4, received: 4, status: 'Matched' }
        ],
        discrepancies: [
            { id: 'DSC-01', ref: 'DSP-2026-884', destination: 'Palashbari Ward 2', issue: '20 Food Packets missing between Godown dispatch (500) and Ground receipt (480). Transit boat seepage reported.', targetRole: 'ground', status: 'Clarification Requested' },
            { id: 'DSC-02', ref: 'DSP-2026-885', destination: 'Chaygaon Lowland', issue: '20 Life Jackets short-delivered at Chaygaon relief camp intake checkpoint.', targetRole: 'godown', status: 'Open' }
        ],
        returns: [
            { resource: 'Inflatable Rescue Boats', dispatched: 10, returnedGood: 8, damaged: 1, missing: 1, syncStatus: 'Verified & Restocked (8 Good)' },
            { resource: 'High-Buoyancy Life Jackets', dispatched: 100, returnedGood: 95, damaged: 5, missing: 0, syncStatus: 'Verified & Restocked (95 Good)' },
            { resource: 'Portable Water Purifiers', dispatched: 15, returnedGood: 15, damaged: 0, missing: 0, syncStatus: '100% Returned Intact' }
        ],
        operations: [
            { opId: 'OP-NDRF-11', location: 'Palashbari Ward 2', officer: 'R. K. Kalita (GO-KAM-04)', status: 'Active • 142 Rescued', notes: '2 boat shuttles active; afternoon field report submitted.' },
            { opId: 'OP-SDRF-07', location: 'Chaygaon Lowland', officer: 'R. K. Kalita (GO-KAM-04)', status: 'Active • 68 Rescued', notes: 'Evacuation ongoing; awaiting life jacket shortage clarification.' },
            { opId: 'OP-MED-03', location: 'Goroimari Char', officer: 'Dr. B. Goswami (Health Unit)', status: 'Active • Camp Set Up', notes: 'Temporary mobile health camp operational on elevated school mound.' }
        ],
        logs: [
            { user: 'GO-KAM-04 (Ground Officer)', action: 'Submitted delivery receipt for DSP-2026-884 (480/500 Food Packets)', time: 'Today, 10:25 AM' },
            { user: 'GD-MIRZA-01 (Godown Manager)', action: 'Dispatched 200 Life Jackets via AS-01-GC-4821 (DSP-2026-885)', time: 'Today, 09:40 AM' },
            { user: 'DDMA-AUTH-01 (Authority)', action: 'Approved ALC-501 & ALC-502 for Palashbari Ward 2', time: 'Today, 08:50 AM' },
            { user: 'ADM-GIS-01 (Admin)', action: 'Marked Palashbari Ward 2 as Critical flood zone (18.2 m)', time: 'Today, 08:15 AM' }
        ],
        escalations: [
            { id: 'ESC-12', title: 'Unresolved Food Packet Shortage (DSP-2026-884)', detail: 'Escalated to District Authority after 20-packet mismatch at Palashbari Ward 2.', status: 'Escalated to Authority' },
            { id: 'ESC-13', title: 'Transit Life Jacket Discrepancy (DSP-2026-885)', detail: 'Flagged 20-unit mismatch between Mirza central godown manifest and Chaygaon receipt.', status: 'Under Review' }
        ],
        chats: {
            ground: [
                { sender: 'outgoing', text: 'Hi GO-KAM-04, DSP-2026-884 shows 500 Food Packets dispatched but 480 received. Was 1 carton damaged in transit?', time: '10:28 AM' },
                { sender: 'incoming', text: 'Officer GO-KAM-04: Yes, 1 carton (20 packets) got water-damaged on the ferry transfer. Photo evidence uploaded.', time: '10:31 AM' }
            ],
            godown: [
                { sender: 'outgoing', text: 'Godown Mirza, please confirm vehicle loading count for DSP-2026-885 (200 Life Jackets) to Chaygaon.', time: '09:55 AM' },
                { sender: 'incoming', text: 'Godown Manager: Gate-pass shows 4 bales of 50 life jackets loaded. Checking driver manifest now.', time: '10:02 AM' }
            ],
            authority: [
                { sender: 'outgoing', text: 'DDMA Authority: Flagged 20-unit food shortage on DSP-2026-884 for audit review.', time: '10:33 AM' },
                { sender: 'incoming', text: 'District Authority: Noted. Approving replacement buffer stock for Palashbari Ward 2.', time: '10:36 AM' }
            ],
            admin: [
                { sender: 'outgoing', text: 'Admin GIS Desk: Please verify if Goroimari Char road access is still blocked for DSP-2026-888.', time: '10:12 AM' },
                { sender: 'incoming', text: 'Admin Portal: Approach road still submerged; boat transfer required at Goroimari ghat.', time: '10:15 AM' }
            ]
        }
    }
};
