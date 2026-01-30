import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Shield, Zap, Brain, Lock, Bell, Scan, Target, Layers } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  headNumber: number;
  accentColor: string;
  badgeText: string;
}

function FeatureCard({ icon, title, description, features, headNumber, accentColor, badgeText }: FeatureCardProps) {
  return (
    <Card className="relative overflow-hidden group hover-elevate transition-all duration-300" data-testid={`card-feature-head-${headNumber}`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${accentColor}`} />
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className={`p-3 rounded-xl ${accentColor.replace('bg-', 'bg-').replace('/100', '/10')} bg-opacity-10`}>
            {icon}
          </div>
          <Badge variant="outline" className="text-xs">
            Head {headNumber}
          </Badge>
        </div>
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge className="mt-2" variant="secondary">{badgeText}</Badge>
        </div>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${accentColor.replace('/100', '/20')}`}>
                <div className={`h-2 w-2 rounded-full ${accentColor}`} />
              </div>
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

const features = [
  {
    icon: <Eye className="h-6 w-6 text-blue-500" />,
    title: "AI Deepfake Detection",
    description: "Advanced neural networks detect manipulated media, synthetic voices, and generated content with 99.7% accuracy.",
    features: [
      "Real-time video analysis for face swaps",
      "Voice authentication and clone detection",
      "Document forgery identification",
      "Social media content verification",
    ],
    headNumber: 1,
    accentColor: "bg-blue-500",
    badgeText: "Vision AI",
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Anti-AI Surveillance",
    description: "Monitor and neutralize unauthorized AI systems attempting to track, profile, or manipulate your digital presence.",
    features: [
      "Facial recognition blocking",
      "Behavioral tracking detection",
      "Data harvesting prevention",
      "Privacy score monitoring",
    ],
    headNumber: 2,
    accentColor: "bg-primary",
    badgeText: "Privacy Shield",
  },
  {
    icon: <Zap className="h-6 w-6 text-red-500" />,
    title: "Adaptive Threat Containment",
    description: "Self-evolving defense mechanisms that learn from attacks and automatically strengthen your security posture.",
    features: [
      "Zero-day threat response",
      "Automated quarantine protocols",
      "Attack pattern learning",
      "Network isolation capabilities",
    ],
    headNumber: 3,
    accentColor: "bg-red-500",
    badgeText: "Active Defense",
  },
];

const capabilities = [
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Machine Learning Core",
    description: "Self-improving algorithms that evolve with emerging threats",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "End-to-End Encryption",
    description: "Military-grade encryption for all your sensitive data",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    title: "Real-Time Alerts",
    description: "Instant notifications when threats are detected",
  },
  {
    icon: <Scan className="h-5 w-5" />,
    title: "Continuous Scanning",
    description: "24/7 monitoring across all your connected devices",
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: "Precision Targeting",
    description: "Focus security resources where they matter most",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Multi-Layer Defense",
    description: "Multiple security barriers for comprehensive protection",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4">The Three Heads</Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            Triple-Layered AI Defense
          </h2>
          <p className="text-lg text-muted-foreground">
            Each head of Cerberus specializes in a different aspect of digital security,
            working in harmony to provide complete protection.
          </p>
        </div>

        {/* Main feature cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              {...feature}
            />
          ))}
        </div>

        {/* Additional capabilities */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">Core Capabilities</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built on cutting-edge technology to keep you protected
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 rounded-xl bg-background border border-border/50 hover-elevate transition-all duration-200"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                {capability.icon}
              </div>
              <div>
                <h4 className="font-semibold mb-1">{capability.title}</h4>
                <p className="text-sm text-muted-foreground">{capability.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
