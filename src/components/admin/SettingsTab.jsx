import React, { useState, useEffect, useRef } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Home,
  Info,
  Sparkles,
  Layers,
  Activity,
  MapPin,
  Image as ImageIcon,
  UploadCloud,
  Check,
  Globe,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useWebsiteContent, DEFAULT_WEBSITE_CONTENT } from '../../context/WebsiteContentContext';

/**
 * Universal Drag-and-Drop Image Uploader Component
 * Supports: Drag & Drop from PC, click-to-browse, instant client-side canvas compression,
 * web URL paste, live preview, and 1-click reset to official default image.
 */
function ImageDropzone({
  label,
  helperText,
  value,
  onChange,
  defaultImage,
  onReset,
  aspectLabel = 'Landscape (16:9)',
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select or drop a valid image file (JPG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target.result;

      // Client-side canvas compression: keeps images crisp & fast, prevents oversized payload
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1400;
        let w = img.width;
        let h = img.height;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.84);
        setIsProcessing(false);
        onChange(compressed);
      };
      img.onerror = () => {
        setIsProcessing(false);
        onChange(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setIsProcessing(false);
      alert('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const isCustom = value && defaultImage && value !== defaultImage;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1.5px solid #E2E8F0',
        padding: '16px',
        marginBottom: '18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>{label}</span>
          {aspectLabel && (
            <span
              style={{
                fontSize: '0.7rem',
                color: '#008A38',
                backgroundColor: '#ECFDF3',
                border: '1px solid rgba(0, 184, 74, 0.25)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 700,
              }}
            >
              {aspectLabel}
            </span>
          )}
        </div>

        {isCustom && onReset && (
          <button
            type="button"
            onClick={onReset}
            style={{
              fontSize: '0.72rem',
              color: '#B91C1C',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              padding: '3px 8px',
              borderRadius: '6px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RotateCcw size={11} />
            <span>Reset to Original</span>
          </button>
        )}
      </div>

      {helperText && (
        <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '0 0 10px' }}>{helperText}</p>
      )}

      {/* Drag & Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        style={{
          border: isDragging ? '2px dashed #00B84A' : '2px dashed #CBD5E1',
          borderRadius: '12px',
          padding: '20px 14px',
          backgroundColor: isDragging ? 'rgba(0, 184, 74, 0.08)' : '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          transform: isDragging ? 'scale(1.01)' : 'scale(1)',
          boxShadow: isDragging ? '0 8px 24px rgba(0, 184, 74, 0.18)' : 'none',
          marginBottom: '10px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && e.target.files[0] && processFile(e.target.files[0])}
          style={{ display: 'none' }}
        />

        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: isDragging ? '#00B84A' : '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            color: isDragging ? '#FFFFFF' : '#008A38',
            transition: 'all 0.18s ease',
          }}
        >
          <UploadCloud size={20} />
        </div>

        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A', marginBottom: '3px', textAlign: 'center' }}>
          {isProcessing ? 'Optimizing Image...' : isDragging ? 'Drop Image to Upload!' : 'Drag & Drop Your Image Here'}
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748B', textAlign: 'center' }}>
          or <span style={{ color: '#008A38', fontWeight: 800, textDecoration: 'underline' }}>Browse from Device</span> • PNG, JPG, WebP
        </div>
      </div>

      {/* Alternative URL Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          {showUrlInput ? 'Hide Web URL link' : 'Or paste direct image URL'}
        </button>

        {value && (
          <span style={{ fontSize: '0.72rem', color: '#008A38', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Check size={12} /> Active Image Live
          </span>
        )}
      </div>

      {showUrlInput && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            type="text"
            placeholder="https://images.unsplash.com/... or image link"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.8rem',
              backgroundColor: '#FFFFFF',
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (customUrl.trim()) {
                onChange(customUrl.trim());
                setCustomUrl('');
                setShowUrlInput(false);
              }
            }}
            style={{
              backgroundColor: '#008A38',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Apply
          </button>
        </div>
      )}

      {/* Live Preview */}
      {value && (
        <div
          style={{
            marginTop: '10px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            backgroundColor: '#0A0F18',
            position: 'relative',
            height: '180px',
          }}
        >
          <img
            src={value}
            alt="Preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.72)',
              color: '#FFFFFF',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.66rem',
              fontWeight: 700,
              backdropFilter: 'blur(4px)',
            }}
          >
            Live Preview
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsTab({ activeSubTab = 'media', onSubTabChange, showToast }) {
  const { content, updateSection, resetSection, resetAllToDefaults } = useWebsiteContent();

  const [currentSubTab, setCurrentSubTab] = useState(activeSubTab || 'media');
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeSubTab && activeSubTab !== currentSubTab) {
      setCurrentSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  useEffect(() => {
    if (content) {
      const sectionKey = getSectionKey(currentSubTab);
      if (content[sectionKey]) {
        setFormData(JSON.parse(JSON.stringify(content[sectionKey])));
      }
    }
  }, [currentSubTab, content]);

  function getSectionKey(subTab) {
    switch (subTab) {
      case 'media':
        return 'hero'; // handled individually
      case 'home':
        return 'hero';
      case 'about':
        return 'about';
      case 'services':
        return 'services';
      case 'why_us':
        return 'whyUs';
      case 'programs':
        return 'programs';
      case 'tracking':
        return 'tracking';
      case 'contact':
        return 'contact';
      default:
        return 'hero';
    }
  }

  const handleSubTabClick = (tabId) => {
    setCurrentSubTab(tabId);
    if (onSubTabChange) {
      onSubTabChange(tabId);
    }
  };

  const notify = (msg) => {
    if (showToast) showToast(msg);
  };

  const handleSaveSection = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    const sectionKey = getSectionKey(currentSubTab);
    try {
      await updateSection(sectionKey, formData);
      notify('✓ Section updated and published live!');
    } catch (err) {
      console.error(err);
      notify('Error saving changes. Please retry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSection = async () => {
    if (window.confirm('Reset this section back to official default content?')) {
      const sectionKey = getSectionKey(currentSubTab);
      await resetSection(sectionKey);
      notify('✓ Section restored to default content.');
    }
  };

  // Helper for 1-click live image update from the dedicated Media Tab
  const handleMediaImageUpdate = async (sectionKey, updateFn, labelName) => {
    try {
      const currentSection = content[sectionKey] ? JSON.parse(JSON.stringify(content[sectionKey])) : {};
      const updatedSection = updateFn(currentSection);
      await updateSection(sectionKey, updatedSection);
      notify(`✓ Updated ${labelName} image live!`);
    } catch (err) {
      console.error(err);
      notify(`Failed to update ${labelName} image.`);
    }
  };

  const tabs = [
    { id: 'media', label: '🖼️ Website Images & Media', icon: ImageIcon, desc: 'Drag & Drop all gym images' },
    { id: 'home', label: 'Home / Hero', icon: Home, desc: 'Visual banner & cue' },
    { id: 'about', label: 'About Us', icon: Info, desc: 'Heritage story & photo' },
    { id: 'services', label: 'Services', icon: Sparkles, desc: 'PT, Massage, Steam & images' },
    { id: 'programs', label: 'Programs', icon: Activity, desc: 'Beginner, Inter, Advanced' },
    { id: 'why_us', label: 'Why Choose Us', icon: Layers, desc: '5 Core Value Props' },
    { id: 'tracking', label: 'Tracking', icon: Activity, desc: 'Body composition metrics' },
    { id: 'contact', label: 'Contact & Branches', icon: MapPin, desc: 'Phone, hours & policy' },
  ];

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #CBD5E1',
    fontSize: '0.86rem',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: 1.5,
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 800,
    color: '#334155',
    marginBottom: '6px',
    letterSpacing: '0.02em',
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Banner: Clean Branded Header (WITHOUT "View Live Site" and "Save & Publish" buttons) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderRadius: '16px',
          padding: '22px 26px',
          color: '#FFFFFF',
          marginBottom: '22px',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(0, 184, 74, 0.15)',
              border: '1px solid rgba(0, 184, 74, 0.4)',
              color: '#00D256',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px',
            }}
          >
            <Globe size={12} />
            <span>Website Control Room</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
            Website Content & Media Settings
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.84rem', margin: '4px 0 0', maxWidth: '600px' }}>
            Drag and drop images, update texts, and customize services. All changes synchronize instantly to the live site.
          </p>
        </div>

        {/* Live Auto-Save Status Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '999px',
            backgroundColor: 'rgba(0, 210, 86, 0.12)',
            border: '1px solid rgba(0, 210, 86, 0.3)',
            color: '#00D256',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.02em',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#00D256',
              boxShadow: '0 0 8px #00D256',
            }}
          />
          <span>Auto-Saved Live to Cloud</span>
        </div>
      </div>

      {/* Sub-tab Navigation Strip */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = currentSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSubTabClick(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '12px',
                border: active ? '1.5px solid #00B84A' : '1.5px solid #E2E8F0',
                backgroundColor: active ? '#ECFDF3' : '#FFFFFF',
                color: active ? '#008A38' : '#475569',
                fontWeight: active ? 800 : 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
                boxShadow: active ? '0 4px 12px rgba(0, 184, 74, 0.12)' : 'none',
              }}
            >
              <Icon size={16} color={active ? '#008A38' : '#64748B'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          padding: '24px 28px',
          boxShadow: '0 8px 30px rgba(15, 23, 42, 0.05)',
        }}
      >
        {/* ============================================================ */}
        {/* TAB: ALL WEBSITE IMAGES & MEDIA (DRAG & DROP HUB)             */}
        {/* ============================================================ */}
        {currentSubTab === 'media' && (
          <div>
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#008A38', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                <ImageIcon size={14} />
                <span>Media & Visual Assets</span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>
                All Website Images (Drag & Drop Uploader)
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.86rem', margin: 0 }}>
                Drag and drop any image from your computer to replace photos across the website. Changes update immediately live!
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* 1. Hero Background */}
              <ImageDropzone
                label="1. Hero Fullscreen Background"
                helperText="Main full-screen background photo seen when landing on the website."
                aspectLabel="16:9 Landscape"
                value={content?.hero?.bgImage || DEFAULT_WEBSITE_CONTENT.hero.bgImage}
                defaultImage={DEFAULT_WEBSITE_CONTENT.hero.bgImage}
                onChange={(newImg) => {
                  handleMediaImageUpdate('hero', (prev) => ({ ...prev, bgImage: newImg }), 'Hero Background');
                }}
                onReset={() => {
                  handleMediaImageUpdate('hero', (prev) => ({ ...prev, bgImage: DEFAULT_WEBSITE_CONTENT.hero.bgImage }), 'Hero Background');
                }}
              />

              {/* 2. About Us Image */}
              <ImageDropzone
                label="2. About Us Featured Gym Photo"
                helperText="Gym facility & corporate heritage photo in About Mahabal Group section."
                aspectLabel="4:3 Facility Photo"
                value={content?.about?.image || DEFAULT_WEBSITE_CONTENT.about.image}
                defaultImage={DEFAULT_WEBSITE_CONTENT.about.image}
                onChange={(newImg) => {
                  handleMediaImageUpdate('about', (prev) => ({ ...prev, image: newImg }), 'About Us');
                }}
                onReset={() => {
                  handleMediaImageUpdate('about', (prev) => ({ ...prev, image: DEFAULT_WEBSITE_CONTENT.about.image }), 'About Us');
                }}
              />

              {/* 3. Personal Training Image */}
              <ImageDropzone
                label="3. Personal Training (PT) Service Image"
                helperText="Card image for 1-on-1 Dedicated Coaching."
                aspectLabel="16:10 Service Card"
                value={
                  content?.services?.items?.find((i) => i.id === 'pt')?.image ||
                  DEFAULT_WEBSITE_CONTENT.services.items[0].image
                }
                defaultImage={DEFAULT_WEBSITE_CONTENT.services.items[0].image}
                onChange={(newImg) => {
                  handleMediaImageUpdate(
                    'services',
                    (prev) => {
                      const items = [...(prev.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      const idx = items.findIndex((i) => i.id === 'pt');
                      if (idx >= 0) items[idx] = { ...items[idx], image: newImg };
                      return { ...prev, items };
                    },
                    'Personal Training'
                  );
                }}
                onReset={() => {
                  handleMediaImageUpdate(
                    'services',
                    (prev) => {
                      const items = [...(prev.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      const idx = items.findIndex((i) => i.id === 'pt');
                      if (idx >= 0) items[idx] = { ...items[idx], image: DEFAULT_WEBSITE_CONTENT.services.items[0].image };
                      return { ...prev, items };
                    },
                    'Personal Training'
                  );
                }}
              />

              {/* 4. Massage Service Image */}
              <ImageDropzone
                label="4. Massage Therapy Service Image"
                helperText="Card image for Sports & Recovery Deep Tissue Massage."
                aspectLabel="16:10 Service Card"
                value={
                  content?.services?.items?.find((i) => i.id === 'massage')?.image ||
                  DEFAULT_WEBSITE_CONTENT.services.items[1].image
                }
                defaultImage={DEFAULT_WEBSITE_CONTENT.services.items[1].image}
                onChange={(newImg) => {
                  handleMediaImageUpdate(
                    'services',
                    (prev) => {
                      const items = [...(prev.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      const idx = items.findIndex((i) => i.id === 'massage');
                      if (idx >= 0) items[idx] = { ...items[idx], image: newImg };
                      return { ...prev, items };
                    },
                    'Massage Therapy'
                  );
                }}
                onReset={() => {
                  handleMediaImageUpdate(
                    'services',
                    (prev) => {
                      const items = [...(prev.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      const idx = items.findIndex((i) => i.id === 'massage');
                      if (idx >= 0) items[idx] = { ...items[idx], image: DEFAULT_WEBSITE_CONTENT.services.items[1].image };
                      return { ...prev, items };
                    },
                    'Massage Therapy'
                  );
                }}
              />

              {/* 5. Steam Bath Service Image */}
              <ImageDropzone
                label="5. Steam Bath Sanctuary Image"
                helperText="Card image for Luxury Thermal Steam Bath Detox."
                aspectLabel="16:10 Service Card"
                value={
                  content?.services?.items?.find((i) => i.id === 'steam')?.image ||
                  DEFAULT_WEBSITE_CONTENT.services.items[2].image
                }
                defaultImage={DEFAULT_WEBSITE_CONTENT.services.items[2].image}
                onChange={(newImg) => {
                  handleMediaImageUpdate(
                    'services',
                    (prev) => {
                      const items = [...(prev.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      const idx = items.findIndex((i) => i.id === 'steam');
                      if (idx >= 0) items[idx] = { ...items[idx], image: newImg };
                      return { ...prev, items };
                    },
                    'Steam Bath'
                  );
                }}
                onReset={() => {
                  handleMediaImageUpdate(
                    'services',
                    (prev) => {
                      const items = [...(prev.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      const idx = items.findIndex((i) => i.id === 'steam');
                      if (idx >= 0) items[idx] = { ...items[idx], image: DEFAULT_WEBSITE_CONTENT.services.items[2].image };
                      return { ...prev, items };
                    },
                    'Steam Bath'
                  );
                }}
              />

              {/* 6. Zumba Service Image */}
              <ImageDropzone
                label="6. Zumba Cardio Dance Image"
                helperText="Card image for High-Energy Latin Zumba Dance."
                aspectLabel="16:10 Service Card"
                value={
                  content?.services?.items?.find((i) => i.id === 'zumba')?.image ||
                  DEFAULT_WEBSITE_CONTENT.services.items[3].image
                }
                defaultImage={DEFAULT_WEBSITE_CONTENT.services.items[3].image}
                onChange={(newImg) => {
                  handleMediaImageUpdate(
                    'services',
                    (prev) => {
                      const items = [...(prev.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      const idx = items.findIndex((i) => i.id === 'zumba');
                      if (idx >= 0) items[idx] = { ...items[idx], image: newImg };
                      return { ...prev, items };
                    },
                    'Zumba'
                  );
                }}
                onReset={() => {
                  handleMediaImageUpdate(
                    'services',
                    (prev) => {
                      const items = [...(prev.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      const idx = items.findIndex((i) => i.id === 'zumba');
                      if (idx >= 0) items[idx] = { ...items[idx], image: DEFAULT_WEBSITE_CONTENT.services.items[3].image };
                      return { ...prev, items };
                    },
                    'Zumba'
                  );
                }}
              />

              {/* 7. Yoga Service Image */}
              <ImageDropzone
                label="7. Yoga & Flexibility Image"
                helperText="Card image for Mind, Body & Flexibility Yoga."
                aspectLabel="16:10 Service Card"
                value={
                  content?.services?.items?.find((i) => i.id === 'yoga')?.image ||
                  DEFAULT_WEBSITE_CONTENT.services.items[4].image
                }
                defaultImage={DEFAULT_WEBSITE_CONTENT.services.items[4].image}
                onChange={(newImg) => {
                  handleMediaImageUpdate(
                    'services',
                    (prev) => {
                      const items = [...(prev.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      const idx = items.findIndex((i) => i.id === 'yoga');
                      if (idx >= 0) items[idx] = { ...items[idx], image: newImg };
                      return { ...prev, items };
                    },
                    'Yoga'
                  );
                }}
                onReset={() => {
                  handleMediaImageUpdate(
                    'services',
                    (prev) => {
                      const items = [...(prev.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      const idx = items.findIndex((i) => i.id === 'yoga');
                      if (idx >= 0) items[idx] = { ...items[idx], image: DEFAULT_WEBSITE_CONTENT.services.items[4].image };
                      return { ...prev, items };
                    },
                    'Yoga'
                  );
                }}
              />

              {/* 8. Beginner Program Image */}
              <ImageDropzone
                label="8. Beginner Program Image"
                helperText="Workout curriculum visual for Level 1 Newcomers."
                aspectLabel="16:9 Landscape"
                value={
                  content?.programs?.beginner?.image ||
                  DEFAULT_WEBSITE_CONTENT.programs.beginner.image
                }
                defaultImage={DEFAULT_WEBSITE_CONTENT.programs.beginner.image}
                onChange={(newImg) => {
                  handleMediaImageUpdate(
                    'programs',
                    (prev) => ({
                      ...prev,
                      beginner: { ...(prev.beginner || {}), image: newImg },
                    }),
                    'Beginner Program'
                  );
                }}
                onReset={() => {
                  handleMediaImageUpdate(
                    'programs',
                    (prev) => ({
                      ...prev,
                      beginner: { ...(prev.beginner || {}), image: DEFAULT_WEBSITE_CONTENT.programs.beginner.image },
                    }),
                    'Beginner Program'
                  );
                }}
              />

              {/* 9. Intermediate Program Image */}
              <ImageDropzone
                label="9. Intermediate Program Image"
                helperText="Workout curriculum visual for Level 2 Hypertrophy."
                aspectLabel="16:9 Landscape"
                value={
                  content?.programs?.intermediate?.image ||
                  DEFAULT_WEBSITE_CONTENT.programs.intermediate.image
                }
                defaultImage={DEFAULT_WEBSITE_CONTENT.programs.intermediate.image}
                onChange={(newImg) => {
                  handleMediaImageUpdate(
                    'programs',
                    (prev) => ({
                      ...prev,
                      intermediate: { ...(prev.intermediate || {}), image: newImg },
                    }),
                    'Intermediate Program'
                  );
                }}
                onReset={() => {
                  handleMediaImageUpdate(
                    'programs',
                    (prev) => ({
                      ...prev,
                      intermediate: { ...(prev.intermediate || {}), image: DEFAULT_WEBSITE_CONTENT.programs.intermediate.image },
                    }),
                    'Intermediate Program'
                  );
                }}
              />

              {/* 10. Advanced Program Image */}
              <ImageDropzone
                label="10. Advanced Program Image"
                helperText="Workout curriculum visual for Level 3 Athletic Powerlifting."
                aspectLabel="16:9 Landscape"
                value={
                  content?.programs?.advanced?.image ||
                  DEFAULT_WEBSITE_CONTENT.programs.advanced.image
                }
                defaultImage={DEFAULT_WEBSITE_CONTENT.programs.advanced.image}
                onChange={(newImg) => {
                  handleMediaImageUpdate(
                    'programs',
                    (prev) => ({
                      ...prev,
                      advanced: { ...(prev.advanced || {}), image: newImg },
                    }),
                    'Advanced Program'
                  );
                }}
                onReset={() => {
                  handleMediaImageUpdate(
                    'programs',
                    (prev) => ({
                      ...prev,
                      advanced: { ...(prev.advanced || {}), image: DEFAULT_WEBSITE_CONTENT.programs.advanced.image },
                    }),
                    'Advanced Program'
                  );
                }}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: HOME / HERO                                             */}
        {/* ============================================================ */}
        {currentSubTab === 'home' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              Home Section & Hero Visual
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.86rem', marginBottom: '22px' }}>
              Change the main fullscreen background image and toggle the subtle scroll down arrow.
            </p>

            <ImageDropzone
              label="Hero Fullscreen Background Image"
              helperText="Drag & drop any high-resolution gym photo. Automatically scales and optimizes."
              aspectLabel="16:9 Landscape"
              value={formData.bgImage || DEFAULT_WEBSITE_CONTENT.hero.bgImage}
              defaultImage={DEFAULT_WEBSITE_CONTENT.hero.bgImage}
              onChange={(newImg) => {
                const updated = { ...formData, bgImage: newImg };
                setFormData(updated);
                updateSection('hero', updated);
                notify('✓ Hero image updated live!');
              }}
              onReset={() => {
                const updated = { ...formData, bgImage: DEFAULT_WEBSITE_CONTENT.hero.bgImage };
                setFormData(updated);
                updateSection('hero', updated);
                notify('✓ Hero image restored to default!');
              }}
            />

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#008A38',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Save size={15} />
                <span>Save Section</span>
              </button>
              <button
                type="button"
                onClick={handleResetSection}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#F8FAFC',
                  color: '#64748B',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: ABOUT US                                                */}
        {/* ============================================================ */}
        {currentSubTab === 'about' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              About Mahabal Group & Respire Fitness
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.86rem', marginBottom: '22px' }}>
              Manage corporate narrative, institutional pillars, and featured facility photo.
            </p>

            <ImageDropzone
              label="Featured Facility & Heritage Photo"
              helperText="Main photo shown on the left of About section."
              aspectLabel="4:3 Facility Photo"
              value={formData.image || DEFAULT_WEBSITE_CONTENT.about.image}
              defaultImage={DEFAULT_WEBSITE_CONTENT.about.image}
              onChange={(newImg) => {
                const updated = { ...formData, image: newImg };
                setFormData(updated);
                updateSection('about', updated);
                notify('✓ About photo updated live!');
              }}
              onReset={() => {
                const updated = { ...formData, image: DEFAULT_WEBSITE_CONTENT.about.image };
                setFormData(updated);
                updateSection('about', updated);
                notify('✓ About photo restored to default!');
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div>
                <label style={labelStyle}>Section Eyebrow</label>
                <input
                  type="text"
                  value={formData.eyebrow || ''}
                  onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Headline Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>Lead Story Paragraph</label>
              <textarea
                rows={3}
                value={formData.leadParagraph || ''}
                onChange={(e) => setFormData({ ...formData, leadParagraph: e.target.value })}
                style={textareaStyle}
              />
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>Secondary Story Paragraph</label>
              <textarea
                rows={3}
                value={formData.secondaryParagraph || ''}
                onChange={(e) => setFormData({ ...formData, secondaryParagraph: e.target.value })}
                style={textareaStyle}
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#008A38',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Save size={15} />
                <span>Save About Section</span>
              </button>
              <button
                type="button"
                onClick={handleResetSection}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#F8FAFC',
                  color: '#64748B',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={14} />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: SERVICES                                                */}
        {/* ============================================================ */}
        {currentSubTab === 'services' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              Services Section (PT, Massage, Steam Bath, Zumba, Yoga)
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.86rem', marginBottom: '22px' }}>
              Drag and drop images for each service card, edit titles, and descriptions.
            </p>

            <div style={{ display: 'grid', gap: '24px' }}>
              {(formData.items || DEFAULT_WEBSITE_CONTENT.services.items).map((service, idx) => (
                <div
                  key={service.id || idx}
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    border: '1.5px solid #E2E8F0',
                    backgroundColor: '#F8FCFA',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontWeight: 800, color: '#008A38', fontSize: '0.94rem' }}>
                      #{idx + 1} — {service.title}
                    </span>
                    <span style={{ fontSize: '0.74rem', backgroundColor: '#E2E8F0', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                      ID: {service.id}
                    </span>
                  </div>

                  {/* Drag & Drop for this specific service */}
                  <ImageDropzone
                    label={`${service.title} Card Image`}
                    helperText={`Drag and drop custom image for ${service.title}.`}
                    aspectLabel="16:10 Service Card"
                    value={service.image}
                    defaultImage={DEFAULT_WEBSITE_CONTENT.services.items[idx]?.image}
                    onChange={(newImg) => {
                      const updatedItems = [...(formData.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      updatedItems[idx] = { ...updatedItems[idx], image: newImg };
                      const updated = { ...formData, items: updatedItems };
                      setFormData(updated);
                      updateSection('services', updated);
                      notify(`✓ ${service.title} image updated live!`);
                    }}
                    onReset={() => {
                      const updatedItems = [...(formData.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                      updatedItems[idx] = { ...updatedItems[idx], image: DEFAULT_WEBSITE_CONTENT.services.items[idx]?.image };
                      const updated = { ...formData, items: updatedItems };
                      setFormData(updated);
                      updateSection('services', updated);
                      notify(`✓ ${service.title} image restored!`);
                    }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={labelStyle}>Service Title</label>
                      <input
                        type="text"
                        value={service.title || ''}
                        onChange={(e) => {
                          const updated = [...(formData.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                          updated[idx].title = e.target.value;
                          setFormData({ ...formData, items: updated });
                        }}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Badge Tag</label>
                      <input
                        type="text"
                        value={service.tag || ''}
                        onChange={(e) => {
                          const updated = [...(formData.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                          updated[idx].tag = e.target.value;
                          setFormData({ ...formData, items: updated });
                        }}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea
                      rows={2}
                      value={service.description || ''}
                      onChange={(e) => {
                        const updated = [...(formData.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                        updated[idx].description = e.target.value;
                        setFormData({ ...formData, items: updated });
                      }}
                      style={textareaStyle}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#008A38',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Save size={15} />
                <span>Save All Services</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: PROGRAMS                                                */}
        {/* ============================================================ */}
        {currentSubTab === 'programs' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              Workout Programs (Beginner, Intermediate, Advanced)
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.86rem', marginBottom: '22px' }}>
              Change curriculum images, subtitles, and descriptions with drag and drop.
            </p>

            <div style={{ display: 'grid', gap: '22px' }}>
              {['beginner', 'intermediate', 'advanced'].map((lvl) => {
                const prog = formData[lvl] || DEFAULT_WEBSITE_CONTENT.programs[lvl] || {};
                const name = lvl.charAt(0).toUpperCase() + lvl.slice(1);
                return (
                  <div
                    key={lvl}
                    style={{
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1.5px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.94rem', marginBottom: '12px' }}>
                      Level: {name} Program
                    </div>

                    <ImageDropzone
                      label={`${name} Program Cover Image`}
                      helperText={`Drag and drop visual photo for ${name} program.`}
                      aspectLabel="16:9 Landscape"
                      value={prog.image}
                      defaultImage={DEFAULT_WEBSITE_CONTENT.programs[lvl]?.image}
                      onChange={(newImg) => {
                        const updated = {
                          ...formData,
                          [lvl]: { ...prog, image: newImg },
                        };
                        setFormData(updated);
                        updateSection('programs', updated);
                        notify(`✓ ${name} program image updated live!`);
                      }}
                      onReset={() => {
                        const updated = {
                          ...formData,
                          [lvl]: { ...prog, image: DEFAULT_WEBSITE_CONTENT.programs[lvl]?.image },
                        };
                        setFormData(updated);
                        updateSection('programs', updated);
                        notify(`✓ ${name} program image restored!`);
                      }}
                    />

                    <div style={{ marginTop: '12px' }}>
                      <label style={labelStyle}>Subtitle</label>
                      <input
                        type="text"
                        value={prog.subtitle || ''}
                        onChange={(e) => {
                          const updated = {
                            ...formData,
                            [lvl]: { ...prog, subtitle: e.target.value },
                          };
                          setFormData(updated);
                        }}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        rows={2}
                        value={prog.description || ''}
                        onChange={(e) => {
                          const updated = {
                            ...formData,
                            [lvl]: { ...prog, description: e.target.value },
                          };
                          setFormData(updated);
                        }}
                        style={textareaStyle}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#008A38',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Save size={15} />
                <span>Save Programs</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: WHY CHOOSE US                                           */}
        {/* ============================================================ */}
        {currentSubTab === 'why_us' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              Why Choose Us Section
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.86rem', marginBottom: '22px' }}>
              Edit headlines and 4 core value proposition cards.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Eyebrow</label>
                <input
                  type="text"
                  value={formData.eyebrow || ''}
                  onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Section Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#008A38',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Save size={15} />
                <span>Save Section</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: FITNESS TRACKING                                        */}
        {/* ============================================================ */}
        {currentSubTab === 'tracking' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              Smart Fitness Tracking Section
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.86rem', marginBottom: '22px' }}>
              Update tracking headlines and biometric monitoring highlights.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Eyebrow</label>
                <input
                  type="text"
                  value={formData.eyebrow || ''}
                  onChange={(e) => setFormData({ ...formData, eyebrow: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Section Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#008A38',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Save size={15} />
                <span>Save Section</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB: CONTACT & BRANCHES                                      */}
        {/* ============================================================ */}
        {currentSubTab === 'contact' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              Contact, Branch Desks & Gym Rules
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.86rem', marginBottom: '22px' }}>
              Edit branch contact numbers, operating hours, and gym policies.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Vishrambag Desk Phone</label>
                <input
                  type="text"
                  value={formData.vishrambagPhone || '+91 7798001777'}
                  onChange={(e) => setFormData({ ...formData, vishrambagPhone: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Vijaynagar Desk Phone</label>
                <input
                  type="text"
                  value={formData.vijaynagarPhone || '+91 9172848777'}
                  onChange={(e) => setFormData({ ...formData, vijaynagarPhone: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={handleSaveSection}
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#008A38',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Save size={15} />
                <span>Save Contact Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
