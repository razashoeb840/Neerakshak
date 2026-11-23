// NEERAKSHAK Pan-India River, District & Telemetry Registry
// Supports whole India flood monitoring, automated river detection & reverse geocoding

export const INDIA_DISTRICT_SECTORS = [
  // --- ASSAM & NORTHEAST ---
  { id: 'kamrup', name: 'Kamrup, Assam', state: 'Assam', coords: [26.15, 91.60], zoom: 11, river: 'Brahmaputra River', basin: 'Brahmaputra Basin' },
  { id: 'majuli', name: 'Majuli Island, Assam', state: 'Assam', coords: [26.95, 94.20], zoom: 11, river: 'Subansiri & Brahmaputra', basin: 'Brahmaputra Basin' },
  { id: 'barpeta', name: 'Barpeta, Assam', state: 'Assam', coords: [26.32, 91.00], zoom: 11, river: 'Manas & Beki River', basin: 'Brahmaputra Basin' },
  { id: 'dhemaji', name: 'Dhemaji, Assam', state: 'Assam', coords: [27.48, 94.58], zoom: 11, river: 'Jiabharali River', basin: 'Brahmaputra Basin' },
  { id: 'cachar', name: 'Silchar (Cachar), Assam', state: 'Assam', coords: [24.83, 92.79], zoom: 11, river: 'Barak River', basin: 'Barak Basin' },

  // --- BIHAR ---
  { id: 'patna', name: 'Patna, Bihar', state: 'Bihar', coords: [25.60, 85.13], zoom: 11, river: 'Ganga River', basin: 'Ganga Basin' },
  { id: 'katihar', name: 'Katihar / Purnia, Bihar', state: 'Bihar', coords: [25.54, 87.57], zoom: 11, river: 'Kosi River', basin: 'Kosi Basin' },
  { id: 'muzaffarpur', name: 'Muzaffarpur, Bihar', state: 'Bihar', coords: [26.12, 85.39], zoom: 11, river: 'Burhi Gandak River', basin: 'Ganga Basin' },

  // --- UTTAR PRADESH ---
  { id: 'varanasi', name: 'Varanasi, Uttar Pradesh', state: 'Uttar Pradesh', coords: [25.31, 83.00], zoom: 11, river: 'Ganga River', basin: 'Ganga Basin' },
  { id: 'prayagraj', name: 'Prayagraj (Sangam), UP', state: 'Uttar Pradesh', coords: [25.43, 81.84], zoom: 11, river: 'Ganga-Yamuna Confluence', basin: 'Ganga Basin' },
  { id: 'gorakhpur', name: 'Gorakhpur, Uttar Pradesh', state: 'Uttar Pradesh', coords: [26.76, 83.37], zoom: 11, river: 'Rapti & Rohini River', basin: 'Ganga Basin' },

  // --- ODISHA & WEST BENGAL ---
  { id: 'cuttack', name: 'Cuttack, Odisha', state: 'Odisha', coords: [20.46, 85.88], zoom: 11, river: 'Mahanadi River', basin: 'Mahanadi Basin' },
  { id: 'balasore', name: 'Balasore, Odisha', state: 'Odisha', coords: [21.49, 86.93], zoom: 11, river: 'Subarnarekha River', basin: 'Subarnarekha Basin' },
  { id: 'malda', name: 'Malda, West Bengal', state: 'West Bengal', coords: [25.01, 88.14], zoom: 11, river: 'Mahananda & Ganga', basin: 'Ganga Basin' },

  // --- SOUTH & WEST INDIA ---
  { id: 'wayanad', name: 'Wayanad, Kerala', state: 'Kerala', coords: [11.68, 76.13], zoom: 11, river: 'Kabini & Chaliyar River', basin: 'Cauvery / West Flowing' },
  { id: 'kolhapur', name: 'Kolhapur, Maharashtra', state: 'Maharashtra', coords: [16.70, 74.24], zoom: 11, river: 'Panchganga River', basin: 'Krishna Basin' },
  { id: 'surat', name: 'Surat / Bharuch, Gujarat', state: 'Gujarat', coords: [21.17, 72.83], zoom: 11, river: 'Tapti & Narmada River', basin: 'Tapti / Narmada Basin' },
  { id: 'vijayawada', name: 'Vijayawada, Andhra Pradesh', state: 'Andhra Pradesh', coords: [16.50, 80.64], zoom: 11, river: 'Krishna River', basin: 'Krishna Basin' },
  { id: 'srinagar', name: 'Srinagar, Jammu & Kashmir', state: 'Jammu & Kashmir', coords: [34.08, 74.79], zoom: 11, river: 'Jhelum River', basin: 'Indus Basin' },

  // --- ALL INDIA ---
  { id: 'all-india', name: 'Pan-India Flood Command (All States)', state: 'India', coords: [22.8, 80.0], zoom: 5, river: 'National River Telemetry', basin: 'National Hydrology' }
];

