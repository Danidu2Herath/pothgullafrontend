import { useApp } from '../../App';
import { useFetch } from '../../hooks/useFetch';
import { listBooks, listDevices, listRooms, setDeviceMaintenance, setRoomMaintenance } from '../../api/catalogue';
import { Loading, ErrorState } from '../../components/States';

function SvgIcon({ path, color, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path.split('M').filter(Boolean).map((d, i) => <path key={i} d={'M' + d} />)}
    </svg>
  );
}

function statusMeta(item) {
  if (item.type === 'book') {
    return item.available > 0
      ? { label: 'Available', col: '#16a34a', bg: '#dcfce7', key: 'available' }
      : { label: 'All on loan', col: '#3b82f6', bg: '#dbeafe', key: 'onloan' };
  }
  const s = item.raw?.status || (item.available > 0 ? 'AVAILABLE' : 'BORROWED');
  return {
    AVAILABLE: { label: 'Available', col: '#16a34a', bg: '#dcfce7', key: 'available' },
    BORROWED: { label: 'On loan', col: '#3b82f6', bg: '#dbeafe', key: 'onloan' },
    UNDER_MAINTENANCE: { label: 'Maintenance', col: '#d97706', bg: '#fef2e2', key: 'maintenance' },
    RETIRED: { label: 'Retired', col: '#ef4444', bg: '#fee2e2', key: 'retired' },
  }[s] || { label: s, col: '#7c7e93', bg: '#f3f3f8', key: 'other' };
}

async function loadAll() {
  const [books, devices, rooms] = await Promise.all([listBooks({ limit: 100 }), listDevices({ limit: 100 }), listRooms()]);
  return [...books.items, ...devices.items, ...rooms.items];
}

export default function ManageResources() {
  const { setStaffModal, showToast, refresh } = useApp();
  const { data, loading, error, reload } = useFetch(() => loadAll(), []);

  if (loading) return <Loading label="Loading resources…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  const list = data || [];

  const counts = [
    { value: list.length, label: 'Total resources', col: '#16a34a', bg: '#dcfce7' },
    { value: list.filter((r) => r.available > 0).length, label: 'Available now', col: '#059669', bg: '#d7f8e9' },
    { value: list.filter((r) => r.type === 'book').length, label: 'Book titles', col: '#3b82f6', bg: '#dbeafe' },
    { value: list.filter((r) => r.raw?.status === 'UNDER_MAINTENANCE').length, label: 'Maintenance', col: '#f59e0b', bg: '#fef2e2' },
  ];

  async function toggleMaintenance(item) {
    if (item.type === 'book') { showToast('Books are managed at copy level'); return; }
    const under = item.raw?.status !== 'UNDER_MAINTENANCE';
    try {
      if (item.type === 'device') await setDeviceMaintenance(item.id, under);
      else await setRoomMaintenance(item.id, under);
      showToast(under ? 'Marked under maintenance' : 'Marked available');
      refresh();
    } catch (e) { showToast(e?.response?.data?.message ?? 'Update failed'); }
  }

  return (
    <div style={{ padding: '30px 30px 40px', fontFamily: "'Public Sans', sans-serif", minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <p style={{ fontSize: 12, color: '#7c7e93', margin: '0 0 3px' }}>Staff · Resources</p>
          <h1 style={{ fontFamily: "'Spectral', serif", fontSize: 26, fontWeight: 600, color: '#1a1b2e', margin: 0 }}>Manage resources</h1>
        </div>
        <button
          onClick={() => setStaffModal({ open: true, type: 'book', rf: { rtitle: '', rauthor: '', rcat: '', rcopies: 1, rtier: 1, rstatus: 'available' } })}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(22,163,74,.28)' }}>
          <SvgIcon path="M12 5v14M5 12h14" color="#fff" size={15} />
          Add resource
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 26, flexWrap: 'wrap' }}>
        {counts.map((stat, i) => (
          <div key={i} style={{ background: stat.bg, border: `1px solid ${stat.col}40`, borderRadius: 20, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, fontWeight: 800, color: stat.col }}>{stat.value}</span>
            <span style={{ fontSize: 12, color: stat.col, fontWeight: 500 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e7e7ef', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1.4fr', padding: '12px 20px', background: '#f8f8fc', borderBottom: '1px solid #e7e7ef' }}>
          {['Resource', 'Type', 'Available', 'Status'].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#7c7e93', textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</div>
          ))}
        </div>

        {list.map((resource, i) => {
          const meta = statusMeta(resource);
          return (
            <div key={resource.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1.4fr', padding: '14px 20px', borderBottom: i < list.length - 1 ? '1px solid #f3f3f8' : 'none', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{ width: 38, height: 46, background: resource.color, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SvgIcon path={resource.iconPath} color="rgba(255,255,255,0.9)" size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1b2e', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resource.title}</div>
                  <div style={{ fontSize: 11, color: '#7c7e93', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resource.author}</div>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: '#4b4d63', background: '#f3f3f8', borderRadius: 20, padding: '3px 9px', fontWeight: 500, textTransform: 'capitalize' }}>{resource.type}</span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: '#1a1b2e' }}>
                {resource.type === 'book' ? `${resource.available}/${resource.copies}` : resource.available}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: meta.col, background: meta.bg, borderRadius: 20, padding: '4px 10px' }}>{meta.label}</span>
                {resource.type !== 'book' && (
                  <button onClick={() => toggleMaintenance(resource)} title="Toggle maintenance" style={{ background: 'none', border: '1px solid #e7e7ef', borderRadius: 7, padding: '4px 8px', fontSize: 11, color: '#7c7e93', cursor: 'pointer', fontWeight: 600 }}>
                    {resource.raw?.status === 'UNDER_MAINTENANCE' ? 'Reopen' : 'Maintain'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
