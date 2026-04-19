'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mail, Github, Linkedin, MessageCircle, Shield, Play, Sparkles, ArrowLeft,
  UserX, RefreshCw, MapPin, Briefcase, Clock, IndianRupee, Award, Calendar, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// ─────────────────────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────────────────────
const ProfileSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-8 container py-12">
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="h-32 w-32 rounded-full shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card><CardContent className="pt-6 space-y-4"><Skeleton className="h-6 w-40" /><Skeleton className="h-20 w-full" /></CardContent></Card>
    <Card><CardContent className="pt-6 space-y-4"><Skeleton className="h-6 w-40" /><Skeleton className="h-40 w-full" /></CardContent></Card>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Not Found
// ─────────────────────────────────────────────────────────────
const NotFoundState = ({ username, onRetry }) => {
  const router = useRouter();
  return (
    <div className="container py-24 flex flex-col items-center justify-center text-center gap-6">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
        <UserX className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground max-w-sm">
          No user with the username <span className="font-mono text-foreground bg-muted px-1.5 py-0.5 rounded text-sm">@{username}</span> exists on Nainix.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <Button variant="outline" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
        <Button variant="ghost" onClick={onRetry}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Format Helpers
// ─────────────────────────────────────────────────────────────
const formatCurrency = (val) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);
  return `₹${formatted}`;
};

// ─────────────────────────────────────────────────────────────
// Main Profile Page
// ─────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!params.username) return;
    const fetchProfile = async () => {
      setIsLoading(true); setFetchError(false); setUser(null);
      try {
        const response = await fetch(`/api/users/${params.username}`);
        const result = await response.json();
        if (!response.ok || !result.success) setUser(null);
        else setUser(result.user);
      } catch (error) {
        setFetchError(true); setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [params.username, retryCount]);

  if (isLoading) return <ProfileSkeleton />;
  if (fetchError) {
    return (
      <div className="container py-24 text-center space-y-4">
        <p className="text-muted-foreground">Something went wrong while loading this profile.</p>
        <Button variant="outline" onClick={() => setRetryCount(c => c + 1)}><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button>
      </div>
    );
  }
  if (!user) return <NotFoundState username={params.username} onRetry={() => setRetryCount(c => c + 1)} />;


  const profile = user.roleProfile || {};
  const location = [user.city, user.country].filter(Boolean).join(', ');

  return (
    <div className="container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-5xl mx-auto space-y-8">
        
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {/* ── Main Header Card ── */}
        <Card className="overflow-hidden">
          <CardContent className="pt-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <Avatar className="h-32 w-32 shrink-0 border">
                <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
                <AvatarFallback className="text-3xl bg-muted text-muted-foreground">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    {user.verifiedBadges?.map((badge, idx) => (
                      <Badge key={idx} variant="secondary" className="flex items-center gap-1"><Shield className="h-3 w-3" />{badge}</Badge>
                    ))}
                    {user?.monetization?.verificationBadgeActive && (
                      <Badge variant="secondary" className="flex items-center gap-1"><Shield className="h-3 w-3" />Verified</Badge>
                    )}
                    {user?.monetization?.aiProActive && (
                      <Badge variant="secondary" className="flex items-center gap-1"><Sparkles className="h-3 w-3 text-primary" />AI Pro</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium flex-wrap">
                    <span className="text-primary">{profile.professionalTitle || (user.role === 'CLIENT' ? 'Verified Client' : 'Nainix Professional')}</span>
                    <span>•</span>
                    <span>@{user.username}</span>
                    {user.role === 'CLIENT' && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">Hire Manager</Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Info row */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
                  {location && (
                    <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> <span className="text-foreground font-medium">{location}</span></div>
                  )}
                  {user.role === 'FREELANCER' && profile.hourlyRate > 0 && (
                     <div className="flex items-center gap-1.5 flex-none"><IndianRupee className="h-4 w-4" /> <span className="text-foreground font-medium">{formatCurrency(profile.hourlyRate)}/hr</span></div>
                  )}
                  {user.role === 'FREELANCER' && profile.experienceYears > 0 && (
                     <div className="flex items-center gap-1.5"><Award className="h-4 w-4" /> <span className="text-foreground font-medium">{profile.experienceYears} Yrs Exp.</span></div>
                  )}
                  {user.role === 'FREELANCER' && profile.availability && (
                     <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> <span className="text-foreground font-medium capitalize">{profile.availability.replace('_', ' ')}</span></div>
                  )}
                  {user.role === 'CLIENT' && (
                    <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> <span className="text-foreground font-medium">Member since {new Date(user.createdAt).getFullYear()}</span></div>
                  )}
                  <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> <span className="text-foreground font-medium">Identity Verified</span></div>
                </div>

                <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">{user.bio}</p>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {user.role === 'FREELANCER' ? (
                    <Button className="w-full sm:w-auto">Invite to Job</Button>
                  ) : (
                    <Button className="w-full sm:w-auto" asChild>
                      <Link href="/dashboard">View Open Jobs</Link>
                    </Button>
                  )}
                  
                  {user.socialLinks?.github && (
                    <Button variant="outline" size="icon" asChild><a href={user.socialLinks.github} target="_blank" rel="noreferrer" title="GitHub"><Github className="h-4 w-4" /></a></Button>
                  )}
                  {user.socialLinks?.linkedin && (
                    <Button variant="outline" size="icon" asChild><a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" title="LinkedIn"><Linkedin className="h-4 w-4" /></a></Button>
                  )}
                  {user.socialLinks?.whatsapp && (
                    <Button variant="outline" size="icon" asChild><a href={`https://wa.me/${user.socialLinks.whatsapp}`} target="_blank" rel="noreferrer" title="WhatsApp"><MessageCircle className="h-4 w-4" /></a></Button>
                  )}
                  {profile.portfolioUrl && (
                    <Button variant="outline" size="icon" asChild><a href={profile.portfolioUrl} target="_blank" rel="noreferrer" title="Website"><Globe className="h-4 w-4" /></a></Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Video Intro ── */}
        {user.videoIntro && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" /> Video Pitch
              </h2>
              <div className="aspect-video bg-muted rounded-xl overflow-hidden border">
                <iframe width="100%" height="100%" src={user.videoIntro} title="Video Intro" frameBorder="0" allowFullScreen />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Skills ── */}
        {user.skills && user.skills.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" /> Core Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm px-3 py-1 font-medium bg-muted hover:bg-muted/80">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Portfolio ── */}
        {user.portfolio && user.portfolio.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Portfolio Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.portfolio.map((project, idx) => (
                  <div key={idx} className="group border rounded-xl overflow-hidden bg-card transition-shadow hover:shadow-md">
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-lg mb-1.5">{project.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </motion.div>
    </div>
  );
};

export default ProfilePage;
