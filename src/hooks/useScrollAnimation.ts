import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook to trigger animations when an element enters the viewport.
 * @param threshold Percentage of the element's visibility required to trigger (0 to 1).
 * @returns [ref, visible]
 */
export function useScrollAnimation(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          // Once visible, we can stop observing if we only want the animation to play once
          if (ref.current) observer.unobserve(ref.current)
        }
      },
      { threshold }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  return [ref, visible] as const
}
