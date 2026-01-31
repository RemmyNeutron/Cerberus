import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ProtectionStatusCard } from "@/components/protection-status-card";
import { ThreatLogItem } from "@/components/threat-log-item";
import { StatsCard } from "@/components/stats-card";
import { MediaScanner } from "@/components/media-scanner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Activity, AlertTriangle, CheckCircle, RefreshCw, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ProtectionStatus, ThreatLog } from "@shared/schema";

export default function DashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/api/login";
    }
  }, [authLoading, isAuthenticated]);

  const { data: protectionStatus, isLoading: statusLoading } = useQuery<ProtectionStatus>({
    queryKey: ["/api/protection-status"],
    enabled: isAuthenticated,
  });

  const { data: threatLogs, isLoading: logsLoading } = useQuery<ThreatLog[]>({
    queryKey: ["/api/threat-logs"],
    enabled: isAuthenticated,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalThreatsBlocked: number;
    threatsToday: number;
    lastScan: string;
    securityScore: number;
  }>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  const updateProtectionMutation = useMutation({
    mutationFn: async (data: { headType: string; enabled: boolean }) => {
      return apiRequest("PATCH", "/api/protection-status", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/protection-status"] });
      toast({
        title: "Protection Updated",
        description: "Your security settings have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update protection settings.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (headType: string, enabled: boolean) => {
    updateProtectionMutation.mutate({ headType, enabled });
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ""}
              </h1>
              <p className="text-muted-foreground">
                Your Cerberus guardian is actively protecting your digital presence.
              </p>
            </div>
            <Badge variant="secondary" className="gap-2 py-2 px-4">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              All Systems Active
            </Badge>
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <StatsCard
                title="Security Score"
                value={`${stats?.securityScore || 98}%`}
                description="Excellent protection"
                icon={<Shield className="h-5 w-5" />}
                trend="up"
                trendValue="+2% this week"
              />
              <StatsCard
                title="Threats Blocked Today"
                value={stats?.threatsToday || 0}
                description="Across all protection heads"
                icon={<AlertTriangle className="h-5 w-5" />}
                trend="neutral"
              />
              <StatsCard
                title="Total Threats Blocked"
                value={stats?.totalThreatsBlocked || 0}
                description="Since account creation"
                icon={<CheckCircle className="h-5 w-5" />}
                trend="up"
                trendValue="+12 this month"
              />
              <StatsCard
                title="Last Scan"
                value={stats?.lastScan || "Just now"}
                description="Continuous monitoring active"
                icon={<Clock className="h-5 w-5" />}
              />
            </>
          )}
        </div>

        {/* Media Scanner */}
        <div className="mb-8">
          <MediaScanner />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Protection status cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Protection Heads
            </h2>
            
            {statusLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <ProtectionStatusCard
                  headType="deepfake"
                  isEnabled={protectionStatus?.deepfakeEnabled ?? true}
                  onToggle={(enabled) => handleToggle("deepfake", enabled)}
                  isLoading={updateProtectionMutation.isPending}
                  threatCount={threatLogs?.filter((l) => l.headType === "deepfake" && l.status === "blocked").length}
                  threats={threatLogs || []}
                />
                <ProtectionStatusCard
                  headType="surveillance"
                  isEnabled={protectionStatus?.surveillanceEnabled ?? true}
                  onToggle={(enabled) => handleToggle("surveillance", enabled)}
                  isLoading={updateProtectionMutation.isPending}
                  threatCount={threatLogs?.filter((l) => l.headType === "surveillance" && l.status === "blocked").length}
                  threats={threatLogs || []}
                />
                <ProtectionStatusCard
                  headType="containment"
                  isEnabled={protectionStatus?.containmentEnabled ?? true}
                  onToggle={(enabled) => handleToggle("containment", enabled)}
                  isLoading={updateProtectionMutation.isPending}
                  threatCount={threatLogs?.filter((l) => l.headType === "containment" && l.status === "blocked").length}
                  threats={threatLogs || []}
                />
              </div>
            )}
          </div>

          {/* Recent threat logs */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" data-testid="button-refresh-logs">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Latest detected and blocked threats
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-lg border">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ))}
                  </div>
                ) : threatLogs && threatLogs.length > 0 ? (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {threatLogs.slice(0, 10).map((log) => (
                        <ThreatLogItem key={log.id} log={log} />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-12 w-12 text-primary/50 mb-4" />
                    <p className="font-medium">All Clear</p>
                    <p className="text-sm text-muted-foreground">
                      No threats detected recently
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
