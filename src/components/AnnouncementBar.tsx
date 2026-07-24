import React from 'react';

export const AnnouncementBar: React.FC = () => {
  const messages = [
    "✨ ESTABLISHED IN 1998 • SERVING FRESH BAKERY DELIGHTS FOR OVER 25 YEARS",
    "🚚 FREE DELIVERY ON ORDERS ABOVE RS. 1,500 • ORDER NOW AND ENJOY FRESHLY BAKED GOODNESS",
    "✨ THE BEST IN TOWN • FROM NATURE TO YOU •"
  ];

  const separator = " | ";

  // Duplicate the messages array for seamless infinite loop
  const displayMessages = [...messages, ...messages];

  return (
    <div className="sticky top-0 z-50 w-full" style={{ height: '32px', background: 'linear-gradient(135deg, #F8F2E6 0%, #F1E7D4 100%)' }}>
      <div className="h-full flex items-center overflow-hidden relative">
        <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap" style={{ animationDuration: '20s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' }}>
          {displayMessages.map((msg, index) => (
            <React.Fragment key={index}>
              <span className="px-3" style={{ fontWeight: 600, fontSize: '11px', color: '#071326' }}>
                {msg}
              </span>
              <span style={{ color: 'rgba(201, 162, 39, 0.7)' }}>{separator}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CSS for the marquee animation */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          animation-name: marquee;
          display: inline-flex;
        }
      `}</style>
    </div>
  );
};
