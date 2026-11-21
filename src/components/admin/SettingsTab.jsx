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
  Video,
  Play,
  Pause,
  Film,
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
  const [isReplacing, setIsReplacing] = useState(false);
  const fileInputRef = useRef(null);

  // Sync isReplacing when image value changes
  useEffect(() => {
    if (!value) {
      setIsReplacing(false);
    }
  }, [value]);

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
        const compressed = canvas.toDataURL('image/jpeg', 0.70);
        setIsProcessing(false);
        setIsReplacing(false);
        onChange(compressed);
      };
      img.onerror = () => {
        setIsProcessing(false);
        setIsReplacing(false);
        onChange(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setIsProcessing(false);
      setIsReplacing(false);
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

  const hasImage = Boolean(value && typeof value === 'string' && value.trim().length > 0);
  const showDropzone = !hasImage || isReplacing;
  const isCustom = hasImage && defaultImage && value !== defaultImage;

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
      {/* Header with Label and Aspect ratio pill */}
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
        <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '0 0 12px' }}>{helperText}</p>
      )}

      {/* Hidden file input used for both empty zone and edit action */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
        style={{ display: 'none' }}
      />

      {/* STATE 1: Empty or In Replace Mode -> Show ONLY the Dashed Drag & Drop Box (Matching Image 2) */}
      {showDropzone ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{
            border: isDragging ? '2px dashed #00B84A' : '2px dashed #CBD5E1',
            borderRadius: '12px',
            padding: '28px 16px',
            backgroundColor: isDragging ? 'rgba(0, 184, 74, 0.08)' : '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            transform: isDragging ? 'scale(1.01)' : 'scale(1)',
            boxShadow: isDragging ? '0 8px 24px rgba(0, 184, 74, 0.18)' : 'none',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: isDragging ? '#00B84A' : '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
              color: isDragging ? '#FFFFFF' : '#008A38',
              transition: 'all 0.18s ease',
            }}
          >
            <UploadCloud size={22} />
          </div>

          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', marginBottom: '4px', textAlign: 'center' }}>
            {isProcessing ? 'Optimizing Image...' : isDragging ? 'Drop Image to Upload!' : 'Drag & Drop Your Image Here'}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748B', textAlign: 'center' }}>
            or <span style={{ color: '#008A38', fontWeight: 800, textDecoration: 'underline' }}>Browse from Device</span> • PNG, JPG, WebP
          </div>

          {isReplacing && hasImage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsReplacing(false);
              }}
              style={{
                marginTop: '12px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#64748B',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <X size={13} />
              <span>Cancel (Keep Current Image)</span>
            </button>
          )}
        </div>
      ) : (
        /* STATE 2: Image Present -> Show Image Preview with floating Edit (✏️) & Delete (🗑️) icon buttons */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: isDragging ? '2px dashed #00B84A' : '1.5px solid #E2E8F0',
            backgroundColor: '#0F172A',
            height: '210px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            transition: 'border 0.2s ease',
          }}
        >
          <img
            src={value}
            alt="Uploaded Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />

          {/* Floating Action Buttons on Image: Edit (✏️) and Delete (🗑️) */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 5,
            }}
          >
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => {
                setIsReplacing(true);
                setTimeout(() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }, 50);
              }}
              title="Edit / Replace Image"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.22)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ECFDF3';
                e.currentTarget.style.color = '#008A38';
                e.currentTarget.style.borderColor = '#00B84A';
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.color = '#0F172A';
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Edit3 size={16} />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsReplacing(false);
              }}
              title="Delete Image"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.22)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DC2626';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = '#DC2626';
                e.currentTarget.style.transform = 'scale(1.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FEF2F2';
                e.currentTarget.style.color = '#DC2626';
                e.currentTarget.style.borderColor = '#FCA5A5';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Live Active Badge bottom-right */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.78)',
              color: '#FFFFFF',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.68rem',
              fontWeight: 700,
              backdropFilter: 'blur(4px)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Check size={11} color="#00B84A" /> Live Active
          </div>

          {/* Drag over overlay when dragging file onto existing image */}
          {isDragging && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 184, 74, 0.92)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                zIndex: 10,
              }}
            >
              <UploadCloud size={38} style={{ marginBottom: '6px' }} />
              <span style={{ fontSize: '0.94rem', fontWeight: 800 }}>Drop New Image to Replace!</span>
            </div>
          )}
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

  // Custom programs state & handlers
  const [showAddProgramForm, setShowAddProgramForm] = useState(false);
  const [newProgramData, setNewProgramData] = useState({
    title: '',
    subtitle: '',
    description: '',
    schedule: '4-5 Days / Week (60 Mins)',
    focus: 'Functional Conditioning, Core Stability, Strength',
    image: '',
  });

  const handleAddCustomProgram = () => {
    if (!newProgramData.title.trim()) {
      notify('Please enter a program name (e.g. CrossFit, Fat Loss)');
      return;
    }
    const currentList = Array.isArray(formData.customPrograms) ? [...formData.customPrograms] : [];
    const newProg = {
      id: `prog-${Date.now()}`,
      title: newProgramData.title.trim(),
      category: newProgramData.title.trim(),
      subtitle: newProgramData.subtitle.trim() || `${newProgramData.title.trim()} Conditioning`,
      description: newProgramData.description.trim() || 'Structured workout curriculum tailored for specific fitness outcomes under professional guidance.',
      schedule: newProgramData.schedule.trim() || '4-5 Days / Week (60 Mins)',
      focus: newProgramData.focus.trim() || 'Functional Conditioning, Core Stability, Strength',
      image: newProgramData.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop',
    };
    const updated = {
      ...formData,
      customPrograms: [...currentList, newProg],
    };
    setFormData(updated);
    updateSection('programs', updated);
    setShowAddProgramForm(false);
    setNewProgramData({
      title: '',
      subtitle: '',
      description: '',
      schedule: '4-5 Days / Week (60 Mins)',
      focus: 'Functional Conditioning, Core Stability, Strength',
      image: '',
    });
    notify(`✓ Added "${newProg.title}" program!`);
  };

  const handleDeleteCustomProgram = (idx) => {
    const currentList = Array.isArray(formData.customPrograms) ? [...formData.customPrograms] : [];
    const progTitle = currentList[idx]?.title || 'Program';
    if (!window.confirm(`Are you sure you want to delete "${progTitle}" program?`)) return;
    currentList.splice(idx, 1);
    const updated = {
      ...formData,
      customPrograms: currentList,
    };
    setFormData(updated);
    updateSection('programs', updated);
    notify(`✓ Removed "${progTitle}" program.`);
  };

  const handleUpdateCustomProgram = (idx, field, value) => {
    const currentList = Array.isArray(formData.customPrograms) ? [...formData.customPrograms] : [];
    if (currentList[idx]) {
      currentList[idx] = { ...currentList[idx], [field]: value };
      const updated = {
        ...formData,
        customPrograms: currentList,
      };
      setFormData(updated);
      autoSaveSection(updated);
    }
  };

  const getSectionKey = (subTab) => {
    switch (subTab) {
      case 'splash_video':
        return 'splashVideo';
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
      case 'contact':
        return 'contact';
      default:
        return 'hero';
    }
  };

  const isSectionVisible = (sectionKey) => {
    if (sectionKey === 'splashVideo') {
      if (content?.sectionVisibility?.splash === false) return false;
      if (content?.splashVideo?.enabled === false) return false;
      return true;
    }
    if (content?.sectionVisibility?.[sectionKey] === false) return false;
    if (content?.[sectionKey]?.visible === false) return false;
    return true;
  };

  const handleToggleCurrentSection = async () => {
    const sectionKey = getSectionKey(currentSubTab);
    const currentVis = isSectionVisible(sectionKey);
    const newVis = !currentVis;
    if (sectionKey === 'splashVideo') {
      await toggleSectionVisibility('splash', newVis);
      const updated = { ...(content?.splashVideo || {}), enabled: newVis };
      await updateSection('splashVideo', updated);
      setFormData(updated);
      notify(newVis ? '✓ Intro Video is now ACTIVE on website opening!' : '✓ Intro Video is now DISABLED (Direct Home Page)!');
      return;
    }
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

  // Custom Sections Management
  const customSections = content?.customSections || [];

  const handleUpdateCustomSection = async (sectionId, updatedFields) => {
    const updatedCustom = customSections.map((cs) =>
      cs.id === sectionId ? { ...cs, ...updatedFields } : cs
    );
    await updateSection('customSections', updatedCustom);
    notify('✓ Section updated!');
  };

  const handleDeleteCustomSection = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this custom section from the website?')) return;
    const updatedCustom = customSections.filter((cs) => cs.id !== sectionId);
    await updateSection('customSections', updatedCustom);
    notify('✓ Custom section removed.');
    setCurrentSubTab('home');
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

  const baseTabs = [
    { id: 'splash_video', label: 'Opening Video', icon: Video, desc: 'Intro 3D video on open' },
    { id: 'home', label: 'Home / Hero', icon: Home, desc: 'Visual banner & cue' },
    { id: 'about', label: 'About Us', icon: Info, desc: 'Heritage story & photo' },
    { id: 'services', label: 'Services', icon: Sparkles, desc: 'PT, Massage, Steam & images' },
    { id: 'programs', label: 'Programs', icon: Activity, desc: 'Beginner, Inter, Advanced' },
    { id: 'why_us', label: 'Why Choose Us', icon: Layers, desc: '5 Core Value Props' },
    { id: 'contact', label: 'Contact & Branches', icon: MapPin, desc: 'Phone, hours & policy' },
    { id: 'pt_fees', label: 'PT Fee Structure', icon: Dumbbell, desc: 'Edit branch PT rates' },
  ];

  const tabs = [
    ...baseTabs,
    ...customSections.map((cs) => ({
      id: `custom_${cs.id}`,
      label: cs.tabLabel || cs.title || 'Custom Section',
      icon: Sparkles,
      desc: cs.description || 'Custom Section',
      isCustom: true,
      customData: cs,
    })),
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
      </div>

      {/* Sub-tab Navigation Strip */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
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
        {/* TAB: OPENING VIDEO / SPLASH SCREEN                          */}
        {/* ============================================================ */}
        {currentSubTab === 'splash_video' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      backgroundColor: 'rgba(0, 184, 74, 0.1)',
                      color: '#008A38',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <Video size={13} />
                    Opening Experience
                  </span>
                  <span
                    style={{
                      fontSize: '0.74rem',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontWeight: 700,
                    }}
                  >
                    3D Brand Splash
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Opening Intro Video (Splash Screen)
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.86rem', margin: 0, maxWidth: '680px' }}>
                  वेबसाइट उघडल्यावर प्ले होणारा ३D Logo व ब्रँडिंग व्हिडिओ येथून थेट एडिट, अपलोड किंवा बदलू शकता.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={formData.videoUrl || '/video.mp4'}
                  download="Respire_Intro_Video.mp4"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Film size={14} />
                  <span>Download Video</span>
                </a>
              </div>
            </div>

            {/* Video Active / Disabled Switch Card */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                backgroundColor: (formData.enabled !== false && content?.sectionVisibility?.splash !== false) ? '#ECFDF3' : '#F8FAFC',
                border: (formData.enabled !== false && content?.sectionVisibility?.splash !== false) ? '1.5px solid #A7F3D0' : '1.5px solid #E2E8F0',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: (formData.enabled !== false && content?.sectionVisibility?.splash !== false) ? '#00B84A' : '#94A3B8',
                    }}
                  />
                  <strong style={{ fontSize: '0.94rem', color: '#0F172A' }}>
                    {(formData.enabled !== false && content?.sectionVisibility?.splash !== false)
                      ? 'Intro Video Status: ACTIVE (व्हिडिओ चालू आहे)'
                      : 'Intro Video Status: DISABLED (व्हिडिओ बंद आहे)'}
                  </strong>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0 18px' }}>
                  {(formData.enabled !== false && content?.sectionVisibility?.splash !== false)
                    ? 'Visitors will see the 3D video introduction when opening the website.'
                    : 'Visitors will land directly on the Home page without any intro video.'}
                </p>
              </div>

              <button
                type="button"
                onClick={async () => {
                  const currentStatus = (formData.enabled !== false && content?.sectionVisibility?.splash !== false);
                  const newStatus = !currentStatus;
                  const updated = { ...formData, enabled: newStatus };
                  await autoSaveSection(updated);
                  await toggleSectionVisibility('splash', newStatus);
                  notify(newStatus ? '✓ Intro video activated on website!' : '✓ Intro video disabled!');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  backgroundColor: (formData.enabled !== false && content?.sectionVisibility?.splash !== false) ? '#008A38' : '#F1F5F9',
                  color: (formData.enabled !== false && content?.sectionVisibility?.splash !== false) ? '#FFFFFF' : '#475569',
                  border: (formData.enabled !== false && content?.sectionVisibility?.splash !== false) ? 'none' : '1.5px solid #CBD5E1',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {(formData.enabled !== false && content?.sectionVisibility?.splash !== false) ? (
                  <>
                    <Eye size={15} />
                    <span>Active (Click to Turn Off)</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={15} />
                    <span>Disabled (Click to Turn On)</span>
                  </>
                )}
              </button>
            </div>

            {/* 2-Column Grid: Form Inputs (Left) and Live Video Preview (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
              {/* Left Column: Video Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Upload Video From PC */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    border: '1.5px dashed #00B84A',
                    backgroundColor: '#F0FDF4',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <UploadCloud size={20} color="#008A38" />
                    <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>
                      Upload New Video File
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 12px 0' }}>
                    Choose an MP4 or WebM video file from your computer (Recommended: 1080p or 720p, under 15MB).
                  </p>

                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    id="splash_video_file_picker"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result;
                        if (result) {
                          const updated = {
                            ...formData,
                            videoUrl: result,
                            uploadedFileName: file.name,
                          };
                          autoSaveSection(updated);
                          notify(`✓ Uploaded "${file.name}" as new intro video!`);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById('splash_video_file_picker')?.click()}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 16px',
                        borderRadius: '8px',
                        backgroundColor: '#008A38',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 138, 56, 0.25)',
                      }}
                    >
                      <Plus size={15} />
                      <span>Browse Video File</span>
                    </button>

                    {formData.uploadedFileName && (
                      <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 700, backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: '6px' }}>
                        ✓ {formData.uploadedFileName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Primary Video URL Input */}
                <div>
                  <label style={labelStyle}>
                    Primary MP4 Video URL / Path *
                  </label>
                  <input
                    type="text"
                    value={formData.videoUrl !== undefined ? formData.videoUrl : '/video.mp4'}
                    onChange={(e) => {
                      const val = e.target.value;
                      autoSaveSection({ ...formData, videoUrl: val, uploadedFileName: '' });
                    }}
                    placeholder="/video.mp4 or https://.../video.mp4"
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Default official video is <code>/video.mp4</code>. You can paste an external URL or use the upload button above.
                  </span>
                </div>

                {/* Fallback WebM URL */}
                <div>
                  <label style={labelStyle}>
                    Secondary WebM URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.videoWebmUrl !== undefined ? formData.videoWebmUrl : '/video.webm'}
                    onChange={(e) => {
                      const val = e.target.value;
                      autoSaveSection({ ...formData, videoWebmUrl: val });
                    }}
                    placeholder="/video.webm"
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    WebM format provides faster loading for Google Chrome and Firefox browsers.
                  </span>
                </div>

                {/* Duration Control */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ ...labelStyle, margin: 0 }}>
                      Video Auto-Play Duration Limit
                    </label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#008A38' }}>
                      {formData.durationSeconds !== undefined ? formData.durationSeconds : 10} Seconds
                    </span>
                  </div>

                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={formData.durationSeconds !== undefined ? formData.durationSeconds : 10}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      autoSaveSection({ ...formData, durationSeconds: val });
                    }}
                    style={{ width: '100%', accentColor: '#008A38', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                    <span>Fast (3s)</span>
                    <span>Standard (10s)</span>
                    <span>Cinematic (20s)</span>
                  </div>
                </div>

                {/* Quick Action Reset */}
                <div style={{ paddingTop: '8px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm('Restore official 3D Respire Branding video?')) return;
                      const updated = {
                        enabled: true,
                        videoUrl: '/video.mp4',
                        videoWebmUrl: '/video.webm',
                        durationSeconds: 10,
                        title: '3D RESPIRE Opening Brand Video',
                      };
                      autoSaveSection(updated);
                      notify('✓ Restored official 3D Respire Branding Video!');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <RotateCcw size={13} />
                    <span>Restore Official 3D Video</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Live Video Player Preview */}
              <div
                style={{
                  backgroundColor: '#0F172A',
                  borderRadius: '16px',
                  padding: '20px',
                  color: '#FFFFFF',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={15} color="#00D256" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Live Video Player Preview
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                    HTML5 Player
                  </span>
                </div>

                {/* Video Tag */}
                <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000000', marginBottom: '12px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <video
                    key={formData.videoUrl || '/video.mp4'}
                    controls
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  >
                    {formData.videoWebmUrl && <source src={formData.videoWebmUrl} type="video/webm" />}
                    <source src={formData.videoUrl || '/video.mp4'} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                  <strong style={{ color: '#00D256' }}>✓ Live Preview:</strong> You can test video playback, sound, and visual fidelity using the player above. Any change made on the left updates this preview instantly.
                </div>
              </div>
            </div>

            {/* Bottom Save & Reset Row */}
            <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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
                  padding: '11px 24px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  border: 'none',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 138, 56, 0.3)',
                }}
              >
                <Save size={16} />
                <span>{isSaving ? 'Publishing...' : 'Save & Publish Live'}</span>
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
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={15} />
                <span>Reset to Default</span>
              </button>
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
              value={formData.bgImage !== undefined ? formData.bgImage : DEFAULT_WEBSITE_CONTENT.hero.bgImage}
              defaultImage={DEFAULT_WEBSITE_CONTENT.hero.bgImage}
              onChange={(newImg) => {
                const updated = { ...formData, bgImage: newImg };
                setFormData(updated);
                updateSection('hero', updated);
                notify(newImg ? '✓ Hero image updated live!' : '✓ Hero image removed!');
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
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
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
              value={formData.image !== undefined ? formData.image : DEFAULT_WEBSITE_CONTENT.about.image}
              defaultImage={DEFAULT_WEBSITE_CONTENT.about.image}
              onChange={(newImg) => {
                const updated = { ...formData, image: newImg };
                setFormData(updated);
                updateSection('about', updated);
                notify(newImg ? '✓ About photo updated live!' : '✓ About photo removed!');
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
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
                  Services Section (PT, Massage, Steam Bath, Zumba, Yoga)
                </h3>
                <p style={{ color: '#64748B', fontSize: '0.86rem', margin: 0 }}>
                  Drag and drop images for each service card, edit titles, and descriptions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentItems = [...(formData.items || DEFAULT_WEBSITE_CONTENT.services.items)];
                  currentItems.push({
                    id: `service-${Date.now()}`,
                    title: 'New Service',
                    tag: 'Special Offering',
                    description: 'Customized training protocols designed for your physiology and fitness goals.',
                    features: ['Personal assessment', 'Custom workout plan', 'Certified coaching'],
                    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
                    accent: '#00B84A',
                  });
                  const updated = { ...formData, items: currentItems };
                  autoSaveSection(updated);
                  notify('✓ New service card added to website!');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#008A38',
                  color: '#FFFFFF',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0, 138, 56, 0.25)',
                }}
              >
                <Plus size={15} />
                <span>+ Add New</span>
              </button>
            </div>

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
                      notify(newImg ? `✓ ${service.title} image updated live!` : `✓ ${service.title} image removed!`);
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
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
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
                        notify(newImg ? `✓ ${name} program image updated live!` : `✓ ${name} program image removed!`);
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

              {/* Custom Additional Programs */}
              {(formData.customPrograms || []).map((prog, cIdx) => (
                <div
                  key={prog.id || cIdx}
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    border: '1.5px solid #86EFAC',
                    backgroundColor: '#F0FDF4',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 900, backgroundColor: '#00B84A', color: '#fff', padding: '3px 8px', borderRadius: '6px' }}>CUSTOM PROGRAM</span>
                      <strong style={{ fontSize: '1.02rem', color: '#0F172A' }}>{prog.title}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomProgram(cIdx)}
                      title="Delete this program"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <ImageDropzone
                    label={`${prog.title} Cover Image`}
                    helperText={`Drag and drop visual photo for ${prog.title}.`}
                    aspectLabel="16:9 Landscape"
                    value={prog.image}
                    defaultImage="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop"
                    onChange={(newImg) => {
                      handleUpdateCustomProgram(cIdx, 'image', newImg);
                    }}
                    onReset={() => {
                      handleUpdateCustomProgram(cIdx, 'image', 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop');
                    }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div>
                      <label style={labelStyle}>Program Title</label>
                      <input
                        type="text"
                        value={prog.title || ''}
                        onChange={(e) => handleUpdateCustomProgram(cIdx, 'title', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Subtitle</label>
                      <input
                        type="text"
                        value={prog.subtitle || ''}
                        onChange={(e) => handleUpdateCustomProgram(cIdx, 'subtitle', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={labelStyle}>Description</label>
                    <textarea
                      rows={2}
                      value={prog.description || ''}
                      onChange={(e) => handleUpdateCustomProgram(cIdx, 'description', e.target.value)}
                      style={textareaStyle}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div>
                      <label style={labelStyle}>Schedule (Cadence)</label>
                      <input
                        type="text"
                        placeholder="e.g. 4-5 Days / Week (60 Mins)"
                        value={prog.schedule || ''}
                        onChange={(e) => handleUpdateCustomProgram(cIdx, 'schedule', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Focus Points (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Core, Functional Training, HIIT"
                        value={Array.isArray(prog.focus) ? prog.focus.join(', ') : (prog.focus || '')}
                        onChange={(e) => handleUpdateCustomProgram(cIdx, 'focus', e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Program Button / Inline Form */}
            {!showAddProgramForm ? (
              <button
                type="button"
                onClick={() => setShowAddProgramForm(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '16px 20px',
                  borderRadius: '14px',
                  border: '2px dashed #00B84A',
                  backgroundColor: '#F0FDF4',
                  color: '#008A38',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '18px',
                  transition: 'all 0.2s',
                }}
              >
                <Plus size={18} />
                <span>+ Add New Workout Program (e.g. CrossFit, Fat Loss, Powerlifting)</span>
              </button>
            ) : (
              <div
                style={{
                  marginTop: '18px',
                  padding: '22px',
                  borderRadius: '16px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #00B84A',
                  boxShadow: '0 8px 24px rgba(0, 184, 74, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1.05rem' }}>
                    ➕ Add New Workout Program
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddProgramForm(false)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Program Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. CrossFit / Functional, Fat Loss, Strength & Power"
                      value={newProgramData.title}
                      onChange={(e) => setNewProgramData({ ...newProgramData, title: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. High-Intensity Conditioning & Agility"
                      value={newProgramData.subtitle}
                      onChange={(e) => setNewProgramData({ ...newProgramData, subtitle: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <ImageDropzone
                  label="Program Cover Image"
                  helperText="Drag and drop 16:9 photo for this program."
                  aspectLabel="16:9 Landscape"
                  value={newProgramData.image}
                  defaultImage="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop"
                  onChange={(newImg) => setNewProgramData({ ...newProgramData, image: newImg })}
                  onReset={() => setNewProgramData({ ...newProgramData, image: '' })}
                />

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Comprehensive overview of training method and target audience..."
                    value={newProgramData.description}
                    onChange={(e) => setNewProgramData({ ...newProgramData, description: e.target.value })}
                    style={textareaStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Cadence / Schedule</label>
                    <input
                      type="text"
                      placeholder="e.g. 4-5 Days / Week (60 Mins)"
                      value={newProgramData.schedule}
                      onChange={(e) => setNewProgramData({ ...newProgramData, schedule: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Core Focus Points (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Explosive Power, Core Stability, Endurance"
                      value={newProgramData.focus}
                      onChange={(e) => setNewProgramData({ ...newProgramData, focus: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={handleAddCustomProgram}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '10px',
                      backgroundColor: '#00B84A',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Publish Program</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProgramForm(false)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

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
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
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
                      title: '',
                      badge: '',
                      desc: '',
                    });
                    autoSaveSection({ ...formData, reasons: currentReasons });
                    notify('✓ Added new blank Reason card!');
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
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#008A38' }}>
                        Card #{rIdx + 1} — {reason.title || 'New Blank Reason Card'}
                      </span>
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
                          placeholder="Enter reason title (e.g. Certified Trainers)..."
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
                          placeholder="Enter badge tag (optional)..."
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
                        placeholder="Enter reason description..."
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
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
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

            {/* Inquiry Services Dropdown List Manager */}
            <div
              style={{
                marginTop: '20px',
                padding: '20px',
                borderRadius: '14px',
                backgroundColor: '#F8FCFA',
                border: '1.5px solid #D1FAE5',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0' }}>
                    Contact Form "Service of Interest" Dropdown
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                    Manage the list of services visitors can select when submitting a membership inquiry.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const sName = window.prompt('Enter new service name for Contact inquiry dropdown:');
                    if (!sName || !sName.trim()) return;
                    const trimmed = sName.trim();
                    const currentList = Array.isArray(formData.inquiryServices) && formData.inquiryServices.length > 0
                      ? [...formData.inquiryServices]
                      : [
                          'Personal Training',
                          'Sports Massage',
                          'Steam Bath',
                          'Zumba Dance Cardio',
                          'Yoga & Mobility',
                          'General Gym Membership',
                        ];
                    if (currentList.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
                      notify(`"${trimmed}" is already in the list!`);
                      return;
                    }
                    currentList.push(trimmed);
                    const updated = { ...formData, inquiryServices: currentList };
                    autoSaveSection(updated);
                    notify(`✓ Added "${trimmed}" to Contact Form dropdown!`);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#008A38',
                    color: '#FFFFFF',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={14} />
                  <span>+ Add Service to Dropdown</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {(Array.isArray(formData.inquiryServices) && formData.inquiryServices.length > 0
                  ? formData.inquiryServices
                  : [
                      'Personal Training',
                      'Sports Massage',
                      'Steam Bath',
                      'Zumba Dance Cardio',
                      'Yoga & Mobility',
                      'General Gym Membership',
                    ]
                ).map((srv, sIdx) => (
                  <div
                    key={`${srv}-${sIdx}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #A7F3D0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    }}
                  >
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>{srv}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const currentList = Array.isArray(formData.inquiryServices) && formData.inquiryServices.length > 0
                          ? [...formData.inquiryServices]
                          : [
                              'Personal Training',
                              'Sports Massage',
                              'Steam Bath',
                              'Zumba Dance Cardio',
                              'Yoga & Mobility',
                              'General Gym Membership',
                            ];
                        if (currentList.length <= 1) {
                          notify('You must keep at least 1 service option.');
                          return;
                        }
                        currentList.splice(sIdx, 1);
                        const updated = { ...formData, inquiryServices: currentList };
                        autoSaveSection(updated);
                        notify(`✓ Removed "${srv}" from dropdown!`);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      title="Remove from dropdown"
                    >
                      <Trash2 size={13} />
                    </button>
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
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
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
                <p style={{ fontSize: '0.82rem', color: '#64748B' }}>Edit Alternate Days & Daily Training prices for each branch. Changes save instantly.</p>
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
                            {isSavingPT ? 'Saving...' : 'Save'}
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
                        {isSavingPT ? 'Saving...' : 'Save'}
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

        {/* ============================================================ */}
        {/* CUSTOM SECTION EDITOR                                         */}
        {/* ============================================================ */}
        {currentSubTab.startsWith('custom_') && (() => {
          const sectionId = currentSubTab.replace('custom_', '');
          const currentSec = customSections.find((cs) => cs.id === sectionId);
          if (!currentSec) {
            return (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                Section not found.{' '}
                <button type="button" onClick={() => setCurrentSubTab('home')} style={{ color: '#008A38', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Return to Home
                </button>
              </div>
            );
          }

          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0' }}>
                    {currentSec.title} (Custom Section)
                  </h3>
                  <p style={{ color: '#64748B', fontSize: '0.84rem', margin: 0 }}>
                    Edit section title, cover photo, description and feature cards. All changes sync live.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleUpdateCustomSection(currentSec.id, { visible: currentSec.visible === false ? true : false })}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      backgroundColor: currentSec.visible !== false ? '#ECFDF3' : '#F1F5F9',
                      color: currentSec.visible !== false ? '#008A38' : '#64748B',
                      border: '1px solid',
                      borderColor: currentSec.visible !== false ? '#A7F3D0' : '#CBD5E1',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {currentSec.visible !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span>{currentSec.visible !== false ? 'Live on Site' : 'Hidden from Site'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCustomSection(currentSec.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete Section</span>
                  </button>
                </div>
              </div>

              {/* Form fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Section Title</label>
                  <input
                    type="text"
                    value={currentSec.title || ''}
                    onChange={(e) => handleUpdateCustomSection(currentSec.id, { title: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tab Navigation Label</label>
                  <input
                    type="text"
                    value={currentSec.tabLabel || ''}
                    onChange={(e) => handleUpdateCustomSection(currentSec.id, { tabLabel: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Eyebrow / Small Header</label>
                  <input
                    type="text"
                    value={currentSec.eyebrow || ''}
                    onChange={(e) => handleUpdateCustomSection(currentSec.id, { eyebrow: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Section Overview / Paragraph</label>
                <textarea
                  rows={2}
                  value={currentSec.description || ''}
                  onChange={(e) => handleUpdateCustomSection(currentSec.id, { description: e.target.value })}
                  style={textareaStyle}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <ImageDropzone
                  label="Section Photo / Banner"
                  helperText="Drag and drop photo for this section."
                  aspectLabel="16:9 Landscape"
                  value={currentSec.image}
                  onChange={(newImg) => handleUpdateCustomSection(currentSec.id, { image: newImg })}
                  onReset={() => handleUpdateCustomSection(currentSec.id, { image: '' })}
                />
              </div>

              {/* Feature Cards / Value Props inside custom section */}
              <div style={{ marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>Feature / Highlights Cards</span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = [...(currentSec.items || [])];
                      items.push({ title: 'New Feature', badge: 'Highlight', desc: 'Description of this feature or offering.' });
                      handleUpdateCustomSection(currentSec.id, { items });
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
                    <span>Add Card</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {(currentSec.items || []).map((card, cIdx) => (
                    <div
                      key={cIdx}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#008A38' }}>Card #{cIdx + 1} — {card.title}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const items = [...(currentSec.items || [])];
                            items.splice(cIdx, 1);
                            handleUpdateCustomSection(currentSec.id, { items });
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
                            value={card.title || ''}
                            onChange={(e) => {
                              const items = [...(currentSec.items || [])];
                              items[cIdx] = { ...items[cIdx], title: e.target.value };
                              handleUpdateCustomSection(currentSec.id, { items });
                            }}
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>Badge Tag</label>
                          <input
                            type="text"
                            value={card.badge || ''}
                            onChange={(e) => {
                              const items = [...(currentSec.items || [])];
                              items[cIdx] = { ...items[cIdx], badge: e.target.value };
                              handleUpdateCustomSection(currentSec.id, { items });
                            }}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>Description</label>
                        <textarea
                          rows={2}
                          value={card.desc || ''}
                          onChange={(e) => {
                            const items = [...(currentSec.items || [])];
                            items[cIdx] = { ...items[cIdx], desc: e.target.value };
                            handleUpdateCustomSection(currentSec.id, { items });
                          }}
                          style={textareaStyle}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button for Custom Section */}
              <div style={{ marginTop: '22px' }}>
                <button
                  type="button"
                  onClick={() => notify('✓ Section saved live!')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#008A38',
                    color: '#FFFFFF',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Save size={15} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
