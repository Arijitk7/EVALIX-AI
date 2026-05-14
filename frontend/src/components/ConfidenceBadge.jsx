/**
 * ConfidenceBadge — Shows AI confidence level with color coding
 * Green ≥85%, Yellow 70-84%, Red <70%
 */
export default function ConfidenceBadge({ score }) {
  if (score === null || score === undefined) return null;

  const level = score >= 85 ? 'high' : score >= 70 ? 'medium' : 'low';
  const config = {
    high:   { label: `${score}% Confidence`, cls: 'badge-green', icon: '✅' },
    medium: { label: `${score}% Confidence`, cls: 'badge-yellow', icon: '⚠️' },
    low:    { label: `${score}% Confidence`, cls: 'badge-red',    icon: '🔴' },
  };

  const { label, cls, icon } = config[level];
  return (
    <span className={`badge ${cls}`} title="AI Confidence Score">
      {icon} {label}
    </span>
  );
}