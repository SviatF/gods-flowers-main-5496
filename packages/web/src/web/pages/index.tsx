import { useReveal } from "../hooks/use-reveal";
import { useSiteContentRevision } from "../components/site-content-provider";
import { Header } from "../components/site/header";
import { Hero } from "../components/site/hero";
import { ConversionStrip } from "../components/site/conversion-strip";
import { Courses } from "../components/site/courses";
import { Advantages } from "../components/site/advantages";
import { Cases } from "../components/site/cases";
import { Faq } from "../components/site/faq";
import { LeadForm } from "../components/site/lead-form";
import { LeadModal } from "../components/site/lead-modal";
import { MobilePurchaseBar } from "../components/site/mobile-purchase-bar";
import { Footer } from "../components/site/footer";

function Index() {
  useReveal();
  useSiteContentRevision();

  return (
    <div className="min-h-screen bg-cream pb-24 md:pb-0">
      <Header />
      <main>
        <Hero />
        <ConversionStrip />
        <Courses />
        <Advantages />
        <Cases />
        <Faq />
        <LeadForm />
      </main>
      <Footer />
      <LeadModal />
      <MobilePurchaseBar />
    </div>
  );
}

export default Index;
