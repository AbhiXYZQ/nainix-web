'use client';

import { useState, useEffect, useCallback } from 'react';
import { Filter, X, DollarSign, SlidersHorizontal } from 'lucide-react';

// Always use en-US so server and client produce identical strings → no hydration mismatch
const fmtUSD = (n) => n.toLocaleString('en-US');
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import JobCard from '@/components/JobCard';
import ProposalModal from '@/components/ProposalModal';
import useJobStore from '@/lib/store/jobStore';
import useAuthStore from '@/lib/store/authStore';
import { JobCategory } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

// ─── Constants ──────────────────────────────────────────────
const BUDGET_MIN_LIMIT = 0;
const BUDGET_MAX_LIMIT = 25000;

// Budget presets for quick selection
const BUDGET_PRESETS = [
  { label: 'Any', min: 0, max: 25000 },
  { label: 'Under $1k', min: 0, max: 1000 },
  { label: '$1k–$5k', min: 1000, max: 5000 },
  { label: '$5k–$10k', min: 5000, max: 10000 },
  { label: '$10k+', min: 10000, max: 25000 },
];

const POPULAR_SKILLS = ['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'MongoDB'];

// ─── Budget Range Filter Component ──────────────────────────
const BudgetFilter = ({ budgetMin, budgetMax, onBudgetChange }) => {
  // Local state so slider feels instant (parent updates on commit)
  const [localMin, setLocalMin] = useState(budgetMin);
  const [localMax, setLocalMax] = useState(budgetMax);
  const [inputMin, setInputMin] = useState(String(budgetMin));
  const [inputMax, setInputMax] = useState(String(budgetMax));

  // Sync if parent resets (e.g. Clear Filters)
  useEffect(() => {
    setLocalMin(budgetMin);
    setLocalMax(budgetMax);
    setInputMin(String(budgetMin));
    setInputMax(String(budgetMax));
  }, [budgetMin, budgetMax]);

  const minPercent = ((localMin - BUDGET_MIN_LIMIT) / (BUDGET_MAX_LIMIT - BUDGET_MIN_LIMIT)) * 100;
  const maxPercent = ((localMax - BUDGET_MIN_LIMIT) / (BUDGET_MAX_LIMIT - BUDGET_MIN_LIMIT)) * 100;

  const commitChange = (min, max) => {
    onBudgetChange(min, max);
  };

  const handleMinSlider = (e) => {
    const val = Math.min(Number(e.target.value), localMax - 500);
    setLocalMin(val);
    setInputMin(String(val));
    commitChange(val, localMax);
  };

  const handleMaxSlider = (e) => {
    const val = Math.max(Number(e.target.value), localMin + 500);
    setLocalMax(val);
    setInputMax(String(val));
    commitChange(localMin, val);
  };

  const handleInputMinBlur = () => {
    const num = parseInt(inputMin, 10);
    if (isNaN(num)) { setInputMin(String(localMin)); return; }
    const clamped = Math.max(BUDGET_MIN_LIMIT, Math.min(num, localMax - 500));
    setLocalMin(clamped);
    setInputMin(String(clamped));
    commitChange(clamped, localMax);
  };

  const handleInputMaxBlur = () => {
    const num = parseInt(inputMax, 10);
    if (isNaN(num)) { setInputMax(String(localMax)); return; }
    const clamped = Math.min(BUDGET_MAX_LIMIT, Math.max(num, localMin + 500));
    setLocalMax(clamped);
    setInputMax(String(clamped));
    commitChange(localMin, clamped);
  };

  const applyPreset = (preset) => {
    setLocalMin(preset.min);
    setLocalMax(preset.max);
    setInputMin(String(preset.min));
    setInputMax(String(preset.max));
    commitChange(preset.min, preset.max);
  };

  const isDefaultBudget = localMin === BUDGET_MIN_LIMIT && localMax === BUDGET_MAX_LIMIT;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5" />
          Budget Range
        </Label>
        {!isDefaultBudget && (
          <button
            onClick={() => applyPreset(BUDGET_PRESETS[0])}
            className="text-xs text-primary hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {BUDGET_PRESETS.map((preset) => {
          const isActive = localMin === preset.min && localMax === preset.max;
          return (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Dual Range Slider Track */}
      <div className="px-3">
        <div className="relative h-5 flex items-center">
          {/* Grey track */}
          <div className="absolute w-full h-1.5 bg-primary/20 rounded-full" />
          {/* Coloured range between thumbs */}
          <div
            className="absolute h-1.5 bg-primary rounded-full"
            style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
          />
          {/* Min thumb */}
          <input
            type="range"
            min={BUDGET_MIN_LIMIT}
            max={BUDGET_MAX_LIMIT}
            step={500}
            value={localMin}
            onChange={handleMinSlider}
            className="absolute w-full h-5 opacity-0 cursor-pointer"
            style={{ zIndex: localMin > BUDGET_MAX_LIMIT * 0.9 ? 5 : 3 }}
          />
          {/* Max thumb */}
          <input
            type="range"
            min={BUDGET_MIN_LIMIT}
            max={BUDGET_MAX_LIMIT}
            step={500}
            value={localMax}
            onChange={handleMaxSlider}
            className="absolute w-full h-5 opacity-0 cursor-pointer"
            style={{ zIndex: 4 }}
          />
          {/* Visual thumb circles */}
          <div
            className="absolute h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm pointer-events-none z-10 -translate-x-1/2"
            style={{ left: `${minPercent}%` }}
          />
          <div
            className="absolute h-4 w-4 rounded-full border-2 border-primary bg-background shadow-sm pointer-events-none z-10 -translate-x-1/2"
            style={{ left: `${maxPercent}%` }}
          />
        </div>
      </div>

      {/* Min / Max text inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Min ($)</Label>
          <Input
            type="number"
            min={BUDGET_MIN_LIMIT}
            max={BUDGET_MAX_LIMIT}
            step={100}
            value={inputMin}
            onChange={(e) => setInputMin(e.target.value)}
            onBlur={handleInputMinBlur}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Max ($)</Label>
          <Input
            type="number"
            min={BUDGET_MIN_LIMIT}
            max={BUDGET_MAX_LIMIT}
            step={100}
            value={inputMax}
            onChange={(e) => setInputMax(e.target.value)}
            onBlur={handleInputMaxBlur}
            className="h-8 text-sm"
          />
        </div>
      </div>

      {/* Live preview label */}
      {!isDefaultBudget && (
        <p className="text-xs text-center text-primary font-medium">
          ${fmtUSD(localMin)} — ${localMax === BUDGET_MAX_LIMIT ? `${fmtUSD(localMax)}+` : fmtUSD(localMax)}
        </p>
      )}
    </div>
  );
};

// ─── Filter Sidebar ──────────────────────────────────────────
const FilterSidebar = ({ filters, setFilters }) => {
  const handleBudgetChange = useCallback(
    (min, max) => setFilters({ budgetMin: min, budgetMax: max }),
    [setFilters]
  );

  return (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select
          value={filters.category || 'all'}
          onValueChange={(val) => setFilters({ category: val === 'all' ? null : val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.values(JobCategory).map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Budget Range */}
      <BudgetFilter
        budgetMin={filters.budgetMin}
        budgetMax={filters.budgetMax}
        onBudgetChange={handleBudgetChange}
      />

      <Separator />

      {/* Urgent SOS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="urgent-filter">Urgent SOS Only</Label>
          <Switch
            id="urgent-filter"
            checked={filters.urgentOnly}
            onCheckedChange={(checked) => setFilters({ urgentOnly: checked })}
          />
        </div>
      </div>

      <Separator />

      {/* Popular Skills */}
      <div className="space-y-2">
        <Label>Popular Skills</Label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SKILLS.map((skill) => (
            <Badge
              key={skill}
              variant={filters.skills.includes(skill) ? 'default' : 'outline'}
              className="cursor-pointer transition-colors hover:bg-primary/80"
              onClick={() => {
                const newSkills = filters.skills.includes(skill)
                  ? filters.skills.filter((s) => s !== skill)
                  : [...filters.skills, skill];
                setFilters({ skills: newSkills });
              }}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear All */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          setFilters({
            category: null,
            budgetMin: BUDGET_MIN_LIMIT,
            budgetMax: BUDGET_MAX_LIMIT,
            skills: [],
            urgentOnly: false,
          })
        }
      >
        Clear All Filters
      </Button>
    </div>
  );
};

// ─── Jobs Page ───────────────────────────────────────────────
const JobsPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const { filters, setFilters, getFilteredJobs, cleanupExpiredFeaturedJobs, fetchJobs } = useJobStore();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [filteredJobs, setFilteredJobs] = useState([]);

  const featuredJobsCount = filteredJobs.filter(
    (job) => job.isFeatured && (!job.featuredUntil || new Date(job.featuredUntil) > new Date())
  ).length;

  const isBudgetFiltered =
    filters.budgetMin > BUDGET_MIN_LIMIT || filters.budgetMax < BUDGET_MAX_LIMIT;

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    cleanupExpiredFeaturedJobs();
    setFilteredJobs(getFilteredJobs());
  }, [filters, getFilteredJobs, cleanupExpiredFeaturedJobs]);

  useEffect(() => {
    trackEvent('jobs_page_viewed', {
      authenticated: isAuthenticated,
      role: user?.role || 'GUEST',
    });
  }, [isAuthenticated, user?.role]);

  const handleApply = (job) => {
    trackEvent('job_apply_clicked', {
      jobId: job.id,
      featured: !!job.isFeatured,
      urgent: !!job.isUrgent,
    });

    if (!isAuthenticated) {
      toast.error('Please login to submit a proposal');
      router.push('/login');
      return;
    }
    if (user?.role !== 'FREELANCER') {
      toast.error('Only freelancers can submit proposals');
      return;
    }
    setSelectedJob(job);
    setProposalModalOpen(true);
  };

  const hasActiveFilters =
    filters.category || filters.urgentOnly || filters.skills.length > 0 || isBudgetFiltered;

  const clearAll = () =>
    setFilters({
      category: null,
      budgetMin: BUDGET_MIN_LIMIT,
      budgetMax: BUDGET_MAX_LIMIT,
      skills: [],
      urgentOnly: false,
    });

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 shrink-0">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilterSidebar filters={filters} setFilters={setFilters} />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Find Your Next Gig</h1>
              <p className="text-muted-foreground mt-1">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} available
                {featuredJobsCount > 0 && ` • ${featuredJobsCount} featured`}
              </p>
            </div>

            {/* Mobile Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {[
                        filters.category ? 1 : 0,
                        filters.urgentOnly ? 1 : 0,
                        filters.skills.length,
                        isBudgetFiltered ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar filters={filters} setFilters={setFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground">Active:</span>

              {filters.category && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  {filters.category}
                  <button
                    onClick={() => setFilters({ category: null })}
                    className="ml-0.5 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {isBudgetFiltered && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  ${fmtUSD(filters.budgetMin)}–${filters.budgetMax === BUDGET_MAX_LIMIT ? `${fmtUSD(filters.budgetMax)}+` : fmtUSD(filters.budgetMax)}
                  <button
                    onClick={() => setFilters({ budgetMin: BUDGET_MIN_LIMIT, budgetMax: BUDGET_MAX_LIMIT })}
                    className="ml-0.5 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.urgentOnly && (
                <Badge variant="secondary" className="gap-1 pr-1">
                  Urgent Only
                  <button
                    onClick={() => setFilters({ urgentOnly: false })}
                    className="ml-0.5 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                  {skill}
                  <button
                    onClick={() => setFilters({ skills: filters.skills.filter((s) => s !== skill) })}
                    className="ml-0.5 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {hasActiveFilters && (
                <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground underline">
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Featured Jobs Promo Banner */}
          <Card>
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Want faster visibility for your posting? Use Featured Jobs boost from client dashboard.
              </p>
              <Button variant="outline" asChild className="shrink-0">
                <Link href="/dashboard/client">Boost a Job</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Jobs Grid */}
          <div className="grid gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs
                .sort((a, b) => {
                  const aFeatured = a.isFeatured && (!a.featuredUntil || new Date(a.featuredUntil) > new Date()) ? 1 : 0;
                  const bFeatured = b.isFeatured && (!b.featuredUntil || new Date(b.featuredUntil) > new Date()) ? 1 : 0;
                  if (bFeatured !== aFeatured) return bFeatured - aFeatured;
                  const urgentDiff = (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
                  if (urgentDiff !== 0) return urgentDiff;
                  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                })
                .map((job) => (
                  <JobCard key={job.id} job={job} onApply={handleApply} />
                ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center space-y-3">
                  <SlidersHorizontal className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="font-medium">No jobs match your filters</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting the budget range or removing some filters.
                  </p>
                  <Button variant="outline" className="mt-2" onClick={clearAll}>
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      <ProposalModal
        open={proposalModalOpen}
        onOpenChange={setProposalModalOpen}
        job={selectedJob}
      />
    </div>
  );
};

export default JobsPage;