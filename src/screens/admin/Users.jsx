import { useApp } from '../../App';
import { useFetch } from '../../hooks/useFetch';
import { listUsers, disableUser, enableUser } from '../../api/users';
import { Loading, ErrorState } from '../../components/States';

const ROLE_CHIPS = ['All', 'Student', 'Lecturer', 'Staff', 'Admin'];
const TIER_CHIPS = ['All', 'T1', 'T2', 'T3', 'T4', 'T5'];
const SORT_OPTS = ['Name', 'Points', 'Tier'];

const TIER_ORDER = { 'Tier 1': 1, 'Tier 2': 2, 'Tier 3': 3, 'Tier 4': 4, 'Tier 5': 5, '—': 0 };

export default function Users() {
  const { userFilter, setUserFilter, tierFilter, setTierFilter, sortOpt, setSortOpt, setAdminModal, showToast, refresh } = useApp();
  const { data, loading, error, reload } = useFetch(() => listUsers(), []);

  async function handleToggleActive(u) {
    try {
      if (u.isActive) { await disableUser(u.id); showToast(`${u.name} disabled`); }
      else { await enableUser(u.id); showToast(`${u.name} enabled`); }
      refresh();
    } catch (e) { showToast(e?.response?.data?.message ?? 'Update failed'); }
  }

  function handleEdit(u) {
    setAdminModal({ open: true, mode: 'editUser', editUser: u, uf: { uname: u.name, uemail: u.email, ubatch: u.group || '', uphone: u.phone || '', urole: u.roleKey }, copiesBook: null });
  }

  function handleAddUser() {
    setAdminModal({ open: true, mode: 'addUser', editUser: null, uf: { uname: '', uemail: '', ubatch: '', uphone: '', urole: 'student' }, copiesBook: null });
  }

  if (loading) return <Loading label="Loading users…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const usersList = data?.items || [];
  const tierMap = { 'T1': 'Tier 1', 'T2': 'Tier 2', 'T3': 'Tier 3', 'T4': 'Tier 4', 'T5': 'Tier 5' };

  let filtered = usersList;
  if (userFilter !== 'All') filtered = filtered.filter(u => u.role === userFilter);
  if (tierFilter !== 'All') filtered = filtered.filter(u => u.tier === tierMap[tierFilter]);

  filtered = [...filtered].sort((a, b) => {
    if (sortOpt === 'Name') return a.name.localeCompare(b.name);
    if (sortOpt === 'Points') return b.pts - a.pts;
    if (sortOpt === 'Tier') return (TIER_ORDER[b.tier] || 0) - (TIER_ORDER[a.tier] || 0);
    return 0;
  });

  return (
    <div style={{ padding: '30px 30px 40px', fontFamily: "'Public Sans', sans-serif", minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontFamily: "'Spectral', serif", fontSize: 24, fontWeight: 700, color: '#1a1b2e', margin: '0 0 4px' }}>Users</h1>
          <p style={{ fontSize: 13, color: '#7c7e93', margin: 0 }}>{usersList.length} members registered</p>
        </div>
        <button
          onClick={handleAddUser}
          style={{
            background: '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: 9,
            padding: '10px 18px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: 0.2,
          }}>
          + Add user
        </button>
      </div>

      {/* Filter row 1: roles */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {ROLE_CHIPS.map(r => (
          <button
            key={r}
            onClick={() => setUserFilter(r)}
            style={{
              background: userFilter === r ? '#16a34a' : '#fff',
              color: userFilter === r ? '#fff' : '#3a3b4e',
              border: `1px solid ${userFilter === r ? '#16a34a' : '#e7e7ef'}`,
              borderRadius: 20,
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
            {r}
          </button>
        ))}
      </div>

      {/* Filter row 2: tiers + sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {TIER_CHIPS.map(t => (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            style={{
              background: tierFilter === t ? '#0c2a1a' : '#fff',
              color: tierFilter === t ? '#fff' : '#3a3b4e',
              border: `1px solid ${tierFilter === t ? '#0c2a1a' : '#e7e7ef'}`,
              borderRadius: 20,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
            {t}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#7c7e93' }}>Sort:</span>
          {SORT_OPTS.map(s => (
            <button
              key={s}
              onClick={() => setSortOpt(s)}
              style={{
                background: sortOpt === s ? '#f0f0f6' : 'transparent',
                color: sortOpt === s ? '#1a1b2e' : '#7c7e93',
                border: `1px solid ${sortOpt === s ? '#d0d0e0' : 'transparent'}`,
                borderRadius: 7,
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: sortOpt === s ? 700 : 500,
                cursor: 'pointer',
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #e7e7ef', borderRadius: 14, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
          padding: '10px 20px',
          background: '#f8f8fc',
          borderBottom: '1px solid #e7e7ef',
        }}>
          {['Member', 'Role', 'Tier', 'Points', 'Status', 'Actions'].map(col => (
            <span key={col} style={{ fontSize: 11, fontWeight: 700, color: '#9b9db2', textTransform: 'uppercase', letterSpacing: 0.5 }}>{col}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9b9db2', fontSize: 13 }}>No users match these filters.</div>
        )}
        {filtered.map((u, i) => (
          <div
            key={u.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px',
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid #f0f0f6' : 'none',
              alignItems: 'center',
            }}>

            {/* Member */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: u.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}>
                {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1b2e' }}>{u.name}</div>
                <div style={{ fontSize: 11, color: '#9b9db2' }}>{u.email}</div>
              </div>
            </div>

            {/* Role */}
            <span style={{ fontSize: 12, color: '#3a3b4e' }}>{u.role}</span>

            {/* Tier */}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#3a3b4e' }}>{u.tier}</span>

            {/* Points */}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: '#16a34a' }}>
              {u.pts > 0 ? u.pts.toLocaleString() : '—'}
            </span>

            {/* Status */}
            <span style={{
              display: 'inline-block',
              background: u.status === 'Active' ? '#dcfce7' : '#fee2e2',
              color: u.status === 'Active' ? '#16a34a' : '#dc2626',
              borderRadius: 20,
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 700,
              width: 'fit-content',
            }}>
              {u.status}
            </span>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleEdit(u)}
                title="Edit user"
                style={{
                  background: '#f0f0f6',
                  border: 'none',
                  borderRadius: 7,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3a3b4e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => handleToggleActive(u)}
                title={u.isActive ? 'Disable account' : 'Enable account'}
                style={{
                  background: u.isActive ? '#fee2e2' : '#dcfce7',
                  border: 'none',
                  borderRadius: 7,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={u.isActive ? '#dc2626' : '#16a34a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {u.isActive
                    ? <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
                    : <path d="M5 12l4 4L19 6" />}
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
