// NEERAKSHAK Pan-India River, District & Telemetry Registry
// Basin-Specific Role & User ID Architecture with Strict Sector Isolation

/**
 * USER_BASIN_REGISTRY
 * Defines real river systems, gauge telemetry (CWC danger & warning marks),
 * and 5-6 dedicated district/circle sectors per basin.
 *
 * User ID Format: <role-prefix><unique-digits><state-code><basin-code>
 * Example: ad1558bk
 *   - 'ad' = admin ('au' = authority, 'gd' = godown, 'go' = ground officer, 'mo' = monitoring)
 *   - '1558' = unique random 4 digits
 *   - 'b' = Bihar ('a' = Assam, 'u' = UP, 'o' = Odisha, 'm' = Maharashtra)
 *   - 'k' = Kosi Basin ('b' = Brahmaputra, 'g' = Ganga, 'm' = Mahanadi, 'p' = Panchganga)
 */
export const USER_BASIN_REGISTRY = {
  'bk': {
    id: 'bk',
    stateCode: 'b',
    basinCode: 'k',
    stateName: 'Bihar',
    basinName: 'Kosi River Basin',
    shortName: 'Bihar (Kosi Basin)',
    tagline: 'Kosi Embankment & Flood Floodway Command',
    demoUser: {
      admin: 'ad1558bk',
      authority: 'au2381bk',
      godown: 'gd4920bk',
      ground: 'go5142bk',
      monitoring: 'mo6810bk'
    },
    rivers: [
      {
        id: 'kosi',
        name: 'Kosi River (Birpur Barrage)',
        basin: 'Kosi Basin',
        state: 'Bihar',
        current: 71.4,
        danger: 70.8,
        warning: 70.0,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 18 L12 15 L22 13 L32 9 L42 7 L52 2',
        center: [25.65, 87.40],
        path: [
          [26.52, 86.99],
          [26.15, 87.05],
          [25.80, 87.25],
          [25.54, 87.35],
          [25.43, 87.25]
        ]
      },
      {
        id: 'saura',
        name: 'Saura River (Purnia)',
        basin: 'Kosi Basin',
        state: 'Bihar',
        current: 34.0,
        danger: 34.2,
        warning: 33.5,
        unit: 'm',
        trend: 'Steady',
        barColor: '#f97316',
        spark: 'M2 12 L12 11 L22 10 L32 10 L42 9 L52 8',
        center: [25.77, 87.47],
        path: [
          [26.10, 87.40],
          [25.77, 87.47],
          [25.45, 87.52]
        ]
      },
      {
        id: 'tilyuga',
        name: 'Tilyuga River (Saharsa)',
        basin: 'Kosi Basin',
        state: 'Bihar',
        current: 58.6,
        danger: 58.2,
        warning: 57.5,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 14 L12 12 L22 10 L32 8 L42 6 L52 3',
        center: [26.12, 86.60],
        path: [
          [26.45, 86.50],
          [26.12, 86.60],
          [25.80, 86.75]
        ]
      }
    ],
    sectors: [
      {
        id: 'katihar-sadar',
        name: 'Katihar Sadar Sector',
        block: 'Katihar Sadar, Katihar',
        state: 'Bihar',
        coords: [25.54, 87.57],
        zoom: 12,
        river: 'Kosi River',
        basin: 'Kosi River Basin'
      },
      {
        id: 'kursela-sangam',
        name: 'Kursela Confluence',
        block: 'Kursela Block, Katihar',
        state: 'Bihar',
        coords: [25.43, 87.25],
        zoom: 12,
        river: 'Kosi & Ganga Confluence',
        basin: 'Kosi River Basin'
      },
      {
        id: 'purnia-east',
        name: 'Purnia East Lowland',
        block: 'Purnia East, Purnia',
        state: 'Bihar',
        coords: [25.78, 87.48],
        zoom: 12,
        river: 'Saura River (Kosi Trib.)',
        basin: 'Kosi River Basin'
      },
      {
        id: 'birpur-barrage',
        name: 'Birpur Barrage Sector',
        block: 'Birpur, Supaul',
        state: 'Bihar',
        coords: [26.52, 86.99],
        zoom: 12,
        river: 'Kosi Main Barrage',
        basin: 'Kosi River Basin'
      },
      {
        id: 'saharsa-basin',
        name: 'Saharsa Lowland Belt',
        block: 'Mahishi & Nauhatta, Saharsa',
        state: 'Bihar',
        coords: [25.88, 86.60],
        zoom: 12,
        river: 'Tilyuga & Kosi',
        basin: 'Kosi River Basin'
      },
      {
        id: 'supaul-embankment',
        name: 'Supaul Embankment Sector',
        block: 'Supaul Sadar, Supaul',
        state: 'Bihar',
        coords: [26.12, 86.59],
        zoom: 12,
        river: 'Kosi Western Embankment',
        basin: 'Kosi River Basin'
      }
    ]
  },

  'ab': {
    id: 'ab',
    stateCode: 'a',
    basinCode: 'b',
    stateName: 'Assam',
    basinName: 'Brahmaputra Basin',
    shortName: 'Assam (Brahmaputra Basin)',
    tagline: 'Brahmaputra River Valley Flood Division',
    demoUser: {
      admin: 'ad2491ab',
      authority: 'au3152ab',
      godown: 'gd4820ab',
      ground: 'go6104ab',
      monitoring: 'mo7291ab'
    },
    rivers: [
      {
        id: 'brahmaputra',
        name: 'Brahmaputra River (Pandu Ghat)',
        basin: 'Brahmaputra Basin',
        state: 'Assam',
        current: 18.2,
        danger: 18.0,
        warning: 17.5,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 16 L12 13 L22 14 L32 8 L42 6 L52 3',
        center: [26.15, 91.60],
        path: [
          [27.60, 95.50],
          [27.20, 94.60],
          [26.90, 93.90],
          [26.60, 92.80],
          [26.24, 91.92],
          [26.18, 91.73],
          [26.13, 91.48],
          [26.04, 91.22],
          [25.96, 90.50]
        ]
      },
      {
        id: 'subansiri',
        name: 'Subansiri River (Majuli)',
        basin: 'Brahmaputra Basin',
        state: 'Assam',
        current: 82.5,
        danger: 82.0,
        warning: 81.2,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 15 L12 13 L22 10 L32 8 L42 5 L52 3',
        center: [26.95, 94.20],
        path: [
          [27.40, 94.40],
          [27.15, 94.30],
          [26.95, 94.20],
          [26.80, 93.95]
        ]
      },
      {
        id: 'beki',
        name: 'Manas & Beki River (Barpeta)',
        basin: 'Brahmaputra Basin',
        state: 'Assam',
        current: 45.3,
        danger: 45.1,
        warning: 44.5,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 14 L12 12 L22 10 L32 8 L42 6 L52 4',
        center: [26.32, 91.00],
        path: [
          [26.80, 91.00],
          [26.50, 91.00],
          [26.32, 91.00],
          [26.15, 90.90]
        ]
      }
    ],
    sectors: [
      {
        id: 'kamrup-guwahati',
        name: 'Kamrup / Guwahati Sector',
        block: 'Kamrup Metro & Rural',
        state: 'Assam',
        coords: [26.15, 91.60],
        zoom: 12,
        river: 'Brahmaputra River',
        basin: 'Brahmaputra Basin'
      },
      {
        id: 'palashbari-chaygaon',
        name: 'Palashbari / Chaygaon',
        block: 'Palashbari Circle, Kamrup',
        state: 'Assam',
        coords: [26.13, 91.50],
        zoom: 12,
        river: 'Brahmaputra River',
        basin: 'Brahmaputra Basin'
      },
      {
        id: 'majuli-island',
        name: 'Majuli River Island',
        block: 'Majuli Sub-Division, Assam',
        state: 'Assam',
        coords: [26.95, 94.20],
        zoom: 12,
        river: 'Subansiri & Brahmaputra',
        basin: 'Brahmaputra Basin'
      },
      {
        id: 'barpeta-lowlands',
        name: 'Barpeta Lowlands',
        block: 'Barpeta Circle, Assam',
        state: 'Assam',
        coords: [26.32, 91.00],
        zoom: 12,
        river: 'Manas & Beki River',
        basin: 'Brahmaputra Basin'
      },
      {
        id: 'dhemaji-north',
        name: 'Dhemaji North Plain',
        block: 'Dhemaji District, Assam',
        state: 'Assam',
        coords: [27.48, 94.58],
        zoom: 12,
        river: 'Jiabharali & Brahmaputra',
        basin: 'Brahmaputra Basin'
      },
      {
        id: 'goalpara-riverside',
        name: 'Goalpara Riverside Sector',
        block: 'Goalpara Circle, Assam',
        state: 'Assam',
        coords: [26.17, 90.62],
        zoom: 12,
        river: 'Brahmaputra River',
        basin: 'Brahmaputra Basin'
      }
    ]
  },

  'bg': {
    id: 'bg',
    stateCode: 'b',
    basinCode: 'g',
    stateName: 'Bihar',
    basinName: 'Ganga & Son Basin',
    shortName: 'Bihar (Ganga & Son Basin)',
    tagline: 'Middle Ganga River Flood Command',
    demoUser: {
      admin: 'ad3310bg',
      authority: 'au4120bg',
      godown: 'gd5280bg',
      ground: 'go6390bg',
      monitoring: 'mo7410bg'
    },
    rivers: [
      {
        id: 'ganga-patna',
        name: 'Ganga River (Gandhi Ghat)',
        basin: 'Ganga Basin',
        state: 'Bihar',
        current: 50.1,
        danger: 49.8,
        warning: 49.0,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 15 L12 13 L22 11 L32 9 L42 5 L52 3',
        center: [25.62, 85.15],
        path: [
          [25.68, 84.85],
          [25.63, 85.15],
          [25.55, 85.35],
          [25.40, 85.70]
        ]
      },
      {
        id: 'punpun',
        name: 'Punpun River (Sripalpur)',
        basin: 'Ganga Basin',
        state: 'Bihar',
        current: 53.4,
        danger: 53.0,
        warning: 52.2,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 14 L12 12 L22 10 L32 8 L42 6 L52 4',
        center: [25.52, 85.22],
        path: [
          [25.35, 85.05],
          [25.52, 85.22],
          [25.55, 85.30]
        ]
      },
      {
        id: 'son',
        name: 'Son River (Koelwar Bridge)',
        basin: 'Ganga Basin',
        state: 'Bihar',
        current: 51.8,
        danger: 52.0,
        warning: 51.2,
        unit: 'm',
        trend: 'Steady',
        barColor: '#f97316',
        spark: 'M2 11 L12 11 L22 10 L32 9 L42 8 L52 8',
        center: [25.62, 84.85],
        path: [
          [25.40, 84.75],
          [25.62, 84.85],
          [25.65, 84.90]
        ]
      }
    ],
    sectors: [
      {
        id: 'patna-danapur',
        name: 'Patna Danapur Ghat',
        block: 'Danapur Circle, Patna',
        state: 'Bihar',
        coords: [25.63, 85.04],
        zoom: 12,
        river: 'Ganga River',
        basin: 'Ganga & Son Basin'
      },
      {
        id: 'patna-digha',
        name: 'Patna Digha / Gandhi Ghat',
        block: 'Patna Sadar, Bihar',
        state: 'Bihar',
        coords: [25.63, 85.13],
        zoom: 12,
        river: 'Ganga River',
        basin: 'Ganga & Son Basin'
      },
      {
        id: 'fatuha-confluence',
        name: 'Fatuha Confluence Sector',
        block: 'Fatuha Block, Patna',
        state: 'Bihar',
        coords: [25.51, 85.31],
        zoom: 12,
        river: 'Punpun & Ganga Confluence',
        basin: 'Ganga & Son Basin'
      },
      {
        id: 'maner-riverbank',
        name: 'Maner Riverbank Sector',
        block: 'Maner Block, Patna',
        state: 'Bihar',
        coords: [25.64, 84.88],
        zoom: 12,
        river: 'Son & Ganga Confluence',
        basin: 'Ganga & Son Basin'
      },
      {
        id: 'mokama-tal',
        name: 'Mokama Tal Lowland',
        block: 'Mokama Circle, Patna',
        state: 'Bihar',
        coords: [25.39, 85.92],
        zoom: 12,
        river: 'Ganga River',
        basin: 'Ganga & Son Basin'
      },
      {
        id: 'bakhtiyarpur-plain',
        name: 'Bakhtiyarpur Flood Plain',
        block: 'Bakhtiyarpur Block, Patna',
        state: 'Bihar',
        coords: [25.46, 85.53],
        zoom: 12,
        river: 'Ganga River',
        basin: 'Ganga & Son Basin'
      }
    ]
  },

  'ug': {
    id: 'ug',
    stateCode: 'u',
    basinCode: 'g',
    stateName: 'Uttar Pradesh',
    basinName: 'Ganga & Yamuna Basin',
    shortName: 'UP (Ganga & Yamuna Basin)',
    tagline: 'Upper Ganga & Yamuna Doab Division',
    demoUser: {
      admin: 'ad4129ug',
      authority: 'au5291ug',
      godown: 'gd6312ug',
      ground: 'go7420ug',
      monitoring: 'mo8192ug'
    },
    rivers: [
      {
        id: 'ganga-varanasi',
        name: 'Ganga River (Dashashwamedh)',
        basin: 'Ganga Basin',
        state: 'Uttar Pradesh',
        current: 71.6,
        danger: 71.2,
        warning: 70.2,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 15 L12 13 L22 11 L32 9 L42 6 L52 3',
        center: [25.31, 83.00],
        path: [
          [25.25, 82.95],
          [25.31, 83.00],
          [25.35, 83.04]
        ]
      },
      {
        id: 'yamuna-prayagraj',
        name: 'Yamuna River (Naini Bridge)',
        basin: 'Ganga Basin',
        state: 'Uttar Pradesh',
        current: 84.9,
        danger: 84.7,
        warning: 83.9,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 14 L12 12 L22 10 L32 8 L42 6 L52 4',
        center: [25.43, 81.84],
        path: [
          [25.40, 81.75],
          [25.43, 81.84],
          [25.45, 81.90]
        ]
      },
      {
        id: 'rapti-gorakhpur',
        name: 'Rapti River (Birdghat)',
        basin: 'Ganga Basin',
        state: 'Uttar Pradesh',
        current: 75.3,
        danger: 74.9,
        warning: 74.0,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 16 L12 14 L22 11 L32 8 L42 5 L52 3',
        center: [26.76, 83.37],
        path: [
          [26.90, 83.30],
          [26.76, 83.37],
          [26.65, 83.45]
        ]
      }
    ],
    sectors: [
      {
        id: 'varanasi-ghats',
        name: 'Varanasi Ghats Sector',
        block: 'Varanasi Sadar, UP',
        state: 'Uttar Pradesh',
        coords: [25.31, 83.00],
        zoom: 12,
        river: 'Ganga River',
        basin: 'Ganga & Yamuna Basin'
      },
      {
        id: 'assi-ramnagar',
        name: 'Assi / Ramnagar Embankment',
        block: 'Ramnagar Circle, Varanasi',
        state: 'Uttar Pradesh',
        coords: [25.27, 83.02],
        zoom: 12,
        river: 'Ganga & Varuna River',
        basin: 'Ganga & Yamuna Basin'
      },
      {
        id: 'prayagraj-sangam',
        name: 'Prayagraj Sangam Sector',
        block: 'Prayagraj Sadar, UP',
        state: 'Uttar Pradesh',
        coords: [25.43, 81.88],
        zoom: 12,
        river: 'Ganga-Yamuna Confluence',
        basin: 'Ganga & Yamuna Basin'
      },
      {
        id: 'naini-yamuna',
        name: 'Naini Lowland Sector',
        block: 'Naini Circle, Prayagraj',
        state: 'Uttar Pradesh',
        coords: [25.38, 81.86],
        zoom: 12,
        river: 'Yamuna River',
        basin: 'Ganga & Yamuna Basin'
      },
      {
        id: 'gorakhpur-rapti',
        name: 'Gorakhpur Rapti Sector',
        block: 'Gorakhpur Sadar, UP',
        state: 'Uttar Pradesh',
        coords: [26.76, 83.37],
        zoom: 12,
        river: 'Rapti & Rohini River',
        basin: 'Ganga & Yamuna Basin'
      },
      {
        id: 'mirzapur-ganga',
        name: 'Mirzapur Embankment Sector',
        block: 'Mirzapur Sadar, UP',
        state: 'Uttar Pradesh',
        coords: [25.15, 82.57],
        zoom: 12,
        river: 'Ganga River',
        basin: 'Ganga & Yamuna Basin'
      }
    ]
  },

  'om': {
    id: 'om',
    stateCode: 'o',
    basinCode: 'm',
    stateName: 'Odisha',
    basinName: 'Mahanadi Basin',
    shortName: 'Odisha (Mahanadi Basin)',
    tagline: 'Mahanadi Delta & Coastal Flood Division',
    demoUser: {
      admin: 'ad5912om',
      authority: 'au6281om',
      godown: 'gd7190om',
      ground: 'go8310om',
      monitoring: 'mo9210om'
    },
    rivers: [
      {
        id: 'mahanadi-cuttack',
        name: 'Mahanadi River (Jobra Barrage)',
        basin: 'Mahanadi Basin',
        state: 'Odisha',
        current: 27.2,
        danger: 27.0,
        warning: 26.2,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 13 L12 12 L22 10 L32 9 L42 7 L52 4',
        center: [20.46, 85.88],
        path: [
          [20.55, 85.75],
          [20.46, 85.88],
          [20.40, 86.05]
        ]
      },
      {
        id: 'kathajodi',
        name: 'Kathajodi River (Naraj Gorge)',
        basin: 'Mahanadi Basin',
        state: 'Odisha',
        current: 26.6,
        danger: 26.5,
        warning: 25.8,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 14 L12 13 L22 11 L32 9 L42 6 L52 4',
        center: [20.44, 85.87],
        path: [
          [20.47, 85.80],
          [20.44, 85.87],
          [20.38, 86.02]
        ]
      },
      {
        id: 'birupa',
        name: 'Birupa River (Choudwar)',
        basin: 'Mahanadi Basin',
        state: 'Odisha',
        current: 24.5,
        danger: 24.8,
        warning: 24.0,
        unit: 'm',
        trend: 'Steady',
        barColor: '#f97316',
        spark: 'M2 10 L12 10 L22 10 L32 9 L42 8 L52 8',
        center: [20.52, 85.92],
        path: [
          [20.56, 85.85],
          [20.52, 85.92],
          [20.48, 86.10]
        ]
      }
    ],
    sectors: [
      {
        id: 'cuttack-sadar',
        name: 'Cuttack Sadar Sector',
        block: 'Cuttack Sadar, Odisha',
        state: 'Odisha',
        coords: [20.46, 85.88],
        zoom: 12,
        river: 'Mahanadi River',
        basin: 'Mahanadi Basin'
      },
      {
        id: 'jobra-barrage',
        name: 'Jobra Barrage Sector',
        block: 'Jobra Circle, Cuttack',
        state: 'Odisha',
        coords: [20.48, 85.90],
        zoom: 12,
        river: 'Mahanadi Barrage',
        basin: 'Mahanadi Basin'
      },
      {
        id: 'banki-circle',
        name: 'Banki Circle Sector',
        block: 'Banki Sub-Division, Cuttack',
        state: 'Odisha',
        coords: [20.38, 85.53],
        zoom: 12,
        river: 'Mahanadi River',
        basin: 'Mahanadi Basin'
      },
      {
        id: 'naraj-gorge',
        name: 'Naraj Delta Gorge',
        block: 'Naraj Circle, Cuttack',
        state: 'Odisha',
        coords: [20.47, 85.76],
        zoom: 12,
        river: 'Kathajodi & Mahanadi Bifurcation',
        basin: 'Mahanadi Basin'
      },
      {
        id: 'jagatsinghpur-delta',
        name: 'Jagatsinghpur Coastal Delta',
        block: 'Jagatsinghpur Circle, Odisha',
        state: 'Odisha',
        coords: [20.26, 86.17],
        zoom: 12,
        river: 'Mahanadi Lower Delta',
        basin: 'Mahanadi Basin'
      },
      {
        id: 'kendrapada-lowland',
        name: 'Kendrapada Flood Lowland',
        block: 'Kendrapada District, Odisha',
        state: 'Odisha',
        coords: [20.50, 86.42],
        zoom: 12,
        river: 'Birupa & Mahanadi Distributaries',
        basin: 'Mahanadi Basin'
      }
    ]
  },

  'mp': {
    id: 'mp',
    stateCode: 'm',
    basinCode: 'p',
    stateName: 'Maharashtra',
    basinName: 'Panchganga Basin',
    shortName: 'Maharashtra (Panchganga Basin)',
    tagline: 'Panchganga & Upper Krishna Command',
    demoUser: {
      admin: 'ad6481mp',
      authority: 'au7192mp',
      godown: 'gd8301mp',
      ground: 'go9120mp',
      monitoring: 'mo9931mp'
    },
    rivers: [
      {
        id: 'panchganga-kolhapur',
        name: 'Panchganga River (Kolhapur Ghat)',
        basin: 'Panchganga Basin',
        state: 'Maharashtra',
        current: 43.1,
        danger: 42.0,
        warning: 40.5,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 15 L12 13 L22 12 L32 8 L42 5 L52 3',
        center: [16.70, 74.24],
        path: [
          [16.72, 74.15],
          [16.70, 74.24],
          [16.65, 74.35],
          [16.60, 74.55]
        ]
      },
      {
        id: 'krishna-shirol',
        name: 'Krishna River (Narsobawadi)',
        basin: 'Krishna Basin',
        state: 'Maharashtra',
        current: 51.8,
        danger: 51.5,
        warning: 50.5,
        unit: 'm',
        trend: 'Rising',
        barColor: '#dc2626',
        spark: 'M2 13 L12 12 L22 11 L32 9 L42 6 L52 4',
        center: [16.73, 74.60],
        path: [
          [16.85, 74.55],
          [16.73, 74.60],
          [16.60, 74.65]
        ]
      },
      {
        id: 'bhogawati',
        name: 'Bhogawati River (Radhanagari)',
        basin: 'Panchganga Basin',
        state: 'Maharashtra',
        current: 38.6,
        danger: 39.0,
        warning: 38.0,
        unit: 'm',
        trend: 'Steady',
        barColor: '#f97316',
        spark: 'M2 10 L12 11 L22 10 L32 9 L42 9 L52 8',
        center: [16.58, 74.18],
        path: [
          [16.50, 74.10],
          [16.58, 74.18],
          [16.65, 74.22]
        ]
      }
    ],
    sectors: [
      {
        id: 'kolhapur-panchganga',
        name: 'Kolhapur City / Panchganga Ghat',
        block: 'Karveer Tehsil, Kolhapur',
        state: 'Maharashtra',
        coords: [16.70, 74.24],
        zoom: 12,
        river: 'Panchganga River',
        basin: 'Panchganga Basin'
      },
      {
        id: 'shirol-confluence',
        name: 'Shirol / Narsobawadi Sangam',
        block: 'Shirol Tehsil, Kolhapur',
        state: 'Maharashtra',
        coords: [16.74, 74.60],
        zoom: 12,
        river: 'Krishna & Panchganga Confluence',
        basin: 'Panchganga Basin'
      },
      {
        id: 'karveer-lowland',
        name: 'Karveer Rural Lowland',
        block: 'Karveer Circle, Kolhapur',
        state: 'Maharashtra',
        coords: [16.68, 74.19],
        zoom: 12,
        river: 'Panchganga & Bhogawati',
        basin: 'Panchganga Basin'
      },
      {
        id: 'hatkanangale-sector',
        name: 'Hatkanangale Industrial Belt',
        block: 'Hatkanangale Tehsil, Kolhapur',
        state: 'Maharashtra',
        coords: [16.75, 74.45],
        zoom: 12,
        river: 'Panchganga River',
        basin: 'Panchganga Basin'
      },
      {
        id: 'ichalkaranji-riverside',
        name: 'Ichalkaranji Textile Sector',
        block: 'Ichalkaranji Circle, Kolhapur',
        state: 'Maharashtra',
        coords: [16.69, 74.46],
        zoom: 12,
        river: 'Panchganga River',
        basin: 'Panchganga Basin'
      },
      {
        id: 'shiroli-embankment',
        name: 'Shiroli Embankment Sector',
        block: 'Hatkanangale, Kolhapur',
        state: 'Maharashtra',
        coords: [16.74, 74.28],
        zoom: 12,
        river: 'Panchganga River',
        basin: 'Panchganga Basin'
      }
    ]
  }
};

