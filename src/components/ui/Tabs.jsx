import { useState, createContext, useContext } from 'react'
import { cn } from '../../lib/utils'

const TabsContext = createContext({ activeTab: '', setActiveTab: () => {} })

export function Tabs({ defaultValue, value, children, className, onValueChange }) {
  const [internalTab, setInternalTab] = useState(defaultValue || value || '')

  // Support controlled mode (value prop) or uncontrolled (defaultValue)
  const activeTab = value !== undefined ? value : internalTab

  const handleTabChange = (val) => {
    if (value === undefined) setInternalTab(val)
    onValueChange?.(val)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={className}>
        {typeof children === 'function'
          ? children({ activeTab, setActiveTab: handleTabChange })
          : children
        }
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className }) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg p-1 gap-1',
        'bg-[#1a1a1a] border border-[#2a2a2a]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  const isActive = activeTab === value

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-[#C9A84C] text-[#0a0a0a] shadow-sm'
          : 'text-gray-400 hover:text-white hover:bg-white/5',
        className
      )}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }) {
  const { activeTab } = useContext(TabsContext)
  if (activeTab !== value) return null

  return (
    <div
      className={cn(
        'mt-4 animate-fadeIn',
        className
      )}
    >
      {children}
    </div>
  )
}
