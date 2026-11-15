// Sports Quick Play — five-question rounds across NBA, NFL, soccer and
// esports. All questions live in this ONE file so new ones can be added
// regularly: copy a block, give it a unique id, keep the answer index
// pointing at the right option. Every question is original phrasing,
// checked against the public rulebooks/leagues named in its source.
//
// Rotation: the question set is picked by date (seeded shuffle), so
// everyone gets the same set on a given day, and a round never repeats
// a question.

export type QPCategory = 'nba' | 'nfl' | 'soccer' | 'esports' | 'mixed'

export const QP_CATEGORIES: { id: QPCategory; label: string }[] = [
  { id: 'nba', label: 'NBA' },
  { id: 'nfl', label: 'NFL' },
  { id: 'soccer', label: 'Soccer' },
  { id: 'esports', label: 'Esports' },
  { id: 'mixed', label: 'Mixed round' },
]

export interface QPQuestion {
  id: string
  category: Exclude<QPCategory, 'mixed'>
  question: string
  options: [string, string, string, string]
  answer: number // index into options
  explanation: string
  source: string
}

export const QUESTIONS: QPQuestion[] = [
  // ---- NBA ----
  {
    id: 'nba-1', category: 'nba',
    question: 'How many points is a free throw worth?',
    options: ['1 point', '2 points', '3 points', '4 points'],
    answer: 0,
    explanation: 'One shot from the free-throw line is worth one point.',
    source: 'NBA rulebook',
  },
  {
    id: 'nba-2', category: 'nba',
    question: 'How long is a regulation NBA game?',
    options: ['40 minutes', '48 minutes', '60 minutes', '90 minutes'],
    answer: 1,
    explanation: 'Four quarters of 12 minutes each add up to 48 minutes.',
    source: 'NBA rulebook',
  },
  {
    id: 'nba-3', category: 'nba',
    question: 'How many teams play in the NBA?',
    options: ['28', '30', '32', '36'],
    answer: 1,
    explanation: 'The league has 30 teams, split between the Eastern and Western Conferences.',
    source: 'NBA',
  },
  {
    id: 'nba-4', category: 'nba',
    question: 'How many personal fouls foul a player out of an NBA game?',
    options: ['4', '5', '6', '7'],
    answer: 2,
    explanation: 'Six personal fouls disqualify a player for the rest of the game.',
    source: 'NBA rulebook',
  },
  {
    id: 'nba-5', category: 'nba',
    question: 'Who holds the NBA career scoring record?',
    options: ['Kareem Abdul-Jabbar', 'Michael Jordan', 'LeBron James', 'Kobe Bryant'],
    answer: 2,
    explanation: 'LeBron James passed Kareem Abdul-Jabbar in February 2023.',
    source: 'NBA records',
  },
  {
    id: 'nba-6', category: 'nba',
    question: 'How many players from each team are on the court at once?',
    options: ['4', '5', '6', '7'],
    answer: 1,
    explanation: 'Basketball is played five-on-five.',
    source: 'NBA rulebook',
  },
  // ---- NFL ----
  {
    id: 'nfl-1', category: 'nfl',
    question: 'How many points is a touchdown worth?',
    options: ['3 points', '6 points', '7 points', '2 points'],
    answer: 1,
    explanation: 'A touchdown is six points; the extra-point kick after it is worth one more.',
    source: 'NFL rulebook',
  },
  {
    id: 'nfl-2', category: 'nfl',
    question: 'How many players from each team are on the field at once?',
    options: ['9', '10', '11', '12'],
    answer: 2,
    explanation: 'American football is played eleven-on-eleven.',
    source: 'NFL rulebook',
  },
  {
    id: 'nfl-3', category: 'nfl',
    question: 'How many yards does an offense need to gain for a first down?',
    options: ['5 yards', '10 yards', '15 yards', '20 yards'],
    answer: 1,
    explanation: 'Ten yards earns a new set of downs.',
    source: 'NFL rulebook',
  },
  {
    id: 'nfl-4', category: 'nfl',
    question: 'How many points is a field goal worth?',
    options: ['1 point', '2 points', '3 points', '6 points'],
    answer: 2,
    explanation: 'A kick through the uprights is three points.',
    source: 'NFL rulebook',
  },
  {
    id: 'nfl-5', category: 'nfl',
    question: 'What is the NFL championship game called?',
    options: ['The World Series', 'The Stanley Cup', 'The Super Bowl', 'The Final Four'],
    answer: 2,
    explanation: 'The Super Bowl decides the NFL champion each season.',
    source: 'NFL',
  },
  {
    id: 'nfl-6', category: 'nfl',
    question: 'How long is a regulation NFL game?',
    options: ['48 minutes', '60 minutes', '80 minutes', '90 minutes'],
    answer: 1,
    explanation: 'Four quarters of 15 minutes each add up to 60 minutes.',
    source: 'NFL rulebook',
  },
  // ---- Soccer ----
  {
    id: 'soc-1', category: 'soccer',
    question: 'How many players from each team are on the field at once?',
    options: ['9', '10', '11', '12'],
    answer: 2,
    explanation: 'Soccer is played eleven-on-eleven, including the goalkeeper.',
    source: 'FIFA Laws of the Game',
  },
  {
    id: 'soc-2', category: 'soccer',
    question: 'How long is a standard professional soccer match?',
    options: ['60 minutes', '80 minutes', '90 minutes', '120 minutes'],
    answer: 2,
    explanation: 'Two halves of 45 minutes, plus stoppage time.',
    source: 'FIFA Laws of the Game',
  },
  {
    id: 'soc-3', category: 'soccer',
    question: 'What is it called when one player scores three goals in a match?',
    options: ['A brace', 'A hat-trick', 'A treble', 'A triple'],
    answer: 1,
    explanation: 'Three goals by one player in a single match is a hat-trick.',
    source: 'FIFA',
  },
  {
    id: 'soc-4', category: 'soccer',
    question: 'How often is the FIFA World Cup held?',
    options: ['Every two years', 'Every three years', 'Every four years', 'Every five years'],
    answer: 2,
    explanation: 'The men’s World Cup is held every four years.',
    source: 'FIFA',
  },
  {
    id: 'soc-5', category: 'soccer',
    question: 'How many points does a team get for a win in most leagues?',
    options: ['1 point', '2 points', '3 points', '4 points'],
    answer: 2,
    explanation: 'Three points for a win, one for a draw, none for a loss.',
    source: 'FIFA / league rules',
  },
  {
    id: 'soc-6', category: 'soccer',
    question: 'What does FIFA stand for?',
    options: [
      'Federation of International Football Associations',
      'Fédération Internationale de Football Association',
      'Football International Federation Association',
      'Federation Internationale de Football America',
    ],
    answer: 1,
    explanation: 'FIFA is French for the International Federation of Association Football.',
    source: 'FIFA',
  },
  // ---- Esports ----
  {
    id: 'esp-1', category: 'esports',
    question: 'In League of Legends, what must a team destroy to win the game?',
    options: ['The Baron', 'The Nexus', 'The Dragon', 'The Rift Herald'],
    answer: 1,
    explanation: 'Destroying the enemy Nexus wins the game.',
    source: 'Riot Games',
  },
  {
    id: 'esp-2', category: 'esports',
    question: 'In Valorant, how many players are on each team?',
    options: ['4', '5', '6', '7'],
    answer: 1,
    explanation: 'Valorant is played five-on-five.',
    source: 'Riot Games',
  },
  {
    id: 'esp-3', category: 'esports',
    question: 'What does "GG" mean at the end of a match?',
    options: ['Great goal', 'Good game', 'Go go', 'Game guard'],
    answer: 1,
    explanation: '"GG" is short for "good game" — a sportsmanlike sign-off.',
    source: 'Esports community usage',
  },
  {
    id: 'esp-4', category: 'esports',
    question: 'In Counter-Strike 2, how many rounds does a team need to win a standard MR12 map?',
    options: ['9 rounds', '11 rounds', '13 rounds', '16 rounds'],
    answer: 2,
    explanation: 'MR12 means a maximum of 24 rounds; the first team to 13 wins the map.',
    source: 'Valve',
  },
  {
    id: 'esp-5', category: 'esports',
    question: 'In which year was FaZe Clan founded?',
    options: ['2008', '2010', '2012', '2014'],
    answer: 1,
    explanation: 'FaZe started as FaZe Sniping in May 2010.',
    source: 'FaZe Clan: A Timeline, 2010–2026 (sponsor-provided)',
  },
  {
    id: 'esp-6', category: 'esports',
    question: 'In which year was the first League of Legends World Championship held?',
    options: ['2009', '2010', '2011', '2013'],
    answer: 2,
    explanation: 'The first Worlds was held in 2011 in Jönköping, Sweden.',
    source: 'Riot Games',
  },
]

// --- Rotation: seeded shuffle, deterministic per (category, date) ---

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickQuestions(category: QPCategory, dateStr: string, count = 5): QPQuestion[] {
  const pool = category === 'mixed' ? [...QUESTIONS] : QUESTIONS.filter((q) => q.category === category)
  const rand = mulberry32(hashSeed(`${category}|${dateStr}`))
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export function questionsPerCategory(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const q of QUESTIONS) out[q.category] = (out[q.category] ?? 0) + 1
  return out
}
