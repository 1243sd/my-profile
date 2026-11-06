import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { profile } from './content'

const HeroClouds = lazy(() => import('./effects/HeroClouds'))
const HeroDroplets = lazy(() => import('./effects/HeroDroplets'))
const ProjectLiquid = lazy(() => import('./effects/ProjectLiquid'))
const ContactRipple = lazy(() => import('./effects/ContactRipple'))

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
    if (typeof window.IntersectionObserver !== 'function') { setVisible(true); return }
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
  { label: '案例', href: '#projects' },
  { label: '教育', href: '#education' },
]

function FloatingNav() {
  const [active, setActive] = useState('')
  const [scrollProgress, setScrollProgress] = useState(0)
  const menuRef = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(maxScroll > 0 ? window.scrollY / maxScroll : 0)
      const current = [...nav].reverse().find(item => {
        const target = document.querySelector(item.href)
        return target && target.getBoundingClientRect().top <= 180
      })
      setActive(current?.href ?? '')
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule) }
  }, [])
  const links = nav.map(item => <a key={item.href} href={item.href} aria-current={active === item.href ? 'location' : undefined} onClick={() => { if (menuRef.current) menuRef.current.open = false }}>{item.label}</a>)
  return <header className="site-header">
    <a className="brand" href="#top" aria-label="返回首页"><span className="brand-mark">{profile.initials}<span className="brand-dot">.</span></span><span className="brand-sub">CONTENT<br />PORTFOLIO</span></a>
    <nav className="desktop-nav" aria-label="主导航">{links}</nav>
    <a className="header-contact" href="#contact">联系我 <Arrow diagonal /></a>
    <details className="mobile-menu" ref={menuRef}><summary aria-label="打开导航菜单"><span>菜单</span><span className="menu-icon" aria-hidden="true">☰</span></summary><nav aria-label="手机导航">{links}<a href="#contact" onClick={() => { if (menuRef.current) menuRef.current.open = false }}>联系</a></nav></details>
    <span className="header-progress" aria-hidden="true" style={{ transform: `scaleX(${scrollProgress})` }} />
  </header>
}

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className="arrow">{diagonal ? '↗' : '→'}</span>
}

function SectionHeading({ id, index, eyebrow, title, aside }: { id: string; index: string; eyebrow: string; title: string; aside?: string }) {
  return <div className="section-heading motion-reveal"><span className="section-index">{index} / {eyebrow}</span><h2 id={id}>{title}</h2>{aside && <p>{aside}</p>}</div>
}

function ProjectArt({ art, number }: { art: string; number: string }) {
  const words: Record<string, string> = { red: '好内容，\n自有回响。', video: '每一秒，\n都有故事。', community: '一起把\n热爱放大。' }
  const labels: Record<string, string> = { red: 'NOTE / IDEA', video: 'VIDEO / STORY', community: 'PEOPLE / COMMUNITY' }
  return <div className={`project-art project-art--${art}`} aria-hidden="true">
    <div className="art-grid" /><span className="art-orbit" /><span className="art-sticker">✳</span>
    <div className="art-sheet"><span>{labels[art]}</span><strong>{words[art]}</strong><div className="art-lines"><i /><i /><i /></div><small>CONTENT EXPERIMENT {number}</small></div>
    <div className="art-mini"><span>IDEAS<br />IN MOTION</span><b>↗</b></div>
    <span className="art-caption">SELECTED CASE / {number}</span>
  </div>
}

function HeroVisualContent() {
  return <div className="hero-visual-inner" aria-hidden="true">
    <div className="hero-particle-field"><img className="hero-static" src={`${import.meta.env.BASE_URL}orbit.svg`} alt="" /></div>
    <div className="scene-card scene-card--note"><span>01 / 小红书</span><strong>有用的灵感<br />值得被看见</strong><i /><small>CONTENT / NOTE</small></div>
    <div className="scene-card scene-card--video"><span>02 / 抖音</span><b className="scene-play">▶</b><strong>把故事<br />拍进每一秒</strong><small>VIDEO / STORY</small></div>
    <div className="scene-card scene-card--community"><span>03 / 社区</span><strong>让热爱<br />聚在一起</strong><div className="scene-people"><i /><i /><i /></div></div>
    <span className="scene-spark">✳</span>
  </div>
}

function ContactContent() {
  return <div className="contact-inner">
    <span className="section-index">05 / LET'S CONNECT</span>
    <p className="contact-overline">有好的内容想法？聊聊下一步。</p>
    <h2 id="contact-title">下一次好内容，<br /><em>一起做出来</em><span className="accent">.</span></h2>
    <div className="contact-links">
      {profile.xiaohongshu && <a href={profile.xiaohongshu} target="_blank" rel="noreferrer">小红书 <Arrow diagonal /></a>}
      {profile.douyin && <a href={profile.douyin} target="_blank" rel="noreferrer">抖音 <Arrow diagonal /></a>}
      {profile.email && <a href={`mailto:${profile.email}`}>EMAIL <Arrow diagonal /></a>}
      {profile.resume && <a href={profile.resume} target="_blank" rel="noreferrer">简历 <Arrow diagonal /></a>}
      <a href={profile.github} target="_blank" rel="noreferrer">GITHUB <Arrow diagonal /></a>
    </div>
    <div className="contact-bottom"><span>OPEN TO NEW IDEAS</span><span>{profile.location}</span></div>
  </div>
}

