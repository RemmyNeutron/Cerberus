import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Download, 
  Shield, 
  Zap, 
  Eye, 
  Bell,
  CheckCircle,
  ArrowRight,
  Laptop,
  Terminal,
} from "lucide-react";

interface PlatformCardProps {
  platform: string;
  icon: React.ReactNode;
  version: string;
  size: string;
  requirements: string[];
  isPrimary?: boolean;
}

function PlatformCard({ platform, icon, version, size, requirements, isPrimary }: PlatformCardProps) {
  return (
    <Card className={`relative ${isPrimary ? 'border-primary shadow-lg' : ''}`} data-testid={`card-download-${platform.toLowerCase()}`}>
      {isPrimary && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="px-3 py-1">Recommended</Badge>
        </div>
      )}
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
        <CardTitle className="text-xl">{platform}</CardTitle>
        <CardDescription>Version {version} • {size}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full gap-2" size="lg" data-testid={`button-download-${platform.toLowerCase()}`}>
          <Download className="h-4 w-4" />
          Download for {platform}
        </Button>
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">System Requirements:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

const features = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Real-Time Protection",
    description: "Continuous monitoring of all files, downloads, and media content for AI-generated threats.",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Background Scanning",
    description: "Runs silently in the background, automatically scanning files as they enter your system.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Instant Alerts",
    description: "Get immediate desktop notifications when suspicious AI-generated content is detected.",
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: "System Tray Integration",
    description: "Quick access from your system tray with real-time status and one-click scanning.",
  },
];

export default function DownloadsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="outline" className="mb-4">Desktop Application</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" data-testid="text-downloads-headline">
              Cerberus Desktop Protection
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Download the Cerberus desktop application for real-time, always-on protection 
              against AI-generated threats. Available for Windows, macOS, and Linux.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Free with subscription
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Auto-updates
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                24/7 protection
              </div>
            </div>
          </div>
        </section>

        {/* Download Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <PlatformCard
                platform="Windows"
                icon={<Monitor className="h-8 w-8 text-primary" />}
                version="2.4.1"
                size="124 MB"
                requirements={[
                  "Windows 10 or later",
                  "64-bit processor",
                  "4 GB RAM minimum",
                  "500 MB disk space",
                ]}
                isPrimary
              />
              <PlatformCard
                platform="macOS"
                icon={<Laptop className="h-8 w-8 text-primary" />}
                version="2.4.1"
                size="118 MB"
                requirements={[
                  "macOS 11 Big Sur or later",
                  "Apple Silicon or Intel",
                  "4 GB RAM minimum",
                  "500 MB disk space",
                ]}
              />
              <PlatformCard
                platform="Linux"
                icon={<Terminal className="h-8 w-8 text-primary" />}
                version="2.4.1"
                size="108 MB"
                requirements={[
                  "Ubuntu 20.04+ / Fedora 34+",
                  "64-bit processor",
                  "4 GB RAM minimum",
                  "500 MB disk space",
                ]}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Desktop App Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The Cerberus desktop application provides comprehensive protection that works 
                seamlessly with your daily workflow.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {features.map((feature, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Installation Guide */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Quick Installation Guide</h2>
                <p className="text-muted-foreground">
                  Get protected in just a few minutes with our simple installation process.
                </p>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Download the installer</h3>
                    <p className="text-muted-foreground">
                      Click the download button for your operating system above. The installer 
                      will begin downloading automatically.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Run the installer</h3>
                    <p className="text-muted-foreground">
                      Open the downloaded file and follow the on-screen instructions. 
                      Administrator privileges may be required.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Sign in to your account</h3>
                    <p className="text-muted-foreground">
                      Launch Cerberus and sign in with your account credentials. Your 
                      subscription will be automatically detected.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">You're protected!</h3>
                    <p className="text-muted-foreground">
                      Cerberus will run in the background, providing real-time protection. 
                      Access it anytime from your system tray.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need Help Getting Started?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Our support team is available 24/7 to help you with installation, 
              configuration, or any questions about Cerberus.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="outline" className="gap-2">
                View Documentation
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" className="gap-2">
                Contact Support
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
