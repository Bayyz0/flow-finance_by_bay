/**
 * Cloud Theme Component
 * Displays animated floating clouds as background
 */

export function CloudTheme() {
  return (
    <>
      <style>{`
        @keyframes float-cloud-1 {
          0% { transform: translateX(-100%) translateY(0); }
          100% { transform: translateX(100vw) translateY(0); }
        }
        @keyframes float-cloud-2 {
          0% { transform: translateX(-100%) translateY(20px); }
          100% { transform: translateX(100vw) translateY(20px); }
        }
        @keyframes float-cloud-3 {
          0% { transform: translateX(-100%) translateY(-20px); }
          100% { transform: translateX(100vw) translateY(-20px); }
        }
        @keyframes float-cloud-4 {
          0% { transform: translateX(-100%) translateY(40px); }
          100% { transform: translateX(100vw) translateY(40px); }
        }
        .cloud-float-1 {
          animation: float-cloud-1 25s linear infinite;
        }
        .cloud-float-2 {
          animation: float-cloud-2 30s linear infinite;
          animation-delay: 5s;
        }
        .cloud-float-3 {
          animation: float-cloud-3 35s linear infinite;
          animation-delay: 10s;
        }
        .cloud-float-4 {
          animation: float-cloud-4 40s linear infinite;
          animation-delay: 15s;
        }
      `}</style>

      <div
        className="fixed inset-0 pointer-events-none overflow-hidden bg-gradient-to-b from-sky-100 to-sky-50"
        style={{ zIndex: -1 }}
      >
        {/* Cloud 1 */}
        <svg
          className="cloud-float-1 absolute top-1/4 w-32 h-16 opacity-40"
          viewBox="0 0 200 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 80 Q30 80 30 60 Q30 40 50 40 Q60 20 80 20 Q100 20 100 40 Q120 40 120 60 Q120 80 100 80 Z"
            fill="rgb(191, 219, 254)"
          />
        </svg>

        {/* Cloud 2 */}
        <svg
          className="cloud-float-2 absolute top-1/3 w-40 h-20 opacity-30"
          viewBox="0 0 200 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 80 Q30 80 30 60 Q30 40 50 40 Q60 20 80 20 Q100 20 100 40 Q120 40 120 60 Q120 80 100 80 Z"
            fill="rgb(219, 234, 254)"
          />
        </svg>

        {/* Cloud 3 */}
        <svg
          className="cloud-float-3 absolute top-2/3 w-36 h-18 opacity-35"
          viewBox="0 0 200 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 80 Q30 80 30 60 Q30 40 50 40 Q60 20 80 20 Q100 20 100 40 Q120 40 120 60 Q120 80 100 80 Z"
            fill="rgb(147, 197, 253)"
          />
        </svg>

        {/* Cloud 4 */}
        <svg
          className="cloud-float-4 absolute top-1/2 w-44 h-22 opacity-25"
          viewBox="0 0 200 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 80 Q30 80 30 60 Q30 40 50 40 Q60 20 80 20 Q100 20 100 40 Q120 40 120 60 Q120 80 100 80 Z"
            fill="rgb(96, 165, 250)"
          />
        </svg>
      </div>
    </>
  );
}
