import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import cerberusBg from "@assets/CerberusBG_1769811901895.png";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Background image with dark wash */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cerberusBg})` }}
      />
      {/* Dark wash gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50" />
      {/* Additional top gradient for header area */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm gap-2 bg-black/50 backdrop-blur-sm border-orange-500/30" data-testid="badge-hero-ai">
              <Sparkles className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <span className="text-white">AI-Powered Security Protection</span>
            </Badge>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg" data-testid="text-hero-headline">
            Three Heads.{" "}
            <span className="text-orange-500">One Guardian.</span>{" "}
            <span className="text-gray-300">Total Protection.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Like the mythological guardian of the underworld, Cerberus deploys three specialized AI heads
            to detect deepfakes, monitor surveillance threats, and contain adaptive attacks in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="text-base px-8 gap-2 bg-orange-600 hover:bg-orange-700 border-orange-700" asChild data-testid="button-hero-get-started">
              <a href="/api/login">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 bg-black/30 backdrop-blur-sm border-white/30 text-white hover:bg-white/10" asChild data-testid="button-hero-learn-more">
              <a href="#features">
                Explore Features
              </a>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-orange-500" aria-hidden="true" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
