import './globals.css';
import { ThemeProvider } from 'next-themes';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import PremiumChatbot from '@/components/PremiumChatbot';
import Preloader from '@/components/Preloader';

export const metadata = {
  title: 'Nainix - 0% Commission Freelancing Platform',
  description: 'Nainix helps clients hire developers and freelancers find projects. Post jobs, send proposals, and connect directly with 0% commission.',
  icons: {
    icon: '/logo_light.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body>
        <Preloader />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <PremiumChatbot />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
