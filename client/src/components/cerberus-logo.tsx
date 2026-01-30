import { Shield } from "lucide-react";

interface CerberusLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function CerberusLogo({ className = "", size = "md", showText = true }: CerberusLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Shield 
          className={`${sizeClasses[size]} text-primary fill-primary/10`} 
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-primary font-bold text-xs">III</span>
        </div>
      </div>
      {showText && (
        <span className={`font-bold tracking-tight ${textSizeClasses[size]}`}>
          Cerberus
        </span>
      )}
    </div>
  );
}