/**
 * Resolves the logged-in user's River Basin configuration from their User ID.
 * Parses strings formatted as `<role><id><state><basin>` (e.g. `ad1558bk` -> 'bk').
 */
export function resolveUserBasin(userId) {
  if (!userId || typeof userId !== 'string') {
    return USER_BASIN_REGISTRY['bk'];
  }

  const clean = userId.trim().toLowerCase();

  // 1. Direct basin key match
  if (USER_BASIN_REGISTRY[clean]) {
    return USER_BASIN_REGISTRY[clean];
  }

  // 2. Structured pattern: <role(2)><digits(1-6)><state(1)><basin(1)> e.g. ad1558bk
  const structuredMatch = clean.match(/^([a-z]{2})(\d{1,6})([a-z])([a-z])$/);
  if (structuredMatch) {
    const key = structuredMatch[3] + structuredMatch[4];
    if (USER_BASIN_REGISTRY[key]) {
      return USER_BASIN_REGISTRY[key];
    }
  }

  // 3. Trailing 2-letter basin key check
  if (clean.length >= 2) {
    const suffix = clean.slice(-2);
    if (USER_BASIN_REGISTRY[suffix]) {
      return USER_BASIN_REGISTRY[suffix];
    }
  }

  // 4. Legacy username alias support
  if (clean.includes('kamrup') || clean.includes('assam')) return USER_BASIN_REGISTRY['ab'];
  if (clean.includes('patna')) return USER_BASIN_REGISTRY['bg'];
  if (clean.includes('kosi') || clean.includes('purnia') || clean.includes('katihar')) return USER_BASIN_REGISTRY['bk'];
  if (clean.includes('varanasi') || clean.includes('prayagraj') || clean.includes('up')) return USER_BASIN_REGISTRY['ug'];
  if (clean.includes('cuttack') || clean.includes('odisha') || clean.includes('mahanadi')) return USER_BASIN_REGISTRY['om'];
  if (clean.includes('kolhapur') || clean.includes('panchganga')) return USER_BASIN_REGISTRY['mp'];

  // Default to Bihar Kosi Basin (ad1558bk)
  return USER_BASIN_REGISTRY['bk'];
}

