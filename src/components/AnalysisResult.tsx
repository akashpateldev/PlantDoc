import { AlertTriangle, CheckCircle, Leaf, Pill, Shield, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface DiseaseResult {
  diseaseName: string;
  confidence: number;
  description: string;
  causes: string[];
  chemicalTreatment: string[];
  organicTreatment: string[];
  prevention: string[];
  isHealthy: boolean;
}

interface AnalysisResultProps {
  result: DiseaseResult;
}

const AnalysisResult = ({ result }: AnalysisResultProps) => {
  const confidenceColor = result.confidence >= 80 
    ? "text-success" 
    : result.confidence >= 50 
    ? "text-warning" 
    : "text-destructive";

  return (
    <div className="animate-scale-in rounded-xl border border-border bg-card overflow-hidden shadow-card">
      {/* Header */}
      <div className={`p-6 ${result.isHealthy ? 'bg-success/10' : 'bg-destructive/5'}`}>
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
            result.isHealthy ? 'bg-success/20' : 'bg-destructive/10'
          }`}>
            {result.isHealthy ? (
              <CheckCircle className="h-6 w-6 text-success" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-destructive" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-foreground mb-1">
              {result.diseaseName}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <span className={`text-sm font-semibold ${confidenceColor}`}>
                {result.confidence}%
              </span>
            </div>
            <Progress value={result.confidence} className="h-2 mt-2 w-48" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-foreground">About this Disease</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.description}
          </p>
        </div>

        {/* Causes */}
        {!result.isHealthy && result.causes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h4 className="font-semibold text-foreground">Possible Causes</h4>
            </div>
            <ul className="space-y-2">
              {result.causes.map((cause, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2 shrink-0" />
                  {cause}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Treatment Section */}
        {!result.isHealthy && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chemical Treatment */}
            <div className="rounded-lg border border-border p-4 bg-muted/20">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-foreground">Chemical Treatment</h4>
              </div>
              <ul className="space-y-2">
                {result.chemicalTreatment.map((treatment, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {treatment}
                  </li>
                ))}
              </ul>
            </div>

            {/* Organic Treatment */}
            <div className="rounded-lg border border-border p-4 bg-success/5">
              <div className="flex items-center gap-2 mb-3">
                <Leaf className="h-5 w-5 text-success" />
                <h4 className="font-semibold text-foreground">Organic Treatment</h4>
              </div>
              <ul className="space-y-2">
                {result.organicTreatment.map((treatment, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-success mt-2 shrink-0" />
                    {treatment}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Prevention */}
        <div className="rounded-lg border border-border p-4 bg-secondary/30">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 text-accent" />
            <h4 className="font-semibold text-foreground">Prevention Tips</h4>
          </div>
          <ul className="space-y-2">
            {result.prevention.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
