function getStrength(password) {
  if (!password) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const LABELS = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong']
const COLORS = ['bg-red-400', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500']

export default function PasswordStrengthMeter({ password }) {
  const score = getStrength(password)
  if (!password) return null

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 h-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${i < score ? COLORS[score] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className={`text-xs mt-1 ${score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' : 'text-emerald-600'}`}>
        {LABELS[score]}
        {score < 3 && <span className="text-gray-400"> — try adding a number or symbol like @, #, !</span>}
      </p>
    </div>
  )
}