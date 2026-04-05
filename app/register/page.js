'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import useAuthStore from '@/lib/store/authStore';
import { Github, Linkedin } from 'lucide-react';

const COUNTRY_OPTIONS = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Singapore',
  'UAE',
];

const SKILL_OPTIONS = [
  'React',
  'Next.js',
  'Node.js',
  'TypeScript',
  'MongoDB',
  'PostgreSQL',
  'Python',
  'Django',
  'AI/ML',
  'DevOps',
  'AWS',
  'UI/UX',
];

const LIVE_STATUS = {
  IDLE: 'idle',
  CHECKING: 'checking',
  VALID: 'valid',
  INVALID: 'invalid',
  TAKEN: 'taken',
};

const initialLiveChecks = {
  email: { status: LIVE_STATUS.IDLE, message: '' },
  username: { status: LIVE_STATUS.IDLE, message: '' },
  phone: { status: LIVE_STATUS.IDLE, message: '' },
  portfolioUrl: { status: LIVE_STATUS.IDLE, message: '' },
};

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone = '') {
  return /^\+?[1-9]\d{7,14}$/.test(phone.replace(/[\s-]/g, ''));
}

function isValidUsername(username = '') {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

function isValidUrl(value = '') {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const RegisterPage = () => {
  const [role, setRole] = useState('FREELANCER');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    bio: '',
    professionalTitle: '',
    experienceYears: '',
    hourlyRate: '',
    skills: [],
    availability: '',
    portfolioUrl: '',
    companyName: '',
    companyWebsite: '',
    companySize: '',
    hiringGoal: '',
    budgetRange: '',
    acceptTerms: false,
  });

  const [liveChecks, setLiveChecks] = useState(initialLiveChecks);
  const [loading, setLoading] = useState(false);
  const [isOAuth, setIsOAuth] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth') === 'true') {
      setIsOAuth(true);
      setFormData((prev) => ({
        ...prev,
        name: params.get('name') || prev.name,
        email: params.get('email') || prev.email,
      }));
    }
  }, []);

  const handleSocialLogin = (provider) => {
    const providerMap = {
      'Google': 'google',
      'Apple': 'apple',
      'GitHub': 'github',
      'LinkedIn': 'linkedin_oidc',
    };
    
    const mappedProvider = providerMap[provider];
    if (mappedProvider) {
      window.location.href = `/api/auth/oauth?provider=${mappedProvider}`;
    }
  };

  const totalSteps = 4;

  const stepMeta = [
    { id: 1, title: 'Account Setup', subtitle: 'Basic account information' },
    { id: 2, title: 'Profile Essentials', subtitle: 'Identity and professional summary' },
    { id: 3, title: role === 'FREELANCER' ? 'Freelancer Details' : 'Client Company Details', subtitle: 'Role-based onboarding details' },
    { id: 4, title: 'Final Review', subtitle: 'Terms and complete signup' },
  ];

  const progressValue = Math.round((currentStep / totalSteps) * 100);

  const completionCount = Object.values(formData).filter((value) => {
    if (typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.length > 0;
    return String(value || '').trim().length > 0;
  }).length;

  const completionPercent = Math.min(100, Math.round((completionCount / Object.keys(formData).length) * 100));

  const router = useRouter();
  const { login } = useAuthStore();

  const setLiveCheck = (field, status, message = '') => {
    setLiveChecks((prev) => ({ ...prev, [field]: { status, message } }));
  };

  const checkAvailability = async (type, value) => {
    setLiveCheck(type, LIVE_STATUS.CHECKING, 'Checking availability...');

    try {
      const response = await fetch(`/api/auth/availability?type=${type}&value=${encodeURIComponent(value)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        setLiveCheck(type, LIVE_STATUS.INVALID, result.message || 'Unable to verify right now.');
        return;
      }

      if (result.available) {
        setLiveCheck(type, LIVE_STATUS.VALID, `${type} is available.`);
        return;
      }

      if (result.reason === 'taken') {
        setLiveCheck(type, LIVE_STATUS.TAKEN, result.message || `${type} already in use.`);
        return;
      }

      setLiveCheck(type, LIVE_STATUS.INVALID, result.message || `Invalid ${type}.`);
    } catch {
      setLiveCheck(type, LIVE_STATUS.INVALID, 'Unable to verify right now.');
    }
  };

  useEffect(() => {
    const value = formData.username.trim().toLowerCase();

    if (!value) {
      setLiveCheck('username', LIVE_STATUS.IDLE);
      return;
    }

    if (!isValidUsername(value)) {
      setLiveCheck('username', LIVE_STATUS.INVALID, 'Use 3-20 chars: lowercase letters, numbers, underscore.');
      return;
    }

    const timeout = setTimeout(() => {
      checkAvailability('username', value);
    }, 450);

    return () => clearTimeout(timeout);
  }, [formData.username]);

  useEffect(() => {
    const value = formData.email.trim().toLowerCase();

    if (!value) {
      setLiveCheck('email', LIVE_STATUS.IDLE);
      return;
    }

    if (!isValidEmail(value)) {
      setLiveCheck('email', LIVE_STATUS.INVALID, 'Invalid email format.');
      return;
    }

    const timeout = setTimeout(() => {
      checkAvailability('email', value);
    }, 450);

    return () => clearTimeout(timeout);
  }, [formData.email]);

  useEffect(() => {
    const value = formData.phone.trim();

    if (!value) {
      setLiveCheck('phone', LIVE_STATUS.IDLE);
      return;
    }

    if (!isValidPhone(value)) {
      setLiveCheck('phone', LIVE_STATUS.INVALID, 'Use international format, e.g. +919876543210.');
      return;
    }

    const timeout = setTimeout(() => {
      checkAvailability('phone', value);
    }, 450);

    return () => clearTimeout(timeout);
  }, [formData.phone]);

  useEffect(() => {
    if (role !== 'FREELANCER') {
      setLiveCheck('portfolioUrl', LIVE_STATUS.IDLE);
      return;
    }

    const value = formData.portfolioUrl.trim();

    if (!value) {
      setLiveCheck('portfolioUrl', LIVE_STATUS.IDLE);
      return;
    }

    if (!isValidUrl(value)) {
      setLiveCheck('portfolioUrl', LIVE_STATUS.INVALID, 'Portfolio link is invalid.');
      return;
    }

    setLiveCheck('portfolioUrl', LIVE_STATUS.VALID, 'Portfolio link looks good.');
  }, [formData.portfolioUrl, role]);

  const statusTextClass = (status) => {
    if (status === LIVE_STATUS.INVALID || status === LIVE_STATUS.TAKEN) return 'text-xs text-destructive';
    if (status === LIVE_STATUS.VALID) return 'text-xs text-primary';
    return 'text-xs text-muted-foreground';
  };

  const fieldHasBlockingIssue = (field) => {
    const status = liveChecks[field]?.status;
    return status === LIVE_STATUS.INVALID || status === LIVE_STATUS.TAKEN || status === LIVE_STATUS.CHECKING;
  };

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const nextSkills = prev.skills.includes(skill)
        ? prev.skills.filter((item) => item !== skill)
        : [...prev.skills, skill];

      return { ...prev, skills: nextSkills };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    for (let step = 1; step <= totalSteps; step += 1) {
      const stepValid = validateStep(step, true);
      if (!stepValid) {
        setCurrentStep(step);
        setLoading(false);
        return;
      }
    }

    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      username: formData.username.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.trim(),
      country: formData.country.trim(),
      state: formData.state.trim(),
      city: formData.city.trim(),
      bio: formData.bio.trim(),
      professionalTitle: formData.professionalTitle.trim(),
      experienceYears: formData.experienceYears,
      hourlyRate: formData.hourlyRate,
      skills: formData.skills,
      availability: formData.availability,
      portfolioUrl: formData.portfolioUrl.trim(),
      companyName: formData.companyName.trim(),
      companyWebsite: formData.companyWebsite.trim(),
      companySize: formData.companySize,
      hiringGoal: formData.hiringGoal.trim(),
      budgetRange: formData.budgetRange,
      acceptTerms: formData.acceptTerms,
    };

    if (!trimmedData.name || !trimmedData.email || !trimmedData.username || (!isOAuth && !trimmedData.password) || !trimmedData.phone || !trimmedData.country || !trimmedData.state || !trimmedData.city) {
      toast.error('Please fill all required fields.');
      setLoading(false);
      return;
    }

    if (fieldHasBlockingIssue('email') || fieldHasBlockingIssue('username') || fieldHasBlockingIssue('phone') || fieldHasBlockingIssue('portfolioUrl')) {
      toast.error('Please fix highlighted validation errors before submit.');
      setLoading(false);
      return;
    }

    if (!isOAuth && trimmedData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (trimmedData.bio.length < 30) {
      toast.error('Bio should be at least 30 characters.');
      setLoading(false);
      return;
    }

    if (!trimmedData.acceptTerms) {
      toast.error('Please accept terms and privacy policy.');
      setLoading(false);
      return;
    }

    if (role === 'FREELANCER') {
      if (!trimmedData.professionalTitle || !trimmedData.experienceYears || !trimmedData.hourlyRate || !trimmedData.availability || trimmedData.skills.length < 3) {
        toast.error('Freelancer profile requires title, experience, rate, availability, and at least 3 skills.');
        setLoading(false);
        return;
      }
    }

    if (role === 'CLIENT') {
      if (!trimmedData.companyName || !trimmedData.companySize || !trimmedData.hiringGoal || !trimmedData.budgetRange) {
        toast.error('Client profile requires company details, hiring goal, and budget range.');
        setLoading(false);
        return;
      }
    }

    try {
      const roleDetails = role === 'FREELANCER'
        ? {
            professionalTitle: trimmedData.professionalTitle,
            experienceYears: Number(trimmedData.experienceYears || 0),
            hourlyRate: Number(trimmedData.hourlyRate || 0),
            skills: trimmedData.skills,
            availability: trimmedData.availability,
            portfolioUrl: trimmedData.portfolioUrl,
          }
        : {
            companyName: trimmedData.companyName,
            companyWebsite: trimmedData.companyWebsite,
            companySize: trimmedData.companySize,
            hiringGoal: trimmedData.hiringGoal,
            budgetRange: trimmedData.budgetRange,
          };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          name: trimmedData.name,
          email: trimmedData.email,
          username: trimmedData.username,
          password: trimmedData.password,
          phone: trimmedData.phone,
          country: trimmedData.country,
          state: trimmedData.state,
          city: trimmedData.city,
          bio: trimmedData.bio,
          acceptTerms: trimmedData.acceptTerms,
          roleDetails,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        toast.error(result.message || 'Unable to create account.');
        setLoading(false);
        return;
      }

      login(result.user);
      toast.success('Account created successfully!');
      router.push(result.user.role === 'CLIENT' ? '/dashboard/client' : '/dashboard/freelancer');
    } catch {
      toast.error('Unable to create account right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step, showToast = true) => {
    if (step === 1) {
      if (!formData.name.trim() || !formData.username.trim() || !formData.email.trim() || (!isOAuth && !formData.password)) {
        if (showToast) toast.error('Step 1: Fill name, username, email' + (isOAuth ? '.' : ' and password.'));
        return false;
      }
      if (!isOAuth && formData.password.length < 6) {
        if (showToast) toast.error('Step 1: Password must be at least 6 characters.');
        return false;
      }
      if (fieldHasBlockingIssue('username') || fieldHasBlockingIssue('email')) {
        if (showToast) toast.error('Step 1: Fix username/email errors first.');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.phone.trim() || !formData.country.trim() || !formData.state.trim() || !formData.city.trim() || formData.bio.trim().length < 30) {
        if (showToast) toast.error('Step 2: Phone, country, state, city and 30+ chars summary required.');
        return false;
      }
      if (fieldHasBlockingIssue('phone')) {
        if (showToast) toast.error('Step 2: Fix phone number issue first.');
        return false;
      }
    }

    if (step === 3) {
      if (role === 'FREELANCER') {
        if (!formData.professionalTitle.trim() || !formData.experienceYears || !formData.hourlyRate || !formData.availability || formData.skills.length < 3) {
          if (showToast) toast.error('Step 3: Add title, exp, rate, availability and 3+ skills.');
          return false;
        }
        if (fieldHasBlockingIssue('portfolioUrl')) {
          if (showToast) toast.error('Step 3: Fix portfolio URL format.');
          return false;
        }
      } else {
        if (!formData.companyName.trim() || !formData.companySize || !formData.hiringGoal.trim() || !formData.budgetRange) {
          if (showToast) toast.error('Step 3: Add company, hiring goal and budget details.');
          return false;
        }
      }
    }

    if (step === 4) {
      if (!formData.acceptTerms) {
        if (showToast) toast.error('Step 4: Please accept terms to continue.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    const ok = validateStep(currentStep, true);
    if (!ok) return;
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>
              Premium onboarding • quick and guided
            </CardDescription>
            <div className="rounded-lg border bg-muted/40 p-3 text-left space-y-3 mt-3">
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium">Step {currentStep} of {totalSteps}</div>
                <div className="text-muted-foreground">Profile completion {completionPercent}%</div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressValue}%` }} />
              </div>
              <div>
                <p className="font-semibold text-sm">{stepMeta[currentStep - 1].title}</p>
                <p className="text-xs text-muted-foreground">{stepMeta[currentStep - 1].subtitle}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={setRole} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="FREELANCER">I'm a Freelancer</TabsTrigger>
                <TabsTrigger value="CLIENT">I'm a Client</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {currentStep === 1 && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Sparkles className="h-4 w-4" />
                    <span>Fast start: basic account setup (under 1 min)</span>
                  </div>

                  {!isOAuth && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <Button type="button" variant="outline" onClick={() => handleSocialLogin('Google')} className="w-full">
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.01 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            <path d="M1 1h22v22H1z" fill="none" />
                          </svg>
                          Google
                        </Button>
                        <Button type="button" variant="outline" onClick={() => handleSocialLogin('GitHub')} className="w-full">
                          <Github className="mr-2 h-4 w-4" />
                          GitHub
                        </Button>
                      </div>

                      <div className="relative mb-6 mt-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Or register with email
                          </span>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required disabled={isOAuth} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" name="username" placeholder="johndoe" value={formData.username} onChange={handleChange} required />
                      <p className="text-xs text-muted-foreground">Your profile will be at nainix.me/{formData.username}</p>
                      {liveChecks.username.status !== LIVE_STATUS.IDLE && (
                        <p className={statusTextClass(liveChecks.username.status)}>{liveChecks.username.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required disabled={isOAuth} />
                      {liveChecks.email.status !== LIVE_STATUS.IDLE && (
                        <p className={statusTextClass(liveChecks.email.status)}>{liveChecks.email.message}</p>
                      )}
                    </div>
                    {!isOAuth && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" placeholder="+91 9876543210" value={formData.phone} onChange={handleChange} required />
                      {liveChecks.phone.status !== LIVE_STATUS.IDLE && (
                        <p className={statusTextClass(liveChecks.phone.status)}>{liveChecks.phone.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={formData.country} onValueChange={(val) => setFormData((prev) => ({ ...prev, country: val }))}>
                        <SelectTrigger id="country">
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_OPTIONS.map((country) => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" placeholder="Uttar Pradesh" value={formData.state} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" placeholder="Lucknow" value={formData.city} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Summary</Label>
                    <Textarea id="bio" name="bio" placeholder="Tell us your strengths and what kind of projects you do best..." value={formData.bio} onChange={handleChange} rows={4} required />
                    <p className="text-xs text-muted-foreground">Tip: concise summary with outcomes converts better.</p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                role === 'FREELANCER' ? (
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="professionalTitle">Professional Title</Label>
                        <Input id="professionalTitle" name="professionalTitle" placeholder="Full Stack Developer" value={formData.professionalTitle} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experienceYears">Experience (Years)</Label>
                        <Input id="experienceYears" name="experienceYears" type="number" min="0" placeholder="3" value={formData.experienceYears} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
                        <Input id="hourlyRate" name="hourlyRate" type="number" min="1" placeholder="30" value={formData.hourlyRate} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="availability">Availability</Label>
                        <Select value={formData.availability} onValueChange={(val) => setFormData((prev) => ({ ...prev, availability: val }))}>
                          <SelectTrigger id="availability">
                            <SelectValue placeholder="Select availability" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LESS_THAN_10">Less than 10 hrs/week</SelectItem>
                            <SelectItem value="PART_TIME">Part-time (10-20 hrs/week)</SelectItem>
                            <SelectItem value="FULL_TIME">Full-time (30+ hrs/week)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Core Skills (choose at least 3)</Label>
                      <div className="flex flex-wrap gap-2">
                        {SKILL_OPTIONS.map((skill) => (
                          <Button
                            key={skill}
                            type="button"
                            variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Selected: {formData.skills.length}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portfolioUrl">Portfolio URL (optional)</Label>
                      <Input id="portfolioUrl" name="portfolioUrl" placeholder="https://yourportfolio.com" value={formData.portfolioUrl} onChange={handleChange} />
                      {liveChecks.portfolioUrl.status !== LIVE_STATUS.IDLE && (
                        <p className={statusTextClass(liveChecks.portfolioUrl.status)}>{liveChecks.portfolioUrl.message}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input id="companyName" name="companyName" placeholder="Acme Labs Pvt Ltd" value={formData.companyName} onChange={handleChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyWebsite">Company Website (optional)</Label>
                        <Input id="companyWebsite" name="companyWebsite" placeholder="https://acme.com" value={formData.companyWebsite} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size</Label>
                        <Select value={formData.companySize} onValueChange={(val) => setFormData((prev) => ({ ...prev, companySize: val }))}>
                          <SelectTrigger id="companySize">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1_10">1-10</SelectItem>
                            <SelectItem value="11_50">11-50</SelectItem>
                            <SelectItem value="51_200">51-200</SelectItem>
                            <SelectItem value="201_1000">201-1000</SelectItem>
                            <SelectItem value="1000_PLUS">1000+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budgetRange">Typical Project Budget</Label>
                        <Select value={formData.budgetRange} onValueChange={(val) => setFormData((prev) => ({ ...prev, budgetRange: val }))}>
                          <SelectTrigger id="budgetRange">
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UNDER_1000">Under $1k</SelectItem>
                            <SelectItem value="1000_5000">$1k - $5k</SelectItem>
                            <SelectItem value="5000_20000">$5k - $20k</SelectItem>
                            <SelectItem value="20000_PLUS">$20k+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hiringGoal">Hiring Goal</Label>
                      <Textarea id="hiringGoal" name="hiringGoal" placeholder="What kind of developers or projects are you hiring for?" value={formData.hiringGoal} onChange={handleChange} rows={3} required />
                    </div>
                  </div>
                )
              )}

              {currentStep === 4 && (
                <div className="space-y-4 rounded-lg border p-4">
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                    <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Quick Review</p>
                    <p className="text-muted-foreground mt-1">Name: {formData.name || '-'} • Role: {role}</p>
                    <p className="text-muted-foreground">Email: {formData.email || '-'} • {formData.city || '-'}, {formData.state || '-'}</p>
                  </div>
                  <div className="flex items-start space-x-2 rounded-lg border p-3">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                    <Label htmlFor="acceptTerms" className="text-sm font-normal leading-5">
                      I agree to the{' '}
                      <Link
                        href="/legal/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link
                        href="/legal/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        Privacy Policy
                      </Link>
                      , and confirm my details are correct.
                    </Label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 1 || loading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={handleNext} disabled={loading}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
