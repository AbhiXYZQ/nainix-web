'use client';

import { formatDistanceToNow, isValid } from 'date-fns';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, Sparkles, Zap, Building2, Users, ArrowRight, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Pending';
  const date = new Date(dateString);
  if (!isValid(date)) return 'Recently';
  
  return formatDistanceToNow(date, { addSuffix: true }).replace('about ', '');
};

const JobCard = ({ job, onApply }) => {
  const featuredActive = job.isFeatured && (!job.featuredUntil || new Date(job.featuredUntil) > new Date());
  
  // Use real proposal count from the job object (populated by API)
  const proposalCount = job.proposalCount || 0;

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
          {/* Main Content Area - Clickable to Detail Page */}
          <Link href={`/jobs/${job.id}`} className="flex-1 p-4 sm:p-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-l-xl transition-colors">
            <div className="space-y-4">
              <div className="space-y-3">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border pb-0.5 rounded-md text-[10px] sm:text-xs">
                    <Briefcase className="mr-1.5 h-3 w-3" />
                    {job.category}
                  </Badge>
                  
                  {featuredActive && (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-none font-medium px-2 py-0.5 text-[10px] sm:text-xs">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                  {job.isUrgent && (
                    <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20 shadow-none font-medium px-2 py-0.5 animate-pulse text-[10px] sm:text-xs">
                      <Zap className="mr-1 h-3 w-3" fill="currentColor" />
                      Urgent
                    </Badge>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {job.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {job.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5 pt-1 sm:pt-2">
                {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-secondary/40 text-secondary-foreground text-[10px] sm:text-xs font-medium border border-border/50">
                    {skill}
                  </Badge>
                ))}
                {job.requiredSkills.length > 4 && (
                  <Badge variant="secondary" className="bg-secondary/40 text-secondary-foreground text-[10px] sm:text-xs font-medium border border-border/50">
                    +{job.requiredSkills.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          </Link>

          {/* Right Sidebar Meta Info - Compact on Mobile */}
          <div className="md:w-[260px] bg-muted/20 border-t md:border-t-0 md:border-l border-border p-4 sm:p-6 flex flex-col justify-between space-y-4 sm:space-y-6 shrink-0 z-10 relative">
            <div className="space-y-4 sm:space-y-5">
              {/* Budget */}
              <div className="flex justify-between items-baseline md:block">
                <p className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5 sm:mb-1.5">Est. Budget</p>
                <div className="flex items-center text-foreground font-bold text-lg sm:text-xl">
                  <IndianRupee className="mr-0.5 h-3.5 sm:h-4 w-3.5 sm:w-4 text-primary" />
                  <span>{job.budgetMin.toLocaleString()} - {job.budgetMax.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-2">
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground font-medium">
                    <Clock className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Posted
                  </div>
                  <p className="text-xs sm:text-sm font-semibold">{formatTimeAgo(job.createdAt)}</p>
                </div>
                
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground font-medium">
                    <Users className="mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    Applied
                  </div>
                  <p className="text-xs sm:text-sm font-semibold">{proposalCount}</p>
                </div>
              </div>

              {/* Client Info snippet - Hidden or very compact on extreme mobile? No, let's keep it clean */}
              <div className="flex items-center gap-2 sm:gap-3 py-3 sm:pt-4 border-t border-border/60 overflow-hidden">
                <Avatar className="h-7 w-7 sm:h-9 sm:w-9 ring-1 ring-border shrink-0">
                  {job.client?.avatarUrl || job.client?.avatar_url ? (
                    <AvatarImage src={job.client.avatarUrl || job.client.avatar_url} alt={job.client?.name || 'Client'} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-primary/5 text-primary text-[10px] sm:text-xs font-semibold">
                    {job.client?.name ? job.client.name.substring(0, 2).toUpperCase() : <Building2 className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold leading-none mb-1 text-foreground truncate">
                    {job.client?.name || 'Verified Client'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center truncate">
                    Verified
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => onApply(job)} 
              className="w-full group/btn shadow-md hover:shadow-lg transition-all h-9 sm:h-10 text-xs sm:text-sm"
              variant={job.isUrgent ? "destructive" : "default"}
            >
              Apply Now
              <ArrowRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default JobCard;
