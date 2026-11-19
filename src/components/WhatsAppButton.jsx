import React from 'react';

export default function WhatsAppButton() {
  const openWhatsApp = () => {
    const text = encodeURIComponent(
      'Hello Respire Fitness (Mahabal Group Venture), I would like to inquire about membership and facilities.'
    );
    window.open(`https://wa.me/917798001777?text=${text}`, '_blank');
  };

  return (
    <button
      onClick={openWhatsApp}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 999,
        width: '58px',
        height: '58px',
        borderRadius: '50%',
        backgroundColor: '#25D366',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.48)',
        border: '2.5px solid #FFFFFF',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 211, 102, 0.65)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.48)';
      }}
      aria-label="WhatsApp Respire Fitness"
      title="WhatsApp Respire Fitness"
    >
      {/* Official WhatsApp SVG Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width="31"
        height="31"
        fill="#FFFFFF"
        aria-hidden="true"
      >
        <path d="M16.002 2.667c-7.363 0-13.334 5.971-13.334 13.333 0 2.352.615 4.648 1.783 6.671L2.667 29.333l6.842-1.795a13.276 13.276 0 0 0 6.493 1.695c7.363 0 13.333-5.971 13.333-13.333 0-7.362-5.97-13.333-13.333-13.333zm0 24.336a11.02 11.02 0 0 1-5.619-1.539l-.403-.239-4.06 1.065 1.084-3.959-.263-.418a10.958 10.958 0 0 1-1.691-5.813c0-6.073 4.941-11.015 11.015-11.015 2.942 0 5.708 1.147 7.787 3.228a10.946 10.946 0 0 1 3.227 7.788c0 6.074-4.942 11.016-11.077 11.016zm6.042-8.251c-.331-.166-1.959-.967-2.262-1.077-.304-.111-.524-.166-.745.166-.221.331-.855 1.077-1.049 1.298-.193.221-.386.248-.717.083-.331-.166-1.398-.515-2.663-1.644-.984-.878-1.649-1.963-1.842-2.294-.193-.331-.021-.51.145-.675.149-.148.331-.386.497-.579.166-.193.221-.331.331-.552.111-.221.055-.414-.028-.579-.083-.166-.745-1.795-1.021-2.457-.269-.645-.542-.558-.745-.568-.193-.01-.414-.012-.635-.012s-.579.083-.883.414c-.304.331-1.159 1.132-1.159 2.761s1.187 3.203 1.352 3.424c.166.221 2.336 3.567 5.659 5.002.791.341 1.408.545 1.889.698.794.252 1.517.216 2.088.131.637-.095 1.959-.801 2.235-1.574.276-.773.276-1.436.193-1.574-.083-.138-.304-.221-.635-.386z" />
      </svg>
    </button>
  );
}
