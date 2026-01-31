import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Shield, Github, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
    toast({
      title: "You're on the list!",
      description: "We'll notify you when Cerberus is ready for public testing.",
    });
  };

  return (
    <section id="waitlist" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto overflow-hidden">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <Badge variant="outline" className="w-fit mb-4 gap-2">
                  <AlertTriangle className="h-3 w-3" />
                  In Development
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                  Join Cerberus Early Access
                </h2>
                <p className="text-muted-foreground mb-6">
                  Be notified when public testing and Github releases go live.
                </p>

                {isSubmitted ? (
                  <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <Shield className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">You're on the waitlist!</p>
                      <p className="text-sm text-muted-foreground">
                        We'll be in touch when Cerberus is ready.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1"
                        data-testid="input-waitlist-email"
                      />
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        data-testid="button-join-waitlist"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Joining...
                          </>
                        ) : (
                          <>
                            <Bell className="h-4 w-4 mr-2" />
                            Join the waitlist
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      No spam. Only important release updates.
                    </p>
                  </form>
                )}
              </div>

              <div className="bg-muted/50 p-8 md:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-border">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Github className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Open Source</h3>
                      <p className="text-sm text-muted-foreground">
                        Cerberus will be released on GitHub for transparency and community contribution.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Beta Testing</h3>
                      <p className="text-sm text-muted-foreground">
                        Early access members will help shape Cerberus before public release.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cerberus is currently in development. Donations help fund infrastructure, testing, and continued development as we prepare for public beta.
          </p>
        </div>
      </div>
    </section>
  );
}
