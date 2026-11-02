import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { profile } from './content'

const HeroParticles = lazy(() => import('./effects/HeroParticles'))
const ProjectLiquid = lazy(() => import('./effects/ProjectLiquid'))
const ContactRipple = lazy(() => import('./effects/ContactRipple'))
const FlameWrap = lazy(() => import('./components/canvasui/FlameWrap').then(module => ({ default: module.FlameWrap })))

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  return reduced
}

function OnView({ children, fallback, className = '' }: { children: ReactNode; fallback: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const target = ref.current
    if (!target) return
    if (typeof window.IntersectionObserver !== 'function') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '180px' })
    observer.observe(target)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className={className}>{visible ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}</div>
}

function useScrollReveal(reducedMotion: boolean) {
  useEffect(() => {
    if (reducedMotion) return
    document.documentElement.classList.add('motion-ready')
    let frame = 0
    const revealVisible = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        document.querySelectorAll('.motion-reveal:not(.in-view)').forEach(element => {
          const rect = element.getBoundingClientRect()
          if (rect.top < window.innerHeight - 36 && rect.bottom > 0) element.classList.add('in-view')
        })
      })
    }
    revealVisible()
    window.addEventListener('scroll', revealVisible, { passive: true })
    window.addEventListener('resize', revealVisible)
    window.addEventListener('hashchange', revealVisible)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', revealVisible)
      window.removeEventListener('resize', revealVisible)
      window.removeEventListener('hashchange', revealVisible)
      document.documentElement.classList.remove('motion-ready')
    }
  }, [reducedMotion])
}

function FlameAction({ href, className, children, reducedMotion }: { href: string; className: string; children: ReactNode; reducedMotion: boolean }) {
  const link = <a className={className} href={href}>{children}</a>
  if (reducedMotion) return link
  return <Suspense fallback={link}><FlameWrap className="flame-action" color={[1, 0.36, 0.17]} intensity={0.8} height={38} spread={8} radius={4} speed={0.65} sparks={1.2} sparkDensity={0.7} smoke={0.25} melt={1.5} distortion={3}>{link}</FlameWrap></Suspense>
}

