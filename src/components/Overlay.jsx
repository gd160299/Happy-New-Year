import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Countdown from './Countdown'

export default function Overlay({ phase, onCountdownComplete, audioReady, onUserInteract }) {
    const containerRef = useRef()
    const titleRef = useRef()
    const yearRef = useRef()
    const subtitleRef = useRef()
    const animated = useRef(false)

    // Animate celebration text when phase switches
    useEffect(() => {
        if (phase !== 'celebration' || animated.current) return
        animated.current = true

        const ctx = gsap.context(() => {
            const titleEl = titleRef.current
            const text = titleEl.textContent
            titleEl.textContent = ''
            const chars = []
            for (const char of text) {
                const span = document.createElement('span')
                span.textContent = char === ' ' ? '\u00A0' : char
                span.style.display = 'inline-block'
                span.style.opacity = '0'
                titleEl.appendChild(span)
                chars.push(span)
            }

            gsap.fromTo(chars,
                { opacity: 0, y: 60, scale: 0.5, rotateX: -90 },
                { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.8, stagger: 0.04, ease: 'back.out(1.7)', delay: 0.3 }
            )

            gsap.fromTo(yearRef.current,
                { opacity: 0, scale: 0, y: 30 },
                { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 1.2 }
            )

            gsap.fromTo(subtitleRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 2.0 }
            )

            gsap.to(yearRef.current, {
                textShadow: '0 0 40px rgba(255,215,0,0.9), 0 0 80px rgba(255,165,0,0.6), 0 0 120px rgba(255,100,0,0.3)',
                duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2.5,
            })
        }, containerRef)

        return () => ctx.revert()
    }, [phase])

    return (
        <div ref={containerRef} className="overlay" onClick={onUserInteract}>
            {phase === 'countdown' && (
                <Countdown onComplete={onCountdownComplete} audioReady={audioReady} />
            )}

            {phase === 'countdown' && !audioReady && (
                <div className="audio-hint">🔊 Nhấp vào để bật âm thanh</div>
            )}
            {phase === 'countdown' && audioReady && (
                <div className="audio-hint audio-ready">🔊 Âm thanh đã sẵn sàng</div>
            )}

            {phase === 'celebration' && (
                <div className="overlay-content">
                    <h1 ref={titleRef} className="title">CHÚC MỪNG NĂM MỚI</h1>
                    <div ref={yearRef} className="year">2026</div>
                    <p ref={subtitleRef} className="subtitle">
                        Chúc em một năm mới an khang thịnh vượng,<br />
                        vạn sự như ý, hạnh phúc tràn đầy! 🎆
                    </p>
                </div>
            )}
        </div>
    )
}
