import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

/**
 * Lightweight entrance animation wrapper — fades + slides content in on
 * mount. Used throughout dashboards for a "premium SaaS" feel without
 * pulling in a full animation library.
 */
export default function FadeIn({ children, delay = 0, className, as: Tag = 'div' }) {
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    timer.current = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(timer.current)
  }, [delay])

  return (
    <Tag
      className={clsx(
        'transition-all duration-500 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        className
      )}
    >
      {children}
    </Tag>
  )
}
