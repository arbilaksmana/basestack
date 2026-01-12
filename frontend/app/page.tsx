import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Problems } from "./components/Problems";
import { HowItWorks } from "./components/HowItWorks";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-green-500 selection:text-black">
      <Navbar />
      <Hero />
      <Features />
      <Problems />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
