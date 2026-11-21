import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const DEFAULT_INQUIRY_SERVICES = [
  'Personal Training',
  'Sports Massage',
  'Steam Bath',
  'Zumba Dance Cardio',
  'Yoga & Mobility',
  'General Gym Membership',
];

export const DEFAULT_WEBSITE_CONTENT = {
  sectionVisibility: {
    splash: true,
    hero: true,
    about: true,
    services: true,
    membership: true,
    programs: true,
    tracking: true,
    whyUs: true,
    contact: true,
  },
  customSections: [],
  splashVideo: {
    enabled: true,
    videoUrl: '/trainer_intro.mp4',
    videoWebmUrl: '',
    durationSeconds: 22,
    title: 'Respire Trainer Session Intro',
  },
  hero: {
    visible: true,
    bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=90&w=2560&auto=format&fit=crop',
    showCue: true,
  },
  about: {
    visible: true,
    eyebrow: '• A PART OF MAHABAL GROUP •',
    title: 'ABOUT MAHABAL GROUP & RESPIRE',
    leadParagraph:
      'Respire Fitness is proudly founded and steered under the esteemed banner of the Mahabal Group—a distinguished corporate enterprise that has earned high standing and widespread public trust across Sangli and Western Maharashtra.',
    secondaryParagraph:
      'Rooted in the group’s foundational philosophy that economic growth and societal health go hand-in-hand, Respire Fitness was conceptualized to provide Sangli with a world-class health sanctuary. Combining modern sports science with transparent, professional management, the Mahabal Group ensures that every member benefits from corporate reliability, safety, and long-term commitment.',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop',
    badgeTag: 'Institutional Stewardship',
    badgeTitle: 'A Part of Mahabal Group',
    heritageTitle: 'Mahabal Group',
    heritageSubtitle: 'A Legacy of Excellence',
    credentials: [
      'A Part of Mahabal Group',
      '2 Sangli Branches (Vishrambag & Vijaynagar)',
      '100% Institutional Governance',
    ],
    pillars: [
      {
        title: 'Decades of Trusted Heritage',
        desc: 'Backed by Mahabal Group—built on decades of trust, ethics, and corporate leadership in Sangli.',
      },
      {
        title: 'Vision for Sangli’s Wellness',
        desc: 'Elevating Sangli’s fitness with metro-grade sports science and luxury wellness standards.',
      },
      {
        title: 'Uncompromising Standards',
        desc: 'World-class biomechanical equipment, certified trainers, and 100% transparent fee policies.',
      },
      {
        title: '2 Strategic Sangli Hubs',
        desc: 'Serving members across two premier branches: Vishrambag (R City Mall) & Vijaynagar (Krishna Heights).',
      },
    ],
  },
  services: {
    visible: true,
    eyebrow: 'World-Class Offerings',
    title: 'OUR PREMIUM SERVICES',
    subtitle:
      'From high-intensity personal training to restorative luxury thermal therapies, experience complete fitness and recovery under one roof at R City Mall, Sangli.',
    items: [
      {
        id: 'pt',
        title: 'Personal Training',
        tag: '1-on-1 Dedicated Coaching',
        description:
          'Customized training protocols designed for your physiology, body composition goals, and lifestyle with certified elite coaches.',
        features: [
          'Body assessment & posture analysis',
          'Custom workout plan & periodization',
          'Real-time form correction & safety',
          'Nutrition & macro guidance',
        ],
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop',
        accent: '#00B84A',
      },
      {
        id: 'massage',
        title: 'Massage',
        tag: 'Sports & Recovery Therapy',
        description:
          'Professional sports massage and deep tissue therapy designed to accelerate muscular recovery, alleviate tension, and boost circulation.',
        features: [
          'Deep tissue & trigger point release',
          'Reduces delayed muscle soreness (DOMS)',
          'Improves joint range of motion',
          'Restores neuromuscular balance',
        ],
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000&auto=format&fit=crop',
        accent: '#172C83',
      },
      {
        id: 'steam',
        title: 'Steam Bath',
        tag: 'Thermal Detox & Relaxation',
        description:
          'Luxury thermal steam sanctuary to flush metabolic toxins, soothe fatigued muscles, and rejuvenate skin after intense training.',
        features: [
          'Deep cellular metabolic detoxification',
          'Cardiovascular & blood flow stimulation',
          'Clears respiratory airways & skin pores',
          'Promotes post-training relaxation',
        ],
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000&auto=format&fit=crop',
        accent: '#00B84A',
      },
      {
        id: 'zumba',
        title: 'Zumba',
        tag: 'High-Energy Cardio Dance',
        description:
          'Dynamic, infectious Latin and international dance choreography that torches calories, elevates endurance, and turns fitness into a celebration.',
        features: [
          'Burn 500-800 kcal per session',
          'Full-body cardiovascular conditioning',
          'Boosts coordination & rhythm',
          'Euphoric, motivating group energy',
        ],
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop',
        accent: '#172C83',
      },
      {
        id: 'yoga',
        title: 'Yoga',
        tag: 'Mind, Body & Flexibility',
        description:
          'Holistic practice integrating Vinyasa flows, Hatha postures, and Pranayama breathwork to build lean strength, mental clarity, and mobility.',
        features: [
          'Deep spinal & hip mobility enhancement',
          'Core stability & isometric strength',
          'Pranayama stress reduction & breath control',
          'Mental focus and meditative calm',
        ],
        image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1000&auto=format&fit=crop',
        accent: '#00B84A',
      },
    ],
  },
  whyUs: {
    visible: true,
    eyebrow: 'The Respire Standard',
    title: 'WHY CHOOSE RESPIRE FITNESS',
    subtitle:
      'A harmonious fusion of elite sports science, luxury recovery amenities, and the uncompromised trust of the Mahabal Group.',
    reasons: [
      {
        title: 'Dedicated Trainer Support',
        desc: 'Our trainers are ranked and reviewed by members with verified certifications. Enjoy flexible weekly slot booking to receive dedicated 1-on-1 coaching when it fits your schedule.',
        badge: 'Certified Experts',
      },
      {
        title: 'Hyper-Personalized Training',
        desc: 'No cookie-cutter routines. Every member receives custom exercise selection tailored to joint mechanics, lifestyle demands, and aesthetic or athletic aspirations.',
        badge: 'Bespoke Regimens',
      },
      {
        title: 'Data-Backed Progress Monitoring',
        desc: 'Periodic body composition analyses track your exact muscle mass gains and fat loss trajectory, synchronized seamlessly with biometric check-in attendance streaks.',
        badge: 'Scientific Tracking',
      },
      {
        title: 'Structured Workout Programs',
        desc: 'Progress smoothly from foundational Beginner stability to Intermediate hypertrophy, through to Advanced athletic powerlifting with on-demand video masterclasses.',
        badge: 'Curated Roadmaps',
      },
      {
        title: 'Unrivaled Member Experience',
        desc: 'Backed by the Mahabal Group legacy and situated on the 7th Floor of R City Mall, enjoy panoramic views, high-ceiling ventilation, and integrated thermal Steam & Massage spa recovery.',
        badge: 'Luxury Sanctuary',
      },
    ],
  },
  programs: {
    visible: true,
    eyebrow: 'Structured Training Regimens',
    title: 'WORKOUT PROGRAMS BY CATEGORY',
    subtitle:
      'Whether taking your first steps into strength training or chasing elite athletic milestones, our progressive curriculums guide your evolution with certified expertise.',
    beginner: {
      category: 'Beginner',
      subtitle: 'Foundation, Mobility & Proper Lifting Form',
      description:
        'Designed for gym newcomers. Master primal movement mechanics (squat, hinge, press, pull), build postural core strength, and establish sustainable workout habits with zero intimidation.',
      color: '#00B84A',
      badge: 'Level 1 • 0-6 Months',
      tags: ['Movement Mechanics', 'Joint Mobility', 'Core Stability', 'Habit Building'],
      modulesCount: '8 Comprehensive Modules',
      duration: '4-6 Weeks Progression',
      coach: 'Certified Physical Coach',
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop',
    },
    intermediate: {
      category: 'Intermediate',
      subtitle: 'Hypertrophy, Strength Periodization & Progressive Overload',
      description:
        'For experienced lifters looking to break plateaus. Focus on hypertrophy science, compound lift volume periodization, metabolic conditioning, and nutrient timing.',
      color: '#172C83',
      badge: 'Level 2 • 6-24 Months',
      tags: ['Progressive Overload', 'Hypertrophy Splits', 'CNS Management', 'Nutrient Timing'],
      modulesCount: '12 Intensive Modules',
      duration: '8-12 Weeks Progression',
      coach: 'Master Strength Specialist',
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop',
    },
    advanced: {
      category: 'Advanced',
      subtitle: 'Athletic Peak Performance, Powerlifting & Power-Building',
      description:
        'Elite programming for seasoned athletes and competitive physique enthusiasts. Advanced RPE/RIR tracking, velocity-based training principles, and neuromuscular supercompensation.',
      color: '#0F172A',
      badge: 'Level 3 • 2+ Years',
      tags: ['Velocity Training', 'Peaking Cycles', 'RPE Auto-Regulation', 'Biomechanics'],
      modulesCount: '16 Elite Masterclasses',
      duration: '12-16 Weeks Progression',
      coach: 'Elite Performance Director',
      image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1000&auto=format&fit=crop',
    },
    customPrograms: [],
  },
  tracking: {
    visible: true,
    eyebrow: 'Digital Fitness Ecosystem',
    title: 'SMART FITNESS TRACKING',
    subtitle:
      'Say goodbye to guesswork. Respire Fitness leverages structured body composition analysis, biometric integration, and milestone tracking to validate every drop of sweat.',
    features: [
      {
        title: 'Body Composition History',
        desc: 'In-depth tracking of Body Fat %, Skeletal Muscle, Visceral Fat, BMI, and metabolic water hydration measured consistently over time.',
        badge: 'Scientific Metrics',
      },
      {
        title: 'Fitness Progress Tracking',
        desc: 'Visualize your strength progressions, 1-Rep Max curves, cardiovascular endurance gains, and milestone streaks with intuitive graphical charts.',
        badge: 'Data-Backed Analytics',
      },
      {
        title: 'Transformation Photos',
        desc: 'Compare visual physical progress side-by-side with private, secure milestone capture to witness real muscle definition and posture refinement.',
        badge: 'Visual Milestones',
      },
      {
        title: 'Workout Schedule & Timetable',
        desc: 'Synchronized weekly timetable with personal trainer slot appointments, group Zumba and Yoga schedules, and planned rest-day recovery.',
        badge: 'Automated Routine',
      },
      {
        title: 'Progress Monitoring & Biometrics',
        desc: 'Seamless biometric check-in integration combined with trainer session feedback notes and WhatsApp automated achievement alerts.',
        badge: 'Trainer Supervision',
      },
    ],
  },
  contact: {
    visible: true,
    eyebrow: 'Visit Our 2 Branches in Sangli',
    title: 'CONNECT WITH RESPIRE FITNESS',
    subtitle:
      'Visit either of our premium Sangli branches — Vishrambag or Vijaynagar — or submit an inquiry below.',
    vishrambagPhone: '+91 7798001777',
    vijaynagarPhone: '+91 9172848777',
    inquiryServices: [
      'Personal Training',
      'Sports Massage',
      'Steam Bath',
      'Zumba Dance Cardio',
      'Yoga & Mobility',
      'General Gym Membership',
    ],
  },
};

