import React from 'react';
import { LogOut, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm, user }) => {
  if (!isOpen) return null;

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
          maxWidth: '420px',
          backgroundColor: 'var(--bg-secondary, #FFFFFF)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(153, 27, 27, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
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

        {/* Top Decorative Icon Circle with pulse glow */}
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
            boxShadow: '0 0 20px rgba(225, 29, 72, 0.18)'
          }}>
            <LogOut size={30} color="#DC2626" style={{ transform: 'translateX(2px)' }} />
          </div>
        </div>

        {/* Modal Title & Subtitle */}
        <h3 style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          fontFamily: 'Outfit, sans-serif',
          color: 'var(--text-primary, #1F2937)',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          Log Out of LifeFlow?
        </h3>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary, #6B7280)',
          margin: '0 0 20px 0',
          lineHeight: 1.5,
          maxWidth: '320px'
        }}>
          Are you sure you want to end your session? You will need to sign in again to access dashboard features.
        </p>

        {/* User Card info badge */}
        {user && (
          <div style={{
            width: '100%',
            backgroundColor: 'var(--bg-primary, #F8FAFC)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '16px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            boxSizing: 'border-box'
          }}>
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'User'}`}
              alt="Avatar"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(153, 27, 27, 0.1)'
              }}
            />
            <div style={{ textAlign: 'left', flex: 1, overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-primary, #1F2937)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.name || 'User'}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary, #6B7280)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.email || ''}
              </div>
            </div>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FCA5A5',
              whiteSpace: 'nowrap'
            }}>
              {user?.role === 'Hospital Staff' ? 'Hospital' : (user?.role || 'Hospital')}
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
            className="modal-btn-cancel"
          >
            Cancel
          </button>

          {/* Confirm Logout Button */}
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1.2,
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif'
            }}
            className="modal-btn-logout"
          >
            <LogOut size={16} />
            <span>Yes, Log Out</span>
          </button>
        </div>

        {/* Embedded animations & hover styles */}
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
          .modal-btn-cancel:hover {
            background-color: var(--bg-primary, #F8FAFC) !important;
            border-color: #CBD5E1 !important;
          }
          .modal-btn-logout:hover {
            box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5) !important;
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    </div>
  );
};

export default LogoutModal;
