'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { 
  Fingerprint, Search, LogOut, ShieldCheck, MapPin, Loader2, CheckCircle2, 
  Database, Users, UserPlus, X, ChevronRight, Camera, Package, Calendar, 
  Hash, User, Info, RefreshCw, AlertCircle, Globe, Map as MapIcon, ChevronDown, Download,
  Printer
} from 'lucide-react';
import { 
  COUNTIES, REASON_OPTIONS, RELIEF_OPTIONS, GENDER_OPTIONS, 
  DISTRICTS_BY_COUNTY, PROGRAM_TYPE_OPTIONS, CATEGORY_OPTIONS, 
  TRAVEL_DOC_OPTIONS, ALL_NATIONALITIES, ALL_DISTRICTS 
} from '@/lib/constants';

export default function CommandPortal() {
  const [session, setSession] = useState<any>(null);
  const [view, setView] = useState<'dashboard' | 'search' | 'enroll'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pendingSync, setPendingSync] = useState(0);

  const [draft, setDraft] = useState({
    firstName: '', lastName: '', programType: '', category: '',
    reliefAssistance: [] as string[], otherRelief: '',
    gender: '', nationality: '', countryOfOrigin: '', dob: '',
    county: '', district: '', town: '', phone: '', email: '',
    docType: '', docNumber: '', docIssueDate: '', docExpiryDate: '',
    reason: '', photo: null as any, lat: null as number | null, lng: null as number | null
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session) {
        // ROLE CHECK: only allow specific emails – CHANGE THESE TO YOUR MINISTER'S EMAIL(S)
        const authorizedEmails = ['minister@example.com', 'admin@liberia.gov']; // UPDATE THIS
       if (!session.user.email || !authorizedEmails.includes(session.user.email)) {
          toast.error('You are not authorized to access this portal.');
          supabase.auth.signOut();
        } else {
          fetchMetrics();
        }
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchMetrics();
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchMetrics = async () => {
    const { count: total } = await supabase.from('immigrants').select('*', { count: 'exact', head: true });
    const { count: pending } = await supabase.from('immigrants').select('*', { count: 'exact', head: true }).eq('sync_status', 'PENDING');
    setTotalRecords(total || 0);
    setPendingSync(pending || 0);
  };

  const saveToSupabase = async () => {
    setIsSaving(true);
    const govId = `LRS-${Math.random().toString(36).substring(2, 8).toUpperCase()}${Date.now() % 1000}`;
    let relief = draft.reliefAssistance.filter(i => i !== 'Others').join(', ');
    if (draft.reliefAssistance.includes('Others') && draft.otherRelief) {
        relief = relief ? `${relief}, ${draft.otherRelief}` : draft.otherRelief;
    }

    const { error } = await supabase.from('immigrants').insert([{
      id: crypto.randomUUID(),
      unique_id: govId,
      first_name: draft.firstName,
      last_name: draft.lastName,
      program_type: draft.programType,
      category: draft.category,
      relief_assistance: relief,
      gender: draft.gender,
      nationality: draft.nationality,
      country_of_origin: draft.countryOfOrigin,
      date_of_birth: draft.dob ? new Date(draft.dob).getTime() : null,
      county_of_residence: draft.county,
      district_of_residence: draft.district,
      town_or_village: draft.town,
      phone_number: draft.phone,
      email_address: draft.email,
      travel_document_type: draft.docType,
      travel_document_number: draft.docNumber,
      date_of_issue: draft.docIssueDate ? new Date(draft.docIssueDate).getTime() : null,
      date_of_expiry: draft.docExpiryDate ? new Date(draft.docExpiryDate).getTime() : null,
      reason_for_migration: draft.reason,
      gps_latitude: draft.lat,
      gps_longitude: draft.lng,
      registration_timestamp: Date.now(),
      registered_by_agent_id: session?.user?.id,
      sync_status: 'SYNCED'
    }]);

    if (!error) {
      toast.success(`Recorded successfully: ID ${govId}`);
      setView('dashboard');
      setStep(1);
      setDraft({ firstName: '', lastName: '', programType: '', category: '', reliefAssistance: [], otherRelief: '', gender: '', nationality: '', countryOfOrigin: '', dob: '', county: '', district: '', town: '', phone: '', email: '', docType: '', docNumber: '', docIssueDate: '', docExpiryDate: '', reason: '', photo: null, lat: null, lng: null });
      fetchMetrics();
    } else toast.error(error.message);
    setIsSaving(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#002868]"><Loader2 className="animate-spin text-[#FFC72C] w-12 h-12" /></div>;
  if (!session) return <LoginScreen />;
  
{/* images for the header */}
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <header className="bg-[#002868] text-white p-3 sm:p-4 shadow-2xl flex flex-wrap justify-between items-center gap-2 px-3 sm:px-10 border-b-4 border-[#FFC72C] sticky top-0 z-50">
  <div className="flex items-center gap-0.5 sm:gap-2 flex-wrap justify-center">
          <img src="/imm_badge.png" alt="Immigration Badge" className="h-8 sm:h-12 w-auto rounded-full" />
    <div className="flex gap-0.5 sm:gap-2">
      <img src="/nir_logo.png" alt="NIR Logo" className="h-8 sm:h-12 w-auto object-contain rounded-full" />
      <img src="/lrrrc_logo.png" alt="LRRRC Logo" className="h-8 sm:h-12 w-auto object-contain rounded-full" />
    </div>
          <div>
            <h1 className="font-black text-xl sm:text-2xl leading-none tracking-tighter">RIMS PORTAL</h1>
            <p className="text-[8px] sm:text-[10px] font-bold text-[#FFC72C] tracking-[0.2em] uppercase">Republic of Liberia</p>
          </div>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="bg-red-500/10 hover:bg-red-600 px-4 sm:px-6 py-2 rounded-xl transition-all font-black text-xs border border-red-500/20">LOGOUT</button>
      </header>

      <main className="flex-1 p-4 sm:p-10 max-w-7xl mx-auto w-full">
        {view === 'dashboard' && <Dashboard setView={setView} totalRecords={totalRecords} pendingSync={pendingSync} />}
        {view === 'search' && <SearchPortal setView={setView} onSelectRecord={(r: any) => setSelectedRecord(r)} />}
        {view === 'enroll' && <EnrollmentWizard step={step} setStep={setStep} draft={draft} setDraft={setDraft} onCancel={() => setView('dashboard')} onFinalize={saveToSupabase} isSaving={isSaving} />}
      </main>

      {selectedRecord && <ProfileDialog record={selectedRecord} onClose={() => setSelectedRecord(null)} />}
    </div>
  );
}

// ── DASHBOARD ──
function Dashboard({ setView, totalRecords, pendingSync }: any) {
  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-700">
      <div className="bg-white rounded-2xl sm:rounded-[3.5rem] p-4 sm:p-14 shadow-2xl flex flex-col sm:flex-row items-center justify-between border border-slate-50 gap-6 sm:gap-8">
  <div className="flex items-center gap-2 sm:gap-7 flex-wrap justify-center">
    <img src="/imm_badge.png" alt="Immigration Badge" className="w-20 sm:w-32 h-auto rounded-full" />
            {/* Placeholders for two additional images */}
         <div className="flex gap-1 sm:gap-3">
  <img src="/nid_logo.png?v=1" alt="NIR Logo" className="w-24 sm:w-32 h-auto object-contain" />
<img src="/ref_logo.png?v=1" alt="LRRRC Logo" className="w-24 sm:w-32 h-auto object-contain" />
</div>
            <div className="text-center sm:text-left">
              <p className="text-[#002868] font-black text-xs sm:text-sm tracking-[0.5em] uppercase mb-3">National REFUGEE PORTAL</p>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tighter italic">Authorized Access</h2>
              <p className="text-slate-400 font-bold text-sm sm:text-base mt-3 flex items-center justify-center sm:justify-start gap-2"><MapPin size={16}/> Republic of Liberia • LRRRC</p>
            </div>
          </div>
          <div className="bg-slate-50 p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] text-center border border-slate-100 shadow-inner w-full sm:w-auto">
             <p className="text-4xl sm:text-6xl font-black text-[#002868] leading-none tracking-tighter italic">{totalRecords}</p>
             <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mt-2">Total Enrolled</p>
             <hr className="my-2 border-slate-200" />
             <p className="text-xl sm:text-2xl font-black text-[#002868]">{pendingSync}</p>
             <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">Pending Sync</p>
          </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          <ActionTile title="Enroll Refugee" desc="Initialize full biographical and biometric capture workflow." icon={<UserPlus size={56}/>} color="bg-[#1B5E20]" onClick={() => setView('enroll')} />
          <ActionTile title="Refugee Search" desc="Advanced forensic query of national records with sub-second latency." icon={<Search size={56}/>} color="bg-[#002868]" onClick={() => setView('search')} />
       </div>
    </div>
  );
}

// ── SEARCH PORTAL (manual search) ──
// ── SEARCH PORTAL (manual search, custom dropdowns, consistent heights) ──
function SearchPortal({ setView, onSelectRecord }: any) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const [filters, setFilters] = useState({
    query: '', uniqueId: '', county: '', district: '', nationality: '', gender: '', reason: '', docType: '', town: '', agentId: '', relief: ''
  });

  const [searchTrigger, setSearchTrigger] = useState(0);

  const buildQuery = () => {
    let q = supabase.from('immigrants').select('*', { count: 'exact' });
    if (filters.query) q = q.or(`first_name.ilike.%${filters.query}%,last_name.ilike.%${filters.query}%`);
    if (filters.uniqueId) q = q.ilike('unique_id', `%${filters.uniqueId}%`);
    if (filters.county) q = q.eq('county_of_residence', filters.county);
    if (filters.district) q = q.eq('district_of_residence', filters.district);
    if (filters.nationality) q = q.eq('nationality', filters.nationality);
    if (filters.gender) q = q.eq('gender', filters.gender);
    if (filters.reason) q = q.eq('reason_for_migration', filters.reason);
    if (filters.docType) q = q.eq('travel_document_type', filters.docType);
    if (filters.town) q = q.ilike('town_or_village', `%${filters.town}%`);
    if (filters.agentId) q = q.ilike('registered_by_agent_id', `%${filters.agentId}%`);
    if (filters.relief) q = q.ilike('relief_assistance', `%${filters.relief}%`);
    return q;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = buildQuery();
      const { data, count, error } = await q
        .order('registration_timestamp', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);
      if (error) throw error;
      setResults(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchTrigger, page]);

  const handleSearch = () => {
    setPage(1);
    setSearchTrigger(prev => prev + 1);
  };

  const clearFilters = () => {
    setFilters({
      query: '', uniqueId: '', county: '', district: '', nationality: '', gender: '', reason: '', docType: '', town: '', agentId: '', relief: ''
    });
    setPage(1);
    setSearchTrigger(prev => prev + 1);
  };

  const exportToCSV = async () => {
    const toastId = toast.loading('Fetching data for export...');
    try {
      let allData: any[] = [];
      let offset = 0;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        let q = supabase.from('immigrants').select('*');
        if (filters.query) q = q.or(`first_name.ilike.%${filters.query}%,last_name.ilike.%${filters.query}%`);
        if (filters.uniqueId) q = q.ilike('unique_id', `%${filters.uniqueId}%`);
        if (filters.county) q = q.eq('county_of_residence', filters.county);
        if (filters.district) q = q.eq('district_of_residence', filters.district);
        if (filters.nationality) q = q.eq('nationality', filters.nationality);
        if (filters.gender) q = q.eq('gender', filters.gender);
        if (filters.reason) q = q.eq('reason_for_migration', filters.reason);
        if (filters.docType) q = q.eq('travel_document_type', filters.docType);
        if (filters.town) q = q.ilike('town_or_village', `%${filters.town}%`);
        if (filters.agentId) q = q.ilike('registered_by_agent_id', `%${filters.agentId}%`);
        if (filters.relief) q = q.ilike('relief_assistance', `%${filters.relief}%`);

        const { data, error } = await q
          .order('registration_timestamp', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;
        allData = allData.concat(data);
        offset += limit;
        if (data.length < limit) hasMore = false;
      }

      if (allData.length === 0) {
        toast.error('No data to export', { id: toastId });
        return;
      }

      const headers = Object.keys(allData[0]);
      const rows = allData.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'refugee_records.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${allData.length} records exported`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Export failed', { id: toastId });
    }
  };

  return (
    <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-right-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-4xl sm:text-6xl font-black text-[#002868] tracking-tighter uppercase">Refugee Registry</h2>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="font-black text-[#002868] bg-[#FFC72C] px-5 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg uppercase text-xs sm:text-sm tracking-widest flex items-center gap-2"
          >
            <Download size={16}/> Export CSV
          </button>
          <button onClick={() => setView('dashboard')} className="font-black text-[#002868] bg-[#FFC72C] px-5 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg uppercase text-xs sm:text-sm tracking-widest flex items-center gap-2">← Dashboard</button>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] shadow-2xl border border-slate-100 space-y-4 sm:space-y-6">
         {/* Search input – height matched to filter cards */}
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
            <input
              value={filters.query}
              onChange={(e) => setFilters({...filters, query: e.target.value})}
              placeholder="Forensic Name Search..."
              className="w-full pl-12 pr-4 p-4 sm:p-6 bg-slate-50 rounded-2xl font-bold outline-none border border-slate-100 focus:ring-4 ring-[#002868]/5 transition-all text-sm sm:text-base"
            />
         </div>

         {/* First row: County, District, Nationality, Relief */}
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest ml-2">County</span>
              <CustomDropdown
                options={COUNTIES}
                value={filters.county}
                onChange={(v: string) => setFilters({...filters, county: v, district: ''})}
                placeholder="County"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest ml-2">District</span>
              <CustomDropdown
                options={DISTRICTS_BY_COUNTY[filters.county] || ALL_DISTRICTS}
                value={filters.district}
                onChange={(v: string) => setFilters({...filters, district: v})}
                placeholder="District"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Nationality</span>
              <CustomDropdown
                options={ALL_NATIONALITIES}
                value={filters.nationality}
                onChange={(v: string) => setFilters({...filters, nationality: v})}
                placeholder="Nationality"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Relief</span>
              <CustomDropdown
                options={RELIEF_OPTIONS}
                value={filters.relief}
                onChange={(v: string) => setFilters({...filters, relief: v})}
                placeholder="Relief"
              />
            </div>
         </div>

         {/* Second row: ID Number, Town, Gender, Agent ID */}
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormInput label="ID Number" value={filters.uniqueId} onChange={(v:any) => setFilters({...filters, uniqueId: v})} />
            <FormInput label="Town" value={filters.town} onChange={(v:any) => setFilters({...filters, town: v})} />
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Gender</span>
              <CustomDropdown
                options={GENDER_OPTIONS}
                value={filters.gender}
                onChange={(v: string) => setFilters({...filters, gender: v})}
                placeholder="Gender"
              />
            </div>
            <FormInput label="Agent ID" value={filters.agentId} onChange={(v:any) => setFilters({...filters, agentId: v})} />
         </div>

         {/* Third row: Reason, Document Type, and buttons */}
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Reason</span>
              <CustomDropdown
                options={REASON_OPTIONS}
                value={filters.reason}
                onChange={(v: string) => setFilters({...filters, reason: v})}
                placeholder="Reason"
              />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Document Type</span>
              <CustomDropdown
                options={TRAVEL_DOC_OPTIONS}
                value={filters.docType}
                onChange={(v: string) => setFilters({...filters, docType: v})}
                placeholder="Document Type"
              />
            </div>
            <div className="col-span-2 flex justify-end gap-3">
              <button
                onClick={clearFilters}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-100 transition-all"
              >
                Clear All Filters
              </button>
              <button
                onClick={handleSearch}
                className="bg-[#002868] text-white px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#001a4f] transition-all flex items-center gap-2"
              >
                <Search size={14}/> Search
              </button>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-lib-blue w-10 h-10" /></div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-[#002868] text-xs sm:text-sm font-black uppercase text-white/40 border-b tracking-[0.3em]">
                  <tr>
                    <th className="p-4 sm:p-10">Registry Identity</th>
                    <th className="p-4 sm:p-10">Location</th>
                    <th className="p-4 sm:p-10 text-center">Relief Status</th>
                    <th className="p-4 sm:p-10 text-right">Biometric Status</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {results.map((item) => (
                  <tr key={item.id} onClick={() => onSelectRecord(item)} className="hover:bg-slate-50 transition-all group cursor-pointer">
                    <td className="p-4 sm:p-10">
                      <p className="font-black text-slate-900 text-base sm:text-xl uppercase tracking-tighter group-hover:text-[#002868]">{item.first_name} {item.last_name}</p>
                      <p className="text-xs sm:text-sm font-black text-[#002868] mt-1 tracking-widest uppercase italic">LRS ID: {item.unique_id}</p>
                     </td>
                    <td className="p-4 sm:p-10 text-slate-500 uppercase text-xs sm:text-sm tracking-widest font-black">{item.nationality} <br/> {item.county_of_residence} County</td>
                    <td className="p-4 sm:p-10 text-center">
                      <span className="bg-[#FFC72C]/20 text-[#002868] px-3 sm:px-5 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-black uppercase ring-1 ring-[#FFC72C]/50">{item.relief_assistance || 'NONE'}</span>
                     </td>
                    <td className="p-4 sm:p-10 text-right text-green-600 font-black text-xs sm:text-sm uppercase"><div className="flex items-center justify-end gap-2"><CheckCircle2 size={16} className="sm:w-5 sm:h-5" /> Verified 1:N</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6 sm:mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 sm:px-6 py-2 bg-gray-100 rounded-xl font-black text-xs sm:text-sm uppercase disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm sm:text-base font-bold text-gray-500">
              Page {page} of {Math.ceil(totalCount / pageSize) || 1} ({totalCount} records)
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= totalCount}
              className="px-4 sm:px-6 py-2 bg-gray-100 rounded-xl font-black text-xs sm:text-sm uppercase disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// CustomDropdown component – replaces native select, opens on click anywhere
function CustomDropdown({ options, value, onChange, placeholder }: any) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => 
    options.filter((o: string) => o.toLowerCase().includes(search.toLowerCase())),
    [search, options]
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-slate-50 p-4 sm:p-6 rounded-2xl text-left font-black text-slate-800 outline-none ring-2 ring-slate-100 focus:ring-8 focus:ring-[#002868]/5 transition-all text-sm sm:text-base shadow-inner flex justify-between items-center"
      >
        <span>{value || `Select ${placeholder}`}</span>
        <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-2xl rounded-2xl z-[60] max-h-60 overflow-y-auto border border-slate-100 p-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full p-2 mb-2 border rounded-lg text-sm"
            autoFocus
          />
          <div>
            <button
              onClick={() => { onChange(''); setOpen(false); setSearch(''); }}
              className="w-full text-left p-3 font-bold text-sm hover:bg-[#002868] hover:text-white rounded-xl transition-all"
            >
              All {placeholder}s
            </button>
            {filtered.map((o: string) => (
              <button
                key={o}
                onClick={() => { onChange(o); setOpen(false); setSearch(''); }}
                className="w-full text-left p-3 font-bold text-sm hover:bg-[#002868] hover:text-white rounded-xl transition-all"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ENROLLMENT WIZARD (unchanged, but with increased font sizes) ──
function EnrollmentWizard({ step, setStep, draft, setDraft, onCancel, onFinalize, isSaving }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleRelief = (item: string) => {
    const current = draft.reliefAssistance;
    const next = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
    setDraft({...draft, reliefAssistance: next});
  };

  return (
    <div className="max-w-5xl mx-auto animate-in zoom-in-95 duration-500 pb-20">
      <div className="flex justify-between items-end mb-6 sm:mb-8">
        <div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#002868] uppercase tracking-tighter italic">Enrollment</h2>
          <p className="text-lib-gold font-black uppercase text-xs sm:text-sm tracking-widest mt-2">Step {step} of 4: {step === 1 ? 'Classification' : step === 2 ? 'Biographical' : step === 3 ? 'Verification' : 'Biometrics'}</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 font-bold hover:text-red-600 transition-all uppercase text-xs tracking-widest">Cancel</button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[3.5rem] p-6 sm:p-12 shadow-2xl border border-slate-100 space-y-8 sm:space-y-10">
        {step === 1 && (
          <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-right-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <FormSelect label="Program Type" options={PROGRAM_TYPE_OPTIONS} value={draft.programType} onChange={(v:any) => setDraft({...draft, programType: v})} />
              <FormSelect label="Category" options={CATEGORY_OPTIONS} value={draft.category} onChange={(v:any) => setDraft({...draft, category: v})} />
            </div>
            <div className="space-y-4">
              <label className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest ml-2">Relief Assistance</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                {RELIEF_OPTIONS.map(item => (
                  <button key={item} onClick={() => toggleRelief(item)} className={`p-3 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm transition-all border-2 ${draft.reliefAssistance.includes(item) ? 'bg-[#002868] text-white border-[#002868]' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {item}
                  </button>
                ))}
              </div>
              {draft.reliefAssistance.includes('Others') && (
                <input value={draft.otherRelief} onChange={(e) => setDraft({...draft, otherRelief: e.target.value})} placeholder="Specify other relief items..." className="w-full p-4 sm:p-5 bg-slate-50 rounded-2xl border border-[#002868]/20 font-bold text-sm outline-none animate-in fade-in" />
              )}
            </div>
            <FormSelect label="Reason for Migration" options={REASON_OPTIONS} value={draft.reason} onChange={(v:any) => setDraft({...draft, reason: v})} />
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 animate-in slide-in-from-right-4">
            <FormInput label="First Name" value={draft.firstName} onChange={(v:any) => setDraft({...draft, firstName: v})} />
            <FormInput label="Last Name" value={draft.lastName} onChange={(v:any) => setDraft({...draft, lastName: v})} />
            <SmartSearch label="Nationality" options={ALL_NATIONALITIES} value={draft.nationality} onChange={(v:any) => setDraft({...draft, nationality: v})} />
            <SmartSearch label="Country of Origin" options={ALL_NATIONALITIES} value={draft.countryOfOrigin} onChange={(v:any) => setDraft({...draft, countryOfOrigin: v})} />
            <FormSelect label="Gender" options={GENDER_OPTIONS} value={draft.gender} onChange={(v:any) => setDraft({...draft, gender: v})} />
            <FormInput label="Date of Birth" type="date" value={draft.dob} onChange={(v:any) => setDraft({...draft, dob: v})} />
            <FormSelect label="County of Residence" options={COUNTIES} value={draft.county} onChange={(v:any) => setDraft({...draft, county: v, district: ''})} />
            <FormSelect label="District of Residence" options={DISTRICTS_BY_COUNTY[draft.county] || []} value={draft.district} onChange={(v:any) => setDraft({...draft, district: v})} disabled={!draft.county} />
            <FormInput label="Town / Village" value={draft.town} onChange={(v:any) => setDraft({...draft, town: v})} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 sm:space-y-10 animate-in slide-in-from-right-4">
            <div className="bg-[#002868] p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
              <div className="text-center sm:text-left">
                <p className="text-[#FFC72C] font-black text-xs sm:text-sm uppercase tracking-widest mb-2">Forensic GPS</p>
                <h3 className="text-xl sm:text-3xl font-black italic tracking-tighter">{draft.lat ? `${draft.lat.toFixed(6)}, ${draft.lng?.toFixed(6)}` : 'DISCONNECTED'}</h3>
              </div>
              <button onClick={() => navigator.geolocation.getCurrentPosition(p => setDraft({...draft, lat: p.coords.latitude, lng: p.coords.longitude}))} className="bg-lib-gold text-lib-blue p-5 sm:p-6 rounded-full shadow-2xl hover:scale-110 transition-all"><MapPin size={28} className="sm:w-8 sm:h-8"/></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <FormSelect label="Doc Type" options={TRAVEL_DOC_OPTIONS} value={draft.docType} onChange={(v:any) => setDraft({...draft, docType: v})} />
              <FormInput label="Doc Number" value={draft.docNumber} onChange={(v:any) => setDraft({...draft, docNumber: v})} />
              <FormInput label="Date of Issue" type="date" value={draft.docIssueDate} onChange={(v:any) => setDraft({...draft, docIssueDate: v})} />
              <FormInput label="Date of Expiry" type="date" value={draft.docExpiryDate} onChange={(v:any) => setDraft({...draft, docExpiryDate: v})} />
              <FormInput label="Phone" value={draft.phone} onChange={(v:any) => setDraft({...draft, phone: v})} />
              <FormInput label="Email" value={draft.email} onChange={(v:any) => setDraft({...draft, email: v})} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-10 animate-in slide-in-from-right-4 text-center">
            <div className="max-w-sm mx-auto bg-slate-100 rounded-[4rem] overflow-hidden border-8 border-slate-50 shadow-inner relative aspect-[3/4]">
              {draft.photo ? <img src={draft.photo} className="w-full h-full object-cover" /> : <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" onLoadedMetadata={() => videoRef.current?.play()} />}
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
                {draft.photo ? (
                  <button onClick={() => { setDraft({...draft, photo: null}); setTimeout(() => { navigator.mediaDevices.getUserMedia({video: true}).then(s => {if(videoRef.current) videoRef.current.srcObject = s;}); }, 100); }} className="bg-red-600 p-5 sm:p-6 rounded-full text-white shadow-2xl hover:rotate-90 transition-all"><RefreshCw size={20} className="sm:w-6 sm:h-6"/></button>
                ) : (
                  <button onClick={() => {
                    const ctx = canvasRef.current?.getContext('2d');
                    if (canvasRef.current && videoRef.current) {
                        canvasRef.current.width = 400; canvasRef.current.height = 533;
                        ctx?.drawImage(videoRef.current, 0, 0, 400, 533);
                        setDraft({...draft, photo: canvasRef.current.toDataURL('image/jpeg')});
                    }
                  }} className="bg-[#FFC72C] p-8 sm:p-10 rounded-full text-[#002868] shadow-2xl border-4 border-white"><Camera size={28} className="sm:w-9 sm:h-9"/></button>
                )}
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <div className="flex justify-between pt-8 sm:pt-12 border-t border-slate-100">
          <button onClick={() => step > 1 && setStep(step - 1)} className={`px-6 sm:px-10 py-3 sm:py-5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest ${step === 1 ? 'opacity-0' : 'bg-slate-100 text-slate-400'}`}>Previous</button>
          <button onClick={() => step < 4 ? setStep(step + 1) : onFinalize()} disabled={isSaving} className="bg-[#002868] text-white px-10 sm:px-16 py-3 sm:py-5 rounded-2xl font-black tracking-widest shadow-2xl uppercase text-sm sm:text-base">
            {isSaving ? <Loader2 className="animate-spin" /> : step === 4 ? 'Submit Registry' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
// ── PROFILE FORM ──
function ProfileDialog({ record, onClose }: any) {
  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const reliefOptions: string[] = ['Rice', 'Oil', 'Cash', 'Household Materials'];
  const selectedRelief: string[] = record.relief_assistance
    ? record.relief_assistance.split(', ').map((s: string) => s.trim())
    : [];

  const handlePrint = async () => {
    // ── 1. Pre-fetch the photo and convert to base64 BEFORE opening print window ──
    let photoSrc = '';
    if (record.remote_photo_url) {
      try {
        const response = await fetch(record.remote_photo_url);
        const blob = await response.blob();
        photoSrc = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn('Could not load photo for print:', err);
        photoSrc = '';
      }
    }

    // ── 2. Open the print window only after photo is ready ──
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Refugee Registration Record</title>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0.5in;
            padding: 0;
            color: #000;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #002868;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .logo { max-height: 60px; }
          .title { text-align: right; }
          h1 { font-size: 18px; margin: 0; color: #002868; }
          h2 { font-size: 14px; margin: 5px 0; }
          .section { margin-bottom: 20px; break-inside: avoid; }
          .section-title {
            background-color: #f0f0f0;
            padding: 5px 10px;
            font-weight: bold;
            border-left: 4px solid #002868;
            margin-bottom: 10px;
          }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .field { margin-bottom: 8px; }
          .field-label { font-weight: bold; font-size: 11px; color: #555; }
          .field-value { font-size: 12px; border-bottom: 1px solid #ccc; padding: 2px 0; }
          .checkbox-group { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 5px; }
          .checkbox-item { display: flex; align-items: center; gap: 5px; }
          .photo-block { text-align: right; margin-bottom: 20px; }
          .photo { width: 100px; height: 100px; object-fit: cover; border: 1px solid #ccc; }
          .photo-placeholder {
            display: inline-flex;
            width: 100px;
            height: 100px;
            border: 1px dashed #ccc;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #999;
          }
          .footer {
            margin-top: 30px;
            font-size: 10px;
            text-align: center;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }
          @media print {
            body { margin: 0.2in; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <img src="${window.location.origin}/imm_badge.png" class="logo" alt="RIMS" />
          </div>
          <div class="title">
            <h1>Refugee Immigration Management System</h1>
            <h2>Republic of Liberia – Official Registration Record</h2>
          </div>
        </div>

        <div class="photo-block">
          ${photoSrc
            ? `<img src="${photoSrc}" class="photo" alt="Registrant photo" />`
            : `<div class="photo-placeholder">No Photo</div>`
          }
        </div>

        <div class="section">
          <div class="section-title">Registration Classification</div>
          <div class="grid">
            <div class="field"><div class="field-label">Program Type</div><div class="field-value">${record.program_type || '—'}</div></div>
            <div class="field"><div class="field-label">Category</div><div class="field-value">${record.category || '—'}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Basic Bio Data</div>
          <div class="grid">
            <div class="field"><div class="field-label">Full Name</div><div class="field-value">${record.first_name || ''} ${record.last_name || ''}</div></div>
            <div class="field"><div class="field-label">Unique ID</div><div class="field-value">${record.unique_id || '—'}</div></div>
            <div class="field"><div class="field-label">Date of Birth</div><div class="field-value">${formatDate(record.date_of_birth)}</div></div>
            <div class="field"><div class="field-label">Gender</div><div class="field-value">${record.gender || '—'}</div></div>
            <div class="field"><div class="field-label">Nationality</div><div class="field-value">${record.nationality || '—'}</div></div>
            <div class="field"><div class="field-label">Country of Origin</div><div class="field-value">${record.country_of_origin || '—'}</div></div>
            <div class="field"><div class="field-label">Phone Number</div><div class="field-value">${record.phone_number || '—'}</div></div>
            <div class="field"><div class="field-label">Email Address</div><div class="field-value">${record.email_address || '—'}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Residence & Location</div>
          <div class="grid">
            <div class="field"><div class="field-label">County</div><div class="field-value">${record.county_of_residence || '—'}</div></div>
            <div class="field"><div class="field-label">District</div><div class="field-value">${record.district_of_residence || '—'}</div></div>
            <div class="field"><div class="field-label">Town/Village</div><div class="field-value">${record.town_or_village || '—'}</div></div>
            <div class="field"><div class="field-label">GPS</div><div class="field-value">${record.gps_latitude && record.gps_longitude ? `${record.gps_latitude.toFixed(6)}, ${record.gps_longitude.toFixed(6)}` : '—'}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Travel Document</div>
          <div class="grid">
            <div class="field"><div class="field-label">Document Type</div><div class="field-value">${record.travel_document_type || '—'}</div></div>
            <div class="field"><div class="field-label">Document Number</div><div class="field-value">${record.travel_document_number || '—'}</div></div>
            <div class="field"><div class="field-label">Date of Issue</div><div class="field-value">${formatDate(record.date_of_issue)}</div></div>
            <div class="field"><div class="field-label">Date of Expiry</div><div class="field-value">${formatDate(record.date_of_expiry)}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Relief Assistance Provided</div>
          <div class="checkbox-group">
            ${reliefOptions.map(opt =>
              `<div class="checkbox-item">
                 <input type="checkbox" ${selectedRelief.includes(opt) ? 'checked' : ''} disabled />
                 <label>${opt}</label>
               </div>`
            ).join('')}
            ${selectedRelief
              .filter(r => !reliefOptions.includes(r))
              .map(other =>
                `<div class="checkbox-item">
                   <input type="checkbox" checked disabled />
                   <label>Other: ${other}</label>
                 </div>`
              ).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Reason for Migration</div>
          <div class="field-value">${record.reason_for_migration || '—'}</div>
        </div>

        <div class="section">
          <div class="section-title">Registration Info</div>
          <div class="grid">
            <div class="field"><div class="field-label">Registered By (Agent ID)</div><div class="field-value">${record.registered_by_agent_id || '—'}</div></div>
            <div class="field"><div class="field-label">Registration Date</div><div class="field-value">${formatDate(record.registration_timestamp)}</div></div>
            <div class="field"><div class="field-label">Sync Status</div><div class="field-value">${record.sync_status || '—'}</div></div>
          </div>
        </div>

        <div class="footer">
          This is an official record of the Liberia Refugee Immigration Management System (RIMS).<br/>
          Generated on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    // ── 3. All content is already inline (base64), so onload fires with everything ready ──
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

          {/* Header */}
          <div className="bg-[#002868] text-white p-4 sm:p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/imm_badge.png" alt="RIMS" className="h-12 w-auto" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">
                  Refugee Immigration Management System
                </h2>
                <p className="text-sm text-[#FFC72C]">Republic of Liberia – Official Registration Record</p>
              </div>
            </div>
            <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="border-l-4 border-[#FFC72C] pl-4">
                  <h1 className="text-2xl font-bold uppercase">Refugee Registration Form</h1>
                  <p className="text-sm text-gray-600">All fields are official record</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {record.remote_photo_url ? (
                  <img
                    src={record.remote_photo_url}
                    alt="Refugee photo"
                    className="w-32 h-32 object-cover border-2 border-gray-300 rounded-md shadow"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 text-xs">
                    Photo not available
                  </div>
                )}
              </div>
            </div>

            {/* Registration Classification */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#002868] border-b border-gray-200 pb-1 mb-4">
                Registration Classification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormBox label="Program Type" value={record.program_type || '—'} />
                <FormBox label="Category" value={record.category || '—'} />
              </div>
            </div>

            {/* Basic Bio Data */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#002868] border-b border-gray-200 pb-1 mb-4">
                Basic Bio Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormBox label="Full Name" value={`${record.first_name || ''} ${record.last_name || ''}`} />
                <FormBox label="Unique ID" value={record.unique_id || '—'} />
                <FormBox label="Date of Birth" value={formatDate(record.date_of_birth)} />
                <FormBox label="Gender" value={record.gender || '—'} />
                <FormBox label="Nationality" value={record.nationality || '—'} />
                <FormBox label="Country of Origin" value={record.country_of_origin || '—'} />
                <FormBox label="Phone Number" value={record.phone_number || '—'} />
                <FormBox label="Email Address" value={record.email_address || '—'} />
              </div>
            </div>

            {/* Residence & Location */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#002868] border-b border-gray-200 pb-1 mb-4">
                Residence & Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormBox label="County" value={record.county_of_residence || '—'} />
                <FormBox label="District" value={record.district_of_residence || '—'} />
                <FormBox label="Town/Village" value={record.town_or_village || '—'} />
                <FormBox
                  label="GPS"
                  value={
                    record.gps_latitude && record.gps_longitude
                      ? `${record.gps_latitude.toFixed(6)}, ${record.gps_longitude.toFixed(6)}`
                      : '—'
                  }
                />
              </div>
            </div>

            {/* Travel Document */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#002868] border-b border-gray-200 pb-1 mb-4">
                Travel Document
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormBox label="Document Type" value={record.travel_document_type || '—'} />
                <FormBox label="Document Number" value={record.travel_document_number || '—'} />
                <FormBox label="Date of Issue" value={formatDate(record.date_of_issue)} />
                <FormBox label="Date of Expiry" value={formatDate(record.date_of_expiry)} />
              </div>
            </div>

            {/* Relief Assistance */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#002868] border-b border-gray-200 pb-1 mb-4">
                Relief Assistance Provided
              </h3>
              <div className="flex flex-wrap gap-4">
                {reliefOptions.map(opt => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedRelief.includes(opt)} readOnly />
                    {opt}
                  </label>
                ))}
                {selectedRelief
                  .filter(r => !reliefOptions.includes(r))
                  .map(other => (
                    <label key={other} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked readOnly />
                      Other: {other}
                    </label>
                  ))}
              </div>
            </div>

            {/* Reason for Migration */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#002868] border-b border-gray-200 pb-1 mb-4">
                Reason for Migration
              </h3>
              <p className="text-sm text-gray-700">{record.reason_for_migration || '—'}</p>
            </div>

            {/* Registration Info */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#002868] border-b border-gray-200 pb-1 mb-4">
                Registration Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormBox label="Registered By (Agent ID)" value={record.registered_by_agent_id || '—'} />
                <FormBox label="Registration Date" value={formatDate(record.registration_timestamp)} />
                <FormBox label="Sync Status" value={record.sync_status || '—'} />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={handlePrint}
              className="bg-[#002868] text-white px-6 py-2 rounded-xl font-black uppercase text-sm tracking-wider hover:bg-[#001a4f] flex items-center gap-2"
            >
              <Printer size={16} /> Save as PDF
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-black uppercase text-sm hover:bg-gray-300"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

// Helper for a form box (label + value inside a bordered div)
function FormBox({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <div className="text-xs font-semibold text-gray-500 mb-1">{label}</div>
      <div className="border border-gray-300 rounded-md p-2 bg-gray-50 min-h-[2.5rem] text-sm">
        {value || '—'}
      </div>
    </div>
  );
}

// Helper for a label–value row
function FormRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-1">
      <span className="font-semibold text-gray-700 w-32 text-sm">{label}:</span>
      <span className="text-gray-800 text-sm">{value || '—'}</span>
    </div>
  );
}

// Helper component to display a labelled field
function FormField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
      <span className="text-base font-medium text-gray-800">{value || '—'}</span>
    </div>
  );
}

// ── HELPER COMPONENTS (with increased font sizes) ──
function ActionTile({ title, desc, icon, color, onClick }: any) {
  return (
    <button onClick={onClick} className={`${color} p-8 sm:p-16 rounded-3xl sm:rounded-[5rem] text-white text-left shadow-2xl hover:-translate-y-3 transition-all relative overflow-hidden group border-b-[12px] sm:border-b-[16px] border-black/20`}>
       <div className="relative z-10">
          <div className="bg-white/10 w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center mb-6 sm:mb-10 border border-white/20">{icon}</div>
          <h3 className="text-2xl sm:text-5xl font-black mb-2 sm:mb-4 tracking-tighter uppercase italic">{title}</h3>
          <p className="text-sm sm:text-base font-bold opacity-60 leading-relaxed max-w-[280px] sm:max-w-[320px]">{desc}</p>
       </div>
       <div className="absolute -right-12 sm:-right-16 -bottom-12 sm:-bottom-16 opacity-5 group-hover:scale-150 transition-all duration-1000">{icon}</div>
    </button>
  );
}

function SmartSearch({ label, options, value, onChange }: any) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const filtered = useMemo(() => options.filter((o:string) => o.toLowerCase().includes(search.toLowerCase())), [search, options]);
  return (
    <div className="flex flex-col gap-3 relative">
      <label className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
      <input value={value || search} onFocus={() => setOpen(true)} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${label}...`} className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl font-black text-slate-800 outline-none ring-2 ring-slate-100 focus:ring-8 focus:ring-[#002868]/5 transition-all text-sm sm:text-base" />
      {open && (
        <div className="absolute top-[100%] left-0 right-0 bg-white shadow-2xl rounded-2xl z-[60] max-h-60 overflow-y-auto border border-slate-100 mt-2 p-2">
          {filtered.map((o:string) => (
            <button key={o} onClick={() => { onChange(o); setSearch(''); setOpen(false); }} className="w-full text-left p-3 sm:p-4 font-bold text-sm sm:text-base hover:bg-[#002868] hover:text-white rounded-xl transition-all">{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniFilter({ label, options, value, onChange }: any) {
  return (
    <div className="bg-slate-50 p-2 sm:p-4 rounded-2xl flex flex-col gap-1 ring-1 ring-slate-200 relative">
      <span className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent font-bold text-sm sm:text-base outline-none appearance-none cursor-pointer w-full pr-6 sm:pr-8">
        <option value="">All {label}s</option>
        {options.map((o:string) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 text-slate-300 pointer-events-none" size={14} />
    </div>
  );
}

function ProfileItem({ label, value, icon }: any) {
  return (
    <div>
      <p className="text-xs sm:text-sm font-black text-slate-400 uppercase flex items-center gap-2 mb-1">{icon} {label}</p>
      <p className="font-bold text-sm sm:text-base text-slate-800">{value || 'N/A'}</p>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <label className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl font-black text-slate-800 outline-none ring-2 ring-slate-100 focus:ring-8 focus:ring-[#002868]/5 transition-all text-sm sm:text-base shadow-inner" />
    </div>
  );
}

function FormSelect({ label, options, value, onChange, disabled }: any) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      <label className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
      <div className="relative">
        <select disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl font-black text-slate-800 outline-none ring-2 ring-slate-100 focus:ring-8 focus:ring-[#002868]/5 transition-all text-sm sm:text-base appearance-none cursor-pointer disabled:opacity-30 shadow-inner">
          <option value="">Select {label}</option>
          {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-4 sm:right-6 top-4 sm:top-6 text-slate-300 pointer-events-none" size={16} />
      </div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoading(false);
  };
  return (
    <div className="relative min-h-screen bg-[#002868] flex items-center justify-center p-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/login_bg.png"
          alt="Background"
          className="w-full h-full object-contain object-center"
        />
      </div>
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl sm:rounded-[5rem] border border-white/20 shadow-2xl max-w-md w-full text-center p-6 sm:p-12">
        <img src="/imm_badge.png" alt="Immigration Badge" className="h-16 sm:h-20 mx-auto mb-4 sm:mb-6" />
        <h2 className="text-white text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-2 italic">RIMS PORTAL</h2>
        <p className="text-[#FFC72C] text-xs sm:text-sm font-black tracking-[0.5em] mb-8 sm:mb-12 uppercase">National Access Gateway</p>
        <div className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 sm:py-4 px-5 text-white font-bold outline-none transition-all text-sm sm:text-base"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Access Key"
            className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 sm:py-4 px-5 text-white font-bold outline-none transition-all text-sm sm:text-base"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#FFC72C] text-[#002868] py-3 sm:py-4 rounded-2xl font-black tracking-[0.3em] uppercase hover:bg-white transition-all shadow-lg mt-4 text-xs sm:text-sm"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Authenticate'}
          </button>
        </div>
      </div>
    </div>
  );
}