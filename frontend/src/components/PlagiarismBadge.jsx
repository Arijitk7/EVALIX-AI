/**
 * PlagiarismBadge — Shows plagiarism risk level
 */
const RISK_CONFIG = {
  LOW:      { icon: '🟢', label: 'Low Risk',      cls: 'badge-green'  },
  MEDIUM:   { icon: '🟡', label: 'Medium Risk',   cls: 'badge-yellow' },
  HIGH:     { icon: '🔴', label: 'High Risk',     cls: 'badge-red'    },
  CRITICAL: { icon: '🚨', label: 'Critical Risk', cls: 'badge-red'    },
};

export default function PlagiarismBadge({ riskLevel, score, aiGenerated }) {
  if (!riskLevel) return null;

  const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.LOW;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className={`badge ${config.cls}`} title={`Plagiarism Score: ${score ?? 0}%`}>
        {config.icon} {config.label} {score !== undefined ? `(${score}%)` : ''}
      </span>
      {aiGenerated && (
        <span className="badge badge-red" title="Possible AI-generated content detected">
          🤖 AI-Generated?
        </span>
      )}
    </div>
  );
}