/**
 * Combines all sectors across all basins (for internal fallback and pan-India map rendering)
 */
export const INDIA_DISTRICT_SECTORS = Object.values(USER_BASIN_REGISTRY).flatMap(b => b.sectors);

/**
 * Combines all rivers across all basins
 */
export const INDIA_RIVER_SYSTEMS = Object.values(USER_BASIN_REGISTRY).flatMap(b => b.rivers);

// Calculate Haversine distance in kilometers
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest river based on geographic coordinates (optionally scoped to a basin)
export function detectNearestRiver(lat, lng, basinKey) {
  const riverPool = (basinKey && USER_BASIN_REGISTRY[basinKey])
    ? USER_BASIN_REGISTRY[basinKey].rivers
    : INDIA_RIVER_SYSTEMS;

  let nearest = riverPool[0] || INDIA_RIVER_SYSTEMS[0];
  let minDistance = Infinity;

  riverPool.forEach(riv => {
    let dist = getDistanceKm(lat, lng, riv.center[0], riv.center[1]);
    if (riv.path) {
      riv.path.forEach(pt => {
        const d = getDistanceKm(lat, lng, pt[0], pt[1]);
        if (d < dist) dist = d;
      });
    }
    if (dist < minDistance) {
      minDistance = dist;
      nearest = riv;
    }
  });

  const isDanger = Number(nearest.current) >= Number(nearest.danger);
  const diff = (Number(nearest.current) - Number(nearest.danger)).toFixed(1);

  return {
    ...nearest,
    distanceKm: Math.round(minDistance),
    isDanger,
    diffText: isDanger ? `+${diff} m (ABOVE DANGER MARK)` : `${Math.abs(diff)} m (Below Danger Mark)`,
    statusLabel: isDanger ? 'CRITICAL BREACH' : 'NORMAL'
  };
}