// Major Indian River Systems with geographic coordinate traces & Central Water Commission (CWC) Danger Marks
export const INDIA_RIVER_SYSTEMS = [
  {
    id: 'brahmaputra',
    name: 'Brahmaputra River',
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
    id: 'barak',
    name: 'Barak River',
    basin: 'Barak Basin',
    state: 'Assam',
    current: 19.8,
    danger: 19.5,
    warning: 19.0,
    unit: 'm',
    trend: 'Rising',
    barColor: '#dc2626',
    spark: 'M2 15 L12 14 L22 10 L32 8 L42 6 L52 4',
    center: [24.83, 92.79],
    path: [
      [25.05, 93.10],
      [24.90, 92.90],
      [24.82, 92.78],
      [24.85, 92.50]
    ]
  },
  {
    id: 'ganga',
    name: 'Ganga River',
    basin: 'Ganga Basin',
    state: 'Bihar / UP / WB',
    current: 50.1,
    danger: 49.8,
    warning: 49.0,
    unit: 'm',
    trend: 'Rising',
    barColor: '#dc2626',
    spark: 'M2 15 L12 13 L22 11 L32 9 L42 5 L52 3',
    center: [25.50, 84.50],
    path: [
      [25.43, 81.84], // Prayagraj
      [25.31, 83.00], // Varanasi
      [25.57, 83.98], // Buxar
      [25.62, 85.15], // Patna
      [25.35, 86.50], // Munger
      [25.25, 87.00], // Bhagalpur
      [25.01, 88.10]  // Farakka / Malda
    ]
  },
  {
    id: 'kosi',
    name: 'Kosi River',
    basin: 'Ganga / Kosi Basin',
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
      [26.50, 86.90],
      [26.00, 87.10],
      [25.54, 87.35],
      [25.35, 87.25]
    ]
  },
  {
    id: 'yamuna',
    name: 'Yamuna River',
    basin: 'Ganga Basin',
    state: 'Delhi / UP',
    current: 205.5,
    danger: 205.3,
    warning: 204.5,
    unit: 'm',
    trend: 'Rising',
    barColor: '#dc2626',
    spark: 'M2 14 L12 12 L22 10 L32 8 L42 6 L52 4',
    center: [28.60, 77.25],
    path: [
      [28.70, 77.20],
      [28.61, 77.24],
      [27.50, 77.70],
      [27.18, 78.02],
      [25.43, 81.84]
    ]
  },
  {
    id: 'mahanadi',
    name: 'Mahanadi River',
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
      [21.50, 83.90],
      [20.80, 84.80],
      [20.46, 85.88],
      [20.30, 86.60]
    ]
  },
  {
    id: 'panchganga',
    name: 'Panchganga River',
    basin: 'Krishna Basin',
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
    id: 'godavari',
    name: 'Godavari River',
    basin: 'Godavari Basin',
    state: 'Maharashtra / AP',
    current: 14.2,
    danger: 13.8,
    warning: 13.0,
    unit: 'm',
    trend: 'Rising',
    barColor: '#dc2626',
    spark: 'M2 12 L12 11 L22 10 L32 8 L42 6 L52 5',
    center: [17.00, 81.80],
    path: [
      [19.00, 75.50],
      [18.50, 79.50],
      [17.50, 81.20],
      [16.90, 82.10]
    ]
  },
  {
    id: 'krishna',
    name: 'Krishna River',
    basin: 'Krishna Basin',
    state: 'AP / Karnataka',
    current: 11.5,
    danger: 11.2,
    warning: 10.5,
    unit: 'm',
    trend: 'Steady',
    barColor: '#f97316',
    spark: 'M2 10 L12 11 L22 9 L32 10 L42 8 L52 8',
    center: [16.50, 80.64],
    path: [
      [16.30, 75.80],
      [16.10, 77.20],
      [16.50, 80.64],
      [15.80, 80.85]
    ]
  },
  {
    id: 'jhelum',
    name: 'Jhelum River',
    basin: 'Indus Basin',
    state: 'Jammu & Kashmir',
    current: 6.2,
    danger: 5.8,
    warning: 5.2,
    unit: 'm',
    trend: 'Rising',
    barColor: '#dc2626',
    spark: 'M2 13 L12 11 L22 10 L32 7 L42 5 L52 3',
    center: [34.08, 74.79],
    path: [
      [33.72, 75.15],
      [34.08, 74.79],
      [34.30, 74.45]
    ]
  }
];

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

// Find nearest river based on geographic coordinates
export function detectNearestRiver(lat, lng) {
  let nearest = INDIA_RIVER_SYSTEMS[0];
  let minDistance = Infinity;

  INDIA_RIVER_SYSTEMS.forEach(riv => {
    // Check distance to center or any point along path
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
export function getRiversForDistrict(districtId) {
  const sector = INDIA_DISTRICT_SECTORS.find(s => s.id === districtId);
  if (!sector) return INDIA_RIVER_SYSTEMS.slice(0, 3);

  const matched = INDIA_RIVER_SYSTEMS.filter(r =>
    r.basin === sector.basin ||
    r.state.includes(sector.state) ||
    getDistanceKm(sector.coords[0], sector.coords[1], r.center[0], r.center[1]) < 220
  );

  if (matched.length > 0) return matched;
  return [detectNearestRiver(sector.coords[0], sector.coords[1])];
}

// Reverse Geocoding with OpenStreetMap Nominatim + Instant Indian Centroid Fallback
export async function autoDetectLocation(lat, lng) {
  const nLat = Number(lat);
  const nLng = Number(lng);

  // 1. First find nearest river
  const riverInfo = detectNearestRiver(nLat, nLng);

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

  // 3. Smart Offline Fallback using nearest Indian sector
  let closestSector = INDIA_DISTRICT_SECTORS[0];
  let minD = Infinity;
  INDIA_DISTRICT_SECTORS.forEach(sec => {
    if (sec.id === 'all-india') return;
    const d = getDistanceKm(nLat, nLng, sec.coords[0], sec.coords[1]);
    if (d < minD) {
      minD = d;
      closestSector = sec;
    }
  });

  return {
    name: `Sector-${Math.round(nLat * 100) % 100} (${closestSector.name.split(',')[0]})`,
    block: `${closestSector.name.split(',')[0]} Circle, ${closestSector.state}`,
    district: closestSector.name.split(',')[0],
    state: closestSector.state,
    river: riverInfo
  };
}
