import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Eye, Shield, Zap, AlertTriangle, CheckCircle, Clock, ChevronDown, ChevronUp, Globe, Mail, Server, File, Smartphone, MapPin, Ban, Info } from "lucide-react";
import type { ThreatLog } from "@shared/schema";

interface ThreatLogItemProps {
  log: ThreatLog;
}

const headTypeConfig = {
  deepfake: {
    icon: Eye,
    label: "Deepfake Detection",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  surveillance: {
    icon: Shield,
    label: "Surveillance Monitor",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  containment: {
    icon: Zap,
    label: "Threat Containment",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
};

const threatLevelConfig = {
  low: {
    badge: "secondary" as const,
    label: "Low",
  },
  medium: {
    badge: "default" as const,
    label: "Medium",
  },
  high: {
    badge: "destructive" as const,
    label: "High",
  },
  critical: {
    badge: "destructive" as const,
    label: "Critical",
  },
};

const statusConfig = {
  detected: {
    icon: AlertTriangle,
    label: "Detected",
    color: "text-yellow-500",
  },
  blocked: {
    icon: Ban,
    label: "Blocked",
    color: "text-destructive",
  },
  resolved: {
    icon: CheckCircle,
    label: "Resolved",
    color: "text-primary",
  },
};

const sourceTypeIcons = {
  website: Globe,
  email: Mail,
  application: Smartphone,
  network: Server,
  file: File,
};

export function ThreatLogItem({ log }: ThreatLogItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const headConfig = headTypeConfig[log.headType as keyof typeof headTypeConfig] || headTypeConfig.containment;
  const levelConfig = threatLevelConfig[log.threatLevel as keyof typeof threatLevelConfig] || threatLevelConfig.low;
  const statusCfg = statusConfig[log.status as keyof typeof statusConfig] || statusConfig.detected;
  
  const HeadIcon = headConfig.icon;
  const StatusIcon = statusCfg.icon;
  const SourceTypeIcon = log.sourceType ? sourceTypeIcons[log.sourceType as keyof typeof sourceTypeIcons] || Globe : Globe;

  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasDetails = log.source || log.blockedContent || log.reason || log.actionTaken;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-start gap-4 p-4 hover-elevate transition-all text-left"
            data-testid={`button-expand-threat-${log.id}`}
          >
            <div className={`p-2 rounded-lg ${headConfig.bgColor} ${headConfig.color}`}>
              <HeadIcon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-medium text-sm">{headConfig.label}</span>
                <Badge variant={levelConfig.badge} className="text-xs">
                  {levelConfig.label}
                </Badge>
                <Badge variant="outline" className={`text-xs gap-1 ${statusCfg.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusCfg.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{log.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(log.detectedAt)}</span>
                </div>
                {log.source && (
                  <div className="flex items-center gap-1">
                    <SourceTypeIcon className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{log.source}</span>
                  </div>
                )}
              </div>
            </div>

            {hasDetails && (
              <div className="shrink-0 text-muted-foreground">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            )}
          </button>
        </CollapsibleTrigger>

        {hasDetails && (
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-0 border-t border-border/50 mt-0">
              <div className="pt-4 space-y-3">
                {log.blockedContent && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-destructive/10">
                      <Ban className="h-3.5 w-3.5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Blocked Content</p>
                      <p className="text-sm mt-0.5">{log.blockedContent}</p>
                    </div>
                  </div>
                )}

                {log.source && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-muted">
                      <SourceTypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</p>
                      <p className="text-sm mt-0.5 break-all">{log.source}</p>
                      {log.sourceType && (
                        <Badge variant="outline" className="text-xs mt-1 capitalize">
                          {log.sourceType}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {log.ipAddress && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-muted">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">IP Address</p>
                      <p className="text-sm mt-0.5 font-mono">{log.ipAddress}</p>
                    </div>
                  </div>
                )}

                {log.reason && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-primary/10">
                      <Info className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Why It Was Blocked</p>
                      <p className="text-sm mt-0.5 text-muted-foreground">{log.reason}</p>
                    </div>
                  </div>
                )}

                {log.actionTaken && (
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-primary/10">
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Action Taken</p>
                      <p className="text-sm mt-0.5">{log.actionTaken}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}
