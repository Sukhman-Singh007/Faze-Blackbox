// Sports Quick Play — five-question rounds. The set is picked by date
// (see src/lib/quickplay.ts), so everyone gets the same five questions
// on a given day and a round never repeats a question. Each answer
// shows a short explanation and its source before moving on.

import { useEffect, useMemo, useRef, useState } from 'react'
import { pickQuestions, QP_CATEGORIES, type QPCategory } from '../lib/quickplay'
import { challengeId, challengeShareText } from '../lib/challenges'
import { copyText } from '../lib/clipboard'
import { incStat } from '../lib/stats'
import { SponsorSlot } from './SponsorSlot'

export interface QuickPlayGameProps {
  category: QPCategory
  dateStr: string
  onExit: () => void
}

export function QuickPlayGame({ category, dateStr, onExit }: QuickPlayGameProps) {
  const questions = useMemo(() => pickQuestions(category, dateStr), [category, dateStr])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [copied, setCopied] = useState(false)
  const startedRef = useRef(false)
  const finishedRef = useRef(false)

  const finished = index >= questions.length
  const q = questions[Math.min(index, questions.length - 1)]
  const label = QP_CATEGORIES.find((c) => c.id === category)?.label ?? category

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true
      incStat('qpStarts')
    }
  }, [])

  useEffect(() => {
    if (finished && !finishedRef.current) {
      finishedRef.current = true
      incStat('qpCompletions')
    }
  }, [finished])

  const handleAnswer = (i: number) => {
    if (selected !== null) return
    setSelected(i)
    const correct = i === q.answer
    if (correct) setScore((s) => s + 1)
    setAnswers((a) => [...a, correct])
  }

  const handleNext = () => {
    setSelected(null)
    setIndex((i) => i + 1)
  }

  const handleReplay = () => {
    setIndex(0)
    setSelected(null)
    setScore(0)
    setAnswers([])
    finishedRef.current = false
  }

  const handleChallenge = async () => {
    const id = challengeId({ kind: 'qp', category, date: dateStr })
    const line = `I scored ${score}/${questions.length} in Sports Quick Play (${label})!`
    const ok = await copyText(challengeShareText(line, id))
    setCopied(ok)
    window.setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 text-center">
      <p className="text-xs font-bold tracking-widest text-red-400">SPORTS QUICK PLAY</p>
      <h1 className="mt-1 text-3xl font-black">{label} — five questions</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Same five questions for everyone today ({dateStr}). Explanations after every answer.
      </p>

      {!finished ? (
        <div className="mt-6 text-left">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Question {index + 1} / {questions.length}</span>
            <span>Score: <b className="text-zinc-100">{score}</b></span>
          </div>
          <section className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-lg font-bold leading-relaxed">{q.question}</p>
            <div className="mt-4 space-y-2">
              {q.options.map((opt, i) => {
                const isAnswer = i === q.answer
                const isPicked = i === selected
                let cls = 'border-zinc-800 bg-zinc-950/60 hover:border-red-500'
                if (selected !== null) {
                  if (isAnswer) cls = 'border-green-500 bg-green-950/40'
                  else if (isPicked) cls = 'border-red-500 bg-red-950/40'
                  else cls = 'border-zinc-800 opacity-50'
                }
                return (
                  <button
                    key={i}
                    disabled={selected !== null}
                    onClick={() => handleAnswer(i)}
                    className={`block w-full rounded-xl border px-4 py-3 text-left font-bold ${cls}`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
            {selected !== null && (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <p className={`font-black ${selected === q.answer ? 'text-green-400' : 'text-red-400'}`}>
                  {selected === q.answer ? 'Correct!' : `Not quite — the answer is “${q.options[q.answer]}”.`}
                </p>
                <p className="mt-1 text-sm text-zinc-300">{q.explanation}</p>
                <p className="mt-1 text-xs text-zinc-500">Source: {q.source}</p>
                <button
                  onClick={handleNext}
                  className="mt-3 rounded-xl bg-red-600 px-5 py-2.5 font-bold hover:bg-red-500"
                >
                  {index + 1 >= questions.length ? 'See my score' : 'Next question'}
                </button>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-sm font-black tracking-widest text-green-400">ROUND COMPLETE</p>
            <p className="mt-3 text-4xl font-black">
              {score} / {questions.length}
            </p>
            <p className="mt-1 text-zinc-400">
              {label} · {dateStr}
            </p>
            <ul className="mt-4 space-y-2 text-left text-sm">
              {questions.map((qq, i) => (
                <li key={qq.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                  {answers[i] ? '✓' : '✗'} {qq.question}{' '}
                  <span className="text-zinc-500">— {qq.options[qq.answer]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button onClick={handleChallenge} className="rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500">
              {copied ? 'Challenge link copied!' : 'Challenge a Friend'}
            </button>
            <button onClick={handleReplay} className="rounded-xl border border-zinc-700 px-5 py-3 font-bold hover:border-zinc-500">
              Play again
            </button>
            <button onClick={onExit} className="rounded-xl border border-zinc-700 px-5 py-3 font-bold hover:border-zinc-500">
              Back to home
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            The link opens the same five questions for your friend — their own run, no answers in the link.
          </p>
          <SponsorSlot />
        </div>
      )}
    </div>
  )
}
