import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommonAlertProps {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const alertConfig = {
  success: {
    variant: "success" as const,
    icon: CheckCircle,
    iconClass: "text-green-600",
  },
  error: {
    variant: "destructive" as const,
    icon: AlertCircle,
    iconClass: "text-red-600",
  },
  warning: {
    variant: "warning" as const,
    icon: AlertTriangle,
    iconClass: "text-yellow-600",
  },
  info: {
    variant: "info" as const,
    icon: Info,
    iconClass: "text-blue-600",
  },
};

export function CommonAlert({
  type,
  title,
  message,
  className,
  onClose,
  showCloseButton = false,
}: CommonAlertProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <Alert variant={config.variant} className={cn("relative", className)}>
      <Icon className={cn("h-4 w-4", config.iconClass)} />
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{message}</AlertDescription>
      </div>
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Alert>
  );
}

// Convenience components for common alert types
export function SuccessAlert({ title, message, ...props }: Omit<CommonAlertProps, "type">) {
  return <CommonAlert type="success" title={title} message={message} {...props} />;
}

export function ErrorAlert({ title, message, ...props }: Omit<CommonAlertProps, "type">) {
  return <CommonAlert type="error" title={title} message={message} {...props} />;
}

export function WarningAlert({ title, message, ...props }: Omit<CommonAlertProps, "type">) {
  return <CommonAlert type="warning" title={title} message={message} {...props} />;
}

export function InfoAlert({ title, message, ...props }: Omit<CommonAlertProps, "type">) {
  return <CommonAlert type="info" title={title} message={message} {...props} />;
} 