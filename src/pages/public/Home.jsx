import { BecomeTutor, CurriculumLevels, FinalCta, HomeFaq, ParallaxQuote, PopularAreas, Pricing } from '../../components/home/Feature';
import { Hero } from '../../components/home/Hero';
import {
  FeaturedTutors,
  HowItWorks,
  LatestTuitions,
  StatsBand,
  SubjectExplorer,
  SubjectMarquee,
  Testimonials,
  WhyEdurock,
} from '../../components/home/Sections';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Home() {
  useDocumentTitle('Find a verified tutor in Bangladesh');
  return (
    <>
      <Hero />
      <SubjectMarquee />
      <StatsBand />
      <LatestTuitions />
      <HowItWorks />
      <CurriculumLevels />
      <ParallaxQuote />
      <SubjectExplorer />
      <FeaturedTutors />
      <BecomeTutor />
      <WhyEdurock />
      <Pricing />
      <PopularAreas />
      <Testimonials />
      <HomeFaq />
      <FinalCta />
    </>
  );
}
