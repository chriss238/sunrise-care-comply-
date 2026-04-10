import type { ItemWithStatus } from '@/lib/types'
import ComplianceItem from './ComplianceItem'
import NewItemForm from './NewItemForm'

interface Props {
  category: string
  icon: string
  items: ItemWithStatus[]
  onComplete: (id: number) => void
  onUpdate: (id: number, fields: Partial<ItemWithStatus>) => void
  onAddItem: (category: string, itemName: string, dueDate: string) => Promise<void>
  isAddingItem: boolean
  onStartAdd: () => void
  onCancelAdd: () => void
  currentUserName: string
}

export default function ComplianceSection({
  category, icon, items,
  onComplete, onUpdate, onAddItem,
  isAddingItem, onStartAdd, onCancelAdd,
  currentUserName,
}: Props) {
  return (
    <section
      className="mb-8 animate-fade-in-down"
      role="region"
      aria-label={`${category} compliance items`}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-[3px] border-sg-coral">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={{ background: 'linear-gradient(135deg, #ed5e68 0%, #d13844 100%)' }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <h2 className="text-lg font-bold text-sg-navy tracking-tight">{category}</h2>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <ComplianceItem
            key={item.id}
            item={item}
            onComplete={onComplete}
            onUpdate={onUpdate}
            currentUserName={currentUserName}
          />
        ))}

        {/* New item form */}
        {isAddingItem && (
          <NewItemForm
            category={category}
            onSave={(itemName, dueDate) => onAddItem(category, itemName, dueDate)}
            onCancel={onCancelAdd}
          />
        )}

        {/* Add item button */}
        {!isAddingItem && (
          <button
            onClick={onStartAdd}
            className="mt-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-sm font-semibold text-gray-400 hover:border-sg-navy hover:text-sg-navy transition-all w-full justify-center"
          >
            + Add item
          </button>
        )}
      </div>
    </section>
  )
}
