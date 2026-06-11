import React, { useEffect, useMemo, useState } from 'react'

const emotions = [
  { id: 'happy', name: '행복해', short: '행복', color: '#dfff4f', message: '마음이 가볍고 좋은 일이 오래 남아 있는 날이야.', action: '지금 떠오르는 사람에게 좋은 마음을 한마디 전해봐.' },
  { id: 'calm', name: '평온해', short: '평온', color: '#bde8ff', message: '아무 일도 없는 게 아니라, 마음이 편안하게 쉬고 있어.', action: '이 고요함을 좋아하는 음악 한 곡과 함께 기억해 둬.' },
  { id: 'excited', name: '신이 나', short: '신남', color: '#ffe15b', message: '기대되는 에너지가 몸 안에서 통통 튀고 있어.', action: '오늘 가장 하고 싶은 일을 10분만 먼저 시작해 봐.' },
  { id: 'loved', name: '설레어', short: '설렘', color: '#ff9fc7', message: '누군가 혹은 무언가를 향해 마음이 활짝 열렸어.', action: '설레는 이유를 한 문장으로 적어 간직해 봐.' },
  { id: 'sad', name: '속상해', short: '슬픔', color: '#9fc5ff', message: '괜찮은 척하기보다 잠깐 마음을 내려놓고 싶은 날이야.', action: '따뜻한 물을 마시고, 오늘만큼은 천천히 움직여도 돼.' },
  { id: 'angry', name: '화가 나', short: '화남', color: '#ff8d70', message: '소중한 기준이 지켜지지 않아서 마음이 신호를 보내고 있어.', action: '바로 반응하기 전에 불편했던 점을 세 단어로 적어 봐.' },
  { id: 'anxious', name: '불안해', short: '불안', color: '#c9b3ff', message: '아직 오지 않은 일을 미리 지키려 마음이 바빠진 것 같아.', action: '지금 보이는 것 3개를 천천히 말하며 현재로 돌아와 봐.' },
  { id: 'tired', name: '피곤해', short: '피곤', color: '#c9c9c9', message: '게으른 게 아니라 충전이 필요한 상태야.', action: '화면을 내려놓고 딱 5분만 눈을 감아 봐.' },
  { id: 'confused', name: '모르겠어', short: '혼란', color: '#ffc978', message: '여러 마음이 한꺼번에 와서 아직 이름을 못 붙였나 봐.', action: '결론 대신 “지금 확실한 것 하나”만 찾아 적어 봐.' },
  { id: 'proud', name: '뿌듯해', short: '뿌듯', color: '#8de5b1', message: '스스로 해낸 일을 마음이 제대로 알아봐 주고 있어.', action: '오늘 잘한 일을 아주 사소한 것까지 세어 봐.' },
  { id: 'lonely', name: '외로워', short: '외로움', color: '#aebed3', message: '혼자 있고 싶은 것과 연결되고 싶은 마음이 함께 있어.', action: '부담 없는 사람에게 이모티콘 하나를 먼저 보내 봐.' },
  { id: 'relieved', name: '안심돼', short: '안도', color: '#b9efdf', message: '긴장이 풀리면서 마음이 제자리로 돌아오는 중이야.', action: '크게 숨을 내쉬고, 무사히 지나온 나를 칭찬해 줘.' },
]

const initialRecords = {
  '2026-06-02': { emotionId: 'calm', note: '' },
  '2026-06-05': { emotionId: 'excited', note: '' },
  '2026-06-07': { emotionId: 'sad', note: '' },
  '2026-06-09': { emotionId: 'proud', note: '' },
}

const normalizeRecords = (storedRecords) => Object.fromEntries(
  Object.entries(storedRecords || initialRecords).map(([date, record]) => [
    date,
    typeof record === 'string' ? { emotionId: record, note: '' } : record,
  ]),
)

const monkeyExpressionImage = {
  happy: 0,
  calm: 1,
  excited: 2,
  loved: 3,
  sad: 6,
  angry: 7,
  anxious: 8,
  tired: 10,
  confused: 11,
  proud: 12,
  lonely: 13,
  relieved: 14,
}

