import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let dbStatus = 'Connecting...';
  let isConnected = false;
  let collectionsList = [];
  let dbName = 'neerakshak_db';

  try {
    const db = await getDatabase(dbName);
    if (db) {
      isConnected = true;
      dbStatus = 'Connected (Clean & Ready)';
      const colls = await db.listCollections().toArray();
      collectionsList = await Promise.all(
        colls.map(async (c) => {
          const count = await db.collection(c.name).countDocuments();
          return { name: c.name, count };
        })
      );
    } else {
      dbStatus = 'Standby / Local Memory Mode';
    }
  } catch (err) {
    dbStatus = 'Notice: ' + err.message;
  }

  return (
    <main style={{ maxWidth: '960px', margin: '40px auto', padding: '24px' }}>
      <header style={{ borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isConnected ? '#10b981' : '#f59e0b' }} />
          <h1 style={{ margin: 0, fontSize: '26px', color: '#38bdf8' }}>NEERAKSHAK Next.js Engine</h1>
        </div>
        <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '14px' }}>
          Real-Time Next.js App Router Backend • MongoDB Engine (<code>neerakshak_db</code>)
        </p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', color: '#94a3b8' }}>Database Engine</h3>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: isConnected ? '#34d399' : '#fbbf24' }}>{dbStatus}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>Target: MongoDB 127.0.0.1:27017 / <strong>{dbName}</strong></div>
        </div>

        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', color: '#94a3b8' }}>Database Cleanliness</h3>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' }}>
            {collectionsList.length === 0 ? '100% Clean (Empty)' : `${collectionsList.length} Active Collections`}
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
            {collectionsList.length === 0 ? 'Zero fake records in MongoDB. Ready for real user entries.' : 'Tracking operational user entries.'}
          </div>
        </div>

        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '14px', textTransform: 'uppercase', color: '#94a3b8' }}>Seed Configuration</h3>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#a78bfa' }}>public/seed.js</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>All mock & drill records isolated strictly outside DB</div>
        </div>
      </section>

      <section style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b', marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#e2e8f0' }}>Ground Officer & Field Operations Engine</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#1e293b', padding: '14px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8' }}>API Endpoint</span>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#38bdf8', marginTop: '4px' }}>/api/ground-officer</div>
            <span style={{ fontSize: '11px', color: '#10b981' }}>● Live App Router</span>
          </div>
          <div style={{ background: '#1e293b', padding: '14px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8' }}>Physical Verification</span>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#a78bfa', marginTop: '4px' }}>deliveryverifications</div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Linked to Godown Gate-Pass</span>
          </div>
          <div style={{ background: '#1e293b', padding: '14px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8' }}>Field Situation Reports</span>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#34d399', marginTop: '4px' }}>fieldreports</div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Immutable Ground Audits</span>
          </div>
          <div style={{ background: '#1e293b', padding: '14px 16px', borderRadius: '8px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8' }}>Return Clearance</span>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f59e0b', marginTop: '4px' }}>clear-return</div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Unlocks Warehouse Intake</span>
          </div>
        </div>
      </section>

      <section style={{ background: '#0f172a', padding: '24px', borderRadius: '12px', border: '1px solid #1e293b' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#e2e8f0' }}>Live Collections Status in MongoDB (<code>neerakshak_db</code>)</h2>
        {collectionsList.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(56, 189, 248, 0.05)', border: '1px dashed #0284c7', borderRadius: '8px', color: '#38bdf8', fontSize: '14px' }}>
            ✓ <strong>MongoDB is 100% clean and fresh!</strong> No fake data exists. When you mark areas or allocate supplies, they will populate here in real-time.
          </div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1' }}>
            {collectionsList.map((c) => (
              <li key={c.name} style={{ margin: '8px 0' }}>
                <code>{c.name}</code>: <strong>{c.count}</strong> records
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