function ExperienceTimeline({ reducedMotion }: { reducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(reducedMotion ? 100 : 0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reducedMotion) return
    let frame = 0
    const update = () => {
      frame = 0
      const timeline = ref.current
      if (!timeline) return
      const rect = timeline.getBoundingClientRect()
      const point = window.innerHeight * 0.64
      setProgress(Math.max(0, Math.min(100, Math.round((point - rect.top) / rect.height * 100))))
      const nodes = Array.from(timeline.querySelectorAll('.timeline-node'))
      const nearest = nodes.reduce((best, node, index) => {
        const distance = Math.abs(node.getBoundingClientRect().top - point)
        return distance < best.distance ? { index, distance } : best
      }, { index: 0, distance: Infinity })
      setActive(nearest.index)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [reducedMotion])

  return <div className="timeline" ref={ref}>
    <div className="timeline-track" aria-hidden="true"><span className="timeline-progress" style={{ height: `${progress}%` }} /></div>
    {profile.experiences.map((item, i) => <article className={`timeline-item motion-reveal${i === active ? ' is-active' : ''}`} key={item.period}>
      <div className="timeline-marker"><button className="timeline-node" type="button" aria-label={`查看 ${item.period} ${item.title}`} onClick={() => { setActive(i); ref.current?.querySelectorAll('.timeline-item')[i]?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' }) }}><span /></button><span className="timeline-period">{item.period}</span></div>
      <div className="timeline-body"><span className="timeline-no">0{i + 1}</span><span className="timeline-label">CHAPTER 0{i + 1}</span><h3>{item.title}</h3><p className="timeline-company">{item.company}</p><p className="timeline-description">{item.description}</p><div className="tag-list">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>
    </article>)}
  </div>
}

const nav = [
  { label: '关于', href: '#about' },
  { label: '经历', href: '#experience' },
  { label: '作品', href: '#projects' },
  { label: '教育', href: '#education' },
]

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className="arrow">{diagonal ? '↗' : '→'}</span>
}

function SectionHeading({ id, index, eyebrow, title, aside }: { id: string; index: string; eyebrow: string; title: string; aside?: string }) {
  return <div className="section-heading motion-reveal"><span className="section-index">{index} / {eyebrow}</span><h2 id={id}>{title}</h2>{aside && <p>{aside}</p>}</div>
}

function ProjectArt({ art, number }: { art: string; number: string }) {
  const words: Record<string, string> = { red: '好内容，自有回响', video: '每一秒，都有故事', community: '一起，把热爱放大' }
  return <div className={`project-art project-art--${art}`} aria-hidden="true"><span className="art-sun">✳</span><div className="art-sheet"><span>CONTENT / {number}</span><strong>{words[art]}</strong><div className="art-lines"><i/><i/><i/></div><small>IDEAS IN MOTION ↗</small></div><span className="art-caption">SELECTED CASE / {number}</span></div>
}

function App() {
  const reducedMotion = useReducedMotion()
  useScrollReveal(reducedMotion)
  const [activeProject, setActiveProject] = useState(0)
  const project = profile.projects[activeProject]
  const art = <ProjectArt art={project.art} number={project.number} />

  return <>
    <div className="noise" aria-hidden="true" />
    <a className="skip-link" href="#main">跳转到正文</a>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="返回首页"><span className="brand-mark">{profile.initials}<span className="brand-dot">.</span></span><span className="brand-sub">PORTFOLIO<br/>2026</span></a>
      <nav aria-label="主导航">{nav.map(item => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
      <FlameAction className="header-contact" href="#contact" reducedMotion={reducedMotion}>联系我 <Arrow diagonal /></FlameAction>
    </header>

    <main id="main">
      <section id="top" className="hero" aria-labelledby="hero-title">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line"/> CONTENT & COMMUNITY <span>·</span> 2026</div>
          <p className="hero-kicker">你好，我是 <strong>{profile.name}</strong></p>
          <h1 id="hero-title">让内容<span className="hero-outline">发光</span><br/>让连接发生<span className="hero-period">.</span></h1>
          <p className="hero-statement">{profile.statement}</p>
          <div className="hero-actions"><FlameAction className="primary-link" href="#projects" reducedMotion={reducedMotion}>查看运营案例 <Arrow diagonal /></FlameAction><a className="text-link" href="#about">了解更多 <span aria-hidden="true">↓</span></a></div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-ring" />
          <img className={reducedMotion ? 'hero-static' : 'hero-static hero-static--underlay'} src={`${import.meta.env.BASE_URL}orbit.svg`} alt="" />
          {!reducedMotion && <OnView className="hero-effect" fallback={null}><HeroParticles /></OnView>}
          <div className="hero-visual-label">IDEAS × PEOPLE<br/>IN MOTION</div>
        </div>
        <div className="hero-bottom"><span>SCROLL TO EXPLORE <span className="scroll-line"/></span><span>01 — 05</span><span>{profile.location}</span></div>
      </section>

      <section id="about" className="about section-pad" aria-labelledby="about-title">
        <SectionHeading id="about-title" index="01" eyebrow="ABOUT" title="关于我" aside="从用户洞察出发，让每一次表达更有方向。" />
        <div className="about-layout"><div className="about-deco" aria-hidden="true"><span>LISTEN<br/>CREATE<br/>GROW<span className="accent">.</span></span><small>好内容，始于对人的理解。</small></div><div className="about-content"><p className="about-lead">{profile.role}<span className="accent">。</span></p><p>{profile.intro}</p><div className="focus-list">{profile.focus.map(item => <span key={item}>{item}</span>)}</div><div className="about-meta"><div><span>坐标</span><strong>{profile.location}</strong></div><div><span>当前状态</span><strong>{profile.availability}</strong></div></div></div></div>
      </section>

      <section id="experience" className="experience section-pad" aria-labelledby="experience-title">
        <SectionHeading id="experience-title" index="02" eyebrow="JOURNEY" title="工作经历" aside="从内容策划到社区经营，把想法变成持续的行动。" />
        <ExperienceTimeline reducedMotion={reducedMotion} />
      </section>

      <section id="projects" className="projects section-pad" aria-labelledby="projects-title">
        <SectionHeading id="projects-title" index="03" eyebrow="SELECTED CASES" title="运营案例" aside="展示策划思路与执行结构。以下均为演示案例。" />
        <div className="project-stage" key={project.number}><div className="project-stage-visual">{!reducedMotion ? <OnView className="project-effect" fallback={art}><ProjectLiquid>{art}</ProjectLiquid></OnView> : art}<div className="project-stage-index">{project.number} <span>/ 0{profile.projects.length}</span></div></div><div className="project-stage-copy"><div className="project-stage-top"><span>FEATURED PROJECT</span><span>{project.year}</span></div><p className="project-english">{project.english}</p><h3>{project.title}</h3><p className="project-category">{project.category}</p><p className="project-description">{project.description}</p><div className="project-outcome"><span>项目说明</span><p>{project.outcome}</p></div><div className="tag-list">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{project.link && <a className="project-link" href={project.link} target="_blank" rel="noreferrer">查看项目 <Arrow diagonal /></a>}</div></div>
        <div className="project-selector" aria-label="选择案例">{profile.projects.map((item, i) => <button key={item.number} type="button" className={i === activeProject ? 'project-tab active' : 'project-tab'} onClick={() => setActiveProject(i)} aria-pressed={i === activeProject}><span>{item.number}</span><strong>{item.title}</strong><small>{item.category}</small><Arrow diagonal /></button>)}</div>
      </section>

      <section id="education" className="education section-pad" aria-labelledby="education-title">
        <SectionHeading id="education-title" index="04" eyebrow="FOUNDATION" title="教育背景" aside="对传播和人的好奇，始终是工作的起点。" />
        <div className="education-list">{profile.education.map(item => <article className="education-item" key={item.period}><span>{item.period}</span><div><h3>{item.school}</h3><p className="education-subject">{item.subject}</p><p>{item.description}</p></div><span className="education-symbol" aria-hidden="true">✳</span></article>)}</div>
      </section>

      <section id="contact" className="contact" aria-labelledby="contact-title">
        {!reducedMotion ? <OnView className="contact-effect" fallback={<ContactContent />}><ContactRipple><ContactContent /></ContactRipple></OnView> : <ContactContent />}
      </section>
    </main>
    <footer className="site-footer"><span>© {new Date().getFullYear()} {profile.name}</span><span className="demo-notice">演示资料 · 请替换为真实个人信息</span><a href="#top">返回顶部 ↑</a></footer>
  </>
}

function ContactContent() {
  return <div className="contact-inner"><span className="section-index">05 / LET'S CONNECT</span><p className="contact-overline">有好的内容想法？聊聊下一步。</p><h2 id="contact-title">一起做好内容，<br/><em>让更多人看见</em><span className="accent">.</span></h2><div className="contact-links">{profile.xiaohongshu && <a href={profile.xiaohongshu} target="_blank" rel="noreferrer">小红书 <Arrow diagonal /></a>}{profile.douyin && <a href={profile.douyin} target="_blank" rel="noreferrer">抖音 <Arrow diagonal /></a>}{profile.email && <a href={`mailto:${profile.email}`}>EMAIL <Arrow diagonal /></a>}{profile.resume && <a href={profile.resume} target="_blank" rel="noreferrer">简历 <Arrow diagonal /></a>}<a href={profile.github} target="_blank" rel="noreferrer">GITHUB <Arrow diagonal /></a></div><div className="contact-bottom"><span>OPEN TO NEW IDEAS</span><span>{profile.location}</span></div></div>
}

export default App
