import { useReveal } from "../hooks/use-reveal";
import { useSiteContentRevision } from "../components/site-content-provider";
import { Header } from "../components/site/header";
import { Hero } from "../components/site/hero";
import { Advantages } from "../components/site/advantages";
import { Courses } from "../components/site/courses";
import { Cases } from "../components/site/cases";
import { LeadForm } from "../components/site/lead-form";
import { LeadModal } from "../components/site/lead-modal";
import { Footer } from "../components/site/footer";

function Index() {
  useReveal();
  useSiteContentRevision();

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <main>
        <Hero />
        <Advantages />
        <Courses />
        <Cases />
        <LeadForm />
      </main>
      <Footer />
      <LeadModal />
    </div>
  );
}

export default Index;
