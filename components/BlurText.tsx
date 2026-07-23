'use client'

import { motion } from 'motion/react'

export function BlurText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <motion.span className={`blur-text ${className}`} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.045, delayChildren: 0.12 } } }}>{String(children).split(' ').map((word, index) => <motion.span className="blur-word" key={`${word}-${index}`} variants={{ hidden: { opacity: 0, filter: 'blur(12px)', y: 18 }, show: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } }}>{word}{index < String(children).split(' ').length - 1 ? '\u00a0' : ''}</motion.span>)}</motion.span>
}