// Resolve Rivers for an entire District/Sector
export function getRiversForDistrict(districtId, basinKey) {
  if (basinKey && USER_BASIN_REGISTRY[basinKey]) {
    return USER_BASIN_REGISTRY[basinKey].rivers;
  }

  const sector = INDIA_DISTRICT_SECTORS.find(s => s.id === districtId);
  if (!sector) return INDIA_RIVER_SYSTEMS.slice(0, 3);

  // Find basin that owns this sector
  const owningBasin = Object.values(USER_BASIN_REGISTRY).find(b => b.sectors.some(s => s.id === districtId));
  if (owningBasin) {
    return owningBasin.rivers;
  }

  const matched = INDIA_RIVER_SYSTEMS.filter(r =>
    r.basin === sector.basin ||
    r.state.includes(sector.state) ||
    getDistanceKm(sector.coords[0], sector.coords[1], r.center[0], r.center[1]) < 220
  );

  if (matched.length > 0) return matched;
  return [detectNearestRiver(sector.coords[0], sector.coords[1])];
}

// Reverse Geocoding with OpenStreetMap Nominatim + Instant Centroid Fallback
export async function autoDetectLocation(lat, lng, basinKey) {
  const nLat = Number(lat);
  const nLng = Number(lng);

  // 1. Detect nearest river scoped to this basin
  const riverInfo = detectNearestRiver(nLat, nLng, basinKey);

  // 2. Query Nominatim for real Indian Village, Block, Circle & District
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200);

    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${nLat}&lon=${nLng}&zoom=14&addressdetails=1`, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const village = addr.village || addr.suburb || addr.hamlet || addr.neighbourhood || addr.town || addr.city || addr.residential || 'Flood Sector';
        const block = addr.subdistrict || addr.county || addr.tehsil || addr.state_district || addr.district || 'District Circle';
        const district = addr.state_district || addr.district || addr.county || 'District';
        const state = addr.state || 'India';

        return {
          name: village,
          block: `${block}, ${district}`,
          district,
          state,
          river: riverInfo
        };
      }
    }
  } catch (e) {
    // Fallback if offline or rate-limited
  }

  // 3. Basin-aware fallback
  const sectorsPool = (basinKey && USER_BASIN_REGISTRY[basinKey])
    ? USER_BASIN_REGISTRY[basinKey].sectors
    : INDIA_DISTRICT_SECTORS;

  let closestSector = sectorsPool[0];
  let minD = Infinity;
  sectorsPool.forEach(sec => {
    const d = getDistanceKm(nLat, nLng, sec.coords[0], sec.coords[1]);
    if (d < minD) {
      minD = d;
      closestSector = sec;
    }
  });

  return {
    name: `Sector-${Math.round(nLat * 100) % 100} (${closestSector.name.split(' ')[0]})`,
    block: `${closestSector.block}`,
    district: closestSector.name.split(' ')[0],
    state: closestSector.state,
    river: riverInfo
  };
}
