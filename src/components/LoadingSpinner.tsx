import { Loader2, Leaf } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message = "Analyzing..." }: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-muted animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className="h-8 w-8 text-primary animate-pulse-slow" />
        </div>
        <Loader2 className="absolute inset-0 h-16 w-16 text-primary animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{message}</p>
      <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
    </div>
  );
};

export default LoadingSpinner;
