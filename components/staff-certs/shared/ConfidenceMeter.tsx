interface Props {
  score: number
}

export default function ConfidenceMeter({ score }: Props) {
  const color = score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-amber-500' : 'bg-red-500'
  const textColor = score >= 90 ? 'text-green-700' : score >= 75 ? 'text-amber-700' : 'text-red-700'
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500 font-medium">AI Confidence</span>
        <span className={`text-sm font-bold ${textColor}`}>{score.toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {score < 90 && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
          ⚠️ Low confidence — please verify highlighted fields before approving.
        </p>
      )}
    </div>
  )
}
