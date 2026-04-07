'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Moon, Sun, Menu, X, UserCog, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useAuthStore from '@/lib/store/authStore';
import { useTheme } from 'next-themes';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, login } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const result = await response.json();
        if (!response.ok || !result.success) {
          if (isAuthenticated) {
            logout();
          }
          return;
        }

        if (!isAuthenticated || user?.id !== result.user?.id) {
          login(result.user);
        }
      } catch (error) {
        if (isAuthenticated) {
          logout();
        }
      }
    };

    hydrateSession();
  }, [isAuthenticated, login, logout, user?.id]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
    } finally {
      logout();
      setMobileMenuOpen(false);
      router.push('/');
    }
  };

  // Command menu
  const handleCommandSelect = (value) => {
    setOpen(false);
    if (value === 'jobs') router.push('/jobs');
    if (value === 'collab') router.push('/collab');
    if (value === 'pricing') router.push('/pricing');
    if (value === 'dashboard') router.push(user?.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* 🚀 UPDATED LOGO SECTION WITH GLOW */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative flex items-center justify-center w-8 h-8">
            {/* ✨ The Minimal Glow Effect ✨ */}
            <div className="absolute -inset-2 bg-primary/20 blur-md rounded-full z-0 transition-all duration-300 group-hover:bg-primary/30 group-hover:blur-lg" />

            {/* Light Mode Logo (z-10 to stay on top of glow) */}
            <Image 
              src="/logo_light.png" 
              alt="Nainix Logo" 
              fill
              className="object-contain block dark:hidden relative z-10"
            />
            {/* Dark Mode Logo (z-10 to stay on top of glow) */}
            <Image 
              src="/logo_dark.png" 
              alt="Nainix Logo" 
              fill
              className="object-contain hidden dark:block relative z-10"
            />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nainix
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link href="/jobs" className={`text-sm transition-all px-4 py-2 rounded-full ${isActive('/jobs') ? 'bg-primary/10 text-primary font-semibold' : 'font-medium text-foreground/80 hover:text-primary hover:bg-primary/5'}`}>
            Find Work
          </Link>
          <Link href="/founders" className={`group relative inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all border ${isActive('/founders') ? 'bg-primary text-primary-foreground border-primary shadow-md font-semibold' : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-semibold'}`}>
            <Zap className={`h-3.5 w-3.5 fill-current ${!isActive('/founders') ? 'group-hover:animate-pulse' : ''}`} />
            Founders Offer
          </Link>
          <Link href="/#how-it-works" className="text-sm transition-all px-4 py-2 rounded-full font-medium text-foreground/80 hover:text-primary hover:bg-primary/5">
            How it Works
          </Link>
          <Link href="/pricing" className={`text-sm transition-all px-4 py-2 rounded-full ${isActive('/pricing') ? 'bg-primary/10 text-primary font-semibold' : 'font-medium text-foreground/80 hover:text-primary hover:bg-primary/5'}`}>
            Pricing
          </Link>
          <Link href="/collab" className={`text-sm transition-all px-4 py-2 rounded-full ${isActive('/collab') ? 'bg-primary/10 text-primary font-semibold' : 'font-medium text-foreground/80 hover:text-primary hover:bg-primary/5'}`}>
            Collab
          </Link>
          
          {/* Search */}
          <Button
            variant="outline"
            className="relative w-64 justify-start text-sm text-muted-foreground"
            onClick={() => setOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search...</span>
            <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Post a Job Button */}
          {isAuthenticated && user?.role === 'CLIENT' && (
            <Button asChild className="hidden md:flex">
              <Link href="/dashboard/client">Post a Job</Link>
            </Button>
          )}

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/${user?.username}`}>My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/edit" className="flex items-center gap-2">
                    <UserCog className="h-4 w-4" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={user?.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer'}>
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4 space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={() => setOpen(true)}>
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Link href="/jobs" className={`block px-4 py-2 rounded-md ${isActive('/jobs') ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted font-medium'}`} onClick={() => setMobileMenuOpen(false)}>
            Find Work
          </Link>
          <Link href="/founders" className={`block px-4 py-2 font-semibold rounded-md flex items-center gap-2 border transition-all ${isActive('/founders') ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'text-primary bg-primary/10 hover:bg-primary/20 border-primary/20'}`} onClick={() => setMobileMenuOpen(false)}>
            <Zap className={`h-4 w-4 fill-current ${!isActive('/founders') ? 'animate-pulse' : ''}`} />
            Founders Offer
          </Link>
          <Link href="/#how-it-works" className="block px-4 py-2 hover:bg-muted rounded-md font-medium" onClick={() => setMobileMenuOpen(false)}>
            How it Works
          </Link>
          <Link href="/pricing" className={`block px-4 py-2 rounded-md ${isActive('/pricing') ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted font-medium'}`} onClick={() => setMobileMenuOpen(false)}>
            Pricing
          </Link>
          <Link href="/collab" className={`block px-4 py-2 rounded-md ${isActive('/collab') ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted font-medium'}`} onClick={() => setMobileMenuOpen(false)}>
            Collab
          </Link>
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          ) : (
            <>
              <Link href={`/${user?.username}`} className="block px-4 py-2 hover:bg-muted rounded-md" onClick={() => setMobileMenuOpen(false)}>
                My Profile
              </Link>
              <Link 
                href={user?.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer'} 
                className="block px-4 py-2 hover:bg-muted rounded-md" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Button variant="ghost" className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      )}

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleCommandSelect('jobs')}>
              <Search className="mr-2 h-4 w-4" />
              <span>Browse Jobs</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandSelect('collab')}>
              <span>Community Collab</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandSelect('pricing')}>
              <span>Pricing & Upgrades</span>
            </CommandItem>
            {isAuthenticated && (
              <CommandItem onSelect={() => handleCommandSelect('dashboard')}>
                <span>My Dashboard</span>
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </nav>
  );
};

export default Navbar;