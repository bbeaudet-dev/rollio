import React from 'react';

interface ProbabilityTimeIndicatorProps {
  totalOutcomes: number;
}

export const ProbabilityTimeIndicator: React.FC<ProbabilityTimeIndicatorProps> = ({ totalOutcomes }) => {
  // Calculate computation time estimate
  // Assuming ~10,000 rolls per second for probability calculations
  const ROLLS_PER_SECOND = 10000; // was 1e9
  const seconds = totalOutcomes / ROLLS_PER_SECOND;
  
  let timeEstimate: string;
  let bgColor: string;
  let textColor = '#fff';
  let isScary = false;
  
  if (seconds < 1) {
    timeEstimate = '< 1 second';
    bgColor = '#28a745'; // green
    textColor = '#fff';
  } else if (seconds < 1000) {
    timeEstimate = `${seconds.toFixed(2)} seconds`;
    bgColor = '#28a745'; // green
    textColor = '#fff';
  } else {
    // Convert to minutes when >= 1000 seconds
    const minutes = seconds / 60;
    if (minutes < 1000) {
      timeEstimate = `${minutes.toFixed(2)} minutes`;
      bgColor = '#d4a017'; // darker yellow
      textColor = '#fff';
    } else {
      // Convert to hours when >= 1000 minutes
      const hours = minutes / 60;
      if (hours < 1000) {
        timeEstimate = `${hours.toFixed(2)} hours`;
        bgColor = '#fd7e14'; // orange
        textColor = '#fff';
      } else {
        // Convert to days when >= 1000 hours
        const days = hours / 24;
        if (days < 1000) {
          timeEstimate = `${days.toFixed(2)} days`;
          bgColor = '#dc3545'; // red
          textColor = '#fff';
        } else {
          // Convert to years when >= 1000 days
          const years = days / 365.25;
          if (years < 1000) {
            timeEstimate = `${years.toFixed(2)} years`;
            bgColor = '#721c24'; // dark red
            textColor = '#fff';
          } else {
            // Convert to thousand years when >= 1000 years
            const thousandYears = years / 1000;
            if (thousandYears < 1000) {
              timeEstimate = `${thousandYears.toFixed(2)} thousand years`;
              bgColor = '#1a1a1a'; // black
              textColor = '#ff0000'; // bright red text
              isScary = true;
            } else {
              // Convert to million years when >= 1000 thousand years
              const millionYears = thousandYears / 1000;
              if (millionYears < 1000) {
                timeEstimate = `${millionYears.toFixed(2)} million years`;
                bgColor = '#1a1a1a'; // black
                textColor = '#ff0000'; // bright red text
                isScary = true;
              } else {
                // Convert to billion years when >= 1000 million years
                timeEstimate = `${(millionYears / 1000).toFixed(2)} billion years`;
                bgColor = '#1a1a1a'; // black
                textColor = '#ff0000'; // bright red text
                isScary = true;
              }
            }
          }
        }
      }
    }
  }

  // Calculate box size based on total outcomes (keep font size escalation)
  const logValue = Math.log10(totalOutcomes || 1);
  const minSize = 14;
  const maxSize = 24;
  const fontSize = Math.min(maxSize, Math.max(minSize, minSize + (logValue - 1) * 1.5));
  
  // Shake animation for very high outcome counts
  const shouldShake = logValue >= 12 || isScary;

  return (
    <div style={{
      fontSize: `${fontSize}px`,
      color: textColor,
      fontFamily: 'monospace',
      backgroundColor: bgColor,
      padding: '12px 16px',
      borderRadius: '6px',
      border: '2px solid rgba(0,0,0,0.1)',
      fontWeight: '600',
      boxShadow: logValue > 9 ? '0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      animation: shouldShake ? 'shake 0.5s infinite' : 'none'
    }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
      `}</style>
      <div>Total Outcomes: {totalOutcomes.toLocaleString()}</div>
      <div style={{
        fontSize: `${Math.min(maxSize * 0.7, Math.max(minSize * 0.7, (minSize * 0.7) + (logValue - 1) * 1.05))}px`,
        marginTop: '4px',
        opacity: 0.95
      }}>
        Est. compute time: <span style={{ fontWeight: '700' }}>{timeEstimate}</span>
      </div>
    </div>
  );
};

