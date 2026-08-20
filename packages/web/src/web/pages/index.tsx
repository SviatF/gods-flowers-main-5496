import { useReveal } from "../hooks/use-reveal";
import { Header } from "../components/site/header";
import { Hero } from "../components/site/hero";
import { Advantages } from "../components/site/advantages";
import { Courses } from "../components/site/courses";
import { Cases } from "../components/site/cases";
import { Consultation } from "../components/site/consultation";
import { LeadForm } from "../components/site/lead-form";
import { Footer } from "../components/site/footer";

function Index() {
  useReveal();

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main>
        <Hero />
        <Advantages />
        <Courses />
        <Cases />
        <Consultation />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
}

export default Index;
