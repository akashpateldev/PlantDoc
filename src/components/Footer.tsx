import { forwardRef } from "react";
import { Leaf } from "lucide-react";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="border-t border-border bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-hero">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              Plant Doc
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            AI-Powered Plant Disease Detection System
          </p>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Plant Doc. B.Tech Major Project.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
