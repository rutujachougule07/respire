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
  Dumbbell,
  Plus,
  Edit3,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useWebsiteContent, DEFAULT_WEBSITE_CONTENT } from '../../context/WebsiteContentContext';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
        const MAX_DIM = 960;
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
        const compressed = canvas.toDataURL('image/jpeg', 0.68);
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

export default function SettingsTab({ activeSubTab = 'home', onSubTabChange, showToast }) {
  const { content, updateSection, toggleSectionVisibility, resetSection, resetAllToDefaults } = useWebsiteContent();

  const [currentSubTab, setCurrentSubTab] = useState(activeSubTab || 'home');
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const getSectionKey = (subTab) => {
    switch (subTab) {
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
  };

  const isSectionVisible = (sectionKey) => {
    if (content?.sectionVisibility?.[sectionKey] === false) return false;
    if (content?.[sectionKey]?.visible === false) return false;
    return true;
  };

  const handleToggleCurrentSection = async () => {
    const sectionKey = getSectionKey(currentSubTab);
    const currentVis = isSectionVisible(sectionKey);
    const newVis = !currentVis;
    await toggleSectionVisibility(sectionKey, newVis);
    notify(newVis ? `✓ ${sectionKey.toUpperCase()} section is now LIVE on website!` : `✓ ${sectionKey.toUpperCase()} section is now HIDDEN / REMOVED from website!`);
  };

  // PT Fee Structure state
  const DEFAULT_PT_RATES = {
    vishrambag: {
      categories: [
        { id: 'pt-vb-general', title: 'GENERAL PERSONAL TRAINING', badge: 'Certified Coach', alternatePrice: 7000, dailyPrice: 10000 },
        { id: 'pt-vb-premium', title: 'PREMIUM PERSONAL TRAINING', badge: 'Elite Transformation Specialist', alternatePrice: 9000, dailyPrice: 13000 },
      ],
    },
    branch2: {
      categories: [
        { id: 'pt-vjn-junior', title: 'JUNIOR PERSONAL TRAINER', badge: 'Junior Fitness Coach', alternatePrice: 4500, dailyPrice: 8000 },
        { id: 'pt-vjn-senior', title: 'SENIOR PERSONAL TRAINER', badge: 'Senior Master Coach (Since 2012)', alternatePrice: 5500, dailyPrice: 10000 },
      ],
    },
  };
  const [ptRates, setPtRates] = useState(DEFAULT_PT_RATES);
  const [ptLoaded, setPtLoaded] = useState(false);
  const [isSavingPT, setIsSavingPT] = useState(false);
  const [editingPTBranch, setEditingPTBranch] = useState('vishrambag');
  const [showAddPTForm, setShowAddPTForm] = useState(false);
  const [newPTCategory, setNewPTCategory] = useState({ title: '', badge: '', alternatePrice: '', dailyPrice: '' });
  const [editingPTIdx, setEditingPTIdx] = useState(null);

  // Load PT rates directly from plans/vishrambag and plans/vijaynagar
  useEffect(() => {
    const loadPTRates = async () => {
      try {
        const vbSnap = await getDoc(doc(db, 'plans', 'vishrambag'));
        const vjnSnap = await getDoc(doc(db, 'plans', 'vijaynagar'));
        const newRates = JSON.parse(JSON.stringify(DEFAULT_PT_RATES));
        if (vbSnap.exists() && Array.isArray(vbSnap.data()?.specialPlans)) {
          newRates.vishrambag = { categories: vbSnap.data().specialPlans };
        }
        if (vjnSnap.exists() && Array.isArray(vjnSnap.data()?.specialPlans)) {
          newRates.branch2 = { categories: vjnSnap.data().specialPlans };
        }
        setPtRates(newRates);
      } catch (e) {
        console.error('Could not load PT rates from Firestore', e);
      } finally {
        setPtLoaded(true);
      }
    };
    loadPTRates();
  }, []);

  const savePTRatesToFirestore = async (updatedRates) => {
    setIsSavingPT(true);
    try {
      if (updatedRates.vishrambag?.categories) {
        await setDoc(doc(db, 'plans', 'vishrambag'), { specialPlans: updatedRates.vishrambag.categories }, { merge: true });
      }
      if (updatedRates.branch2?.categories) {
        await setDoc(doc(db, 'plans', 'vijaynagar'), { specialPlans: updatedRates.branch2.categories }, { merge: true });
      }
      setPtRates(updatedRates);
      notify('✓ PT Fee Structure saved directly to plans collection!');
    } catch (e) {
      console.error(e);
      notify('Error saving PT rates. Please retry.');
    } finally {
      setIsSavingPT(false);
    }
  };

  const handlePTCategoryChange = (branch, idx, field, value) => {
    const updated = JSON.parse(JSON.stringify(ptRates));
    updated[branch].categories[idx][field] = field.includes('Price') ? Number(value) : value;
    setPtRates(updated);
  };

  const handleDeletePTCategory = (branch, idx) => {
    if (!window.confirm('Delete this PT plan?')) return;
    const updated = JSON.parse(JSON.stringify(ptRates));
    updated[branch].categories.splice(idx, 1);
    savePTRatesToFirestore(updated);
  };

  const handleAddPTCategory = () => {
    const { title, badge, alternatePrice, dailyPrice } = newPTCategory;
    if (!title.trim()) { notify('Please enter a plan title.'); return; }
    const updated = JSON.parse(JSON.stringify(ptRates));
    updated[editingPTBranch].categories.push({
      id: `pt-custom-${Date.now()}`,
      title: title.trim(),
      badge: badge.trim(),
      alternatePrice: Number(alternatePrice) || 0,
      dailyPrice: Number(dailyPrice) || 0,
    });
    setNewPTCategory({ title: '', badge: '', alternatePrice: '', dailyPrice: '' });
    setShowAddPTForm(false);
    savePTRatesToFirestore(updated);
  };

  useEffect(() => {
    if (activeSubTab && activeSubTab !== currentSubTab) {
      setCurrentSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  // Initialize form data when sub-tab changes
  useEffect(() => {
    if (content) {
      const sectionKey = getSectionKey(currentSubTab);
      if (content[sectionKey]) {
        setFormData(JSON.parse(JSON.stringify(content[sectionKey])));
      }
    }
  }, [currentSubTab]);

  const handleSubTabClick = (tabId) => {
    setCurrentSubTab(tabId);
    if (onSubTabChange) {
      onSubTabChange(tabId);
    }
  };

  const notify = (msg) => {
    if (showToast) showToast(msg);
  };

  const autoSaveSection = (updatedData) => {
    setFormData(updatedData);
    const sectionKey = getSectionKey(currentSubTab);
    updateSection(sectionKey, updatedData);
  };

  const handleSaveSection = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    if (currentSubTab === 'pt_fees') {
      try {
        await savePTRatesToFirestore(ptRates);
      } finally {
        setIsSaving(false);
      }
      return;
    }
    const sectionKey = getSectionKey(currentSubTab);
    try {
      await updateSection(sectionKey, formData);
      notify(`✓ Published live to website!`);
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

  const tabs = [
    { id: 'home', label: 'Home / Hero', icon: Home, desc: 'Visual banner & cue' },
    { id: 'about', label: 'About Us', icon: Info, desc: 'Heritage story & photo' },
    { id: 'services', label: 'Services', icon: Sparkles, desc: 'PT, Massage, Steam & images' },
    { id: 'programs', label: 'Programs', icon: Activity, desc: 'Beginner, Inter, Advanced' },
    { id: 'why_us', label: 'Why Choose Us', icon: Layers, desc: '5 Core Value Props' },
    { id: 'tracking', label: 'Tracking', icon: Activity, desc: 'Body composition metrics' },
    { id: 'contact', label: 'Contact & Branches', icon: MapPin, desc: 'Phone, hours & policy' },
    { id: 'pt_fees', label: 'PT Fee Structure', icon: Dumbbell, desc: 'Edit branch PT rates' },
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
            Website Content & Section Settings
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.84rem', margin: '4px 0 0', maxWidth: '600px' }}>
            Edit content and upload images directly in each section tab below. All changes synchronize instantly to the live site.
          </p>
        </div>

        {/* Actions: View Live Site + Save & Publish Live + Live Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => window.open('/', '_blank')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}
          >
            <Eye size={15} />
            <span>View Live Site</span>
            <ExternalLink size={13} />
          </button>

          <button
            type="button"
            onClick={handleSaveSection}
            disabled={isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 20px',
              borderRadius: '10px',
              backgroundColor: '#008A38',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 138, 56, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00A342')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#008A38')}
          >
            <Save size={15} />
            <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
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
            <span>Live Synced to Website</span>
          </div>
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
                  onChange={(e) => {
                    const val = e.target.value;
                    autoSaveSection({ ...formData, eyebrow: val });
                  }}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Headline Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    autoSaveSection({ ...formData, title: val });
                  }}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>Lead Story Paragraph</label>
              <textarea
                rows={3}
                value={formData.leadParagraph || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  autoSaveSection({ ...formData, leadParagraph: val });
                }}
                style={textareaStyle}
              />
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={labelStyle}>Secondary Story Paragraph</label>
              <textarea
                rows={3}
                value={formData.secondaryParagraph || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  autoSaveSection({ ...formData, secondaryParagraph: val });
                }}
                style={textareaStyle}
              />
            </div>

            {/* Corporate Heritage Pillars */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>Institutional Pillars (4 Core Blocks)</span>
                <button
                  type="button"
                  onClick={() => {
                    const currentPillars = [...(formData.pillars || DEFAULT_WEBSITE_CONTENT.about.pillars)];
                    currentPillars.push({
                      title: 'New Institutional Pillar',
                      desc: 'Corporate commitment to transparency, governance, and health excellence.',
                    });
                    autoSaveSection({ ...formData, pillars: currentPillars });
                    notify('✓ Added new pillar!');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#ECFDF3',
                    color: '#008A38',
                    border: '1px solid #A7F3D0',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={13} />
                  <span>Add Pillar</span>
                </button>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {(formData.pillars || DEFAULT_WEBSITE_CONTENT.about.pillars).map((p, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#008A38' }}>Pillar #{pIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentPillars = [...(formData.pillars || DEFAULT_WEBSITE_CONTENT.about.pillars)];
                          currentPillars.splice(pIdx, 1);
                          autoSaveSection({ ...formData, pillars: currentPillars });
                          notify('✓ Pillar removed from website!');
                        }}
                        style={{
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={p.title || ''}
                      onChange={(e) => {
                        const currentPillars = [...(formData.pillars || DEFAULT_WEBSITE_CONTENT.about.pillars)];
                        currentPillars[pIdx] = { ...currentPillars[pIdx], title: e.target.value };
                        autoSaveSection({ ...formData, pillars: currentPillars });
                      }}
                      placeholder="Pillar Title"
                      style={{ ...inputStyle, marginBottom: '8px' }}
                    />
                    <textarea
                      rows={2}
                      value={p.desc || ''}
                      onChange={(e) => {
                        const currentPillars = [...(formData.pillars || DEFAULT_WEBSITE_CONTENT.about.pillars)];
                        currentPillars[pIdx] = { ...currentPillars[pIdx], desc: e.target.value };
                        autoSaveSection({ ...formData, pillars: currentPillars });
                      }}
                      placeholder="Pillar Description"
                      style={textareaStyle}
                    />
                  </div>
                ))}
              </div>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, color: '#008A38', fontSize: '0.94rem' }}>
                        #{idx + 1} — {service.title}
                      </span>
                      <span style={{ fontSize: '0.74rem', backgroundColor: '#E2E8F0', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        ID: {service.id}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm(`Delete "${service.title}" service card from the website?`)) return;
                        const currentItems = [...(formData.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                        currentItems.splice(idx, 1);
                        const updated = { ...formData, items: currentItems };
                        autoSaveSection(updated);
                        notify(`✓ Removed ${service.title} from website!`);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FCA5A5',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Delete Service</span>
                    </button>
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
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          autoSaveSection({ ...formData, items: updated });
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
                          updated[idx] = { ...updated[idx], tag: e.target.value };
                          autoSaveSection({ ...formData, items: updated });
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
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        autoSaveSection({ ...formData, items: updated });
                      }}
                      style={textareaStyle}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const currentItems = [...(formData.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                currentItems.push({
                  id: `service-${Date.now()}`,
                  title: 'New Service',
                  tag: 'Special Offering',
                  description: 'Experience customized training protocols designed for your physiology and goals.',
                  features: ['Body assessment & posture analysis', 'Custom workout plan', 'Certified coaching'],
                  image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
                  accent: '#00B84A',
                });
                const updated = { ...formData, items: currentItems };
                autoSaveSection(updated);
                notify('✓ New service card added live to website!');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '1.5px dashed #00B84A',
                backgroundColor: '#ECFDF3',
                color: '#008A38',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                marginTop: '16px',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              <Plus size={16} />
              <span>Add Another Service Card</span>
            </button>

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
                          autoSaveSection(updated);
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
                          autoSaveSection(updated);
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
              Edit headlines and core value proposition cards. Add or remove cards freely.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Eyebrow</label>
                <input
                  type="text"
                  value={formData.eyebrow || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    autoSaveSection({ ...formData, eyebrow: val });
                  }}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Section Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    autoSaveSection({ ...formData, title: val });
                  }}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Reasons List */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>Core Reasons / Value Cards</span>
                <button
                  type="button"
                  onClick={() => {
                    const currentReasons = [...(formData.reasons || DEFAULT_WEBSITE_CONTENT.whyUs.reasons)];
                    currentReasons.push({
                      title: 'New Value Proposition',
                      badge: 'Certified Experts',
                      desc: 'Customized training protocol and verified results tailored to each member.',
                    });
                    autoSaveSection({ ...formData, reasons: currentReasons });
                    notify('✓ Added new Reason card!');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#ECFDF3',
                    color: '#008A38',
                    border: '1px solid #A7F3D0',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  <span>Add Reason Card</span>
                </button>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                {(formData.reasons || DEFAULT_WEBSITE_CONTENT.whyUs.reasons).map((reason, rIdx) => (
                  <div
                    key={rIdx}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#008A38' }}>Card #{rIdx + 1} — {reason.title}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentReasons = [...(formData.reasons || DEFAULT_WEBSITE_CONTENT.whyUs.reasons)];
                          currentReasons.splice(rIdx, 1);
                          autoSaveSection({ ...formData, reasons: currentReasons });
                          notify('✓ Reason card removed from website!');
                        }}
                        style={{
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete Card</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>Title</label>
                        <input
                          type="text"
                          value={reason.title || ''}
                          onChange={(e) => {
                            const currentReasons = [...(formData.reasons || DEFAULT_WEBSITE_CONTENT.whyUs.reasons)];
                            currentReasons[rIdx] = { ...currentReasons[rIdx], title: e.target.value };
                            autoSaveSection({ ...formData, reasons: currentReasons });
                          }}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>Badge Tag</label>
                        <input
                          type="text"
                          value={reason.badge || ''}
                          onChange={(e) => {
                            const currentReasons = [...(formData.reasons || DEFAULT_WEBSITE_CONTENT.whyUs.reasons)];
                            currentReasons[rIdx] = { ...currentReasons[rIdx], badge: e.target.value };
                            autoSaveSection({ ...formData, reasons: currentReasons });
                          }}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>Description</label>
                      <textarea
                        rows={2}
                        value={reason.desc || ''}
                        onChange={(e) => {
                          const currentReasons = [...(formData.reasons || DEFAULT_WEBSITE_CONTENT.whyUs.reasons)];
                          currentReasons[rIdx] = { ...currentReasons[rIdx], desc: e.target.value };
                          autoSaveSection({ ...formData, reasons: currentReasons });
                        }}
                        style={textareaStyle}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
        {/* TAB: FITNESS TRACKING                                        */}
        {/* ============================================================ */}
        {currentSubTab === 'tracking' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              Smart Fitness Tracking Section
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.86rem', marginBottom: '22px' }}>
              Update tracking headlines and biometric monitoring highlights. Add or remove feature cards.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Eyebrow</label>
                <input
                  type="text"
                  value={formData.eyebrow || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    autoSaveSection({ ...formData, eyebrow: val });
                  }}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Section Title</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    autoSaveSection({ ...formData, title: val });
                  }}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Features List */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0F172A' }}>Tracking Metric Cards</span>
                <button
                  type="button"
                  onClick={() => {
                    const currentFeatures = [...(formData.features || DEFAULT_WEBSITE_CONTENT.tracking.features)];
                    currentFeatures.push({
                      title: 'New Tracking Metric',
                      badge: 'Biometric Analytics',
                      desc: 'Continuous real-time progress validation and personal milestone celebration.',
                    });
                    autoSaveSection({ ...formData, features: currentFeatures });
                    notify('✓ Added new tracking card!');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#ECFDF3',
                    color: '#008A38',
                    border: '1px solid #A7F3D0',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  <span>Add Metric Card</span>
                </button>
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                {(formData.features || DEFAULT_WEBSITE_CONTENT.tracking.features).map((feat, fIdx) => (
                  <div
                    key={fIdx}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#008A38' }}>Metric #{fIdx + 1} — {feat.title}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentFeatures = [...(formData.features || DEFAULT_WEBSITE_CONTENT.tracking.features)];
                          currentFeatures.splice(fIdx, 1);
                          autoSaveSection({ ...formData, features: currentFeatures });
                          notify('✓ Metric card removed from website!');
                        }}
                        style={{
                          backgroundColor: '#FEF2F2',
                          color: '#DC2626',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Delete Metric</span>
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>Title</label>
                        <input
                          type="text"
                          value={feat.title || ''}
                          onChange={(e) => {
                            const currentFeatures = [...(formData.features || DEFAULT_WEBSITE_CONTENT.tracking.features)];
                            currentFeatures[fIdx] = { ...currentFeatures[fIdx], title: e.target.value };
                            autoSaveSection({ ...formData, features: currentFeatures });
                          }}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>Badge Tag</label>
                        <input
                          type="text"
                          value={feat.badge || ''}
                          onChange={(e) => {
                            const currentFeatures = [...(formData.features || DEFAULT_WEBSITE_CONTENT.tracking.features)];
                            currentFeatures[fIdx] = { ...currentFeatures[fIdx], badge: e.target.value };
                            autoSaveSection({ ...formData, features: currentFeatures });
                          }}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>Description</label>
                      <textarea
                        rows={2}
                        value={feat.desc || ''}
                        onChange={(e) => {
                          const currentFeatures = [...(formData.features || DEFAULT_WEBSITE_CONTENT.tracking.features)];
                          currentFeatures[fIdx] = { ...currentFeatures[fIdx], desc: e.target.value };
                          autoSaveSection({ ...formData, features: currentFeatures });
                        }}
                        style={textareaStyle}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
                  onChange={(e) => {
                    const val = e.target.value;
                    autoSaveSection({ ...formData, vishrambagPhone: val });
                  }}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Vijaynagar Desk Phone</label>
                <input
                  type="text"
                  value={formData.vijaynagarPhone || '+91 9172848777'}
                  onChange={(e) => {
                    const val = e.target.value;
                    autoSaveSection({ ...formData, vijaynagarPhone: val });
                  }}
                  style={inputStyle}
                />
              </div>
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
                <span>Save Contact Settings</span>
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
        {/* TAB: PT FEE STRUCTURE */}
        {currentSubTab === 'pt_fees' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>Personal Training Fee Structure</h3>
                <p style={{ fontSize: '0.82rem', color: '#64748B' }}>Edit Alternate Days & Daily Training prices for each branch. Changes save to Firestore instantly.</p>
              </div>
              {/* Branch toggle */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {[{ id: 'vishrambag', label: 'Vishrambag' }, { id: 'branch2', label: 'Vijaynagar' }].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => { setEditingPTBranch(b.id); setShowAddPTForm(false); setEditingPTIdx(null); }}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: editingPTBranch === b.id ? 'linear-gradient(135deg,#00D256,#008A37)' : '#F1F5F9',
                      color: editingPTBranch === b.id ? '#fff' : '#475569',
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {!ptLoaded ? (
              <p style={{ color: '#64748B' }}>Loading PT rates...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {(ptRates[editingPTBranch]?.categories || []).map((cat, idx) => (
                  <div
                    key={cat.id}
                    style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}
                  >
                    {editingPTIdx === idx ? (
                      /* Edit mode */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>PLAN TITLE</label>
                            <input
                              value={cat.title}
                              onChange={(e) => handlePTCategoryChange(editingPTBranch, idx, 'title', e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>BADGE / LABEL</label>
                            <input
                              value={cat.badge}
                              onChange={(e) => handlePTCategoryChange(editingPTBranch, idx, 'badge', e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>ALTERNATE DAYS PRICE (₹)</label>
                            <input
                              type="number"
                              value={cat.alternatePrice}
                              onChange={(e) => handlePTCategoryChange(editingPTBranch, idx, 'alternatePrice', e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>DAILY TRAINING PRICE (₹)</label>
                            <input
                              type="number"
                              value={cat.dailyPrice}
                              onChange={(e) => handlePTCategoryChange(editingPTBranch, idx, 'dailyPrice', e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => { savePTRatesToFirestore(ptRates); setEditingPTIdx(null); }}
                            disabled={isSavingPT}
                            style={{ padding: '8px 18px', borderRadius: '8px', backgroundColor: '#00B84A', color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer' }}
                          >
                            {isSavingPT ? 'Saving...' : '✓ Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPTIdx(null)}
                            style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View mode */
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>{cat.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>{cat.badge}</div>
                          <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                            Alternate Days: <strong style={{ color: '#008A38' }}>₹{(cat.alternatePrice || 0).toLocaleString('en-IN')}/-</strong>
                            &nbsp;&nbsp;•&nbsp;&nbsp;
                            Daily Training: <strong style={{ color: '#008A38' }}>₹{(cat.dailyPrice || 0).toLocaleString('en-IN')}/-</strong>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setEditingPTIdx(idx)}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF3', color: '#008A38', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePTCategory(editingPTBranch, idx)}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add new PT category */}
                {!showAddPTForm ? (
                  <button
                    type="button"
                    onClick={() => setShowAddPTForm(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '12px', border: '2px dashed #CBD5E1', backgroundColor: '#F8FAFC', color: '#008A38', fontWeight: 800, fontSize: '0.86rem', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                  >
                    <Plus size={16} /> Add New PT Plan
                  </button>
                ) : (
                  <div style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#166534', marginBottom: '12px' }}>➕ New PT Plan</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>PLAN TITLE *</label>
                        <input
                          placeholder="e.g. ELITE PERSONAL TRAINER"
                          value={newPTCategory.title}
                          onChange={(e) => setNewPTCategory((p) => ({ ...p, title: e.target.value }))}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>BADGE / LABEL</label>
                        <input
                          placeholder="e.g. Master Coach"
                          value={newPTCategory.badge}
                          onChange={(e) => setNewPTCategory((p) => ({ ...p, badge: e.target.value }))}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>ALTERNATE DAYS (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 7000"
                          value={newPTCategory.alternatePrice}
                          onChange={(e) => setNewPTCategory((p) => ({ ...p, alternatePrice: e.target.value }))}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>DAILY TRAINING (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 10000"
                          value={newPTCategory.dailyPrice}
                          onChange={(e) => setNewPTCategory((p) => ({ ...p, dailyPrice: e.target.value }))}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleAddPTCategory}
                        disabled={isSavingPT}
                        style={{ padding: '9px 20px', borderRadius: '8px', backgroundColor: '#00B84A', color: '#fff', border: 'none', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}
                      >
                        {isSavingPT ? 'Saving...' : '✓ Add Plan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddPTForm(false); setNewPTCategory({ title: '', badge: '', alternatePrice: '', dailyPrice: '' }); }}
                        style={{ padding: '9px 14px', borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
