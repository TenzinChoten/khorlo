import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, DollarSign, Clock, Camera, PlayCircle, AtSign, Music, Filter, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchApi, getMediaUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_NICHES = ['Tech', 'Beauty', 'Fashion', 'Fitness', 'Gaming', 'Lifestyle', 'Travel', 'Food'];
// [Reason] Use the same niche/format names stored by campaign creation, not invented labels
const AVAILABLE_FORMATS = ['Short-form Video', 'Long-form Video', 'Photo', 'Carousel', 'Story', 'Live Stream', 'Written Article', 'Audio / Podcast'];

const COMPENSATION_OPTIONS = [
  { value: 'PAID', label: 'Paid' },
  { value: 'FREE_PRODUCT', label: 'Free product' },
  { value: 'PAID_AND_PRODUCT', label: 'Paid + product' },
];

const LOCATION_OPTIONS = [
  { value: 'ONLINE', label: 'Remote' },
  { value: 'OFFLINE', label: 'On-site' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const DEADLINE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'soon', label: 'Ending soon' },
  { value: '7', label: 'Within 7 days' },
  { value: '30', label: 'Within 30 days' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'deadline', label: 'Deadline soonest' },
  { value: 'budget_desc', label: 'Highest compensation' },
];

const csvToList = (value) => (value ? value.split(',').map((item) => item.trim()).filter(Boolean) : []);

const getPlatformIcon = (platform) => {
  const p = (platform || '').toLowerCase();
  if (p.includes('photo') || p.includes('carousel') || p.includes('story')) return <Camera size={16} />;
  if (p.includes('long-form') || p.includes('live')) return <PlayCircle size={16} />;
  if (p.includes('short-form') || p.includes('audio') || p.includes('podcast')) return <Music size={16} />;
  return <AtSign size={16} />;
};

