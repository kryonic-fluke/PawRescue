// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { 
  ArrowRight, Heart, Shield, Users, 
  MapPin, Camera, MessageCircle, 
  Calendar as CalendarIcon, Clock 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useTranslationSafe } from "@/hooks/useTranslationSafe";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { LanguageSelector } from "@/components/LanguageSelector";
import { TranslationExample } from "@/examples/TranslationExample";

// Type-safe translation function with variables
const useTranslationWithVars = () => {
  const { t, i18n } = useTranslationSafe();
  
  return { 
    t: (key: string, options?: Record<string, any>) => t(key, options),
    i18n 
  };
};

const Home = () => {
  const { user } = useUser();
  const { t, i18n } = useTranslationWithVars();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [savedEvents, setSavedEvents] = useState<Record<string, {title: string; note: string}>>({});
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveEvent = (date: Date, title: string, note: string) => {
    const dateKey = date.toISOString().split("T")[0];
    setSavedEvents(prev => ({ ...prev, [dateKey]: { title, note } }));
    toast.success(t('notification.savedEvent', { defaultValue: 'Event saved to calendar!' }));
  };

  const features = [
    { 
      icon: Camera, 
      title: t('home.features.reporting.title'),
      description: t('home.features.reporting.description'),
      color: "text-urgent" 
    },
    { 
      icon: Shield, 
      title: t('home.features.alerts.title'),
      description: t('home.features.alerts.description'),
      color: "text-secondary" 
    },
    { 
      icon: Heart, 
      title: t('home.features.adoption.title'),
      description: t('home.features.adoption.description'),
      color: "text-primary" 
    },
    { 
      icon: MessageCircle, 
      title: t('home.features.messaging.title'),
      description: t('home.features.messaging.description'),
      color: "text-accent" 
    },
  ];

  const stats = [
    { number: "2,500+", label: t('stats.rescued'), icon: Shield },
    { number: "1,800+", label: t('stats.adoptions'), icon: Heart },
    { number: "150+", label: t('stats.ngos'), icon: Users },
    { number: "50+", label: t('stats.cities'), icon: MapPin },
  ];

  return (
    <div className="min-h-screen">
      {/* Header with language selector */}
      <header className="p-4 flex justify-end">
        <LanguageSelector />
      </header>

      <main>
        {/* Small example component demonstrating translation usage */}
        <div className="px-4 md:px-8 lg:px-16">
          <TranslationExample />
        </div>

        {/* Hero Section */}
        <section className="hero-section py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                {t('home.welcome', { name: user?.firstName || t('common.friend', { defaultValue: 'Friend' }) })} 👋
              </h1>
              {user ? (
                <p className="text-white/80 mt-2">{t('home.welcomeBack')}</p>
              ) : (
                <p className="text-white/80 mt-2">
                  {t('home.signInPrompt.prefix')}{' '}
                  <Link className="underline text-primary" to="/sign-in">
                    {t('home.signInPrompt.link')}
                  </Link>{' '}
                  {t('home.signInPrompt.suffix')}
                </p>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative z-10 text-center lg:text-left animate-fade-in-up space-y-8">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    {t('home.hero.title')}{' '}
                    <span className="block text-primary-glow paw-print">
                      {t('home.hero.subtitle')}
                    </span>
                  </h1>
                  <p className="text-xl text-white/90 mb-8 max-w-2xl">
                    {t('home.hero.description')}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button size="lg" className="btn-rescue text-lg px-8 py-3" asChild>
                      <Link to="/report">
                        {t('nav.report')} <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="secondary" className="text-lg px-8 py-3" asChild>
                      <Link to="/adopt">
                        {t('nav.adopt')} <Heart className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>

                    {user && (
                      <Button size="lg" className="btn-hope text-lg px-8 py-3" asChild>
                        <Link to="/dashboard">{t('home.dashboard')}</Link>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-8">
                  {stats.map((stat, i) => (
                    <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
                      <CardContent className="p-4 text-center">
                        <stat.icon className="h-6 w-6 text-white mx-auto mb-2" />
                        <div className="text-2xl font-bold text-white">{stat.number}</div>
                        <div className="text-xs text-white/80">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/40 to-primary/40 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {t('home.mission.title')}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {t('home.mission.description')}
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Shield className="h-8 w-8 text-white mx-auto mb-2" />
                      <div className="text-sm text-white">24/7</div>
                      <div className="text-xs text-white/80">{t('home.emergency')}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 text-white mx-auto mb-2" />
                      <div className="text-sm text-white">{t('home.active')}</div>
                      <div className="text-xs text-white/80">{t('home.community')}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <MapPin className="h-8 w-8 text-white mx-auto mb-2" />
                      <div className="text-sm text-white">50+</div>
                      <div className="text-xs text-white/80">{t('home.cities')}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="relative z-10 animate-float space-y-6">
                <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/30">
                  <div className="text-center">
                    <div className="bg-white/15 rounded-2xl p-4 mb-6 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {t('home.location')}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {t('home.rescueActive')}
                          </p>
                          <p className="text-white/60 text-xs">
                            {t('home.emergencyResponse')}
                          </p>
                        </div>
                        <div className="w-16 h-16 bg-accent/30 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🐾</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative mx-auto w-full h-64">
                      {!imageError ? (
                        <img
                          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/ac68c699-50dc-4969-948e-c865aa87c2ee/generated_images/heartwarming-photo-of-diverse-rescued-an-07a3a4c4-20251006124735.jpg"
                          alt={t('home.heroImageAlt')}
                          loading="lazy"
                          className="w-full h-full object-cover rounded-2xl border border-white/20"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full rounded-2xl bg-primary/70 flex items-center justify-center">
                          <Heart className="h-16 w-16 text-white" />
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                        <Button asChild size="sm" className="btn-rescue">
                          <Link to="/report">{t('nav.report')}</Link>
                        </Button>
                        <Button asChild size="sm" className="btn-trust">
                          <Link to="/live-map">{t('nav.map')}</Link>
                        </Button>
                        <Button asChild size="sm" className="btn-hope">
                          <Link to="/adopt">{t('nav.adopt')}</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/30">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-white" />
                      <h3 className="text-lg font-semibold text-white">
                        {t('home.timeAndCalendar')}
                      </h3>
                    </div>

                    <div className="bg-white/15 rounded-xl p-6 mb-4 border border-white/20">
                      <div className="text-4xl font-bold text-white font-mono mb-2">
                        {currentTime.toLocaleTimeString(i18n.language)}
                      </div>
                      <div className="text-white/80">
                        {currentTime.toLocaleDateString(i18n.language, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" size="lg" className="w-full">
                          <CalendarIcon className="h-5 w-5 mr-2" />
                          {t('home.openCalendar')}
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{t('home.calendar.title')}</DialogTitle>
                        </DialogHeader>

                        <div className="grid md:grid-cols-2 gap-4">
                          <Calendar
                            mode="single"
                            selected={calendarDate}
                            onSelect={setCalendarDate}
                            className="rounded-md border"
                          />

                          <div className="space-y-4">
                            {calendarDate && (
                              <>
                                <div>
                                  <h3 className="font-semibold mb-2">
                                    {t('home.calendar.selectedDate', {
                                      date: calendarDate.toLocaleDateString(i18n.language)
                                    })}
                                  </h3>

                                  <Label>{t('home.calendar.eventTitle')}</Label>
                                  <Input
                                    id="eventTitle"
                                    placeholder={t('home.calendar.eventTitlePlaceholder')}
                                  />

                                  <Label className="mt-4 block">
                                    {t('home.calendar.eventNote')}
                                  </Label>
                                  <Textarea
                                    id="eventNote"
                                    placeholder={t('home.calendar.eventNotePlaceholder')}
                                    rows={3}
                                  />

                                  <Button
                                    className="mt-3 w-full"
                                    onClick={() => {
                                      const title = (document.getElementById("eventTitle") as HTMLInputElement)?.value;
                                      const note = (document.getElementById("eventNote") as HTMLTextAreaElement)?.value;

                                      if (title && calendarDate) {
                                        handleSaveEvent(calendarDate, title, note);
                                      }
                                    }}
                                  >
                                    {t('common.save')}
                                  </Button>
                                </div>

                                {(() => {
                                  const key = calendarDate.toISOString().split("T")[0];
                                  const event = savedEvents[key];
                                  return event ? (
                                    <div className="mt-4 p-4 bg-muted rounded-lg">
                                      <h4 className="font-semibold mb-1">
                                        {t('home.calendar.savedEvent')}:
                                      </h4>
                                      <p className="font-medium">{event.title}</p>
                                      {event.note && (
                                        <p className="text-sm mt-1">{event.note}</p>
                                      )}
                                    </div>
                                  ) : null;
                                })()}
                              </>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>

                <Card className="bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/30">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">
                    {t('home.platformFeatures')}
                  </h3>

                  <div className="space-y-3">
                    {[
                      {
                        icon: Camera,
                        title: t('home.features.reporting.title'),
                        description: t('home.features.reporting.shortDescription')
                      },
                      {
                        icon: Shield,
                        title: t('home.features.alerts.title'),
                        description: t('home.features.alerts.shortDescription')
                      },
                      {
                        icon: MessageCircle,
                        title: t('home.features.messaging.title'),
                        description: t('home.features.messaging.shortDescription')
                      },
                      {
                        icon: Heart,
                        title: t('home.features.adoption.title'),
                        description: t('home.features.adoption.shortDescription')
                      }
                    ].map(({ icon: Icon, title, description }, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                        <Icon className="h-5 w-5 text-white" />
                        <div>
                          <p className="font-semibold text-white text-sm">{title}</p>
                          <p className="text-xs text-white/70">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('home.features.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="card-warm text-center group cursor-pointer">
                <CardContent className="p-8">
                  <feature.icon
                    className={`h-12 w-12 ${feature.color} mx-auto mb-6 group-hover:scale-110 transition`}
                  />
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('home.cta.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-rescue" asChild>
                <Link to="/report">{t('home.cta.report')}</Link>
              </Button>

              <Button size="lg" className="btn-trust" asChild>
                <Link to="/ngo-dashboard">{t('home.cta.ngo')}</Link>
              </Button>

              <Button size="lg" className="btn-hope" asChild>
                <Link to="/adopt">{t('home.cta.adopt')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
