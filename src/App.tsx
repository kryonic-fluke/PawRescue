import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import i18n from './lib/i18n';
import { LanguageProvider } from './contexts/LanguageContext';
import { useRTL } from './hooks/useRTL';

// Import components
import Navigation from './components/Navigation';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import pages
import Home from './pages/Home';
import ReportAnimal from './pages/ReportAnimal';
import AdoptionListings from './pages/AdoptionListings';
import AnimalProfile from './pages/AnimalProfile';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NGODashboard from './pages/NGODashboard';
import FavoritesPage from './pages/FavoritesPage';
import LiveMap from './pages/LiveMap';
import AdoptionGuide from './pages/AdoptionGuide';
import NotFound from './pages/NotFound';
import AdoptionForm from "./pages/AdoptionForm";
import ContactShelters from "./pages/ContactShelters";
import DonationPage from "./pages/DonationPage";
import ThankYou from "./pages/ThankYou";
import ContactPage from './app/contact/page';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

// Import fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  useRTL(); // Handle RTL layout based on language

  return (
    <ThemeProvider defaultTheme="system" storageKey="pawrescue-theme">
      <TooltipProvider>
        <Elements stripe={stripePromise}>
          <div className="min-h-screen flex flex-col bg-background text-foreground font-inter">
            <Navigation />
            <Toaster />
            <Sonner />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/" element={<Home />} />
                <Route path="/adopt" element={<AdoptionListings />} />
                <Route path="/animal/:id" element={<AnimalProfile />} />
                <Route path="/adoption-guides" element={<AdoptionGuide />} />
                <Route path="/live-map" element={<LiveMap />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/donate" element={<DonationPage />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/contact-shelters" element={<ContactShelters />} />

                {/* Protected Routes */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report"
                  element={
                    <ProtectedRoute>
                      <ReportAnimal />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/adopt/:id"
                  element={
                    <ProtectedRoute>
                      <AdoptionForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ngo-dashboard"
                  element={
                    <ProtectedRoute>
                      <NGODashboard />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <footer className="bg-background border-t mt-12 py-8">
              <div className="container mx-auto px-4 text-center text-muted-foreground">
                <p>© {new Date().getFullYear()} PawRescue. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </Elements>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </LanguageProvider>
    </I18nextProvider>
  );
};

export default App;