import { DiseaseResult } from "@/components/AnalysisResult";

const diseaseDatabase: Record<string, DiseaseResult[]> = {
  tomato: [
    {
      diseaseName: "Early Blight (Alternaria solani)",
      confidence: 87,
      description: "Early blight is a common fungal disease that affects tomato plants, causing dark spots with concentric rings on leaves, stems, and fruit. It typically starts on older, lower leaves and progresses upward.",
      causes: [
        "Fungal spores spread through wind and rain splash",
        "Warm, humid conditions favor disease development",
        "Overhead irrigation increases leaf wetness",
        "Poor air circulation around plants"
      ],
      chemicalTreatment: [
        "Apply chlorothalonil-based fungicides preventively",
        "Use mancozeb or copper-based fungicides",
        "Rotate fungicides to prevent resistance",
        "Apply at 7-10 day intervals during wet weather"
      ],
      organicTreatment: [
        "Spray neem oil solution (2-3 tablespoons per gallon)",
        "Apply baking soda solution (1 tbsp per gallon + soap)",
        "Use compost tea as a preventive spray",
        "Apply copper sulfate (Bordeaux mixture)"
      ],
      prevention: [
        "Remove and destroy infected plant debris",
        "Practice crop rotation (3-4 year cycle)",
        "Mulch around plants to prevent soil splash",
        "Water at base of plants, avoid wetting foliage",
        "Provide adequate spacing for air circulation"
      ],
      isHealthy: false
    },
    {
      diseaseName: "Late Blight (Phytophthora infestans)",
      confidence: 82,
      description: "Late blight is a destructive disease that can rapidly kill tomato plants. It causes water-soaked lesions on leaves that turn brown, and white fuzzy growth may appear on leaf undersides in humid conditions.",
      causes: [
        "Cool, wet weather conditions (60-70°F)",
        "High humidity above 90%",
        "Infected seed potatoes or transplants",
        "Wind-dispersed spores from nearby infected plants"
      ],
      chemicalTreatment: [
        "Apply fungicides containing metalaxyl or mefenoxam",
        "Use protectant fungicides like chlorothalonil",
        "Apply systemic fungicides during active infection",
        "Treat preventively when conditions favor disease"
      ],
      organicTreatment: [
        "Apply copper-based fungicides weekly",
        "Use Bacillus subtilis biological fungicide",
        "Remove infected plant material immediately",
        "Apply garlic extract spray as deterrent"
      ],
      prevention: [
        "Use resistant tomato varieties when available",
        "Avoid overhead watering",
        "Improve air circulation",
        "Destroy volunteer tomato and potato plants",
        "Monitor weather conditions for disease risk"
      ],
      isHealthy: false
    }
  ],
  potato: [
    {
      diseaseName: "Potato Late Blight",
      confidence: 85,
      description: "Late blight causes dark, water-soaked lesions on leaves and stems. Under humid conditions, white fungal growth appears on leaf undersides. Tubers develop brown rot that extends into the flesh.",
      causes: [
        "Cool, moist weather conditions",
        "Infected seed tubers",
        "Windborne spores from nearby infections",
        "Volunteer potato plants carrying the pathogen"
      ],
      chemicalTreatment: [
        "Apply mancozeb preventively",
        "Use systemic fungicides during active growth",
        "Chlorothalonil for protectant applications",
        "Rotate fungicide modes of action"
      ],
      organicTreatment: [
        "Copper hydroxide applications",
        "Remove infected foliage immediately",
        "Apply compost tea weekly",
        "Use resistant varieties"
      ],
      prevention: [
        "Plant certified disease-free seed potatoes",
        "Hill soil around plants to protect tubers",
        "Destroy all plant debris after harvest",
        "Avoid irrigation late in the day"
      ],
      isHealthy: false
    }
  ],
  corn: [
    {
      diseaseName: "Northern Corn Leaf Blight",
      confidence: 79,
      description: "This disease causes long, elliptical gray-green to tan lesions on leaves. Severe infections can cause significant yield loss by reducing photosynthetic area.",
      causes: [
        "Cool, humid weather (65-80°F)",
        "Heavy dew periods",
        "Corn residue from previous seasons",
        "Susceptible corn hybrids"
      ],
      chemicalTreatment: [
        "Apply strobilurin fungicides at tassel stage",
        "Use triazole fungicides for control",
        "Scout fields before VT stage for application timing"
      ],
      organicTreatment: [
        "Remove infected plant debris",
        "Apply biological control agents",
        "Use resistant varieties"
      ],
      prevention: [
        "Plant resistant hybrids",
        "Rotate crops to break disease cycle",
        "Manage corn residue through tillage",
        "Scout fields regularly for early detection"
      ],
      isHealthy: false
    }
  ],
  rice: [
    {
      diseaseName: "Rice Blast (Magnaporthe oryzae)",
      confidence: 88,
      description: "Rice blast causes diamond-shaped lesions with gray centers and brown borders on leaves. It can also affect nodes, causing them to break, and panicles, leading to empty grains.",
      causes: [
        "High nitrogen fertilization",
        "Prolonged leaf wetness",
        "Cool night temperatures",
        "Dense plant spacing"
      ],
      chemicalTreatment: [
        "Apply tricyclazole at tillering and heading",
        "Use azoxystrobin for broad-spectrum control",
        "Apply isoprothiolane as systemic fungicide"
      ],
      organicTreatment: [
        "Apply Trichoderma-based biocontrol agents",
        "Use silicon supplements to strengthen cell walls",
        "Remove infected plant material"
      ],
      prevention: [
        "Use resistant rice varieties",
        "Avoid excessive nitrogen application",
        "Maintain balanced fertilization",
        "Ensure proper water management",
        "Plant at recommended spacing"
      ],
      isHealthy: false
    }
  ],
  healthy: [
    {
      diseaseName: "Healthy Plant",
      confidence: 95,
      description: "Great news! Your plant appears to be healthy with no visible signs of disease. The leaves show normal coloration, structure, and development patterns expected for this plant type.",
      causes: [],
      chemicalTreatment: [],
      organicTreatment: [],
      prevention: [
        "Continue regular watering schedule",
        "Maintain balanced fertilization",
        "Monitor regularly for early signs of issues",
        "Ensure adequate sunlight exposure",
        "Practice good garden hygiene"
      ],
      isHealthy: true
    }
  ]
};

