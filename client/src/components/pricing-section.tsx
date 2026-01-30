import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Check, X, Sparkles } from "lucide-react";

interface PricingTier {
  name: string;
  tier: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: { name: string; included: boolean }[];
  maxDevices: number;
  isPopular: boolean;
  ctaText: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Basic",
    tier: "basic",
    priceMonthly: 9,
    priceYearly: 89,
    description: "Essential protection for individuals",
    features: [
      { name: "AI Deepfake Detection (Limited)", included: true },
      { name: "Basic Surveillance Monitoring", included: true },
      { name: "Email Threat Alerts", included: true },
      { name: "Community Support", included: true },
      { name: "Adaptive Threat Containment", included: false },
      { name: "Real-time Response", included: false },
      { name: "API Access", included: false },
      { name: "Dedicated Support", included: false },
    ],
    maxDevices: 3,
    isPopular: false,
    ctaText: "Start Free Trial",
  },
  {
    name: "Pro",
    tier: "pro",
    priceMonthly: 29,
    priceYearly: 279,
    description: "Advanced security for professionals",
    features: [
      { name: "Full AI Deepfake Detection", included: true },
      { name: "Advanced Surveillance Monitoring", included: true },
      { name: "Real-time Threat Alerts", included: true },
      { name: "Priority Support", included: true },
      { name: "Adaptive Threat Containment", included: true },
      { name: "Real-time Response", included: true },
      { name: "API Access", included: false },
      { name: "Dedicated Support", included: false },
    ],
    maxDevices: 10,
    isPopular: true,
    ctaText: "Start Free Trial",
  },
  {
    name: "Enterprise",
    tier: "enterprise",
    priceMonthly: 99,
    priceYearly: 990,
    description: "Complete protection for organizations",
    features: [
      { name: "Full AI Deepfake Detection", included: true },
      { name: "Enterprise Surveillance Suite", included: true },
      { name: "Custom Alert Configuration", included: true },
      { name: "24/7 Dedicated Support", included: true },
      { name: "Advanced Threat Containment", included: true },
      { name: "Instant Real-time Response", included: true },
      { name: "Full API Access", included: true },
      { name: "Dedicated Account Manager", included: true },
    ],
    maxDevices: 100,
    isPopular: false,
    ctaText: "Contact Sales",
  },
];

interface PricingCardProps {
  tier: PricingTier;
  isYearly: boolean;
}

function PricingCard({ tier, isYearly }: PricingCardProps) {
  const price = isYearly ? tier.priceYearly : tier.priceMonthly;
  const period = isYearly ? "/year" : "/month";
  const savings = tier.priceMonthly * 12 - tier.priceYearly;

  return (
    <Card 
      className={`relative flex flex-col ${tier.isPopular ? 'border-primary shadow-lg ring-1 ring-primary/20' : ''}`}
      data-testid={`card-pricing-${tier.tier}`}
    >
      {tier.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="gap-1 px-3 py-1">
            <Sparkles className="h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">{tier.name}</CardTitle>
        <CardDescription className="min-h-[48px]">{tier.description}</CardDescription>
        <div className="mt-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">${price}</span>
            <span className="text-muted-foreground">{period}</span>
          </div>
          {isYearly && savings > 0 && (
            <p className="text-sm text-primary mt-1">Save ${savings}/year</p>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Up to {tier.maxDevices} device{tier.maxDevices > 1 ? 's' : ''}
        </p>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.included ? (
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground/40 shrink-0 mt-0.5" aria-hidden="true" />
              )}
              <span className={feature.included ? '' : 'text-muted-foreground/60'}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          variant={tier.isPopular ? "default" : "outline"}
          size="lg"
          asChild
          data-testid={`button-cta-${tier.tier}`}
        >
          <a href="/api/login" target="_top" data-testid={`link-select-${tier.tier}`}>{tier.ctaText}</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Choose Your Level of Protection
          </h2>
          <p className="text-lg text-muted-foreground">
            From individual users to enterprise organizations, we have a plan that fits your security needs.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Label 
            htmlFor="billing-toggle" 
            className={`text-sm ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
            data-testid="switch-billing-toggle"
            aria-label="Toggle yearly billing"
          />
          <Label 
            htmlFor="billing-toggle" 
            className={`text-sm flex items-center gap-2 ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            Yearly
            <Badge variant="secondary" className="text-xs">Save up to 20%</Badge>
          </Label>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.tier} tier={tier} isYearly={isYearly} />
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}
