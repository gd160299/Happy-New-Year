import { useState, useEffect, useRef } from 'react'
import { playTick } from '../utils/audio'

const TARGET = new Date('2026-02-17T00:00:00+07:00').getTime()

export default function Countdown({ onComplete, audioReady }) {
    const [diff, setDiff] = useState(() => Math.max(0, TARGET - Date.now()))
    const prevSec = useRef(null)

    useEffect(() => {
        if (diff <= 0) { onComplete(); return }
        const id = setInterval(() => {
            const d = Math.max(0, TARGET - Date.now())
            setDiff(d)
            if (d <= 0) { clearInterval(id); onComplete() }
        }, 100)
        return () => clearInterval(id)
    }, []) // eslint-disable-line

    // Tick sound for last 10 seconds
    const sec = Math.ceil(diff / 1000)
    useEffect(() => {
        if (!audioReady) return
        if (sec <= 10 && sec > 0 && sec !== prevSec.current) {
            playTick(sec === 1)
            prevSec.current = sec
        }
    }, [sec, audioReady])

    if (diff <= 0) return null

    const hours = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    const secs = Math.floor((diff % 60000) / 1000)
    const pad = (n) => String(n).padStart(2, '0')

    const isLast10 = sec <= 10

    return (
        <div className="countdown-container">
            {isLast10 ? (
                <div className="countdown-big" key={sec}>{sec}</div>
            ) : (
                <>
                    <div className="countdown-label">COUNTDOWN TO NEW YEAR 🎆</div>
                    <div className="countdown-timer">
                        {pad(hours)} : {pad(mins)} : {pad(secs)}
                    </div>
                    <div className="countdown-date">17 / 02 / 2026 — 00:00:00</div>
                </>
            )}
        </div>
    )
}