function PixelCharacter({ emotionId = 'happy', className = '' }) {
  const index = Math.max(0, emotions.findIndex((emotion) => emotion.id === emotionId))
  return (
    <span
      className={`pixel-character ${className}`}
      style={{ '--character-image': `url('/assets/monkey-expressions/${monkeyExpressionImage[emotionId]}.png')` }}
      role="img"
      aria-label={emotions[index].name}
    />
  )
}

let audioCtx = null
const playBeeps = (notes) => {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const now = audioCtx.currentTime
    notes.forEach(([freq, start, length]) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now + start)
      gain.gain.exponentialRampToValueAtTime(0.08, now + start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + length)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(now + start)
      osc.stop(now + start + length + 0.02)
    })
  } catch { /* 사운드 미지원 환경에서는 조용히 무시 */ }
}

const popSound = () => playBeeps([[660, 0, 0.07], [880, 0.07, 0.09]])
const catchSound = () => playBeeps([[523, 0, 0.06], [659, 0.06, 0.06], [784, 0.12, 0.06], [1047, 0.18, 0.12]])
const winSound = () => playBeeps([[523, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.1], [1047, 0.3, 0.22], [784, 0.3, 0.22]])

function App() {
  const [view, setView] = useState('home')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState('2026-06-12')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [roomMessage, setRoomMessage] = useState('조숭이가 방을 산책하고 있어')
  const [petReaction, setPetReaction] = useState(false)
  const [hunger, setHunger] = useState(68)
  const [feedingOpen, setFeedingOpen] = useState(false)
  const [gameScore, setGameScore] = useState(0)
  const [targetPosition, setTargetPosition] = useState(0)
  const [records, setRecords] = useState(() => {
    try {
      const stored = localStorage.getItem('monkey-emotion-records')
        || localStorage.getItem('ginji-emotion-records')
      return normalizeRecords(JSON.parse(stored))
    } catch {
      return initialRecords
    }
  })

  const selected = emotions[selectedIndex]
  const todayKey = '2026-06-12'

  useEffect(() => {
    localStorage.setItem('monkey-emotion-records', JSON.stringify(records))
  }, [records])

  useEffect(() => {
    if (view !== 'game') return undefined
    const timer = window.setInterval(() => {
      setTargetPosition((current) => (current + 1 + Math.floor(Math.random() * 5)) % 6)
      popSound()
    }, 850)
    return () => window.clearInterval(timer)
  }, [view])

  const moveSelection = (amount) => {
    setSelectedIndex((current) => (current + amount + emotions.length) % emotions.length)
    setSaved(false)
  }

  const centerAction = () => {
    if (view === 'home') {
      setFeedingOpen(false)
      setView('room')
    }
    else if (view === 'room') setView('pick')
    else if (view === 'game') setView('room')
    else if (view === 'pick') setView('result')
    else if (view === 'result') saveEntry()
    else setView('home')
  }

  const saveEntry = () => {
    setRecords((current) => ({
      ...current,
      [selectedDate]: { emotionId: selected.id, note: note.trim() },
    }))
    setSaved(true)
    setView('calendar')
  }

  const chooseCalendarDate = (dateKey) => {
    setSelectedDate(dateKey)
    const record = records[dateKey]
    if (record) {
      setSelectedIndex(Math.max(0, emotions.findIndex((emotion) => emotion.id === record.emotionId)))
    }
    setSaved(false)
    setNote(record?.note || '')
    setView(record ? 'result' : 'pick')
  }

  const reactToPet = () => {
    setPetReaction(true)
    setRoomMessage('조숭이: 헤헤, 나 불렀어?')
    window.setTimeout(() => setPetReaction(false), 650)
  }

  const feedPet = (food) => {
    setHunger((current) => Math.min(100, current + food.fill))
    setPetReaction(true)
    setFeedingOpen(false)
    setRoomMessage(`조숭이가 ${food.name}을(를) 냠냠 먹었어!`)
    window.setTimeout(() => setPetReaction(false), 650)
  }

  const startGame = () => {
    setGameScore(0)
    setTargetPosition(0)
    setView('game')
  }

  const catchMole = () => {
    const nextScore = gameScore + 1
    setGameScore(nextScore)
    setTargetPosition((current) => (current + 3) % 6)
    if (nextScore >= 5) {
      winSound()
      setRoomMessage('게임 성공! 조숭이가 신이 났어!')
      window.setTimeout(() => setView('room'), 500)
    } else {
      catchSound()
    }
  }

  const screen = useMemo(() => {
    if (view === 'calendar') {
      return <Calendar records={records} onBack={() => setView('home')} onSelectDate={chooseCalendarDate} />
    }

    if (view === 'game') {
      return (
        <div className="screen-content game-screen">
          <div className="screen-topline"><span>JOSUNGI POP</span><span>{gameScore} / 5</span></div>
          <div className="mole-field">
            {Array.from({ length: 6 }, (_, index) => (
              <button
                key={index}
                className={`mole-hole ${targetPosition === index ? 'is-up' : ''}`}
                onClick={targetPosition === index ? catchMole : undefined}
                aria-label={targetPosition === index ? '나온 조숭이 잡기' : `빈 구멍 ${index + 1}`}
              >
                {targetPosition === index && <PixelCharacter emotionId="excited" className="mole-pet" />}
                <span className="hole-ground" />
              </button>
            ))}
          </div>
          <p><b>나온 조숭이를 5번 탭!</b><span>빨리 잡아봐!</span></p>
          <button className="game-exit" onClick={() => setView('room')}>그만 놀기</button>
        </div>
      )
    }

    if (view === 'room') {
      return (
        <div className="screen-content room-screen">
          <div className="screen-topline"><span>JOSUNGI'S ROOM</span><span>12:48</span></div>
          <div className="pixel-room">
            <button
              className={`roaming-pet ${petReaction ? 'is-reacting' : ''}`}
              onClick={reactToPet}
              aria-label="조숭이 쓰다듬기"
            >
              <span className="reaction-mark">{petReaction ? '♥' : '!'}</span>
              <PixelCharacter emotionId={petReaction ? 'happy' : 'calm'} />
            </button>
            {feedingOpen && (
              <div className="food-menu">
                <b>무엇을 먹을까?</b>
                <div>
                  {[
                    { id: 'rice', name: '밥', fill: 18 },
                    { id: 'apple', name: '사과', fill: 10 },
                    { id: 'cake', name: '케이크', fill: 14 },
                    { id: 'fish', name: '생선', fill: 22 },
                  ].map((food) => (
                    <button key={food.id} onClick={() => feedPet(food)}>
                      <span className={`food-icon ${food.id}`} />
                      <small>{food.name}</small>
                    </button>
                  ))}
                </div>
                <button className="food-close" onClick={() => setFeedingOpen(false)}>×</button>
              </div>
            )}
          </div>
          <div className="pet-status">
            <span>배고픔</span><i><b style={{ width: `${hunger}%` }} /></i>
            <strong>{hunger}%</strong>
          </div>
          <div className="room-caption">
            <b>{roomMessage}</b>
          </div>
          <div className="room-actions">
            <button
              type="button"
              className="feed-action"
              onClick={(event) => {
                event.stopPropagation()
                setFeedingOpen(true)
              }}
            ><span>●</span>밥 주기</button>
            <button onClick={startGame}><span>★</span>놀기</button>
            <button onClick={() => setView('pick')}><span>?</span>마음 묻기</button>
          </div>
        </div>
      )
    }

    if (view === 'pick') {
      return (
        <div className="screen-content pick-screen">
          <div className="screen-topline"><span>HOW R U?</span><span>12:48</span></div>
          <p className="step-label">{formatDate(selectedDate)}의 마음은</p>
          <div className="emotion-wheel-control">
            <button onClick={() => moveSelection(-1)} aria-label="이전 감정">◀</button>
            <PixelCharacter emotionId={selected.id} className="hero-character small" />
            <button onClick={() => moveSelection(1)} aria-label="다음 감정">▶</button>
          </div>
          <h2>{selected.name}</h2>
          <div className="emotion-dots" aria-label="감정 순서">
            {emotions.map((emotion, index) => (
              <button
                key={emotion.id}
                className={index === selectedIndex ? 'active' : ''}
                onClick={() => setSelectedIndex(index)}
                aria-label={emotion.name}
              />
            ))}
          </div>
          <p className="wheel-hint">휠의 ◀ ▶ 로 감정을 바꿔봐</p>
          <button className="emotion-select-button" onClick={() => setView('result')}>
            감정 선택하기
          </button>
        </div>
      )
    }

    if (view === 'result') {
      return (
        <div className="screen-content result-screen">
          <div className="screen-topline"><span>TRANSLATED</span><span>12:48</span></div>
          <div className="result-heading">
            <PixelCharacter emotionId={selected.id} className="result-character" />
            <div><small>조숭이의 번역</small><h2>{selected.short}</h2></div>
          </div>
          <p className="translation">“{selected.message}”</p>
          <div className="tiny-action"><b>TODAY</b>{selected.action}</div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="왜 이런 기분이 들었을까?"
            maxLength={50}
          />
          <button className="save-chip" onClick={saveEntry}>
            감정과 메모 저장하기
          </button>
        </div>
      )
    }

    return (
      <div className="screen-content home-screen">
        <div className="screen-topline"><span>JOSUNGI MOOD</span><span>12:48</span></div>
        <div className="date-chip">JUN 12 · FRI</div>
        <div className="home-character-button" aria-label="조숭이">
          <PixelCharacter emotionId={records[todayKey]?.emotionId || 'happy'} className="hero-character home-pet" />
        </div>
        <h1>조숭이와 같이<br />마음을 나눠보는 시간</h1>
        <p>오늘의 마음을 천천히 들려줘.</p>
        <button className="start-button" onClick={() => {
          setFeedingOpen(false)
          setView('room')
        }}>시작하기</button>
      </div>
    )
  }, [view, selected, selectedIndex, selectedDate, note, saved, records, roomMessage, petReaction, hunger, feedingOpen, gameScore, targetPosition])

  return (
    <main className="app-stage">
      <div className="ambient-character one"><PixelCharacter emotionId="calm" /></div>
      <div className="ambient-character two"><PixelCharacter emotionId="loved" /></div>
      <section className="device" aria-label="몽키 무드 감정 번역기">
        <div className="device-label">
          <span>josungi</span><b>mood</b>
        </div>
        <div className="display">{screen}</div>

        <div className="click-wheel">
          <button className="wheel-button menu" onClick={() => setView(view === 'calendar' ? 'home' : 'calendar')}>
            <span className="pixel-calendar" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
            <small>MOOD LOG</small>
          </button>
          <button className="wheel-button previous" onClick={() => moveSelection(-1)} aria-label="이전 감정">◀◀</button>
          <button className="wheel-button next" onClick={() => moveSelection(1)} aria-label="다음 감정">▶▶</button>
          <button className="wheel-button play" onClick={() => {
            setFeedingOpen(false)
            setView('home')
          }} aria-label="홈">■ ▶</button>
          <button className="center-button" onClick={centerAction} aria-label="선택">
            <PixelCharacter emotionId={selected.id} />
          </button>
        </div>
      </section>
      <p className="footer-note">CLICK WHEEL TO READ YOUR MOOD</p>
    </main>
  )
}

