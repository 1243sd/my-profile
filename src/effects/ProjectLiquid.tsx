import { Liquid } from '../../components/canvasui/Liquid'

export default function ProjectLiquid({ children }: { children: React.ReactNode }) {
  return <Liquid className="project-liquid">{children}</Liquid>
}
