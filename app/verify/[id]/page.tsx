'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, ShieldCheck, Calendar, User, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function VerifyPage({ params }: { params: { id: string } }) {
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        // Fetch the refugee record by unique_id
        const { data, error } = await supabase
          .from('immigrants')
          .select('*')
          .eq('unique_id', params.id)
          .single();

        if (error) throw error;
        if (!data) notFound();
        
        setRecord(data);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [params.id]);

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin w-12 h-12 text-[#002868] mb-4" />
        <p className="text-slate-500 font-bold">Verifying Registration...</p>
      </div>
    );
  }

  // Error State
  if (error || !record) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-100 p-6 rounded-full mb-4">
          <ShieldCheck className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-red-600 mb-2">Invalid Record</h1>
        <p className="text-slate-500">The registration ID <span className="font-bold">{params.id}</span> could not be verified.</p>
      </div>
    );
  }

  // Success State: Verification Card
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center p-4 sm:p-8">
      {/* Card Container */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-[#002868] p-6 text-center text-white">
          <div className="flex justify-center gap-3 mb-4">
             <img src="/imm_badge.png" className="h-10 w-auto" alt="Badge" />
             <img src="/nid_logo.png" className="h-10 w-auto" alt="NID" />
             <img src="/ref_logo.png" className="h-10 w-auto" alt="LRRRC" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider">Registration Verified</h1>
          <p className="text-[#FFC72C] text-xs font-bold mt-1 uppercase tracking-widest">Republic of Liberia</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Photo & ID */}
          <div className="flex flex-col items-center">
            {record.remote_photo_url ? (
              <img src={record.remote_photo_url} className="w-24 h-24 rounded-full object-cover border-4 border-[#FFC72C] shadow-lg mb-3" alt="Photo" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs mb-3">No Photo</div>
            )}
            <h2 className="text-2xl font-black text-slate-900 uppercase">{record.first_name} {record.last_name}</h2>
            <p className="text-[#002868] font-bold text-sm tracking-widest uppercase bg-slate-100 px-3 py-1 rounded-full mt-2">{record.unique_id}</p>
          </div>

          <hr className="border-slate-100" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</span>
              <span className="font-bold text-slate-800 flex items-center gap-1"><User size={14}/> {record.gender}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program Type</span>
              <span className="font-bold text-slate-800">{record.program_type}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
              <span className="font-bold text-slate-800">{record.category}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reg. Date</span>
              <span className="font-bold text-slate-800 flex items-center gap-1"><Calendar size={14}/> {formatDate(record.registration_timestamp)}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</span>
              <span className="font-bold text-slate-800 flex items-center gap-1"><MapPin size={14}/> {record.town_or_village}, {record.county_of_residence}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`p-4 rounded-xl text-center font-black uppercase text-xs tracking-wider ${record.sync_status === 'SYNCED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
             Status: {record.sync_status || 'Pending'}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Official RIMS Verification Output</p>
        </div>
      </div>
    </div>
  );
}