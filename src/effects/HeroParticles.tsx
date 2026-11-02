import { ParticleObject } from '../../components/canvasui/ParticleObject'

export default function HeroParticles() {
  return (
    <ParticleObject
      className="hero-particles"
      src={`${import.meta.env.BASE_URL}orbit.svg`}
      count={10500}
      size={1.8}
      color="#3158ce"
      radius={145}
      strength={1.15}
      swirl={0.8}
      floatIntensity={0.5}
      rotationIntensity={0.28}
      autoRotate
      autoRotateSpeed={0.28}
      orbit={false}
      zoom={false}
    />
  )
}
