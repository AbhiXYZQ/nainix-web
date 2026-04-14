import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';
import { mockProposals } from '@/lib/db/schema';

function normalizeProposal(p) {
  return {
    id              : p.id,
    jobId           : p.job_id,
    freelancerId    : p.freelancer_id,
    pitch           : p.pitch,
    estimatedDays   : p.estimated_days,
    price           : p.price,
    smartMatchScore : p.smart_match_score,
    createdAt       : p.created_at,
  };
}

export async function GET(request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();
    const { data: user } = await supabase.from('users').select('id, role').eq('id', session.userId).maybeSingle();
    if (!user) return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });

    let proposals = [];

    if (user.role === 'FREELANCER') {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('freelancer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      proposals = data || [];
    } else if (user.role === 'CLIENT') {
      const { data: myJobs } = await supabase.from('jobs').select('id').eq('client_id', user.id);
      const myJobIds = (myJobs || []).map((j) => j.id);

      if (myJobIds.length === 0) {
        return NextResponse.json({ success: true, proposals: [] });
      }

      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .in('job_id', myJobIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      proposals = data || [];
    }

    return NextResponse.json({ success: true, proposals: proposals.map(normalizeProposal) });
  } catch (error) {
    console.error('[GET /proposals]', error);
    return NextResponse.json({ success: false, message: 'Unable to fetch proposals right now.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();
    const { data: user } = await supabase.from('users').select('id, role').eq('id', session.userId).maybeSingle();
    if (!user || user.role !== 'FREELANCER') {
      return NextResponse.json({ success: false, message: 'Only freelancers can submit proposals.' }, { status: 403 });
    }

    const body          = await request.json();
    const jobId         = body?.jobId;
    const pitch         = body?.pitch?.trim();
    const estimatedDays = Number(body?.estimatedDays || 0);
    const price         = Number(body?.price || 0);

    if (!jobId || !pitch || estimatedDays <= 0 || price <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid proposal payload.' }, { status: 400 });
    }

    const { data: job } = await supabase.from('jobs').select('id').eq('id', jobId).maybeSingle();
    if (!job) return NextResponse.json({ success: false, message: 'Job not found.' }, { status: 404 });

    const proposal = {
      id              : uuidv4(),
      job_id          : jobId,
      freelancer_id   : user.id,
      pitch           : pitch.slice(0, 300),
      estimated_days  : estimatedDays,
      price,
      smart_match_score: Math.floor(Math.random() * 20) + 80,
      created_at      : new Date().toISOString(),
    };

    const { error } = await supabase.from('proposals').insert(proposal);
    if (error) throw error;

    return NextResponse.json({ success: true, proposal: normalizeProposal(proposal) });
  } catch (error) {
    console.error('[POST /proposals]', error);
    return NextResponse.json({ success: false, message: 'Unable to submit proposal right now.' }, { status: 500 });
  }
}
