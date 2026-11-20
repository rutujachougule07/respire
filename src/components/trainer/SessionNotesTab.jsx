import React, { useState, useMemo } from 'react';
import { normalizeDuration } from './SessionScheduleTab';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  User,
  Star,
  Trash2,
  Edit3,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  Activity,
  Layers,
} from 'lucide-react';
import {
  saveTrainerNoteToFirestore,
  deleteTrainerNoteFromFirestore,
} from '../../services/firestoreService';

export default function SessionNotesTab({
  trainerProfile,
  myMembers = [],
  mySessions = [],
  myNotes = [],
  showToast,
}) {
  const [memberFilter, setMemberFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [form, setForm] = useState({
    memberId: '',
    sessionId: '',
    date: new Date().toISOString().split('T')[0],
    workoutFocus: 'Full Body Conditioning',
    intensity: 'High',
    duration: '1 Hour',
    exercises: [
      { name: 'Barbell Squats', sets: '4', reps: '10', weight: '60 kg' },
      { name: 'Dumbbell Bench Press', sets: '3', reps: '12', weight: '20 kg' },
    ],
    exerciseNotesText: '',
    observations: '',
    dietHydrationNotes: '',
    rating: 5,
  });

  // Open modal for new note
  const openNewNoteModal = (prefill = {}) => {
    setEditingNote(null);
    setFormError('');
    setForm({
      memberId: prefill.memberId || myMembers[0]?.id || '',
      sessionId: prefill.sessionId || '',
      date: prefill.date || new Date().toISOString().split('T')[0],
      workoutFocus: 'Full Body Conditioning',
      intensity: 'High',
      duration: prefill.duration ? normalizeDuration(prefill.duration) : '1 Hour',
      exercises: [
        { name: 'Barbell Bench Press', sets: '4', reps: '10', weight: '50 kg' },
      ],
      exerciseNotesText: '',
      observations: '',
      dietHydrationNotes: '',
      rating: 5,
    });
    setShowModal(true);
  };

  // Open modal to edit existing note
  const openEditNoteModal = (note) => {
    setEditingNote(note);
    setFormError('');
    setForm({
      memberId: note.memberId || '',
      sessionId: note.sessionId || '',
      date: note.date || new Date().toISOString().split('T')[0],
      workoutFocus: note.workoutFocus || 'Full Body Conditioning',
      intensity: note.intensity || 'High',
      duration: normalizeDuration(note.duration),
      exercises: Array.isArray(note.exercises) && note.exercises.length > 0
        ? note.exercises
        : [{ name: '', sets: '', reps: '', weight: '' }],
      exerciseNotesText: note.exerciseNotesText || note.workoutRoutine || '',
      observations: note.observations || '',
      dietHydrationNotes: note.dietHydrationNotes || '',
      rating: note.rating || 5,
    });
    setShowModal(true);
  };

  // Add exercise row in builder
  const handleAddExerciseRow = () => {
    setForm((prev) => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: '3', reps: '10', weight: '' }],
    }));
  };

  // Remove exercise row
  const handleRemoveExerciseRow = (idx) => {
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== idx),
    }));
  };

  // Update exercise row field
  const handleExerciseChange = (idx, field, value) => {
    setForm((prev) => {
      const updated = [...prev.exercises];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, exercises: updated };
    });
  };

  // Save Note to Firestore
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!form.memberId) {
      setFormError('Please select a member.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const selectedMember = myMembers.find((m) => m.id === form.memberId);
      const cleanExercises = form.exercises.filter((ex) => ex.name.trim());

      const notePayload = {
        id: editingNote ? editingNote.id : undefined,
        trainerId: trainerProfile?.id || 'trainer',
        trainerName: trainerProfile?.name || 'Coach',
        memberId: form.memberId,
        memberName: selectedMember?.name || 'Client',
        sessionId: form.sessionId || '',
        date: form.date,
        workoutFocus: form.workoutFocus,
        intensity: form.intensity,
        duration: form.duration,
        exercises: cleanExercises,
        workoutRoutine: form.exerciseNotesText,
        observations: form.observations,
        dietHydrationNotes: form.dietHydrationNotes,
        rating: Number(form.rating) || 5,
      };

      await saveTrainerNoteToFirestore(notePayload);
      showToast(
        editingNote
          ? `✓ Session notes updated for ${notePayload.memberName}`
          : `✓ Workout session notes recorded for ${notePayload.memberName}`
      );
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Error saving session note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Note
  const handleDeleteNote = async (note) => {
    if (window.confirm(`Delete workout notes for ${note.memberName} on ${note.date}?`)) {
      try {
        await deleteTrainerNoteFromFirestore(note.id);
        showToast('✓ Session note deleted.');
      } catch (err) {
        console.error(err);
        showToast('Error deleting session note.');
      }
    }
  };

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return myNotes.filter((n) => {
      const matchMember = memberFilter === 'All' || n.memberId === memberFilter;
      const matchQuery =
        !searchQuery ||
        (n.memberName && n.memberName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.workoutFocus && n.workoutFocus.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.observations && n.observations.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.workoutRoutine && n.workoutRoutine.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchMember && matchQuery;
    });
  }, [myNotes, memberFilter, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Filter and Action Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '16px 20px',
          border: '1.5px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
        }}
      >
        {/* Member Selector Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
            Filter Client:
          </span>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="All">All Assigned Members ({myMembers.length})</option>
            {myMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '340px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises or observations..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.82rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Log New Note Button */}
        <button
          type="button"
          onClick={() => openNewNoteModal()}
          style={{
            backgroundColor: '#00B84A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '9px 18px',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0, 184, 74, 0.3)',
          }}
        >
          <Plus size={16} />
          <span>Add Session Note</span>
        </button>
      </div>

      {/* Subtext info */}
      <div style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 700 }}>
        Showing {filteredNotes.length} of {myNotes.length} session note(s) logged
      </div>

      {/* Notes List / Grid */}
      {filteredNotes.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1.5px dashed #CBD5E1',
            padding: '56px 24px',
            textAlign: 'center',
            color: '#64748B',
          }}
        >
          <FileText size={44} color="#CBD5E1" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
            No Session Notes Recorded
          </h4>
          <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 16px', maxWidth: '440px', marginInline: 'auto' }}>
            Document workouts, sets, repetitions, and performance notes for each client to track their long-term training adaptations.
          </p>
          <button
            type="button"
            onClick={() => openNewNoteModal()}
            style={{
              backgroundColor: '#00B84A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            + Create First Session Note
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
              }}
            >
              {/* Header: Member + Date + Rating */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0F172A' }}>
                    {note.memberName}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#008A38', fontWeight: 800, marginTop: '2px' }}>
                    {note.date} • {note.workoutFocus || 'Workout Session'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#FFFBEB', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                  <Star size={13} fill="#D97706" color="#D97706" />
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#B45309' }}>{note.rating || 5}/5</span>
                </div>
              </div>

              {/* Workout Details Pill */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {note.intensity && (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: '0.7rem', fontWeight: 800 }}>
                    Intensity: {note.intensity}
                  </span>
                )}
                {note.duration && (
                  <span style={{ padding: '3px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#475569', fontSize: '0.7rem', fontWeight: 800 }}>
                    Duration: {normalizeDuration(note.duration)}
                  </span>
                )}
              </div>

              {/* Exercises Performed List */}
              {Array.isArray(note.exercises) && note.exercises.length > 0 && (
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Dumbbell size={13} color="#008A38" />
                    <span>Exercises Performed</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {note.exercises.map((ex, exIdx) => (
                      <div key={exIdx} style={{ fontSize: '0.76rem', color: '#0F172A', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700 }}>• {ex.name}</span>
                        <span style={{ color: '#008A38', fontWeight: 800 }}>
                          {ex.sets && `${ex.sets} sets`} {ex.reps && `x ${ex.reps}`} {ex.weight && `@ ${ex.weight}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Free-form Workout Routine Details */}
              {note.workoutRoutine && (
                <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5, backgroundColor: '#F8FAFC', padding: '10px 12px', borderRadius: '8px' }}>
                  <strong>Routine Notes:</strong> {note.workoutRoutine}
                </div>
              )}

              {/* Performance Observations */}
              {note.observations && (
                <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5 }}>
                  <strong style={{ color: '#0F172A' }}>Observations:</strong> {note.observations}
                </div>
              )}

              {/* Diet / Hydration Feedback */}
              {note.dietHydrationNotes && (
                <div style={{ fontSize: '0.76rem', color: '#008A38', backgroundColor: '#ECFDF3', padding: '8px 10px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                  <strong>Diet & Hydration:</strong> {note.dietHydrationNotes}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  onClick={() => openEditNoteModal(note)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteNote(note)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: '1px solid #FCA5A5',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2500,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '580px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  {editingNote ? 'Edit Workout Session Note' : 'Add Session Note'}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0' }}>
                  Log exercises performed, intensity, and member observations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitNote} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', fontSize: '0.8rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Select Member and Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Select Member *
                  </label>
                  <select
                    required
                    value={form.memberId}
                    onChange={(e) => setForm({ ...form, memberId: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none' }}
                  >
                    <option value="">-- Choose Assigned Client --</option>
                    {myMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.phone || 'No phone'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Workout Focus & Intensity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Workout Focus / Target Area
                  </label>
                  <input
                    type="text"
                    value={form.workoutFocus}
                    onChange={(e) => setForm({ ...form, workoutFocus: e.target.value })}
                    placeholder="e.g. Chest & Triceps, Leg Hypertrophy"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Session Intensity
                  </label>
                  <select
                    value={form.intensity}
                    onChange={(e) => setForm({ ...form, intensity: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none' }}
                  >
                    <option value="Low">Low (Recovery / Mobility)</option>
                    <option value="Moderate">Moderate (Volume)</option>
                    <option value="High">High (Hypertrophy / Strength)</option>
                    <option value="Peak / Maximum">Peak / Maximum (Max PR)</option>
                  </select>
                </div>
              </div>

              {/* Exercises Performed Builder */}
              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.76rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>
                    Exercises Performed (Sets, Reps, Load)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#ECFDF3',
                      color: '#008A38',
                      border: '1px solid #A7F3D0',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={13} /> Add Exercise
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {form.exercises.map((ex, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr auto', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Exercise Name"
                        value={ex.name}
                        onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        placeholder="Sets"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                        style={{ padding: '8px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', textAlign: 'center' }}
                      />
                      <input
                        type="text"
                        placeholder="Reps"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                        style={{ padding: '8px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem', textAlign: 'center' }}
                      />
                      <input
                        type="text"
                        placeholder="Weight (kg)"
                        value={ex.weight}
                        onChange={(e) => handleExerciseChange(idx, 'weight', e.target.value)}
                        style={{ padding: '8px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                      />
                      {form.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseRow(idx)}
                          style={{ border: 'none', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Performance Observations */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Member Performance Observations *
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.observations}
                  onChange={(e) => setForm({ ...form, observations: e.target.value })}
                  placeholder="Notes on client form, posture execution, stamina, breath control, recovery..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* Diet & Hydration Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Diet & Hydration Recommendations
                </label>
                <input
                  type="text"
                  value={form.dietHydrationNotes}
                  onChange={(e) => setForm({ ...form, dietHydrationNotes: e.target.value })}
                  placeholder="e.g. Advised 40g post-workout whey + banana, minimum 3.5L water daily"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Session Performance Rating */}
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Member Performance Rating: {form.rating} / 5 Stars
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: form.rating >= star ? '#F59E0B' : '#CBD5E1',
                        backgroundColor: form.rating >= star ? '#FFFBEB' : '#FFFFFF',
                        color: form.rating >= star ? '#B45309' : '#64748B',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Star size={14} fill={form.rating >= star ? '#F59E0B' : 'none'} color={form.rating >= star ? '#F59E0B' : '#94A3B8'} />
                      <span>{star}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: '#00B84A', color: '#FFFFFF', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0, 184, 74, 0.3)' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
