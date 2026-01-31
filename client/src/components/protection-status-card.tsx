import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Shield, Zap, CheckCircle, AlertTriangle, XCircle, Loader2, ChevronDown, ChevronUp, Ban, Globe, Mail, Server, File, Smartphone, Clock, Info, MapPin } from "lucide-react";
import type { ThreatLog } from "@shared/schema";

interface ProtectionStatusCardProps {
  headType: "deepfake" | "surveillance" | "containment";
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  isLoading?: boolean;
  threatCount?: number;
  threats?: ThreatLog[];
  status?: "active" | "warning" | "critical";
}

const headConfig = {
  deepfake: {
    title: "Deepfake Detection",
    description: "AI-powered media verification",
    icon: Eye,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  surveillance: {
    title: "Surveillance Monitoring",
    description: "Privacy protection shield",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
  },
  containment: {
    title: "Threat Containment",
    description: "Adaptive defense system",
    icon: Zap,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
};

const statusConfig = {
  active: {
    icon: CheckCircle,
    text: "Active",
    color: "text-primary",
    badge: "default" as const,
  },
  warning: {
    icon: AlertTriangle,
    text: "Warning",
    color: "text-yellow-500",
    badge: "secondary" as const,
  },
  critical: {
    icon: XCircle,
    text: "Critical",
    color: "text-destructive",
    badge: "destructive" as const,
  },
};

const threatLevelConfig = {
  low: { badge: "secondary" as const, label: "Low" },
  medium: { badge: "default" as const, label: "Medium" },
  high: { badge: "destructive" as const, label: "High" },
  critical: { badge: "destructive" as const, label: "Critical" },
};

const sourceTypeIcons = {
  website: Globe,
  email: Mail,
  application: Smartphone,
  network: Server,
  file: File,
};

function ThreatDetailItem({ threat }: { threat: ThreatLog }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const levelConfig = threatLevelConfig[threat.threatLevel as keyof typeof threatLevelConfig] || threatLevelConfig.low;
  const SourceIcon = threat.sourceType ? sourceTypeIcons[threat.sourceType as keyof typeof sourceTypeIcons] || Globe : Globe;

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button 
            className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
            data-testid={`button-threat-detail-${threat.id}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant={levelConfig.badge} className="text-xs">
                    {levelConfig.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(threat.detectedAt)}
                  </span>
                </div>
                <p className="text-sm line-clamp-1">{threat.blockedContent || threat.description}</p>
                {threat.source && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <SourceIcon className="h-3 w-3" />
                    <span className="truncate">{threat.source}</span>
                  </p>
                )}
              </div>
              <div className="shrink-0 text-muted-foreground">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0 border-t border-border/30 space-y-2.5">
            <div className="pt-3">
              {threat.description && (
                <p className="text-sm text-muted-foreground mb-2">{threat.description}</p>
              )}

              {threat.reason && (
                <div className="flex items-start gap-2 mb-2">
                  <Info className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Why blocked:</p>
                    <p className="text-xs">{threat.reason}</p>
                  </div>
                </div>
              )}

              {threat.ipAddress && (
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">IP Address:</p>
                    <p className="text-xs font-mono">{threat.ipAddress}</p>
                  </div>
                </div>
              )}

              {threat.actionTaken && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Action taken:</p>
                    <p className="text-xs">{threat.actionTaken}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function ProtectionStatusCard({
  headType,
  isEnabled,
  onToggle,
  isLoading = false,
  threatCount = 0,
  threats = [],
  status = "active",
}: ProtectionStatusCardProps) {
  const [showThreats, setShowThreats] = useState(false);
  const config = headConfig[headType];
  const statusInfo = statusConfig[status];
  const Icon = config.icon;
  const StatusIcon = statusInfo.icon;

  const filteredThreats = threats.filter(t => t.headType === headType && t.status === "blocked");

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${!isEnabled ? 'opacity-60' : ''}`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${isEnabled ? config.bgColor.replace('/10', '') : 'bg-muted'}`} />
      
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${config.bgColor} ${config.borderColor} border`}>
            <Icon className={`h-6 w-6 ${config.color}`} />
          </div>
          <div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggle}
          disabled={isLoading}
          aria-label={`Toggle ${config.title}`}
          data-testid={`switch-${headType}`}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <StatusIcon className={`h-4 w-4 ${isEnabled ? statusInfo.color : 'text-muted-foreground'}`} />
            )}
            <span className="text-sm font-medium">
              {isLoading ? "Updating..." : isEnabled ? statusInfo.text : "Disabled"}
            </span>
          </div>
          
          {isEnabled && threatCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 h-auto py-1.5"
              onClick={() => setShowThreats(!showThreats)}
              data-testid={`button-show-threats-${headType}`}
            >
              <Ban className="h-3.5 w-3.5 text-destructive" />
              <span>{threatCount} threat{threatCount > 1 ? 's' : ''} blocked</span>
              {showThreats ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          )}
          
          {isEnabled && threatCount === 0 && (
            <Badge variant="secondary">
              No threats detected
            </Badge>
          )}
        </div>

        {showThreats && filteredThreats.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-3">Blocked Threats</p>
            <ScrollArea className={filteredThreats.length > 2 ? "h-[280px]" : ""}>
              <div className="space-y-2 pr-2">
                {filteredThreats.map((threat) => (
                  <ThreatDetailItem key={threat.id} threat={threat} />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
