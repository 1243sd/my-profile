import { Ripple } from '../../components/canvasui/Ripple'

export default function ContactRipple({ children }: { children: React.ReactNode }) {
  return <Ripple className="contact-ripple">{children}</Ripple>
}
