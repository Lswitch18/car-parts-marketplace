import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

if (typeof window !== 'undefined' && !(gsap as unknown as { _gsapRegistered?: boolean })._gsapRegistered) {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  ;(gsap as unknown as { _gsapRegistered?: boolean })._gsapRegistered = true
}

export { gsap, ScrollTrigger, SplitText }
