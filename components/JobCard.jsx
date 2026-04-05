'use client';

import { motion } from 'framer-motion';
import { Clock, DollarSign, Sparkles, Zap, Building2, Users, ArrowRight, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 24) return `${diffInHours || 1}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const JobCard = ({ job, onApply }) => {
  const featuredActive = job.isFeatured && (!job.featuredUntil || new Date(job.featuredUntil) > new Date());
  
  // Deterministic fake proposal count based on job id to avoid hydration mismatch
  const proposalCount = job.id ? (job.id.charCodeAt(0) + job.id.charCodeAt(job.id.length - 1)) % 25 : 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl group bg-card",
        featuredActive ? "border-primary/40 shadow-primary/5" : "border-border/60 hover:border-primary/20",
        job.isUrgent && "border-red-500/40 urgent-glow"
      )}>
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/[0.02] group-hover:via-transparent group-hover:to-transparent transition-colors duration-500 rounded-xl pointer-events-none" />

        <div className="flex flex-col md:flex-row relative z-10">
          {/* Main Content Area */}
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div className="space-y-3">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border pb-0.5 rounded-md">
                    <Briefcase className="mr-1.5 h-3 w-3" />
                    {job.category}
                  </Badge>
                  
                  {featuredActive && (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-none font-medium px-2.5 py-0.5">
                      <Sparkles className="mr-1.5 h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                  {job.isUrgent && (
                    <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 shadow-none font-medium px-2.5 py-0.5 animate-pulse">
                      <Zap className="mr-1.5 h-3 w-3" fill="currentColor" />
                      24H SOS
                    </Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors duration-200">
                    {job.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {job.requiredSkills.slice(0, 5).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-secondary/40 hover:bg-secondary/60 text-secondary-foreground text-xs font-medium border border-border/50">
                    {skill}
                  </Badge>
                ))}
                {job.requiredSkills.length > 5 && (
                  <Badge variant="secondary" className="bg-secondary/40 text-secondary-foreground text-xs font-medium border border-border/50">
                    +{job.requiredSkills.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar Meta Info */}
          <div className="md:w-[280px] bg-muted/20 border-t md:border-t-0 md:border-l border-border p-6 flex flex-col justify-between space-y-6 shrink-0 z-10 relative">
            <div className="space-y-5">
              {/* Budget */}
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Est. Budget Range</p>
                <div className="flex items-center text-foreground font-bold text-xl">
                  <DollarSign className="mr-0.5 h-5 w-5 text-primary" />
                  <span>{job.budgetMin.toLocaleString()} - {job.budgetMax.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-muted-foreground font-medium">
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    Posted
                  </div>
                  <p className="text-sm font-semibold">{formatTimeAgo(job.createdAt)}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-muted-foreground font-medium">
                    <Users className="mr-1.5 h-3.5 w-3.5" />
                    Proposals
                  </div>
                  <p className="text-sm font-semibold">{proposalCount} applied</p>
                </div>
              </div>

              {/* Client Info snippet */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/60 overflow-hidden">
                <Avatar className="h-9 w-9 ring-1 ring-border shrink-0">
                  {job.client?.avatarUrl || job.client?.avatar_url ? (
                    <AvatarImage src={job.client.avatarUrl || job.client.avatar_url} alt={job.client?.name || 'Client'} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                    {job.client?.name ? job.client.name.substring(0, 2).toUpperCase() : <Building2 className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-none mb-1 text-foreground truncate">
                    {job.client?.name || 'Verified Client'}
                  </p>
                  
                  {job.client?.verifiedBadges?.length > 0 || job.client?.verified_badges?.length > 0 ? (
                    <p className="text-xs text-muted-foreground flex items-center truncate">
                      <Sparkles className="h-3 w-3 text-amber-500 mr-1 shrink-0" />
                      Premium Client
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground flex items-center truncate">
                      Payment verified
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={() => onApply(job)} 
              className="w-full group/btn shadow-md hover:shadow-lg transition-all"
              variant={job.isUrgent ? "destructive" : "default"}
            >
              Submit Proposal
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default JobCard;
