import { useState } from "react";
import { FileText, Camera, AlertCircle, Upload } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlantSelector from "@/components/PlantSelector";
import ImageUploader from "@/components/ImageUploader";
import CameraCapture from "@/components/CameraCapture";
import AnalysisResult, { DiseaseResult } from "@/components/AnalysisResult";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { analyzeSymptoms, analyzeImage } from "@/lib/plantAnalysis";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Analyze = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [plantType, setPlantType] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [textLoading, setTextLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [textResult, setTextResult] = useState<DiseaseResult | null>(null);
  const [imageResult, setImageResult] = useState<DiseaseResult | null>(null);
  const [imageInputTab, setImageInputTab] = useState<string>("upload");

  const saveAnalysis = async (result: DiseaseResult, type: "text" | "image") => {
    if (!user) return;
    await supabase.from("analysis_history").insert({
      user_id: user.id,
      analysis_type: type,
      plant_type: plantType || null,
      symptoms: symptoms || null,
      disease_name: result.diseaseName,
      confidence: result.confidence,
      description: result.description,
      causes: result.causes,
      chemical_treatment: result.chemicalTreatment,
      organic_treatment: result.organicTreatment,
      prevention: result.prevention,
      is_healthy: result.isHealthy,
    });
  };

  const handleTextAnalysis = async () => {
    if (!plantType) {
      toast({ title: "Plant type required", description: "Please select a plant type.", variant: "destructive" });
      return;
    }
    if (!symptoms.trim()) {
      toast({ title: "Symptoms required", description: "Please describe the symptoms.", variant: "destructive" });
      return;
    }

    setTextLoading(true);
    setTextResult(null);

    try {
      const result = await analyzeSymptoms(plantType, symptoms);
      setTextResult(result);
      await saveAnalysis(result, "text");
      toast({ title: "Analysis complete", description: "Your symptom analysis is ready." });
    } catch (error: any) {
      toast({ title: "Analysis failed", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setTextLoading(false);
    }
  };

  const handleImageAnalysis = async () => {
    if (!selectedImage) {
      toast({ title: "Image required", description: "Please capture or upload a plant leaf image.", variant: "destructive" });
      return;
    }

    setImageLoading(true);
    setImageResult(null);

    try {
      const result = await analyzeImage(selectedImage);
      setImageResult(result);
      await saveAnalysis(result, "image");
      toast({ title: "Analysis complete", description: "Your image analysis is ready." });
    } catch (error: any) {
      toast({ title: "Analysis failed", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setImageLoading(false);
    }
  };

  const handleCameraCapture = (file: File) => {
    setSelectedImage(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Plant Disease Analysis
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose your preferred method: describe symptoms in text or upload a leaf image for AI-powered disease detection.
            </p>
            {!user && (
              <p className="text-sm text-primary mt-2">
                Sign in to save your analysis history automatically.
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Text-Based Analysis */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-in-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Text-Based Analysis</h2>
                  <p className="text-sm text-muted-foreground">Describe symptoms for diagnosis</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Plant Type</label>
                  <PlantSelector value={plantType} onValueChange={setPlantType} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Describe Symptoms</label>
                  <Textarea
                    placeholder="E.g., Yellow leaves with brown spots, wilting stems, white powder on leaves..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                </div>
                <Button onClick={handleTextAnalysis} disabled={textLoading} className="w-full" size="lg">
                  {textLoading ? "Analyzing..." : "Analyze Symptoms"}
                </Button>
              </div>

              {textLoading && (
                <div className="mt-6"><LoadingSpinner message="Analyzing symptoms with AI..." /></div>
              )}
              {textResult && !textLoading && (
                <div className="mt-6"><AnalysisResult result={textResult} /></div>
              )}
            </div>

            {/* Image-Based Analysis */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-in-right">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Camera className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Image-Based Analysis</h2>
                  <p className="text-sm text-muted-foreground">Capture or upload a leaf photo</p>
                </div>
              </div>

              <div className="space-y-4">
                <Tabs value={imageInputTab} onValueChange={(v) => { setImageInputTab(v); setSelectedImage(null); }}>
                  <TabsList className="w-full">
                    <TabsTrigger value="upload" className="flex-1 gap-2">
                      <Upload className="h-4 w-4" /> Upload
                    </TabsTrigger>
                    <TabsTrigger value="camera" className="flex-1 gap-2">
                      <Camera className="h-4 w-4" /> Camera
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-4">
                    <ImageUploader onImageSelect={setSelectedImage} selectedImage={selectedImage} />
                  </TabsContent>
                  <TabsContent value="camera" className="mt-4">
                    {selectedImage && imageInputTab === "camera" ? (
                      <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Captured plant"
                          className="w-full h-64 object-contain bg-black/5"
                        />
                        <div className="p-3 border-t border-border bg-background/80 flex justify-between items-center">
                          <p className="text-sm text-muted-foreground truncate">{selectedImage.name}</p>
                          <Button variant="outline" size="sm" onClick={() => setSelectedImage(null)}>
                            Retake
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <CameraCapture
                        onCapture={handleCameraCapture}
                        onFallbackToUpload={() => { setImageInputTab("upload"); }}
                      />
                    )}
                  </TabsContent>
                </Tabs>

                <Button onClick={handleImageAnalysis} disabled={imageLoading || !selectedImage} className="w-full" size="lg" variant="success">
                  {imageLoading ? "Analyzing..." : "Analyze Image"}
                </Button>
              </div>

              {imageLoading && (
                <div className="mt-6"><LoadingSpinner message="Processing image with AI..." /></div>
              )}
              {imageResult && !imageLoading && (
                <div className="mt-6"><AnalysisResult result={imageResult} /></div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-foreground mb-1">Important Note</h3>
                <p className="text-sm text-muted-foreground">
                  This AI-powered analysis is for educational and preliminary assessment purposes.
                  For accurate diagnosis and treatment, please consult agricultural experts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Analyze;
