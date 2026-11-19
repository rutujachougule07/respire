import React, { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { updateInquiryStatusInFirestore } from '../../services/firestoreService';

export default function InquiriesTab({ inquiries = [], setInquiries, activeBranchId = 'all', showToast }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = inquiries
    .filter((inq) => {
      if (activeBranchId !== 'all') {
        const branchMatch =
          activeBranchId === 'vishrambag'
            ? inq.branch?.toLowerCase().includes('vishrambag')
            : inq.branch?.toLowerCase().includes('vijaynagar');
        if (!branchMatch) return false;
      }
      if (filterStatus !== 'All' && inq.status !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          inq.name?.toLowerCase().includes(q) ||
          inq.phone?.toLowerCase().includes(q) ||
          inq.service?.toLowerCase().includes(q)
        );
      }
      return true;
    });

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      await updateInquiryStatusInFirestore(inquiryId, newStatus);
      if (setInquiries) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === inquiryId ? { ...item, status: newStatus } : item))
        );
      }
      showToast(`Updated inquiry status to "${newStatus}"`);
    } catch (err) {
      console.warn('Status update notice:', err.message);
    }
  };

  const openWhatsApp = (inquiry) => {
    const cleanPhone = (inquiry.phone || '').replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello ${inquiry.name},\nThank you for reaching out to Respire Fitness (A Mahabal Group Venture) regarding ${inquiry.service || 'Gym Membership'} at our ${inquiry.branch || 'Sangli branch'}. When would be a good time for your orientation?`
    );
    window.open(`https://wa.me/91${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
            Website Inquiries & Leads
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Real-time prospective member inquiries submitted through the website contact form via Firestore.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'New', 'Contacted', 'Converted'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: filterStatus === status ? '#008A38' : '#CBD5E1',
                backgroundColor: filterStatus === status ? '#ECFDF3' : '#FFFFFF',
                color: filterStatus === status ? '#008A38' : '#475569',
                cursor: 'pointer',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            padding: '0 14px',
            maxWidth: '420px',
          }}
        >
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries by name, phone, service..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              padding: '10px',
              fontSize: '0.88rem',
            }}
          />
        </div>
      </div>

      {/* Inquiries Cards or Empty State */}
      {filtered.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '48px 20px',
            textAlign: 'center',
            border: '1px solid #E2E8F0',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 184, 74, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#008A38',
              marginBottom: '14px',
            }}
          >
            <MessageSquare size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
            No Inquiries Found
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto' }}>
            New leads submitted from the website Contact page or Hero CTA will stream here in real-time from Cloud Firestore.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
          {filtered.map((inq) => {
            const isNew = inq.status === 'New';
            return (
              <div
                key={inq.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: isNew ? '1.5px solid #00C952' : '1px solid #E2E8F0',
                  boxShadow: isNew
                    ? '0 10px 24px rgba(0, 201, 82, 0.12)'
                    : '0 4px 14px rgba(15, 23, 42, 0.04)',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '999px',
                        backgroundColor:
                          inq.status === 'Converted'
                            ? '#ECFDF5'
                            : inq.status === 'Contacted'
                            ? '#EFF6FF'
                            : '#FEF3C7',
                        color:
                          inq.status === 'Converted'
                            ? '#059669'
                            : inq.status === 'Contacted'
                            ? '#2563EB'
                            : '#D97706',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {inq.status || 'New'}
                    </span>

                    <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 600 }}>
                      {inq.submittedAt
                        ? new Date(inq.submittedAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recent'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                    {inq.name || 'Prospective Member'}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                      <Phone size={14} color="#008A38" />
                      <a href={`tel:${inq.phone}`} style={{ color: '#008A38', textDecoration: 'none' }}>
                        {inq.phone}
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748B' }}>
                      <MapPin size={14} color="#94A3B8" />
                      <span>{inq.branch || 'Respire Sangli'}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 700 }}>
                      Interested in: <span style={{ color: '#008A38' }}>{inq.service}</span> • Program: {inq.program}
                    </div>
                  </div>

                  {inq.notes && (
                    <div
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: '#475569',
                        fontStyle: 'italic',
                        marginBottom: '16px',
                        borderLeft: '3px solid #00C952',
                      }}
                    >
                      "{inq.notes}"
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
                  <button
                    onClick={() => openWhatsApp(inq)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#25D366',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>WhatsApp</span>
                  </button>

                  <select
                    value={inq.status || 'New'}
                    onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="New">Mark New</option>
                    <option value="Contacted">Mark Contacted</option>
                    <option value="Converted">Mark Converted</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
