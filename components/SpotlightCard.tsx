'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

export function SpotlightCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const card = useRef<HTMLDivElement>(null)
  const x = useMotionValue(50)
  const y = useMotionValue(50)
  const springX = useSpring(x, { stiffness: 180, damping: 26 })
  const springY = useSpring(y, { stiffness: 180, damping: 26 })
  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = card.current?.getBoundingClientRect()
    if (!bounds) return
    x.set(((event.clientX - bounds.left) / bounds.width) * 100)
    y.set(((event.clientY - bounds.top) / bounds.height) * 100)
  }
  return <motion.div ref={card} className={`spotlight-card ${className}`} onMouseMove={handleMove} style={{ '--spot-x': springX, '--spot-y': springY } as never} whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}>{children}</motion.div>
}
