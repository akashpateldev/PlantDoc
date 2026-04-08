import { DiseaseResult } from "@/components/AnalysisResult";
import { supabase } from "@/integrations/supabase/client";

export const analyzeSymptoms = async (
  plantType: string,
  symptoms: string
): Promise<DiseaseResult> => {
  const { data, error } = await supabase.functions.invoke("analyze-plant", {
    body: { type: "text", plantType, symptoms },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "Analysis failed");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as DiseaseResult;
};

export const analyzeImage = async (file: File): Promise<DiseaseResult> => {
  // Convert file to base64
  const base64 = await fileToBase64(file);

  const { data, error } = await supabase.functions.invoke("analyze-plant", {
    body: { type: "image", imageBase64: base64 },
  });

  if (error) {
    console.error("Edge function error:", error);
    throw new Error(error.message || "Analysis failed");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as DiseaseResult;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
