import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Services from '../components/Services';
import Membership from '../components/Membership';
import Programs from '../components/Programs';
import FitnessTracking from '../components/FitnessTracking';
import WhyChooseUs from '../components/WhyChooseUs';
import Contact from '../components/Contact';

export default function HomePage({ plans }) {
  return (
    <main>
      <Hero />
      <About />
      <Services />
      <Membership plans={plans} />
      <Programs />
      <FitnessTracking />
      <WhyChooseUs />
      <Contact />
    </main>
  );
}
