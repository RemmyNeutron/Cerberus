import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, Shield, Zap, CheckCircle, AlertTriangle, XCircle, Loader2 } from "lucide-react";

interface ProtectionStatusCardProps {
  headType: "deepfake" | "surveillance" | "containment";
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  isLoading?: boolean;
  threatCount?: number;
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
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
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
    color: "text-red-500",
    badge: "destructive" as const,
  },
};

export function ProtectionStatusCard({
  headType,
  isEnabled,
  onToggle,
  isLoading = false,
  threatCount = 0,
  status = "active",
}: ProtectionStatusCardProps) {
  const config = headConfig[headType];
  const statusInfo = statusConfig[status];
  const Icon = config.icon;
  const StatusIcon = statusInfo.icon;

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

      <CardContent>
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
            <Badge variant={statusInfo.badge}>
              {threatCount} threat{threatCount > 1 ? 's' : ''} blocked
            </Badge>
          )}
          
          {isEnabled && threatCount === 0 && (
            <Badge variant="secondary">
              No threats detected
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