const FilterDropdown = ({ id, label, openFilter, setOpenFilter, children, count }) => {
  const isOpen = openFilter === id;
  return (
    <div className="campaign-filter-dropdown" style={{ position: 'relative' }}>
      <button
        type="button"
        className="campaign-filter-trigger"
        onClick={() => setOpenFilter(isOpen ? null : id)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 0.9rem',
          background: isOpen || count ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isOpen || count ? 'var(--accent)' : 'var(--glass-border)'}`,
          color: 'white',
          borderRadius: '10px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
        {count > 0 && (
          <span style={{ background: 'var(--accent)', borderRadius: '9999px', fontSize: '0.75rem', padding: '0 0.4rem' }}>{count}</span>
        )}
        <ChevronDown size={14} />
      </button>
      {isOpen && (
        <div
          className="glass-panel campaign-filter-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            minWidth: '220px',
            maxHeight: '280px',
            overflowY: 'auto',
            padding: '0.75rem',
            zIndex: 20,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const SearchCampaigns = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [openFilter, setOpenFilter] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const filtersRef = useRef(null);

  const searchFromUrl = searchParams.get('search') || '';
  const niches = csvToList(searchParams.get('niches'));
  const formats = csvToList(searchParams.get('formats'));
  const compensationType = searchParams.get('compensationType') || '';
  const minBudget = searchParams.get('minBudget') || '';
  const locationType = searchParams.get('locationType') || '';
  const city = searchParams.get('city') || '';
  const deadline = searchParams.get('deadline') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [searchInput, setSearchInput] = useState(searchFromUrl);
  const [cityInput, setCityInput] = useState(city);
  const [minBudgetInput, setMinBudgetInput] = useState(minBudget);

  useEffect(() => { setSearchInput(searchFromUrl); }, [searchFromUrl]);
  useEffect(() => { setCityInput(city); }, [city]);
  useEffect(() => { setMinBudgetInput(minBudget); }, [minBudget]);

  // [Reason] Keep filters in the query string so refresh/share/back-forward preserve discovery state
  const updateParams = (updates, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        next.delete(key);
      } else {
        next.set(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });
    if (resetPage) next.delete('page');
    if ((next.get('sort') || 'newest') === 'newest') next.delete('sort');
    setSearchParams(next, { replace: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchFromUrl) updateParams({ search: searchInput });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (searchFromUrl) params.set('search', searchFromUrl);
    if (niches.length) params.set('niches', niches.join(','));
    if (formats.length) params.set('formats', formats.join(','));
    if (compensationType) params.set('compensationType', compensationType);
    if (minBudget) params.set('minBudget', minBudget);
    if (locationType) params.set('locationType', locationType);
    if (city) params.set('city', city);
    if (deadline) params.set('deadline', deadline);
    params.set('sort', sort);
    params.set('page', String(page));
    params.set('limit', '12');
    return params.toString();
  }, [searchFromUrl, niches, formats, compensationType, minBudget, locationType, city, deadline, sort, page]);

  useEffect(() => {
    if (user?.role === 'INFLUENCER') {
      fetchApi('/applications/me')
        .then(res => setMyApplications(res.applications || []))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchApi(`/campaigns?${queryString}`)
      .then((res) => {
        if (cancelled) return;
        setCampaigns(res.campaigns || res.items || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setCampaigns([]);
        setTotalPages(1);
        setTotal(0);
        setError(err.message || 'Failed to load campaigns');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [queryString]);

  const toggleListValue = (key, list, value) => {
    const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
    updateParams({ [key]: next });
  };

  const activeChips = [
    ...niches.map((name) => ({ key: `niche-${name}`, label: name, onRemove: () => toggleListValue('niches', niches, name) })),
    ...formats.map((name) => ({ key: `format-${name}`, label: name, onRemove: () => toggleListValue('formats', formats, name) })),
    ...(compensationType ? [{ key: 'compensation', label: COMPENSATION_OPTIONS.find((o) => o.value === compensationType)?.label || compensationType, onRemove: () => updateParams({ compensationType: '' }) }] : []),
    ...(minBudget ? [{ key: 'minBudget', label: `Min ${minBudget}`, onRemove: () => updateParams({ minBudget: '' }) }] : []),
    ...(locationType ? [{ key: 'location', label: LOCATION_OPTIONS.find((o) => o.value === locationType)?.label || locationType, onRemove: () => updateParams({ locationType: '' }) }] : []),
    ...(city ? [{ key: 'city', label: city, onRemove: () => updateParams({ city: '' }) }] : []),
    ...(deadline ? [{ key: 'deadline', label: DEADLINE_OPTIONS.find((o) => o.value === deadline)?.label || deadline, onRemove: () => updateParams({ deadline: '' }) }] : []),
  ];

  const hasFilters = activeChips.length > 0 || !!searchFromUrl;
  const filterCount = activeChips.length + (searchFromUrl ? 1 : 0);

  const formatBudget = (camp) => {
    if (!camp.budget) return camp.compensationType === 'FREE_PRODUCT' ? 'Free Product' : 'Unpaid';
    return `${camp.currency || 'USD'} ${camp.budget.toLocaleString()}`;
  };

  const formatDeadline = (date) => {
    if (!date) return 'Open ended';
    const diff = Math.ceil((new Date(date) - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Closed';
    if (diff === 0) return 'Closes today';
    if (diff === 1) return '1 day left';
    if (diff < 7) return `${diff} days left`;
    return `${Math.ceil(diff / 7)} weeks left`;
  };

  const formatName = (cf) => cf?.name || cf?.contentFormat?.name;

  const checkboxRow = (checked, label, onChange) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.2rem', cursor: 'pointer', fontSize: '0.9rem' }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );

  const radioRow = (checked, label, onChange) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.2rem', cursor: 'pointer', fontSize: '0.9rem' }}>
      <input type="radio" checked={checked} onChange={onChange} />
      {label}
    </label>
  );

  const filterControls = (
    <>
      <FilterDropdown id="niches" label="All Niches" openFilter={openFilter} setOpenFilter={setOpenFilter} count={niches.length}>
        {AVAILABLE_NICHES.map((niche) => checkboxRow(niches.includes(niche), niche, () => toggleListValue('niches', niches, niche)))}
      </FilterDropdown>
      <FilterDropdown id="formats" label="All Formats" openFilter={openFilter} setOpenFilter={setOpenFilter} count={formats.length}>
        {AVAILABLE_FORMATS.map((format) => checkboxRow(formats.includes(format), format, () => toggleListValue('formats', formats, format)))}
      </FilterDropdown>
      <FilterDropdown id="compensation" label="Compensation" openFilter={openFilter} setOpenFilter={setOpenFilter} count={(compensationType ? 1 : 0) + (minBudget ? 1 : 0)}>
        {radioRow(!compensationType, 'Any type', () => updateParams({ compensationType: '' }))}
        {COMPENSATION_OPTIONS.map((option) => radioRow(compensationType === option.value, option.label, () => updateParams({ compensationType: option.value })))}
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Minimum budget</p>
          <input
            type="number"
            min="0"
            placeholder="e.g. 500"
            value={minBudgetInput}
            onChange={(e) => setMinBudgetInput(e.target.value)}
            onBlur={() => updateParams({ minBudget: minBudgetInput })}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParams({ minBudget: minBudgetInput }); }}
            style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
          />
        </div>
      </FilterDropdown>
      <FilterDropdown id="location" label="Location" openFilter={openFilter} setOpenFilter={setOpenFilter} count={(locationType ? 1 : 0) + (city ? 1 : 0)}>
        {radioRow(!locationType, 'Any', () => updateParams({ locationType: '' }))}
        {LOCATION_OPTIONS.map((option) => radioRow(locationType === option.value, option.label, () => updateParams({ locationType: option.value })))}
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>City</p>
          <input
            type="text"
            placeholder="Filter by city"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onBlur={() => updateParams({ city: cityInput.trim() })}
            onKeyDown={(e) => { if (e.key === 'Enter') updateParams({ city: cityInput.trim() }); }}
            style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
          />
        </div>
      </FilterDropdown>
      <FilterDropdown id="deadline" label="Deadline" openFilter={openFilter} setOpenFilter={setOpenFilter} count={deadline ? 1 : 0}>
        {DEADLINE_OPTIONS.map((option) => radioRow(deadline === option.value, option.label, () => updateParams({ deadline: option.value })))}
      </FilterDropdown>
      <FilterDropdown id="sort" label={SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Newest'} openFilter={openFilter} setOpenFilter={setOpenFilter} count={0}>
        {SORT_OPTIONS.map((option) => radioRow(sort === option.value, option.label, () => updateParams({ sort: option.value === 'newest' ? '' : option.value })))}
      </FilterDropdown>
    </>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Open Campaigns</h1>
        <button type="button" className="btn btn-outline campaign-filters-mobile-btn" onClick={() => setMobileOpen(true)}>
          <Filter size={16} style={{ marginRight: '0.4rem' }} /> Filters{filterCount > 0 ? ` (${filterCount})` : ''}
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          type="text"
          placeholder="Search campaigns..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '12px', outline: 'none' }}
        />
      </div>

      <div ref={filtersRef} className="campaign-filters-desktop" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        {filterControls}
      </div>

      {(activeChips.length > 0 || hasFilters) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.7rem',
                borderRadius: '9999px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(59,130,246,0.15)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {chip.label} <X size={14} />
            </button>
          ))}
          {hasFilters && (
            <button type="button" onClick={() => { setSearchInput(''); setSearchParams({}); }} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem' }}>
              Clear all filters
            </button>
          )}
        </div>
      )}

      {mobileOpen && (
        // [Reason] Mobile uses a bottom drawer so filters do not consume the full campaign list
        <div className="campaign-filter-drawer-overlay" onClick={() => setMobileOpen(false)}>
          <div className="glass-panel campaign-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Filters</h2>
              <button type="button" onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filterControls}
            </div>
            <button type="button" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} onClick={() => setMobileOpen(false)}>
              Done
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading campaigns...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#ff3b30' }}>{error}</div>
      ) : campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>No campaigns found.</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {campaigns.map(camp => {
              const logoImg = camp.images?.find(img => img.imageType === 'BRAND_LOGO')?.imageUrl || camp.business?.companyLogo;
              const logoSrc = logoImg ? getMediaUrl(logoImg) : `https://ui-avatars.com/api/?name=${encodeURIComponent(camp.business?.companyName || 'B')}&background=random&color=fff`;
              const platforms = camp.contentFormats?.map(formatName).filter(Boolean) || [];
              const isClosed = camp.applicationDeadline && new Date() > new Date(camp.applicationDeadline);
              return (
                <div
                  key={camp.id}
                  className="glass-panel"
                  onClick={() => navigate(`/dashboard/campaign/${camp.id}`)}
                  style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', cursor: 'pointer' }}
                >
                  <img src={logoSrc} alt={camp.business?.companyName} style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover' }} />

                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{camp.business?.companyName}</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{camp.title}</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><DollarSign size={16} /> {formatBudget(camp)}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {camp.city && camp.country ? `${camp.city}, ${camp.country}` : 'Global / Online'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> {formatDeadline(camp.applicationDeadline)}</div>
                    </div>
                    {platforms.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                        {platforms.map((platform, idx) => (
                          <span key={idx} title={platform} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(59,130,246,0.2)', color: 'var(--accent)', borderRadius: '50%', cursor: 'pointer' }}>
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {user?.role === 'INFLUENCER' && (
                    <div>
                      {(() => {
                        const app = myApplications.find(a => a.campaignId === camp.id);
                        if (app) {
                          return (
                            <span style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                              Application {app.status}
                            </span>
                          );
                        }
                        if (isClosed) {
                          return (
                            <span style={{ padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                              Closed
                            </span>
                          );
                        }
                        return (
                          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', pointerEvents: 'none' }}>Apply Now</button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                disabled={page <= 1}
                onClick={() => updateParams({ page: page - 1 }, { resetPage: false })}
                style={{ opacity: page <= 1 ? 0.4 : 1 }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Page {page} of {totalPages} · {total} campaigns</span>
              <button
                type="button"
                className="btn btn-outline"
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: page + 1 }, { resetPage: false })}
                style={{ opacity: page >= totalPages ? 0.4 : 1 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchCampaigns;
