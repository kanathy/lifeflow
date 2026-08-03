import React from 'react';
import { Trash2, X, Droplet } from 'lucide-react';

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  targetUser,
  itemDetails,
  loading
}) => {
  if (!isOpen) return null;

  // Resolve display name, info, and badge from itemDetails or targetUser
  const displayTitle = title || (targetUser ? 'Delete User Profile?' : 'Delete Stock Entry?');
  const displayDescription = description || 'Are you sure you want to delete this record? This action is permanent and cannot be undone.';
  
  const name = itemDetails?.name || targetUser?.name || 'Selected Entry';
  const info = itemDetails?.info || targetUser?.email || '';
  const badge = itemDetails?.badge || (targetUser?.role === 'Hospital Staff' ? 'Hospital' : (targetUser?.role || 'Item'));
  const iconSeed = itemDetails?.name || targetUser?.name || 'LifeFlow';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: 'var(--bg-secondary, #FFFFFF)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          padding: '32px 28px 28px',
          position: 'relative',
          overflow: 'hidden',
          animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: 'var(--text-light, #9CA3AF)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          className="modal-close-hover"
        >
          <X size={20} />
        </button>

        {/* Top Glowing Danger Icon */}
        <div style={{
          position: 'relative',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: '#FEF2F2',
            border: '8px solid #FFF5F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(239, 68, 68, 0.22)'
          }}>
            <Trash2 size={28} color="#DC2626" />
          </div>
        </div>

        {/* Modal Title & Message */}
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          fontFamily: 'Outfit, sans-serif',
          color: 'var(--text-primary, #1F2937)',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          {displayTitle}
        </h3>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary, #6B7280)',
          margin: '0 0 20px 0',
          lineHeight: 1.5,
          maxWidth: '330px'
        }}>
          {displayDescription}
        </p>

        {/* Target Item Info Card */}
        {(targetUser || itemDetails) && (
          <div style={{
            width: '100%',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            boxSizing: 'border-box'
          }}>
            {itemDetails?.isBlood ? (
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Droplet size={22} color="#DC2626" fill="#DC2626" />
              </div>
            ) : (
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${iconSeed}`}
                alt="Avatar"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)'
                }}
              />
            )}
            <div style={{ textAlign: 'left', flex: 1, overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#991B1B',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {name}
              </div>
              {info && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#7F1D1D',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {info}
                </div>
              )}
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: '#FFFFFF',
              color: '#991B1B',
              border: '1px solid #FCA5A5',
              whiteSpace: 'nowrap'
            }}>
              {badge}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%'
        }}>
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              border: '1.5px solid var(--border-color, #E2E8F0)',
              backgroundColor: 'var(--bg-secondary, #FFFFFF)',
              color: 'var(--text-primary, #374151)',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif'
            }}
            className="delete-modal-cancel"
          >
            Cancel
          </button>

          {/* Confirm Delete Button */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1.2,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif'
            }}
            className="delete-modal-confirm"
          >
            <Trash2 size={16} />
            <span>{loading ? 'Deleting...' : 'Yes, Delete'}</span>
          </button>
        </div>

        {/* Animations & Hover styles */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleUp {
            from { opacity: 0; transform: scale(0.92) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .modal-close-hover:hover {
            background-color: var(--bg-primary, #F1F5F9) !important;
            color: var(--text-primary, #1F2937) !important;
          }
          .delete-modal-cancel:hover {
            background-color: var(--bg-primary, #F8FAFC) !important;
            border-color: #CBD5E1 !important;
          }
          .delete-modal-confirm:hover {
            box-shadow: 0 6px 20px rgba(220, 38, 38, 0.55) !important;
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