export const analyzeSymptoms = async (
  plantType: string,
  symptoms: string
): Promise<DiseaseResult> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const lowerSymptoms = symptoms.toLowerCase();
  
  // Check for healthy indicators
  if (
    lowerSymptoms.includes("healthy") ||
    lowerSymptoms.includes("green") ||
    lowerSymptoms.includes("normal") ||
    lowerSymptoms.includes("no problem")
  ) {
    return diseaseDatabase.healthy[0];
  }

  // Get diseases for the plant type
  const diseases = diseaseDatabase[plantType] || diseaseDatabase.tomato;
  
  // Simple keyword matching for demo
  if (lowerSymptoms.includes("spot") || lowerSymptoms.includes("blight") || lowerSymptoms.includes("brown")) {
    return diseases[0];
  }
  
  if (diseases.length > 1 && (lowerSymptoms.includes("water") || lowerSymptoms.includes("wet"))) {
    return diseases[1];
  }

  // Return first disease as default
  return diseases[0];
};

export const analyzeImage = async (
  file: File
): Promise<DiseaseResult> => {
  // Simulate API delay for image processing
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // For demo, randomly select between healthy and diseased
  const isHealthy = Math.random() > 0.7;
  
  if (isHealthy) {
    return diseaseDatabase.healthy[0];
  }

  // Random disease selection for demo
  const plantTypes = Object.keys(diseaseDatabase).filter(k => k !== 'healthy');
  const randomPlant = plantTypes[Math.floor(Math.random() * plantTypes.length)];
  const diseases = diseaseDatabase[randomPlant];
  
  return diseases[Math.floor(Math.random() * diseases.length)];
};
