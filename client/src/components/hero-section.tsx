import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 dark:from-primary/10 dark:to-accent/10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm gap-2" data-testid="badge-hero-ai">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>AI-Powered Security Protection</span>
            </Badge>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight" data-testid="text-hero-headline">
            Three Heads.{" "}
            <span className="gradient-text">One Guardian.</span>{" "}
            <span className="text-muted-foreground">Total Protection.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Like the mythological guardian of the underworld, Cerberus deploys three specialized AI heads
            to detect deepfakes, monitor surveillance threats, and contain adaptive attacks in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="text-base px-8 gap-2" asChild data-testid="button-hero-get-started">
              <a href="/api/login">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild data-testid="button-hero-learn-more">
              <a href="#features">
                Explore Features
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Hero visual - Three Shields representing the three heads */}
        <div className="mt-16 md:mt-24 flex justify-center">
          <div className="relative">
            {/* Central shield grouping */}
            <div className="flex items-end justify-center gap-4 md:gap-8">
              {/* Left Head - Deepfake Detection */}
              <div className="transform -rotate-12 opacity-80">
                <div className="w-24 h-32 md:w-32 md:h-40 bg-gradient-to-br from-blue-500/20 to-blue-600/10 dark:from-blue-400/30 dark:to-blue-600/20 rounded-2xl border border-blue-500/20 flex items-center justify-center backdrop-blur-sm">
                  <Shield className="h-12 w-12 md:h-16 md:w-16 text-blue-500" />
                </div>
              </div>

              {/* Center Head - Primary */}
              <div className="z-10">
                <div className="w-32 h-44 md:w-44 md:h-56 bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-2xl border border-primary/30 flex items-center justify-center backdrop-blur-sm security-glow">
                  <Shield className="h-16 w-16 md:h-24 md:w-24 text-primary" />
                </div>
              </div>

              {/* Right Head - Containment */}
              <div className="transform rotate-12 opacity-80">
                <div className="w-24 h-32 md:w-32 md:h-40 bg-gradient-to-br from-red-500/20 to-red-600/10 dark:from-red-400/30 dark:to-red-600/20 rounded-2xl border border-red-500/20 flex items-center justify-center backdrop-blur-sm">
                  <Shield className="h-12 w-12 md:h-16 md:w-16 text-red-500" />
                </div>
              </div>
            </div>

            {/* Connection lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full max-w-xs h-1 bg-gradient-to-r from-blue-500/30 via-primary/50 to-red-500/30 rounded-full blur-sm" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
