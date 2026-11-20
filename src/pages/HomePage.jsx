import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Membership from '../components/Membership';
import Programs from '../components/Programs';
import FitnessTracking from '../components/FitnessTracking';
import WhyChooseUs from '../components/WhyChooseUs';
import Contact from '../components/Contact';
import { useWebsiteContent } from '../context/WebsiteContentContext';

export default function HomePage({ plans }) {
  const { content } = useWebsiteContent();
  const visibility = content?.sectionVisibility || {};

  const isVisible = (key) => {
    if (visibility[key] === false) return false;
    if (content?.[key]?.visible === false) return false;
    return true;
  };

  return (
    <main>
      {isVisible('hero') && <Hero />}
      {isVisible('about') && <About />}
      {isVisible('services') && <Services />}
      {isVisible('membership') && <Membership plans={plans} />}
      {isVisible('programs') && <Programs />}
      {isVisible('tracking') && <FitnessTracking />}
      {isVisible('whyUs') && <WhyChooseUs />}
      {isVisible('contact') && <Contact />}
    </main>
  );
}
