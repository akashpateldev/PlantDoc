import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  History,
  Leaf,
  Bookmark,
  Plus,
  Trash2,
  FileText,
  Camera,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PlantSelector from "@/components/PlantSelector";
import AnalysisResult, { DiseaseResult } from "@/components/AnalysisResult";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AnalysisRecord {
  id: string;
  analysis_type: string;
  plant_type: string | null;
  symptoms: string | null;
  disease_name: string;
  confidence: number;
  description: string;
  causes: string[] | null;
  chemical_treatment: string[] | null;
  organic_treatment: string[] | null;
  prevention: string[] | null;
  is_healthy: boolean;
  is_bookmarked: boolean;
  created_at: string;
}

interface UserPlant {
  id: string;
  plant_name: string;
  plant_type: string;
  notes: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [plants, setPlants] = useState<UserPlant[]>([]);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);

  // Add plant form
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantType, setNewPlantType] = useState("");
  const [newPlantNotes, setNewPlantNotes] = useState("");

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [analysesRes, plantsRes, profileRes] = await Promise.all([
      supabase
        .from("analysis_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("user_plants")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user!.id)
        .single(),
    ]);

    if (analysesRes.data) setAnalyses(analysesRes.data);
    if (plantsRes.data) setPlants(plantsRes.data);
    if (profileRes.data) setProfile(profileRes.data);
    setLoading(false);
  };

  const toggleBookmark = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("analysis_history")
      .update({ is_bookmarked: !current })
      .eq("id", id);

    if (!error) {
      setAnalyses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_bookmarked: !current } : a))
      );
    }
  };

  const deleteAnalysis = async (id: string) => {
    const { error } = await supabase.from("analysis_history").delete().eq("id", id);
    if (!error) {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Analysis deleted" });
    }
  };

  const addPlant = async () => {
    if (!newPlantName || !newPlantType) {
      toast({ title: "Please fill plant name and type", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("user_plants").insert({
      user_id: user!.id,
      plant_name: newPlantName,
      plant_type: newPlantType,
      notes: newPlantNotes || null,
    });

    if (!error) {
      toast({ title: "Plant added!" });
      setNewPlantName("");
      setNewPlantType("");
      setNewPlantNotes("");
      setShowAddPlant(false);
      fetchAll();
    }
  };

  const deletePlant = async (id: string) => {
    const { error } = await supabase.from("user_plants").delete().eq("id", id);
    if (!error) {
      setPlants((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Plant removed" });
    }
  };

  const toResult = (a: AnalysisRecord): DiseaseResult => ({
    diseaseName: a.disease_name,
    confidence: a.confidence,
    description: a.description,
    causes: a.causes || [],
    chemicalTreatment: a.chemical_treatment || [],
    organicTreatment: a.organic_treatment || [],
    prevention: a.prevention || [],
    isHealthy: a.is_healthy,
  });

  const bookmarked = analyses.filter((a) => a.is_bookmarked);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 lg:py-12">
        <div className="container">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Welcome, {profile?.display_name || user?.email?.split("@")[0]}
              </h1>
              <p className="text-muted-foreground mt-1">
                Your plant health dashboard
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/analyze">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
              </Link>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{analyses.length}</p>
                  <p className="text-sm text-muted-foreground">Total Analyses</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Leaf className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{plants.length}</p>
                  <p className="text-sm text-muted-foreground">My Plants</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Bookmark className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{bookmarked.length}</p>
                  <p className="text-sm text-muted-foreground">Bookmarked</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                Analysis History
              </TabsTrigger>
              <TabsTrigger value="plants">
                <Leaf className="h-4 w-4 mr-2" />
                My Plants
              </TabsTrigger>
              <TabsTrigger value="bookmarks">
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarked
              </TabsTrigger>
            </TabsList>

            {/* History Tab */}
            <TabsContent value="history">
              {analyses.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-border">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No analyses yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by analyzing a plant on the Analyze page
                  </p>
                  <Link to="/analyze">
                    <Button>Go to Analyze</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {analyses.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-md transition-shadow"
                    >
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            className="flex items-center gap-4 flex-1 text-left"
                            onClick={() => setSelectedAnalysis(a)}
                          >
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                a.analysis_type === "text"
                                  ? "bg-primary/10"
                                  : "bg-accent/10"
                              }`}
                            >
                              {a.analysis_type === "text" ? (
                                <FileText className="h-5 w-5 text-primary" />
                              ) : (
                                <Camera className="h-5 w-5 text-accent" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">
                                {a.disease_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {a.plant_type && `${a.plant_type} • `}
                                {new Date(a.created_at).toLocaleDateString()} •{" "}
                                {a.confidence}% confidence
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Analysis Details</DialogTitle>
                          </DialogHeader>
                          {selectedAnalysis && (
                            <AnalysisResult result={toResult(selectedAnalysis)} />
                          )}
                        </DialogContent>
                      </Dialog>
                      <div className="flex items-center gap-2 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBookmark(a.id, a.is_bookmarked)}
                        >
                          <Bookmark
                            className={`h-4 w-4 ${
                              a.is_bookmarked
                                ? "fill-warning text-warning"
                                : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAnalysis(a.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Plants Tab */}
            <TabsContent value="plants">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setShowAddPlant(!showAddPlant)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Plant
                </Button>
              </div>

              {showAddPlant && (
                <div className="rounded-xl border border-border bg-card p-6 shadow-card mb-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Add a New Plant</h3>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Plant Name
                    </label>
                    <Input
                      placeholder="E.g., My Garden Tomatoes"
                      value={newPlantName}
                      onChange={(e) => setNewPlantName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Plant Type
                    </label>
                    <PlantSelector value={newPlantType} onValueChange={setNewPlantType} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Notes (optional)
                    </label>
                    <Textarea
                      placeholder="Any notes about this plant..."
                      value={newPlantNotes}
                      onChange={(e) => setNewPlantNotes(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={addPlant}>Save Plant</Button>
                    <Button variant="outline" onClick={() => setShowAddPlant(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {plants.length === 0 && !showAddPlant ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-border">
                  <Leaf className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No plants yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add plants you grow to track their health
                  </p>
                  <Button onClick={() => setShowAddPlant(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Plant
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plants.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-xl border border-border bg-card p-5 shadow-card"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                            <Leaf className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{p.plant_name}</h4>
                            <p className="text-xs text-muted-foreground capitalize">
                              {p.plant_type}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePlant(p.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                      {p.notes && (
                        <p className="text-sm text-muted-foreground">{p.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-3">
                        Added {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Bookmarks Tab */}
            <TabsContent value="bookmarks">
              {bookmarked.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-border">
                  <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">No bookmarks</h3>
                  <p className="text-sm text-muted-foreground">
                    Bookmark analyses from your history to save them here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookmarked.map((a) => (
                    <Dialog key={a.id}>
                      <DialogTrigger asChild>
                        <button
                          className="w-full flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-md transition-shadow text-left"
                          onClick={() => setSelectedAnalysis(a)}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                            <Bookmark className="h-5 w-5 fill-warning text-warning" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground truncate">
                              {a.disease_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {a.plant_type && `${a.plant_type} • `}
                              {new Date(a.created_at).toLocaleDateString()} •{" "}
                              {a.confidence}% confidence
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Bookmarked Analysis</DialogTitle>
                        </DialogHeader>
                        {selectedAnalysis && (
                          <AnalysisResult result={toResult(selectedAnalysis)} />
                        )}
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
