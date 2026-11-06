import { Droplets } from '../components/canvasui/Droplets'
import type { ReactNode } from 'react'

export default function HeroDroplets({ children }: { children: ReactNode }) {
  return <Droplets className="hero-droplets" intensity={0.22} speed={0.42} staticDrops={0.38} refraction={0.25} blur={0} vignette={0} tintStrength={0} interactive>{children}</Droplets>
}
