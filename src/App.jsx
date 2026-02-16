import { useState, useCallback } from 'react'
import Scene from './components/Scene'
import Overlay from './components/Overlay'
import { unlockAudio, playMusic, stopMusic } from './utils/audio'

const TARGET = new Date('2026-02-17T00:00:00+07:00').getTime()

export default function App() {
  const [phase, setPhase] = useState(() => (Date.now() >= TARGET ? 'celebration' : 'countdown'))
  const [audioReady, setAudioReady] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [showPreviewBtn, setShowPreviewBtn] = useState(true)

  const ensureAudio = useCallback(() => {
    if (!audioReady) {
      unlockAudio()
      setAudioReady(true)
    }
  }, [audioReady])

  const handleUserInteract = useCallback(() => {
    ensureAudio()
  }, [ensureAudio])

  const handleCountdownComplete = useCallback(() => {
    setPhase('celebration')
    try { playMusic() } catch (e) { /* ignore */ }
  }, [])

  const togglePreview = useCallback(() => {
    ensureAudio()
    setPreviewing((prev) => {
      const next = !prev
      if (next) {
        setPhase('celebration')
        // Play music when entering preview
        setTimeout(() => { try { playMusic() } catch (e) { /* ignore */ } }, 100)
      } else {
        stopMusic()
        setPhase(Date.now() >= TARGET ? 'celebration' : 'countdown')
      }
      return next
    })
  }, [ensureAudio])

  return (
    <>
      <Scene active={phase === 'celebration'} audioReady={audioReady} />
      <Overlay
        phase={phase}
        onCountdownComplete={handleCountdownComplete}
        audioReady={audioReady}
        onUserInteract={handleUserInteract}
      />
      {showPreviewBtn && (
        <div className="preview-controls">
          <button className="preview-btn" onClick={togglePreview}>
            {previewing ? '⏪ Quay lại Countdown' : '👁 Xem trước'}
          </button>
          <button className="preview-hide-btn" onClick={() => setShowPreviewBtn(false)} title="Ẩn nút">✕</button>
        </div>
      )}
    </>
  )
}