function App() {
  const reducedMotion = useReducedMotion()
  useScrollReveal(reducedMotion)
  return <>
    <a className="skip-link" href="#main">跳转到正文</a>
    <FloatingNav />
    <main id="main">
      <section id="top" className="hero" aria-labelledby="hero-title">
        <div className="hero-atmosphere" aria-hidden="true"><div className="hero-atmosphere-base" />{!reducedMotion && <OnView className="hero-cloud-slot" fallback={null}><HeroClouds /></OnView>}</div>
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> CONTENT × COMMUNITY <span>2026</span></div>
          <p className="hero-kicker">你好，我是 <strong>{profile.name}</strong><span className="hero-role"> / {profile.role}</span></p>
          <h1 id="hero-title">把内容<br /><em>做出回响</em><span className="hero-period">.</span></h1>
          <p className="hero-statement">{profile.statement}</p>
          <div className="hero-actions"><a className="primary-link" href="#projects">探索运营案例 <Arrow diagonal /></a><a className="text-link" href="#about">认识我 <span aria-hidden="true">↓</span></a></div>
          <span className="hero-note">从洞察开始，让表达更有力量。</span>
        </div>
        <div className="hero-visual">{!reducedMotion ? <OnView className="hero-droplet-slot" fallback={<HeroVisualContent />}><HeroDroplets><HeroVisualContent /></HeroDroplets></OnView> : <HeroVisualContent />}</div>
        <div className="hero-bottom"><span>SCROLL TO EXPLORE <span className="scroll-line" /></span><span>{profile.location}</span></div>
      </section>
      <div className="ticker" aria-hidden="true"><div className="ticker-track"><span>内容策划 ✳ 用户洞察 ✳ 小红书运营 ✳ 短视频创意 ✳ 社区共创 ✳ 数据复盘 ✳</span><span>内容策划 ✳ 用户洞察 ✳ 小红书运营 ✳ 短视频创意 ✳ 社区共创 ✳ 数据复盘 ✳</span></div></div>
      <section id="about" className="about section-pad" aria-labelledby="about-title">
        <SectionHeading id="about-title" index="01" eyebrow="ABOUT ME" title="关于我" aside="好内容，始于对人的理解。" />
        <div className="about-layout">
          <div className="about-deco motion-reveal" aria-hidden="true"><span>LISTEN<span> / </span><br />CREATE<span> / </span><br />GROW<span className="accent">.</span></span><small>IDEAS BECOME CONNECTIONS</small></div>
          <div className="about-content motion-reveal"><p className="about-lead">我在做的，是让<span className="accent">内容与人</span>真正相遇。</p><p>{profile.intro}</p><div className="focus-list">{profile.focus.map((item, index) => <div key={item.title}><span>0{index + 1}</span><strong>{item.title}</strong><p>{item.detail}</p><Arrow diagonal /></div>)}</div><div className="about-meta"><div><span>坐标</span><strong>{profile.location}</strong></div><div><span>当前状态</span><strong>{profile.availability}</strong></div></div></div>
        </div>
      </section>
      <section id="experience" className="experience section-pad" aria-labelledby="experience-title">
        <SectionHeading id="experience-title" index="02" eyebrow="THE JOURNEY" title="工作经历" aside="从内容策划到社区经营，把想法变成持续的行动。" />
        <ExperienceTimeline reducedMotion={reducedMotion} />
      </section>
      <section id="projects" className="projects section-pad" aria-labelledby="projects-title">
        <SectionHeading id="projects-title" index="03" eyebrow="SELECTED WORK" title="运营案例" aside="三个演示案例，展示不同平台的策划与执行思路。" />
        <nav className="case-index" aria-label="案例目录">{profile.projects.map(item => <a key={item.number} href={`#case-${item.number}`}><span>{item.number}</span><strong>{item.platform}</strong><Arrow diagonal /></a>)}</nav>
        <div className="case-list">{profile.projects.map((project, index) => {
          const art = <ProjectArt art={project.art} number={project.number} />
          return <article className={`case-story case-story--${project.art} motion-reveal`} id={`case-${project.number}`} key={project.number}>
            <div className="case-visual">{index === 0 && !reducedMotion ? <OnView className="project-effect" fallback={art}><ProjectLiquid>{art}</ProjectLiquid></OnView> : art}</div>
            <div className="case-copy"><div className="case-top"><span>CASE / {project.number}</span><span>{project.year}</span></div><span className="case-platform">{project.platform}</span><h3>{project.title}</h3><p className="case-english">{project.english}</p><p className="case-description">{project.description}</p><div className="case-process"><span>工作路径 / 示例</span><ol>{project.process.map(step => <li key={step.label}><strong>{step.label}</strong><p>{step.detail}</p></li>)}</ol></div><div className="case-outcome"><span>项目说明</span><p>{project.outcome}</p></div><div className="tag-list">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>{project.link && <a className="project-link" href={project.link} target="_blank" rel="noreferrer">查看项目 <Arrow diagonal /></a>}</div>
          </article>
        })}</div>
      </section>
      <section id="education" className="education section-pad" aria-labelledby="education-title">
        <SectionHeading id="education-title" index="04" eyebrow="FOUNDATION" title="教育背景" aside="保持学习，也保持对表达的好奇。" />
        <div className="education-list">{profile.education.map(item => <article className="education-item motion-reveal" key={item.period}><span className="education-period">{item.period}</span><div><h3>{item.school}</h3><p className="education-subject">{item.subject}</p><p>{item.description}</p></div><span className="education-symbol" aria-hidden="true">✳</span></article>)}</div>
      </section>
      <section id="contact" className="contact" aria-labelledby="contact-title">
        {!reducedMotion ? <OnView className="contact-effect" fallback={<ContactContent />}><ContactRipple><ContactContent /></ContactRipple></OnView> : <ContactContent />}
      </section>
    </main>
    <footer className="site-footer"><span>© {new Date().getFullYear()} {profile.name}</span><span className="demo-notice">演示资料 · 请替换为真实个人信息</span><a href="#top">返回顶部 ↑</a></footer>
  </>
}

export default App
