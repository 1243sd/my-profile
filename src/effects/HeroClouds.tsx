import { Clouds } from '../components/canvasui/Clouds'

export default function HeroClouds() {
  return <Clouds className="hero-clouds" color={[0.91, 0.9, 1]} opacity={0.56} cover={0.22} density={2.1} speed={0.32} wind={0.45} quality={0.7}><div className="hero-atmosphere-base" /></Clouds>
}
