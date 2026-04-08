import { getInitials, getAvatarColor } from '@/lib/staff-certs'

interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export default function NurseAvatar({ name, size = 'md' }: Props) {
  const color = getAvatarColor(name)
  const initials = getInitials(name)
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  )
}
