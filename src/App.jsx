import { useEffect, useState, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [stars, setStars] = useState([])
  const [lanterns, setLanterns] = useState([])
  const [particles, setParticles] = useState([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [name, setName] = useState('')
  const [generatedCard, setGeneratedCard] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Game states
  const [gameScore, setGameScore] = useState(0)
  const [gameActive, setGameActive] = useState(false)
  const [coins, setCoins] = useState([])
  const [timeLeft, setTimeLeft] = useState(30)
  const [highScore, setHighScore] = useState(0)
  const [activeSection, setActiveSection] = useState('hero')
  const [navVisible, setNavVisible] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const gameRef = useRef(null)
  
  const canvasRef = useRef(null)
  const fireworksCanvasRef = useRef(null)
  const containerRef = useRef(null)
  const cardRef = useRef(null)

  // Generate stars
  useEffect(() => {
    const newStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 70,
      delay: Math.random() * 5,
      duration: 1.5 + Math.random() * 4,
      size: Math.random() * 4 + 1,
      color: Math.random() > 0.8 ? '#ffd700' : '#ffffff'
    }))
    setStars(newStars)

    const newLanterns = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 15,
      scale: 0.4 + Math.random() * 0.9,
      swayAmount: 20 + Math.random() * 40
    }))
    setLanterns(newLanterns)
  }, [])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Scroll tracking for navigation
  useEffect(() => {
    const handleScroll = () => {
      // Update active section for nav
      const sections = ['hero', 'atmosphere', 'blessings', 'wishes', 'game', 'vibes']
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fireworks system
  useEffect(() => {
    const canvas = fireworksCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    let animationId
    const fireworks = []
    const particles = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Firework {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = canvas.height
        this.targetY = Math.random() * canvas.height * 0.4 + 50
        this.speed = 8 + Math.random() * 4
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.3
        this.vx = Math.cos(this.angle) * this.speed
        this.vy = Math.sin(this.angle) * this.speed
        this.hue = Math.random() * 60 + 30
        this.exploded = false
        this.trail = []
      }

      update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 })
        if (this.trail.length > 10) this.trail.shift()
        
        this.x += this.vx
        this.y += this.vy
        this.vy += 0.15

        if (this.vy >= 0 || this.y <= this.targetY) {
          this.explode()
        }
      }

      explode() {
        this.exploded = true
        const particleCount = 50 + Math.random() * 50
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle(this.x, this.y, this.hue))
        }
      }

      draw() {
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        for (let i = this.trail.length - 1; i >= 0; i--) {
          const point = this.trail[i]
          ctx.lineTo(point.x, point.y)
          point.alpha *= 0.9
        }
        ctx.strokeStyle = `hsla(${this.hue}, 100%, 60%, 0.5)`
        ctx.lineWidth = 3
        ctx.stroke()
      }
    }

    class Particle {
      constructor(x, y, hue) {
        this.x = x
        this.y = y
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 6 + 2
        this.vx = Math.cos(angle) * speed
        this.vy = Math.sin(angle) * speed
        this.hue = hue + Math.random() * 30 - 15
        this.life = 1
        this.decay = Math.random() * 0.02 + 0.01
        this.gravity = 0.1
        this.size = Math.random() * 4 + 2
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.vy += this.gravity
        this.vx *= 0.98
        this.vy *= 0.98
        this.life -= this.decay
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.life
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, 1)`
        ctx.shadowBlur = 10
        ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, 1)`
        ctx.fill()
        ctx.restore()
      }
    }

    let frameCount = 0
    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 26, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (frameCount % 40 === 0 && Math.random() > 0.3) {
        fireworks.push(new Firework())
      }

      for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update()
        fireworks[i].draw()
        if (fireworks[i].exploded) {
          fireworks.splice(i, 1)
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update()
        particles[i].draw()
        if (particles[i].life <= 0) {
          particles.splice(i, 1)
        }
      }

      frameCount++
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Click confetti effect
  const handleClick = useCallback((e) => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: e.clientX,
      y: e.clientY,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 10,
      color: ['#ffd700', '#ff6b35', '#ffec8b', '#ffffff'][Math.floor(Math.random() * 4)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 20
    }))
    setParticles(prev => [...prev, ...newParticles])
  }, [])

  // Generate Eid Card
  const generateCard = () => {
    if (!name.trim()) return
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedCard({
        name: name.trim(),
        message: `Eid Mubarak, ${name.trim()}`,
        arabic: 'عيد مبارك',
        timestamp: Date.now()
      })
      setIsGenerating(false)
    }, 800)
  }

  // Download card as image
  const downloadCard = () => {
    if (!cardRef.current) return
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    
    canvas.width = 800
    canvas.height = 600
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1a0a2e')
    gradient.addColorStop(0.5, '#2d1b4e')
    gradient.addColorStop(1, '#1a0a2e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Decorative border
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 4
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)
    
    // Corner decorations
    ctx.font = '30px serif'
    ctx.fillStyle = '#ffd700'
    ctx.fillText('❧', 40, 60)
    ctx.fillText('❧', canvas.width - 70, 60)
    ctx.fillText('❧', 40, canvas.height - 40)
    ctx.fillText('❧', canvas.width - 70, canvas.height - 40)
    
    // Arabic text
    ctx.font = 'bold 50px "Amiri", serif'
    ctx.fillStyle = '#ffd700'
    ctx.textAlign = 'center'
    ctx.fillText('عيد مبارك', canvas.width / 2, 150)
    
    // Main message
    ctx.font = 'bold 45px "Cinzel", serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('Eid Mubarak', canvas.width / 2, 250)
    
    // Name
    ctx.font = 'italic 35px "Great Vibes", cursive'
    ctx.fillStyle = '#ffec8b'
    ctx.fillText(name, canvas.width / 2, 320)
    
    // Decorative line
    ctx.strokeStyle = '#ffd700'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 100, 360)
    ctx.lineTo(canvas.width / 2 + 100, 360)
    ctx.stroke()
    
    // Moon and stars
    ctx.font = '40px serif'
    ctx.fillText('🌙', canvas.width / 2, 420)
    ctx.fillText('✨', canvas.width / 2 - 60, 400)
    ctx.fillText('✨', canvas.width / 2 + 60, 400)
    
    // Footer
    ctx.font = '20px "Cinzel", serif'
    ctx.fillStyle = 'rgba(255, 215, 0, 0.7)'
    ctx.fillText('May Allah bless you with joy and prosperity', canvas.width / 2, 500)
    
    // Download
    const link = document.createElement('a')
    link.download = `Eid-Mubarak-${name}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    if (!generatedCard) return
    const text = `🌙 ${generatedCard.message} ✨\n\n${generatedCard.arabic}\n\nMay Allah bless you with joy and prosperity this Eid!`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  // Share site
  const shareSite = async () => {
    const shareData = {
      title: 'Eid Mubarak',
      text: '🌙 Eid Mubarak! Check out this beautiful Eid celebration site! ✨',
      url: window.location.href
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        console.log('Share cancelled')
      }
    } else {
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
        alert('Link copied to clipboard!')
      } catch {
        alert('Share this site with your loved ones!')
      }
    }
  }

  // Send wishes
  const sendWishes = () => {
    const wishes = [
      '🌙 Eid Mubarak! May your life be filled with happiness and prosperity! ✨',
      '✨ Wishing you and your family a blessed Eid filled with joy and peace! 🌙',
      '🎊 May this Eid bring you closer to your loved ones and fill your heart with contentment! 💫'
    ]
    const randomWish = wishes[Math.floor(Math.random() * wishes.length)]
    
    if (navigator.share) {
      navigator.share({
        title: 'Eid Mubarak',
        text: randomWish
      })
    } else {
      navigator.clipboard.writeText(randomWish)
      alert('Eid wish copied! Share it with someone special!')
    }
  }

  // Navigation scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Show/hide nav based on scroll - always visible on hero, hide on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const heroHeight = window.innerHeight * 0.9 // Increased from 0.8 to 0.9
      
      // Always show on hero section (first 90% of viewport height)
      if (currentScrollY < heroHeight) {
        setNavVisible(true)
      } else {
        // Show when scrolling up, hide when scrolling down
        setNavVisible(currentScrollY < lastScrollY)
      }
      
      lastScrollY = currentScrollY
    }
    
    // Initial check - ensure nav is visible on page load
    setNavVisible(true)
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Catch Eidi Game Functions
  const startGame = () => {
    setGameActive(true)
    setGameScore(0)
    setTimeLeft(30)
    setCoins([])
  }

  const endGame = () => {
    setGameActive(false)
    setCoins([])
    if (gameScore > highScore) {
      setHighScore(gameScore)
    }
  }

  const catchCoin = (coinId, points) => {
    setCoins(prev => prev.filter(c => c.id !== coinId))
    setGameScore(prev => prev + points)
  }

  // Game timer and coin spawning
  useEffect(() => {
    if (!gameActive) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive])

  // Spawn coins
  useEffect(() => {
    if (!gameActive) return

    const spawner = setInterval(() => {
      const newCoin = {
        id: Date.now() + Math.random(),
        left: Math.random() * 90 + 5,
        type: Math.random() > 0.8 ? 'gold' : Math.random() > 0.5 ? 'silver' : 'bronze',
        speed: Math.random() * 2 + 2
      }
      setCoins(prev => [...prev, newCoin])
    }, 600)

    return () => clearInterval(spawner)
  }, [gameActive])

  // Move coins
  useEffect(() => {
    if (!gameActive || coins.length === 0) return

    const mover = setInterval(() => {
      setCoins(prev => prev
        .map(coin => ({ ...coin, top: (coin.top || 0) + coin.speed }))
        .filter(coin => (coin.top || 0) < 100)
      )
    }, 50)

    return () => clearInterval(mover)
  }, [gameActive, coins.length])

  // Update confetti particles
  useEffect(() => {
    if (particles.length === 0) return
    
    const interval = setInterval(() => {
      setParticles(prev => prev
        .map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.5,
          rotation: p.rotation + p.rotationSpeed,
          opacity: (p.opacity || 1) - 0.02
        }))
        .filter(p => (p.opacity || 1) > 0)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [particles.length])

  const navItems = [
    { id: 'hero', label: 'Home', icon: '🌙' },
    { id: 'atmosphere', label: 'Atmosphere', icon: '🕌' },
    { id: 'blessings', label: 'Blessings', icon: '✨' },
    { id: 'wishes', label: 'Send Wishes', icon: '🎁' },
    { id: 'game', label: 'Play', icon: '🎮' },
    { id: 'vibes', label: 'Vibes', icon: '✨' },
    { id: 'memories', label: 'Memories', icon: '📸' },
    { id: 'ending', label: 'Ending', icon: '💫' },
  ]

  return (
    <div className="page-container">
      {/* Navigation */}
      <nav className={`main-nav ${navVisible ? 'visible' : ''}`}>
        <div className="nav-brand" onClick={() => scrollToSection('hero')}>
          <span className="nav-logo">🌙</span>
          <span className="nav-title">Eid Mubarak</span>
        </div>
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => scrollToSection(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Hero Section */}
      <section 
        id="hero"
        className="hero-section"
        onClick={handleClick}
        style={{
          transform: `perspective(1000px) rotateX(${mousePos.y * 0.02}deg) rotateY(${mousePos.x * 0.02}deg)`
        }}
      >
        <canvas ref={canvasRef} className="glow-canvas" />
        <canvas ref={fireworksCanvasRef} className="fireworks-canvas" />
        
        {/* Stars */}
        <div className="stars-container">
          {stars.map(star => (
            <div
              key={star.id}
              className="star"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
                background: star.color,
                boxShadow: star.color === '#ffd700' 
                  ? '0 0 15px #ffd700, 0 0 30px #ffd700' 
                  : '0 0 10px rgba(255, 255, 255, 0.8)'
              }}
            />
          ))}
        </div>

        {/* Shooting Stars */}
        <div className="shooting-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className="shooting-star"
              style={{ animationDelay: `${i * 4 + 2}s` }}
            />
          ))}
        </div>

        {/* Floating Lanterns */}
        <div className="lanterns-container">
          {lanterns.map(lantern => (
            <div
              key={lantern.id}
              className="lantern"
              style={{
                left: `${lantern.left}%`,
                animationDelay: `${lantern.delay}s`,
                animationDuration: `${lantern.duration}s`,
                transform: `scale(${lantern.scale})`,
                '--sway': `${lantern.swayAmount}px`
              }}
            >
              <div className="lantern-body">
                <div className="lantern-glow" />
                <div className="lantern-pattern">☪</div>
                <div className="lantern-tassel" />
              </div>
            </div>
          ))}
        </div>

        {/* Crescent Moon */}
        <div 
          className="moon-container"
          style={{
            transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`
          }}
        >
          <div className="crescent-moon">
            <div className="moon-inner" />
            <div className="moon-sparkles">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className="moon-sparkle"
                  style={{ 
                    animationDelay: `${i * 0.5}s`,
                    transform: `rotate(${i * 60}deg) translateX(70px)`
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div 
          className="hero-content"
          style={{
            transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)`
          }}
        >
          {/* Floating decorative elements around content */}
          <div className="content-decorations">
            <span className="float-decor decor-1">✨</span>
            <span className="float-decor decor-2">🌙</span>
            <span className="float-decor decor-3">⭐</span>
            <span className="float-decor decor-4">✦</span>
          </div>

          <div className="greeting-top">
            <div className="arabic-frame">
              <span className="frame-corner tl">❧</span>
              <span className="frame-corner tr">❧</span>
              <span className="arabic-calligraphy animate-in">
                عيد مبارك
              </span>
              <span className="frame-corner bl">❧</span>
              <span className="frame-corner br">❧</span>
            </div>
          </div>
          
          <h1 className="main-title">
            <span className="title-line">
              <span className="char">E</span>
              <span className="char">i</span>
              <span className="char">d</span>
            </span>
            <span className="title-line highlight">
              <span className="char">M</span>
              <span className="char">u</span>
              <span className="char">b</span>
              <span className="char">a</span>
              <span className="char">r</span>
              <span className="char">a</span>
              <span className="char">k</span>
            </span>
          </h1>
          
          <div className="subtitle-container">
            <p className="subtitle">
              <span className="word">May</span>
              <span className="word">the</span>
              <span className="word">blessings</span>
              <span className="word">of</span>
              <span className="word">Allah</span>
              <span className="word">fill</span>
              <span className="word">your</span>
              <span className="word">life</span>
              <span className="word">with</span>
              <span className="word">happiness,</span>
              <span className="word">success,</span>
              <span className="word">and</span>
              <span className="word">prosperity</span>
              <span className="word">today</span>
              <span className="word">and</span>
              <span className="word">always</span>
            </p>
          </div>

          <div className="decorative-line">
            <span className="line-dot pulse" />
            <span className="line-star spin">✦</span>
            <span className="glow-orb" />
            <span className="line-star spin-reverse">✦</span>
            <span className="line-dot pulse" />
          </div>

          <div className="blessing-card enhanced">
            <div className="card-shine" />
            <div className="card-border" />
            <div className="card-inner-glow" />
            <p className="arabic-blessing">
              تقبل الله منا ومنكم صالح الأعمال
            </p>
            <p className="english-blessing">
              "Taqabbal Allahu minna wa minkum"
            </p>
            <p className="translation">
              May Allah accept good deeds from us and from you
            </p>
          </div>

          <div className="cta-buttons enhanced">
            <button className="btn btn-primary magnetic" onClick={(e) => { e.stopPropagation(); scrollToSection('wishes'); }}>
              <span className="btn-icon float">🌙</span>
              <span className="btn-text">Create Card</span>
              <div className="btn-ripple" />
            </button>
            <button className="btn btn-secondary magnetic" onClick={(e) => { e.stopPropagation(); scrollToSection('game'); }}>
              <span className="btn-icon bounce">🎮</span>
              <span className="btn-text">Play Game</span>
            </button>
          </div>

          <div className="scroll-prompt">
            <div className="mouse-icon">
              <div className="mouse-wheel" />
            </div>
            <p className="click-hint">✨ Click anywhere for magic ✨</p>
          </div>
        </div>

        {/* Mosque Silhouette */}
        <div className="mosque-silhouette">
          <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice">
            <path d="M0,300 L0,250 Q50,200 100,250 Q150,200 200,250 L200,220 Q220,180 250,220 L250,250 L300,250 L300,200 Q320,150 350,200 L350,250 L400,250 L400,180 Q420,130 450,180 L450,250 L500,250 L500,150 Q520,100 550,150 L550,250 L600,250 L600,120 Q620,70 650,120 L650,250 L700,250 L700,200 Q720,150 750,200 L750,250 L800,250 L800,180 Q820,130 850,180 L850,250 L900,250 L900,220 Q920,180 950,220 L950,250 L1000,250 L1000,200 Q1020,150 1050,200 L1050,250 L1100,250 L1100,230 Q1120,190 1150,230 L1150,250 L1200,250 L1200,300 Z" fill="url(#mosqueGradient)" opacity="0.4"/>
            <path d="M0,300 L0,280 Q100,240 200,280 Q300,240 400,280 Q500,240 600,280 Q700,240 800,280 Q900,240 1000,280 Q1100,240 1200,280 L1200,300 Z" fill="url(#mosqueGradient2)" opacity="0.6"/>
            <defs>
              <linearGradient id="mosqueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a1a3e"/>
                <stop offset="100%" stopColor="#0f0f2e"/>
              </linearGradient>
              <linearGradient id="mosqueGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d1b69"/>
                <stop offset="100%" stopColor="#1a1a3e"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Confetti Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="confetti-particle"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              background: p.color,
              transform: `rotate(${p.rotation}deg)`,
              opacity: p.opacity || 1
            }}
          />
        ))}

        {/* Overlay gradient */}
        <div className="vignette" />
      </section>

      {/* Eid Atmosphere Section - Transition */}
      <section id="atmosphere" className="atmosphere-section">
        {/* Aurora Effect */}
        <div className="aurora-container">
          <div className="aurora aurora-1" />
          <div className="aurora aurora-2" />
          <div className="aurora aurora-3" />
        </div>

        {/* Light Rays */}
        <div className="light-rays">
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={i} 
              className="light-ray"
              style={{ 
                animationDelay: `${i * 0.3}s`,
                left: `${(i * 100) / 15}%`
              }}
            />
          ))}
        </div>

        {/* Floating Particles */}
        <div className="atmosphere-particles">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="atm-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 8}s`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`
              }}
            />
          ))}
        </div>

        {/* Fog Layers */}
        <div className="fog-container">
          <div className="fog-layer fog-1" />
          <div className="fog-layer fog-2" />
          <div className="fog-layer fog-3" />
        </div>

        {/* Sky Transition */}
        <div className="sky-transition">
          <div className="dawn-gradient" />
          <div className="sunrise-glow" />
        </div>

        {/* Golden Glow */}
        <div className="golden-glow" />

        {/* Decorative Orbs */}
        <div className="floating-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        {/* Mosque Silhouette - Larger */}
        <div className="mosque-landscape">
          <svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
            {/* Main mosque with domes and minarets */}
            <g className="mosque-detail">
              {/* Left minaret */}
              <rect x="50" y="100" width="40" height="300" fill="url(#mosqueGold)"/>
              <rect x="45" y="90" width="50" height="20" rx="5" fill="url(#mosqueGold)"/>
              <rect x="40" y="70" width="60" height="25" rx="5" fill="url(#mosqueGold)"/>
              <rect x="55" y="50" width="30" height="25" rx="15" fill="url(#mosqueGold)"/>
              
              {/* Right minaret */}
              <rect x="1350" y="100" width="40" height="300" fill="url(#mosqueGold)"/>
              <rect x="1345" y="90" width="50" height="20" rx="5" fill="url(#mosqueGold)"/>
              <rect x="1340" y="70" width="60" height="25" rx="5" fill="url(#mosqueGold)"/>
              <rect x="1355" y="50" width="30" height="25" rx="15" fill="url(#mosqueGold)"/>
              
              {/* Main dome center */}
              <path d="M600,300 L600,200 Q600,120 720,120 Q840,120 840,200 L840,300 Z" fill="url(#mosqueGold)"/>
              <rect x="700" y="80" width="40" height="50" rx="20" fill="url(#mosqueGold)"/>
              <line x1="720" y1="60" x2="720" y2="100" stroke="url(#mosqueGold)" strokeWidth="4"/>
              
              {/* Side domes */}
              <path d="M420,300 L420,220 Q420,160 500,160 Q580,160 580,220 L580,300 Z" fill="url(#mosqueGold)"/>
              <path d="M860,300 L860,220 Q860,160 940,160 Q1020,160 1020,220 L1020,300 Z" fill="url(#mosqueGold)"/>
              
              {/* Smaller domes */}
              <circle cx="300" cy="250" r="50" fill="url(#mosqueGold)"/>
              <circle cx="1140" cy="250" r="50" fill="url(#mosqueGold)"/>
              
              {/* Base structure */}
              <rect x="200" y="300" width="1040" height="100" fill="url(#mosqueBase)"/>
              
              {/* Arches */}
              <path d="M300,400 L300,330 Q330,300 360,330 L360,400" fill="url(#archGradient)"/>
              <path d="M400,400 L400,330 Q430,300 460,330 L460,400" fill="url(#archGradient)"/>
              <path d="M500,400 L500,330 Q530,300 560,330 L560,400" fill="url(#archGradient)"/>
              <path d="M880,400 L880,330 Q910,300 940,330 L940,400" fill="url(#archGradient)"/>
              <path d="M980,400 L980,330 Q1010,300 1040,330 L1040,400" fill="url(#archGradient)"/>
              <path d="M1080,400 L1080,330 Q1110,300 1140,330 L1140,400" fill="url(#archGradient)"/>
              
              {/* Main entrance */}
              <path d="M620,400 L620,320 Q720,280 820,320 L820,400" fill="url(#archGradient)"/>
            </g>
            
            <defs>
              <linearGradient id="mosqueGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a103c"/>
                <stop offset="50%" stopColor="#2d1b4e"/>
                <stop offset="100%" stopColor="#0f0a1e"/>
              </linearGradient>
              <linearGradient id="mosqueBase" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a0f3d"/>
                <stop offset="100%" stopColor="#0a0515"/>
              </linearGradient>
              <linearGradient id="archGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f0820"/>
                <stop offset="100%" stopColor="#050208"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content */}
        <div className="atmosphere-content">
          {/* Floating Lanterns */}
          <div className="floating-lanterns-small">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i}
                className="small-lantern"
                style={{
                  left: `${5 + i * 12}%`,
                  top: `${5 + Math.random() * 20}%`,
                  animationDelay: `${i * 0.6}s`,
                  animationDuration: `${10 + Math.random() * 8}s`
                }}
              >
                <div className="small-lantern-body">
                  <div className="small-lantern-glow" />
                  <div className="small-lantern-flame" />
                </div>
              </div>
            ))}
          </div>

          {/* Central Icon */}
          <div className="icon-container">
            <div className="icon-ring ring-1" />
            <div className="icon-ring ring-2" />
            <div className="icon-ring ring-3" />
            <div className="transition-icon">🕌</div>
          </div>
          
          {/* Main Title */}
          <h2 className="atmosphere-title">
            <span className="title-line-first">Welcome to</span>
            <span className="title-line-main">
              <span className="word-animate">A</span>
              <span className="word-animate">day</span>
              <span className="word-animate">of</span>
              <span className="word-animate highlight">joy</span>
            </span>
            <span className="title-line-sub">
              <span className="word-animate highlight">gratitude</span>
              <span className="separator">✦</span>
              <span className="word-animate highlight">togetherness</span>
            </span>
          </h2>

          {/* Description */}
          <div className="atmosphere-description">
            <p className="desc-line">As the crescent moon marks the end of Ramadan,</p>
            <p className="desc-line">a new dawn of celebration begins</p>
          </div>

          {/* Stats Counter */}
          <div className="eid-stats">
            <div className="stat-item">
              <span className="stat-icon">🌙</span>
              <span className="stat-number">1</span>
              <span className="stat-label">Special Day</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-icon">❤️</span>
              <span className="stat-number">∞</span>
              <span className="stat-label">Blessings</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-icon">🌍</span>
              <span className="stat-number">1.9B</span>
              <span className="stat-label">Muslims</span>
            </div>
          </div>

          {/* Elements Grid */}
          <div className="eid-elements">
            <div className="element-item">
              <div className="element-glow" />
              <span className="element-icon">🤲</span>
              <span className="element-text">Prayer</span>
            </div>
            <div className="element-item">
              <div className="element-glow" />
              <span className="element-icon">🍽️</span>
              <span className="element-text">Feast</span>
            </div>
            <div className="element-item">
              <div className="element-glow" />
              <span className="element-icon">👨‍👩‍👧‍👦</span>
              <span className="element-text">Family</span>
            </div>
            <div className="element-item">
              <div className="element-glow" />
              <span className="element-icon">🎁</span>
              <span className="element-text">Gifts</span>
            </div>
          </div>

          {/* Journey Path */}
          <div className="journey-path">
            <div className="path-line" />
            <div className="path-dots">
              <span className="path-dot active" />
              <span className="path-dot" />
              <span className="path-dot" />
              <span className="path-dot" />
            </div>
          </div>

          <div className="scroll-indicator enhanced">
            <div className="mouse">
              <div className="wheel" />
            </div>
            <span>Continue your Eid journey</span>
            <div className="scroll-arrows">
              <span>↓</span>
              <span>↓</span>
              <span>↓</span>
            </div>
          </div>
        </div>

        {/* Particle dust */}
        <div className="dust-particles">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="dust"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
      </section>

      {/* Blessings Section - Cinematic */}
      <section id="blessings" className="blessings-section">
        {/* Cursor light follower */}
        <div 
          className="cursor-light"
          style={{
            left: `${mousePos.x * 5 + 50}%`,
            top: `${mousePos.y * 5 + 50}%`
          }}
        />
        
        {/* Ambient particles */}
        <div className="ambient-particles">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="ambient-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 8}s`,
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`
              }}
            />
          ))}
        </div>

        {/* Floating lanterns */}
        <div className="blessing-lanterns">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="blessing-lantern"
              style={{
                left: `${5 + i * 12}%`,
                top: `${10 + Math.random() * 60}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${8 + Math.random() * 6}s`
              }}
            >
              <div className="lantern-glass">
                <div className="lantern-flame" />
              </div>
            </div>
          ))}
        </div>

        {/* Glass Card Container */}
        <div className="glass-container">
          <div className="glass-card">
            {/* Card glow effect */}
            <div className="card-glow" />
            
            {/* Corner decorations */}
            <div className="corner top-left">❧</div>
            <div className="corner top-right">❧</div>
            <div className="corner bottom-left">❧</div>
            <div className="corner bottom-right">❧</div>

            {/* Content */}
            <div className="card-content">
              <div className="card-icon">✨</div>
              
              <h3 className="blessing-label">Dua for Eid</h3>
              
              <div className="arabic-dua">
                <span className="word">اللَّهُمَّ</span>
                <span className="word">أَدْخِلْ</span>
                <span className="word">عَلَىٰ</span>
                <span className="word">أَهْلِ</span>
                <span className="word">هَٰذَا</span>
                <span className="word">البَيْتِ</span>
                <span className="word">البَرَكَةَ</span>
                <span className="word">وَالسَّعَادَةَ</span>
              </div>
              
              <div className="transliteration">
                <span className="word-reveal">Allahumma</span>
                <span className="word-reveal">adkhil</span>
                <span className="word-reveal">'ala</span>
                <span className="word-reveal">ahli</span>
                <span className="word-reveal">hazhal</span>
                <span className="word-reveal">bayti</span>
                <span className="word-reveal">al-barakata</span>
                <span className="word-reveal">was-sa'adah</span>
              </div>
              
              <div className="translation-dua">
                "O Allah, bring blessings and happiness to the people of this home"
              </div>

              <div className="blessing-divider">
                <span></span>
                <span className="star">✦</span>
                <span></span>
              </div>

              <div className="additional-duas">
                <div className="dua-item">
                  <span className="dua-number">1</span>
                  <p>May Allah accept your fasting and prayers</p>
                </div>
                <div className="dua-item">
                  <span className="dua-number">2</span>
                  <p>May your home be filled with joy and laughter</p>
                </div>
                <div className="dua-item">
                  <span className="dua-number">3</span>
                  <p>May this Eid bring endless blessings to you</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="bottom-glow" />
      </section>

      {/* Send Eid Wishes - VIRAL SECTION */}
      <section id="wishes" className="wishes-section">
        {/* Background Effects */}
        <div className="wishes-bg-glow" />
        <div className="floating-stars">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="wish-star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="wishes-container">
          {/* Section Header */}
          <div className="wishes-header">
            <span className="wishes-icon">🎁</span>
            <h2 className="wishes-title">Send Eid Wishes</h2>
            <p className="wishes-subtitle">Create a personalized greeting card for your loved ones</p>
          </div>

          {/* Input Section */}
          <div className="input-section">
            <div className="input-wrapper">
              <input
                type="text"
                className="name-input"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateCard()}
                maxLength={20}
              />
              <span className="input-icon">✨</span>
            </div>
            <button 
              className="generate-btn"
              onClick={generateCard}
              disabled={!name.trim() || isGenerating}
            >
              {isGenerating ? (
                <span className="generating">
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </span>
              ) : (
                <>
                  <span>Generate Card</span>
                  <span className="btn-sparkle">✨</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Card Preview */}
          {generatedCard && (
            <div className="card-preview-section">
              <div className="card-container">
                {/* The Actual Card */}
                <div ref={cardRef} className="eid-card">
                  <div className="card-inner">
                    {/* Card Border Animation */}
                    <div className="card-border-animated" />
                    
                    {/* Corner Decorations */}
                    <div className="card-corner tl">✦</div>
                    <div className="card-corner tr">✦</div>
                    <div className="card-corner bl">✦</div>
                    <div className="card-corner br">✦</div>

                    {/* Card Content */}
                    <div className="card-content-area">
                      <div className="card-moon">
                        <span className="moon-emoji">🌙</span>
                        <div className="moon-glow-card" />
                      </div>
                      
                      <div className="card-arabic">{generatedCard.arabic}</div>
                      
                      <div className="card-main-text">
                        <span className="eid-text">Eid Mubarak</span>
                        <span className="name-display">{generatedCard.name}</span>
                      </div>

                      <div className="card-stars">
                        <span>✨</span>
                        <span>⭐</span>
                        <span>✨</span>
                      </div>

                      <div className="card-message">
                        May Allah bless you with joy, prosperity, and endless happiness
                      </div>

                      <div className="card-footer">
                        <span className="heart">❤</span>
                        <span>From the heart on this blessed day</span>
                      </div>
                    </div>

                    {/* Sparkle Effects */}
                    <div className="card-sparkles">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="sparkle"
                          style={{
                            top: `${15 + Math.random() * 70}%`,
                            left: `${10 + Math.random() * 80}%`,
                            animationDelay: `${i * 0.3}s`
                          }}
                        >
                          ✨
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Share Actions */}
                <div className="share-actions">
                  <button className="action-btn download-btn" onClick={downloadCard}>
                    <span className="action-icon">📥</span>
                    <span>Download</span>
                  </button>
                  <button className="action-btn whatsapp-btn" onClick={shareToWhatsApp}>
                    <span className="action-icon">💬</span>
                    <span>Share WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sample Cards Grid */}
          {!generatedCard && (
            <div className="sample-cards">
              <p className="sample-label">Or choose a template:</p>
              <div className="sample-grid">
                {['Family', 'Friend', 'Colleague', 'Everyone'].map((type, i) => (
                  <div 
                    key={type} 
                    className="sample-card"
                    onClick={() => {
                      setName(type === 'Everyone' ? 'Everyone' : `My ${type}`)
                      setTimeout(generateCard, 100)
                    }}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="sample-moon">🌙</div>
                    <span className="sample-type">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span>Beautiful Design</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Instant Create</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span>Easy Share</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💾</span>
              <span>Download Image</span>
            </div>
          </div>
        </div>
      </section>

          {/* Eid Vibes / Culture Section */}
      <section id="vibes" className="vibes-section">
        {/* Background Effects */}
        <div className="vibes-bg-glow" />
        <div className="vibes-aurora">
          <div className="aurora-wave wave-1" />
          <div className="aurora-wave wave-2" />
          <div className="aurora-wave wave-3" />
        </div>
        <div className="floating-lanterns-vibes">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="vibe-lantern"
              style={{
                left: `${10 + i * 15}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${10 + Math.random() * 5}s`
              }}
            >
              🏮
            </div>
          ))}
        </div>

        <div className="vibes-container">
          <div className="vibes-header-enhanced">
            <div className="header-decoration left">✦</div>
            <div className="header-center">
              <div className="vibes-icon-wrapper">
                <span className="vibes-icon">✨</span>
                <div className="vibes-icon-glow" />
              </div>
              <h2 className="vibes-title-enhanced">
                <span className="title-letter">E</span>
                <span className="title-letter">i</span>
                <span className="title-letter">d</span>
                <span className="title-space"> </span>
                <span className="title-letter highlight">V</span>
                <span className="title-letter highlight">i</span>
                <span className="title-letter highlight">b</span>
                <span className="title-letter highlight">e</span>
                <span className="title-letter highlight">s</span>
              </h2>
              <p className="vibes-subtitle-enhanced">Experience the beauty of Eid celebration</p>
            </div>
            <div className="header-decoration right">✦</div>
          </div>

          <div className="vibes-grid-enhanced">
            {/* Food Card - Sheer Khurma */}
            <div className="vibe-card-enhanced" style={{ animationDelay: '0s' }}>
              <div className="card-shimmer" />
              <div className="card-3d-wrapper-enhanced">
                <div className="card-3d-enhanced">
                  <div className="card-border-glow" />
                  <div className="card-image-enhanced">
                    <div className="image-bg-pattern" />
                    <span className="card-emoji">🍜</span>
                    <div className="emoji-particles">
                      <span>✨</span>
                      <span>✨</span>
                      <span>✨</span>
                    </div>
                  </div>
                  <div className="card-info-enhanced">
                    <h3>Sheer Khurma</h3>
                    <p>Sweet vermicelli pudding with nuts, dates, and aromatic cardamom</p>
                    <div className="card-tags-enhanced">
                      <span className="tag sweet">Sweet</span>
                      <span className="tag traditional">Traditional</span>
                    </div>
                    <div className="card-hint">Hover to explore</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Biryani Card */}
            <div className="vibe-card-enhanced" style={{ animationDelay: '0.1s' }}>
              <div className="card-shimmer" />
              <div className="card-3d-wrapper-enhanced">
                <div className="card-3d-enhanced">
                  <div className="card-border-glow" />
                  <div className="card-image-enhanced">
                    <div className="image-bg-pattern" />
                    <span className="card-emoji">🍛</span>
                    <div className="emoji-particles">
                      <span>🌶️</span>
                      <span>🌿</span>
                      <span>✨</span>
                    </div>
                  </div>
                  <div className="card-info-enhanced">
                    <h3>Eid Biryani</h3>
                    <p>Aromatic rice with tender meat, saffron, and festive spices</p>
                    <div className="card-tags-enhanced">
                      <span className="tag savory">Savory</span>
                      <span className="tag festive">Festive</span>
                    </div>
                    <div className="card-hint">Hover to explore</div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Clothes Card */}
            <div className="vibe-card-enhanced" style={{ animationDelay: '0.2s' }}>
              <div className="card-shimmer" />
              <div className="card-3d-wrapper-enhanced">
                <div className="card-3d-enhanced">
                  <div className="card-border-glow" />
                  <div className="card-image-enhanced">
                    <div className="image-bg-pattern" />
                    <span className="card-emoji">👘</span>
                    <div className="emoji-particles">
                      <span>✨</span>
                      <span>👗</span>
                      <span>✨</span>
                    </div>
                  </div>
                  <div className="card-info-enhanced">
                    <h3>New Clothes</h3>
                    <p>Traditional attire, fresh outfits, and elegant celebrations</p>
                    <div className="card-tags-enhanced">
                      <span className="tag elegant">Elegant</span>
                      <span className="tag fresh">Fresh</span>
                    </div>
                    <div className="card-hint">Hover to explore</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Card */}
            <div className="vibe-card-enhanced" style={{ animationDelay: '0.3s' }}>
              <div className="card-shimmer" />
              <div className="card-3d-wrapper-enhanced">
                <div className="card-3d-enhanced">
                  <div className="card-border-glow" />
                  <div className="card-image-enhanced">
                    <div className="image-bg-pattern" />
                    <span className="card-emoji">👨‍👩‍👧‍👦</span>
                    <div className="emoji-particles">
                      <span>❤️</span>
                      <span>💕</span>
                      <span>❤️</span>
                    </div>
                  </div>
                  <div className="card-info-enhanced">
                    <h3>Family Gatherings</h3>
                    <p>Togetherness, laughter, hugs, and endless blessings</p>
                    <div className="card-tags-enhanced">
                      <span className="tag love">Love</span>
                      <span className="tag joy">Joy</span>
                    </div>
                    <div className="card-hint">Hover to explore</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Eidi Card */}
            <div className="vibe-card-enhanced" style={{ animationDelay: '0.4s' }}>
              <div className="card-shimmer" />
              <div className="card-3d-wrapper-enhanced">
                <div className="card-3d-enhanced">
                  <div className="card-border-glow" />
                  <div className="card-image-enhanced">
                    <div className="image-bg-pattern" />
                    <span className="card-emoji">🧧</span>
                    <div className="emoji-particles">
                      <span>💰</span>
                      <span>✨</span>
                      <span>💰</span>
                    </div>
                  </div>
                  <div className="card-info-enhanced">
                    <h3>Eidi Gifts</h3>
                    <p>Blessings shared with loved ones, young and old</p>
                    <div className="card-tags-enhanced">
                      <span className="tag giving">Giving</span>
                      <span className="tag blessings">Blessings</span>
                    </div>
                    <div className="card-hint">Hover to explore</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prayer Card */}
            <div className="vibe-card-enhanced" style={{ animationDelay: '0.5s' }}>
              <div className="card-shimmer" />
              <div className="card-3d-wrapper-enhanced">
                <div className="card-3d-enhanced">
                  <div className="card-border-glow" />
                  <div className="card-image-enhanced">
                    <div className="image-bg-pattern" />
                    <span className="card-emoji">🕌</span>
                    <div className="emoji-particles">
                      <span>🌙</span>
                      <span>⭐</span>
                      <span>🌙</span>
                    </div>
                  </div>
                  <div className="card-info-enhanced">
                    <h3>Eid Prayer</h3>
                    <p>Coming together in gratitude, unity, and spiritual peace</p>
                    <div className="card-tags-enhanced">
                      <span className="tag spiritual">Spiritual</span>
                      <span className="tag peace">Peace</span>
                    </div>
                    <div className="card-hint">Hover to explore</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="vibes-quote">
            <div className="quote-line left" />
            <p className="quote-text">"Eid is a time of joy, a time of togetherness, a time of gratitude"</p>
            <div className="quote-line right" />
          </div>
        </div>
      </section>


      {/* Interactive Fun Section - Catch Eidi Game */}
      <section id="game" className="game-section">
        {/* Background Effects */}
        <div className="game-bg-glow" />
        <div className="game-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="game-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        <div className="floating-coins-bg">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-coin"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            >
              {['🪙', '🥈', '🥉', '💰', '✨'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        <div className="game-container">
          <div className="game-header">
            <div className="game-icon-wrapper">
              <span className="game-icon">🎮</span>
              <div className="icon-rings">
                <span className="icon-ring" />
                <span className="icon-ring" />
                <span className="icon-ring" />
              </div>
            </div>
            <h2 className="game-title">
              <span className="title-word">Catch</span>
              <span className="title-word highlight">the</span>
              <span className="title-word">Eidi!</span>
            </h2>
            <p className="game-subtitle">Tap the falling coins to collect Eidi blessings</p>
          </div>

          <div className="game-stats-enhanced">
            <div className="stat-box-enhanced score-box">
              <div className="stat-glow" />
              <span className="stat-icon-anim">💰</span>
              <span className="stat-label">Score</span>
              <span className="stat-value">{gameScore}</span>
              <div className="stat-bar">
                <div className="stat-fill" style={{ width: `${Math.min((gameScore / 500) * 100, 100)}%` }} />
              </div>
            </div>
            <div className="stat-box-enhanced time-box">
              <div className="stat-glow" />
              <span className="stat-icon-anim">⏱️</span>
              <span className="stat-label">Time</span>
              <span className={`stat-value ${timeLeft <= 5 ? 'urgent' : ''}`}>{timeLeft}s</span>
              <div className="stat-bar">
                <div className="stat-fill time" style={{ width: `${(timeLeft / 30) * 100}%` }} />
              </div>
            </div>
            <div className="stat-box-enhanced best-box">
              <div className="stat-glow" />
              <span className="stat-icon-anim">🏆</span>
              <span className="stat-label">Best</span>
              <span className="stat-value">{highScore}</span>
              <div className="stat-bar">
                <div className="stat-fill best" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div 
            ref={gameRef}
            className="game-area-enhanced"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grid overlay */}
            <div className="game-grid">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid-line" style={{ left: `${(i + 1) * 20}%` }} />
              ))}
            </div>

            {!gameActive && gameScore === 0 && (
              <div className="game-start-screen enhanced">
                <div className="start-icon-wrapper">
                  <div className="start-icon">💸</div>
                  <div className="start-icon-glow" />
                </div>
                <h3 className="start-title">Ready to Collect Eidi?</h3>
                <p className="start-desc">Tap the falling coins before time runs out!</p>
                <button className="start-btn enhanced" onClick={startGame}>
                  <span className="btn-shine" />
                  <span className="btn-text">Start Game</span>
                  <span className="btn-icon">🎮</span>
                </button>
                <div className="coin-legend-enhanced">
                  <div className="legend-title">Coin Values</div>
                  <div className="legend-items">
                    <div className="legend-item enhanced">
                      <div className="legend-coin gold">
                        <span>🪙</span>
                        <div className="coin-glow" />
                      </div>
                      <span className="legend-value">50 pts</span>
                    </div>
                    <div className="legend-item enhanced">
                      <div className="legend-coin silver">
                        <span>🥈</span>
                        <div className="coin-glow" />
                      </div>
                      <span className="legend-value">30 pts</span>
                    </div>
                    <div className="legend-item enhanced">
                      <div className="legend-coin bronze">
                        <span>🥉</span>
                        <div className="coin-glow" />
                      </div>
                      <span className="legend-value">10 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!gameActive && gameScore > 0 && (
              <div className="game-over-screen enhanced">
                <div className="confetti-container">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="confetti-piece"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        backgroundColor: ['#ffd700', '#ff6b35', '#ffec8b', '#ffffff'][Math.floor(Math.random() * 4)]
                      }}
                    />
                  ))}
                </div>
                <div className="result-trophy">
                  <div className="result-icon">{gameScore >= 500 ? '👑' : gameScore >= 300 ? '🌟' : '🎉'}</div>
                  <div className="trophy-glow" />
                </div>
                <h3 className="result-title">{gameScore >= 500 ? 'Champion!' : gameScore >= 300 ? 'Amazing!' : 'Well Done!'}</h3>
                <p className="final-score">You collected <span className="score-highlight">{gameScore}</span> Eidi!</p>
                <div className="result-badge">
                  <span className="badge-icon">🏆</span>
                  <span className="badge-text">
                    {gameScore >= 500 ? 'Gold Collector' : gameScore >= 300 ? 'Silver Collector' : 'Bronze Collector'}
                  </span>
                </div>
                <button className="start-btn enhanced" onClick={startGame}>
                  <span className="btn-shine" />
                  <span className="btn-text">Play Again</span>
                  <span className="btn-icon">🔄</span>
                </button>
              </div>
            )}

            {gameActive && (
              <>
                {coins.map(coin => (
                  <div
                    key={coin.id}
                    className={`falling-coin-enhanced ${coin.type}`}
                    style={{
                      left: `${coin.left}%`,
                      top: `${coin.top || -10}%`
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      const points = coin.type === 'gold' ? 50 : coin.type === 'silver' ? 30 : 10
                      catchCoin(coin.id, points)
                    }}
                  >
                    <span className="coin-emoji">
                      {coin.type === 'gold' ? '🪙' : coin.type === 'silver' ? '🥈' : '🥉'}
                    </span>
                    <div className="coin-trail" />
                    <div className="coin-sparkle" />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

  
      {/* Eid Memories Section - Infinite Horizontal Scroll */}
      <section className="memories-infinite" id="memories">
        {/* Animated Background */}
        <div className="infinite-bg">
          <div className="bg-gradient-orb orb-1" />
          <div className="bg-gradient-orb orb-2" />
          <div className="bg-gradient-orb orb-3" />
        </div>

        {/* Floating Particles */}
        <div className="infinite-particles">
          {[...Array(20)].map((_, i) => (
            <span 
              key={i} 
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`
              }}
            >
              {['✨', '💫', '🌟', '⭐', '✦'][Math.floor(Math.random() * 5)]}
            </span>
          ))}
        </div>

        {/* Section Header */}
        <div className="infinite-header">
          <div className="header-line-left" />
          <div className="header-content">
            <span className="header-icon">📸</span>
            <h2 className="infinite-title">Eid Memories</h2>
            <p className="infinite-subtitle">Swipe to explore our journey</p>
          </div>
          <div className="header-line-right" />
        </div>

        {/* Infinite Scroll Track */}
        <div className="infinite-track-wrapper">
          <div className="infinite-track">
            {/* First Set */}
            {[
              { img: '🕌', title: 'Eid Prayer', desc: 'Spiritual beginnings', color: '#ffd700' },
              { img: '🍖', title: 'Family Feast', desc: 'Traditional delights', color: '#ff6b6b' },
              { img: '👨‍👩‍👧‍👦', title: 'Togetherness', desc: 'Love & laughter', color: '#4ecdc4' },
              { img: '🎁', title: 'Eidi Gifts', desc: 'Blessings shared', color: '#a855f7' },
              { img: '🎊', title: 'Celebration', desc: 'Joy unlimited', color: '#f472b6' },
              { img: '✨', title: 'Decorations', desc: 'Festive beauty', color: '#ffd93d' },
              { img: '🌙', title: 'Moon Sighting', desc: 'Eid begins', color: '#60a5fa' },
              { img: '🍰', title: 'Sweet Treats', desc: 'Sheer khurma', color: '#fb923c' },
            ].map((item, i) => (
              <div 
                key={`a-${i}`}
                className="memory-card"
                style={{ '--card-color': item.color }}
                onClick={() => setLightboxImage(item)}
              >
                <div className="card-glow" />
                <div className="card-inner">
                  <div className="card-image-wrapper">
                    <span className="card-emoji">{item.img}</span>
                    <div className="card-shine" />
                  </div>
                  <div className="card-info">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                  <div className="card-border" />
                </div>
              </div>
            ))}
            {/* Duplicate Set for Seamless Loop */}
            {[
              { img: '🕌', title: 'Eid Prayer', desc: 'Spiritual beginnings', color: '#ffd700' },
              { img: '🍖', title: 'Family Feast', desc: 'Traditional delights', color: '#ff6b6b' },
              { img: '👨‍👩‍👧‍👦', title: 'Togetherness', desc: 'Love & laughter', color: '#4ecdc4' },
              { img: '🎁', title: 'Eidi Gifts', desc: 'Blessings shared', color: '#a855f7' },
              { img: '🎊', title: 'Celebration', desc: 'Joy unlimited', color: '#f472b6' },
              { img: '✨', title: 'Decorations', desc: 'Festive beauty', color: '#ffd93d' },
              { img: '🌙', title: 'Moon Sighting', desc: 'Eid begins', color: '#60a5fa' },
              { img: '🍰', title: 'Sweet Treats', desc: 'Sheer khurma', color: '#fb923c' },
            ].map((item, i) => (
              <div 
                key={`b-${i}`}
                className="memory-card"
                style={{ '--card-color': item.color }}
                onClick={() => setLightboxImage(item)}
              >
                <div className="card-glow" />
                <div className="card-inner">
                  <div className="card-image-wrapper">
                    <span className="card-emoji">{item.img}</span>
                    <div className="card-shine" />
                  </div>
                  <div className="card-info">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                  <div className="card-border" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Controls */}
        <div className="infinite-controls">
          <button className="control-btn scroll-left">
            <span>←</span>
          </button>
          <div className="scroll-hint">
            <span className="hint-arrow">⟷</span>
            <span className="hint-text">Keep scrolling</span>
          </div>
          <button className="control-btn scroll-right">
            <span>→</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="infinite-progress">
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
        </div>

        {/* Lightbox */}
        {lightboxImage && (
          <div className="infinite-lightbox" onClick={() => setLightboxImage(null)}>
            <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setLightboxImage(null)}>✕</button>
              <div className="lightbox-glow" style={{ '--glow-color': lightboxImage.color }} />
              <div className="lightbox-image">{lightboxImage.img}</div>
              <h3>{lightboxImage.title}</h3>
              <p>{lightboxImage.desc}</p>
              <div className="lightbox-sparkles">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>✨</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Final Ending Section */}
      <section className="ending-section" id="ending">
        {/* Confetti Burst */}
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <span 
              key={i} 
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
                backgroundColor: ['#ffd700', '#ff6b9d', '#4ecdc4', '#a855f7', '#f472b6'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
        
        {/* Glow Burst */}
        <div className="glow-burst">
          <div className="burst-ring ring-1" />
          <div className="burst-ring ring-2" />
          <div className="burst-ring ring-3" />
        </div>
        
        {/* Floating Lanterns */}
        <div className="ending-lanterns">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="ending-lantern" style={{ animationDelay: `${i * 0.8}s` }}>
              🏮
            </span>
          ))}
        </div>
        
        <div className="ending-content">
          {/* Main Message */}
          <div className="ending-message">
            <span className="message-icon">🌙</span>
            <h2 className="ending-title">
              <span className="line">May your Eid be filled</span>
              <span className="line">with peace and happiness</span>
              <span className="heart">❤️</span>
            </h2>
            <p className="ending-arabic">تقبل الله منا ومنكم صالح الأعمال</p>
          </div>
          
          {/* CTA Buttons */}
          <div className="ending-cta">
            <button className="cta-btn cta-share" onClick={() => shareSite()}>
              <span className="btn-glow" />
              <span className="btn-icon">📤</span>
              <span className="btn-text">Share Site</span>
            </button>
            <button className="cta-btn cta-wishes" onClick={() => sendWishes()}>
              <span className="btn-glow" />
              <span className="btn-icon">💌</span>
              <span className="btn-text">Send Wishes</span>
            </button>
          </div>
          
          {/* Final Quote */}
          <div className="ending-quote">
            <p>"May this Eid bring you closer to your loved ones"</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="eid-footer">
        {/* Animated Rolling Circles */}
        <div className="rolling-circles-container">
          {/* Left side rolling circles */}
          <div className="rolling-circles left">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`left-${i}`}
                className="rolling-circle"
                style={{
                  animationDelay: `${i * 0.8}s`,
                  animationDuration: `${8 + i * 0.5}s`
                }}
              >
                <div className="circle-inner">
                  <span className="circle-emoji">
                    {['🌙', '⭐', '✨', '🕌', '🎊', '💫', '🌟', '✦'][i]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right side rolling circles */}
          <div className="rolling-circles right">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`right-${i}`}
                className="rolling-circle"
                style={{
                  animationDelay: `${i * 1.2}s`,
                  animationDuration: `${10 + i * 0.3}s`
                }}
              >
                <div className="circle-inner">
                  <span className="circle-emoji">
                    {['🎁', '🏮', '💰', '🎉', '🌸', '💝'][i]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating particles */}
        <div className="footer-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="footer-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Orbital rings around content */}
        <div className="orbital-rings">
          <div className="orbital-ring ring-1">
            <div className="orbit-dot dot-1">🌙</div>
            <div className="orbit-dot dot-2">⭐</div>
            <div className="orbit-dot dot-3">✨</div>
          </div>
          <div className="orbital-ring ring-2">
            <div className="orbit-dot dot-1">💫</div>
            <div className="orbit-dot dot-2">🌟</div>
          </div>
        </div>

        <div className="footer-content">
          <div className="footer-moon">🌙</div>
          <p className="footer-text">Eid Mubarak to you and your loved ones</p>
          <p className="footer-arabic">تقبل الله منا ومنكم</p>
          
          <div className="footer-decoration">
            <span>✦</span>
            <span>✨</span>
            <span>✦</span>
          </div>

          <div className="footer-signature">
            Made with ❤️ for the blessed occasion of Eid
          </div>
        </div>

        {/* Bottom wave animation */}
        <div className="footer-waves">
          <div className="wave wave-1"></div>
          <div className="wave wave-2"></div>
          <div className="wave wave-3"></div>
        </div>
      </footer>
    </div>
  )
}

export default App
