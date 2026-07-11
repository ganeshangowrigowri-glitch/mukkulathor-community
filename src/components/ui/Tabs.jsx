import clsx from 'clsx'

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto rounded-sm2 bg-slate-100 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            'shrink-0 rounded-[5px] px-3.5 py-2 text-sm font-medium transition-colors',
            active === tab.value ? 'bg-white text-navy-800 shadow-sm' : 'text-slate-500 hover:text-navy-700'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
