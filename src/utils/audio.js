/**
 * Audio utilities — synthesised firework sounds + music player.
 */

let ctx = null

export function getAudioContext() {
    if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
}

export function unlockAudio() {
    const ac = getAudioContext()
    if (ac.state === 'suspended') ac.resume()
    const buf = ac.createBuffer(1, 1, ac.sampleRate)
    const src = ac.createBufferSource()
    src.buffer = buf
    src.connect(ac.destination)
    src.start()
    return ac
}

/* ─── Firework explosion ─── */
export function playExplosion() {
    const ac = getAudioContext()
    const duration = 0.9
    const len = ac.sampleRate * duration
    const buf = ac.createBuffer(1, len, ac.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
        const t = i / ac.sampleRate
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 6) * 0.25
    }
    const src = ac.createBufferSource()
    src.buffer = buf
    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(1200, ac.currentTime)
    lp.frequency.exponentialRampToValueAtTime(150, ac.currentTime + duration)
    const gain = ac.createGain()
    gain.gain.setValueAtTime(0.6, ac.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + duration)
    src.connect(lp).connect(gain).connect(ac.destination)
    src.start()
}

/* ─── Launch whoosh ─── */
export function playLaunch() {
    const ac = getAudioContext()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(200, ac.currentTime)
    osc.frequency.exponentialRampToValueAtTime(900, ac.currentTime + 0.45)
    gain.gain.setValueAtTime(0.03, ac.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5)
    osc.connect(gain).connect(ac.destination)
    osc.start()
    osc.stop(ac.currentTime + 0.5)
}

/* ─── Countdown tick ─── */
export function playTick(isFinal = false) {
    const ac = getAudioContext()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.frequency.value = isFinal ? 1200 : 880
    gain.gain.setValueAtTime(isFinal ? 0.15 : 0.08, ac.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2)
    osc.connect(gain).connect(ac.destination)
    osc.start()
    osc.stop(ac.currentTime + 0.2)
}

/* ─── Background music ─── */
let musicEl = null

export function playMusic() {
    if (musicEl && !musicEl.paused) return musicEl

    if (!musicEl) {
        musicEl = new Audio(import.meta.env.BASE_URL + 'happy-new-year.mp3')
        musicEl.loop = true
        musicEl.volume = 0.5
    }

    const promise = musicEl.play()
    if (promise) {
        promise.catch((err) => {
            console.warn('Music play failed:', err.message)
        })
    }
    return musicEl
}

export function stopMusic() {
    if (musicEl) { musicEl.pause(); musicEl.currentTime = 0 }
}
