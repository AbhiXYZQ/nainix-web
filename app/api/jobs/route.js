import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSupabase } from '@/lib/db/supabase';
import { getSessionFromRequest } from '@/lib/auth/session';
import { JobStatus, mockJobs, mockUsers } from '@/lib/db/schema';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*, client:users(id, name, avatar_url, verified_badges)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch failed or relations error, using mock data:', error.message);
    }

    if (!jobs || jobs.length === 0 || error) {
      const mockWithClients = mockJobs.map(job => ({
        ...job,
        client: mockUsers.find(u => u.id === job.clientId) || null
      }));
      return NextResponse.json({ success: true, jobs: mockWithClients });
    }

    // Normalize snake_case → camelCase for frontend compatibility
    const normalized = jobs.map(normalizeJob);
    return NextResponse.json({ success: true, jobs: normalized });
  } catch (error) {
    console.error('[GET /jobs]', error);
    return NextResponse.json({ success: false, message: 'Unable to fetch jobs right now.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabase();
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', session.userId)
      .maybeSingle();

    if (userError) throw userError;
    if (!user || user.role !== 'CLIENT') {
      return NextResponse.json({ success: false, message: 'Only clients can create jobs.' }, { status: 403 });
    }

    const body          = await request.json();
    const title         = body?.title?.trim();
    const description   = body?.description?.trim();
    const category      = body?.category;
    const budgetMin     = Number(body?.budgetMin || 0);
    const budgetMax     = Number(body?.budgetMax || 0);
    const requiredSkills = Array.isArray(body?.requiredSkills)
      ? body.requiredSkills.map((s) => String(s).trim()).filter(Boolean)
      : [];
    const isUrgent      = !!body?.isUrgent;
    const isFeatured    = !!body?.isFeatured;
    const featuredDays  = Number(body?.featuredDays || 0);

    if (!title || !description || !category || budgetMin <= 0 || budgetMax <= 0 || requiredSkills.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid job payload.' }, { status: 400 });
    }
    if (budgetMin > budgetMax) {
      return NextResponse.json({ success: false, message: 'Budget min cannot exceed budget max.' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const job = {
      id              : uuidv4(),
      client_id       : user.id,
      title,
      description,
      category,
      budget_min      : budgetMin,
      budget_max      : budgetMax,
      is_urgent       : isUrgent,
      required_skills : requiredSkills,
      is_featured     : isFeatured,
      featured_until  : isFeatured && [1, 3].includes(featuredDays)
        ? new Date(Date.now() + featuredDays * 86400000).toISOString()
        : null,
      status          : JobStatus.OPEN,
      created_at      : now,
      updated_at      : now,
    };

    const { error: insertError } = await supabase.from('jobs').insert(job);
    if (insertError) throw insertError;

    return NextResponse.json({ success: true, job: normalizeJob(job) });
  } catch (error) {
    console.error('[POST /jobs]', error);
    return NextResponse.json({ success: false, message: 'Unable to create job right now.' }, { status: 500 });
  }
}

// Map DB snake_case → camelCase used by the frontend
function normalizeJob(j) {
  return {
    id            : j.id,
    clientId      : j.client_id,
    client        : j.client || null,
    title         : j.title,
    description   : j.description,
    category      : j.category,
    budgetMin     : j.budget_min,
    budgetMax     : j.budget_max,
    isUrgent      : j.is_urgent,
    isFeatured    : j.is_featured,
    featuredUntil : j.featured_until,
    requiredSkills: j.required_skills || [],
    status        : j.status,
    createdAt     : j.created_at,
    updatedAt     : j.updated_at,
  };
}
