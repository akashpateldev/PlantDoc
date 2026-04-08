import { Microscope, Shield, Zap, BookOpen } from "lucide-react";

const features = [
  {
    icon: Microscope,
    title: "Accurate Detection",
    description: "Our AI model is trained on thousands of plant disease images for precise identification.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get disease diagnosis and treatment recommendations within seconds.",
  },
  {
    icon: Shield,
    title: "Prevention Tips",
    description: "Learn how to prevent diseases and maintain healthy crops year-round.",
  },
  {
    icon: BookOpen,
    title: "Educational Resource",
    description: "Detailed information about plant diseases for students and researchers.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Why Choose Plant Doc?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive solution designed for farmers, agriculture students, 
            and gardening enthusiasts to detect and manage plant diseases effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
