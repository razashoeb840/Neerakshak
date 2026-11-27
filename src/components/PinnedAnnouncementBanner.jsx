import { useState, useEffect } from 'react';

export default function PinnedAnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [isDismissed, setIsDismissed] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          setAnnouncements(json.data.filter(a => a.pinned));
        }
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUnpin = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`/api/announcements?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      if (typeof window !== 'undefined' && window.showToast) {
        window.showToast('Announcement unpinned from all portals', 'info');
      }
    } catch (err) {
      console.error('Failed to unpin announcement:', err);
    }
  };

  if (!announcements.length || isDismissed) return null;

  const current = announcements[0];
  const isEmergency = current.severity === 'EMERGENCY';
  const isMonitoringPortal = typeof window !== 'undefined' && window.location.pathname.includes('/monitoring');

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: isEmergency
          ? 'linear-gradient(90deg, #991b1b 0%, #b91c1c 45%, #7f1d1d 100%)'
          : 'linear-gradient(90deg, #075985 0%, #0284c7 50%, #0369a1 100%)',
        color: '#ffffff',
        padding: '9px 18px',
        boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: "'Poppins', sans-serif",
        fontSize: '12.5px',
        borderBottom: '2px solid rgba(255,255,255,0.3)',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
        <span
          style={{
            background: isEmergency ? '#dc2626' : '#0369a1',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.6px',
            padding: '3px 8px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: '0 0 10px rgba(255,255,255,0.2)'
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block',
              boxShadow: '0 0 6px #22c55e'
            }}
          ></span>
          🚨 STATE DEOC PINNED DIRECTIVE
        </span>

        <span style={{ fontWeight: 700, color: '#fef08a' }}>{current.title}:</span>

        <span style={{ color: '#f8fafc', lineHeight: 1.4 }}>{current.message}</span>

        <span
          style={{
            fontSize: '10px',
            background: 'rgba(255,255,255,0.18)',
            padding: '2px 7px',
            borderRadius: '999px',
            color: '#e0f2fe'
          }}
        >
          Pinned to All 5 Portals & Public
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isMonitoringPortal && (
          <button
            onClick={(e) => handleUnpin(current.id, e)}
            style={{
              background: '#ffffff',
              color: '#dc2626',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '5px',
              fontWeight: 700,
              fontSize: '11px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
            title="Unpin this announcement across all portals"
          >
            <i className="fas fa-thumbtack-slash"></i> Unpin Everywhere
          </button>
        )}

        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '15px',
            cursor: 'pointer',
            padding: '2px 6px'
          }}
          title="Hide banner in this tab"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
}
