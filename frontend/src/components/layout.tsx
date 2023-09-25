import { Navbar } from "./navbar";
import { Footer } from "./footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto">{children}</div>
      <Footer />
    </div>
  );
}
