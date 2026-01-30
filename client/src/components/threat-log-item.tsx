import { Badge } from "@/components/ui/badge";
import { Eye, Shield, Zap, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type { ThreatLog } from "@shared/schema";

interface ThreatLogItemProps {
  log: ThreatLog;
}

const headTypeConfig = {
  deepfake: {
    icon: Eye,
    label: "Deepfake",
    color: "text-blue-500",
  },
  surveillance: {
    icon: Shield,
    label: "Surveillance",
    color: "text-primary",
  },
  containment: {
    icon: Zap,
    label: "Containment",
    color: "text-red-500",
  },
};

const threatLevelConfig = {
  low: {
    badge: "secondary" as const,
    label: "Low",
  },
  medium: {
    badge: "secondary" as const,
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
    icon: Clock,
    label: "Blocked",
    color: "text-blue-500",
  },
  resolved: {
    icon: CheckCircle,
    label: "Resolved",
    color: "text-primary",
  },
};

export function ThreatLogItem({ log }: ThreatLogItemProps) {
  const headConfig = headTypeConfig[log.headType as keyof typeof headTypeConfig] || headTypeConfig.containment;
  const levelConfig = threatLevelConfig[log.threatLevel as keyof typeof threatLevelConfig] || threatLevelConfig.low;
  const statusCfg = statusConfig[log.status as keyof typeof statusConfig] || statusConfig.detected;
  
  const HeadIcon = headConfig.icon;
  const StatusIcon = statusCfg.icon;

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
    <div className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card hover-elevate transition-all">
      <div className={`p-2 rounded-lg bg-muted ${headConfig.color}`}>
        <HeadIcon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-medium text-sm">{headConfig.label}</span>
          <Badge variant={levelConfig.badge} className="text-xs">
            {levelConfig.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{log.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <StatusIcon className={`h-3 w-3 ${statusCfg.color}`} />
            <span>{statusCfg.label}</span>
          </div>
          <span>{formatDate(log.detectedAt)}</span>
        </div>
      </div>
    </div>
  );
}