// Deep recursive merge to guarantee defaults are always preserved and child objects aren't wiped
export function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target || {};
  if (!target || typeof target !== 'object') return source;

  const result = Array.isArray(target) ? [...target] : { ...target };

  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];

    if (srcVal === undefined || srcVal === null) continue;

    if (Array.isArray(srcVal)) {
      result[key] = srcVal;
    } else if (typeof srcVal === 'object' && typeof tgtVal === 'object') {
      result[key] = deepMerge(tgtVal, srcVal);
    } else {
      result[key] = srcVal;
    }
  }

  return result;
}

const CMS_BROADCAST_CHANNEL = 'respire_website_cms_v1';

function broadcastContentUpdate(newContent) {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel(CMS_BROADCAST_CHANNEL);
      bc.postMessage({ type: 'CMS_UPDATE', content: newContent });
      bc.close();
    }
  } catch {
    // ignore
  }
}

const WebsiteContentContext = createContext({
  content: DEFAULT_WEBSITE_CONTENT,
  updateSection: async () => {},
  toggleSectionVisibility: async () => {},
  saveAllContent: async () => {},
  resetSection: async () => {},
  resetAllToDefaults: async () => {},
});

export function WebsiteContentProvider({ children }) {
  const [content, setContent] = useState(() => {
    try {
      const cached = localStorage.getItem('rf_website_content_v1');
      if (cached) {
        const parsed = JSON.parse(cached);
        return deepMerge(DEFAULT_WEBSITE_CONTENT, parsed);
      }
    } catch {
      // ignore
    }
    return DEFAULT_WEBSITE_CONTENT;
  });

  // Cross-tab real-time sync using BroadcastChannel, window custom events, and storage events
  useEffect(() => {
    // 1. BroadcastChannel: 0ms real-time sync across separate browser tabs/windows
    let bc = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel(CMS_BROADCAST_CHANNEL);
        bc.onmessage = (event) => {
          if (event.data?.type === 'CMS_UPDATE' && event.data?.content) {
            setContent((prev) => deepMerge(prev, event.data.content));
          }
        };
      }
    } catch {
      // ignore
    }

    // 2. Storage event listener (fallback cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'rf_website_content_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setContent((prev) => deepMerge(prev, parsed));
        } catch {
          // ignore
        }
      }
    };

    // 3. In-page custom event for instantaneous local sync
    const handleCustomUpdate = (e) => {
      if (e.detail) {
        setContent((prev) => deepMerge(prev, e.detail));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('rf_content_updated', handleCustomUpdate);

    // 4. Firestore real-time listeners: listen to both 'settings' and 'system'
    const unsubList = [];

    // Listener for 'settings/websiteContent'
    try {
      const settingsRef = doc(db, 'settings', 'websiteContent');
      const u1 = onSnapshot(settingsRef, (snap) => {
        if (snap.exists()) {
          const remoteData = snap.data();
          setContent((prev) => {
            const merged = deepMerge(prev, remoteData);
            try {
              localStorage.setItem('rf_website_content_v1', JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          });
        }
      }, () => {});
      unsubList.push(u1);
    } catch {
      // ignore
    }

    // Fallback listener for 'system/website_content'
    try {
      const sysRef = doc(db, 'system', 'website_content');
      const u2 = onSnapshot(sysRef, (snap) => {
        if (snap.exists()) {
          const remoteData = snap.data();
          setContent((prev) => {
            const merged = deepMerge(prev, remoteData);
            try {
              localStorage.setItem('rf_website_content_v1', JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          });
        }
      }, () => {});
      unsubList.push(u2);
    } catch {
      // ignore
    }

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rf_content_updated', handleCustomUpdate);
      unsubList.forEach((u) => {
        if (typeof u === 'function') u();
      });
    };
  }, []);

  const updateSection = async (sectionKey, data) => {
    // 1. Instant local state update for zero latency
    setContent((prev) => {
      const prevSection = prev[sectionKey] || {};
      const mergedSection = deepMerge(prevSection, data);

      let updatedVis = prev.sectionVisibility || {};
      if (sectionKey === 'splashVideo' && data.enabled !== undefined) {
        updatedVis = { ...updatedVis, splash: data.enabled };
      }

      const updated = {
        ...prev,
        sectionVisibility: updatedVis,
        [sectionKey]: mergedSection,
      };

      // Sanitize oversized binary from localStorage & broadcast to prevent QuotaExceededError
      const safeForStorage = { ...updated };
      if (safeForStorage.splashVideo?.videoUrl && safeForStorage.splashVideo.videoUrl.length > 50000) {
        safeForStorage.splashVideo = {
          ...safeForStorage.splashVideo,
          videoUrl: 'indexeddb://splash_video',
        };
      }

      try {
        localStorage.setItem('rf_website_content_v1', JSON.stringify(safeForStorage));
      } catch (e) {
        console.warn('localStorage quota warning:', e);
      }

      // Also store individual section as safe fallback
      try {
        const safeSection = { ...mergedSection };
        if (safeSection.videoUrl && safeSection.videoUrl.length > 50000) {
          safeSection.videoUrl = 'indexeddb://splash_video';
        }
        localStorage.setItem(`rf_section_${sectionKey}`, JSON.stringify(safeSection));
      } catch {
        // ignore
      }

      // Broadcast immediately across all open tabs & windows
      broadcastContentUpdate(safeForStorage);

      // Same-tab dispatch
      try {
        window.dispatchEvent(new CustomEvent('rf_content_updated', { detail: { [sectionKey]: mergedSection } }));
      } catch {
        // ignore
      }

      return updated;
    });

    // 2. Persist to Firestore: sanitize oversized data first so 1MB per-doc limit is NEVER exceeded
    const firestoreData = { ...data };
    if (firestoreData.videoUrl && firestoreData.videoUrl.length > 50000) {
      firestoreData.videoUrl = 'indexeddb://splash_video';
    }

    try {
      await setDoc(doc(db, 'settings', 'websiteContent'), { [sectionKey]: firestoreData }, { merge: true }).catch(() => {});
    } catch {}

    try {
      await setDoc(doc(db, 'settings', `section_${sectionKey}`), firestoreData, { merge: true }).catch(() => {});
    } catch {}

    try {
      await setDoc(doc(db, 'system', 'website_content'), { [sectionKey]: firestoreData }, { merge: true }).catch(() => {});
    } catch {}
  };

  const toggleSectionVisibility = async (sectionKey, isVisible) => {
    setContent((prev) => {
      const currentVis = prev.sectionVisibility || {};
      const updatedVis = { ...currentVis, [sectionKey]: isVisible };
      const currentSection = prev[sectionKey] || {};
      const updatedSection = { ...currentSection, visible: isVisible };

      // Keep splashVideo.enabled and sectionVisibility.splash in 100% sync
      let updatedSplashVideo = prev.splashVideo;
      if (sectionKey === 'splash') {
        updatedSplashVideo = { ...(prev.splashVideo || {}), enabled: isVisible };
      }

      const updatedContent = {
        ...prev,
        sectionVisibility: updatedVis,
        [sectionKey]: updatedSection,
        ...(sectionKey === 'splash' ? { splashVideo: updatedSplashVideo } : {}),
      };

      try {
        localStorage.setItem('rf_website_content_v1', JSON.stringify(updatedContent));
      } catch (e) {
        console.warn('localStorage error', e);
      }

      broadcastContentUpdate(updatedContent);

      try {
        window.dispatchEvent(new CustomEvent('rf_content_updated', { detail: updatedContent }));
      } catch {
        // ignore
      }

      return updatedContent;
    });

    try {
      await setDoc(
        doc(db, 'settings', 'websiteContent'),
        {
          sectionVisibility: { [sectionKey]: isVisible },
          [sectionKey]: { visible: isVisible },
          ...(sectionKey === 'splash' ? { splashVideo: { enabled: isVisible } } : {}),
        },
        { merge: true }
      ).catch(() => {});
    } catch {}

    try {
      await setDoc(
        doc(db, 'system', 'website_content'),
        {
          sectionVisibility: { [sectionKey]: isVisible },
          [sectionKey]: { visible: isVisible },
          ...(sectionKey === 'splash' ? { splashVideo: { enabled: isVisible } } : {}),
        },
        { merge: true }
      ).catch(() => {});
    } catch {}
  };

  const saveAllContent = async (allData) => {
    const merged = deepMerge(DEFAULT_WEBSITE_CONTENT, allData);
    setContent(merged);

    try {
      localStorage.setItem('rf_website_content_v1', JSON.stringify(merged));
    } catch {
      // ignore
    }

    broadcastContentUpdate(merged);

    try {
      await setDoc(doc(db, 'settings', 'websiteContent'), merged, { merge: true }).catch(() => {});
    } catch {}

    try {
      await setDoc(doc(db, 'system', 'website_content'), merged, { merge: true }).catch(() => {});
    } catch {}
  };

  const resetSection = async (sectionKey) => {
    if (DEFAULT_WEBSITE_CONTENT[sectionKey]) {
      await updateSection(sectionKey, DEFAULT_WEBSITE_CONTENT[sectionKey]);
    }
  };

  const resetAllToDefaults = async () => {
    setContent(DEFAULT_WEBSITE_CONTENT);
    try {
      localStorage.setItem('rf_website_content_v1', JSON.stringify(DEFAULT_WEBSITE_CONTENT));
    } catch {
      // ignore
    }

    broadcastContentUpdate(DEFAULT_WEBSITE_CONTENT);

    try {
      await setDoc(doc(db, 'settings', 'websiteContent'), DEFAULT_WEBSITE_CONTENT, { merge: true }).catch(() => {});
      await setDoc(doc(db, 'system', 'website_content'), DEFAULT_WEBSITE_CONTENT, { merge: true }).catch(() => {});
    } catch (err) {
      console.error('Error resetting content to defaults:', err);
    }
  };

  return (
    <WebsiteContentContext.Provider
      value={{
        content,
        updateSection,
        toggleSectionVisibility,
        saveAllContent,
        resetSection,
        resetAllToDefaults,
      }}
    >
      {children}
    </WebsiteContentContext.Provider>
  );
}

export function useWebsiteContent() {
  const context = useContext(WebsiteContentContext);
  return (
    context || {
      content: DEFAULT_WEBSITE_CONTENT,
      updateSection: async () => {},
      toggleSectionVisibility: async () => {},
      resetSection: async () => {},
      resetAllToDefaults: async () => {},
    }
  );
}

export default WebsiteContentContext;