function formatDate(dateKey) {
  const day = Number(dateKey.slice(-2))
  return `6월 ${day}일`
}

function Calendar({ records, onBack, onSelectDate }) {
  const days = Array.from({ length: 30 }, (_, index) => index + 1)
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  return (
    <div className="screen-content calendar-screen">
      <div className="screen-topline"><span>MOOD LOG</span><button onClick={onBack}>CLOSE ×</button></div>
      <div className="calendar-title"><span>JUNE</span><b>2026</b></div>
      <div className="calendar-grid weekday-row">
        {weekdays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
      </div>
      <div className="calendar-grid">
        <span /><span />
        {days.map((day) => {
          const key = `2026-06-${String(day).padStart(2, '0')}`
          const record = records[key]
          const emotionId = record?.emotionId
          return (
            <button
              key={day}
              className={`calendar-day ${day === 12 ? 'today' : ''}`}
              onClick={() => onSelectDate(key)}
              aria-label={`6월 ${day}일 감정 ${record ? '수정' : '기록'}`}
            >
              {emotionId ? <PixelCharacter emotionId={emotionId} /> : <span className="day-number">{day}</span>}
            </button>
          )
        })}
      </div>
      <p className="calendar-caption">날짜를 누르면 감정과 메모를 볼 수 있어</p>
    </div>
  )
}

export default App
