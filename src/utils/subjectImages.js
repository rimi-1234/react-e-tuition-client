import { unsplash } from './images';

/**
 * Banner photos for tuitions, picked by subject (every photo below was
 * checked to exist and to show the right subject). A tuition's own uploaded
 * photo always wins.
 */
const IMAGES = {
  math: '1509228468518-180dd4864904',
  advancedMath: '1635070041078-e363dbe005cb',
  physics: '1636466497217-26a8cbeaf0aa',
  advancedPhysics: '1507413245164-6160d8298b31',
  chemistry: '1532094349884-543bc11b234d',
  advancedChemistry: '1532187863486-abf9dbad1b69',
  biology: '1530026405186-ed1f139313f8',
  medical: '1576086213369-97a306d36557',
  english: '1455390582262-044cdead277a',
  literature: '1457369804613-52c61a468e7d',
  ielts: '1543269865-cbf427effbad',
  code: '1517694712202-14dd9538aa97',
  accounting: '1554224155-6726b3ff858f',
  statistics: '1551288049-bebda4e38f71',
  exam: '1606326608606-aa0b62935f2b',
  kids: '1588072432836-e10032774350',
  general: '1546410531-bb4caa6b424d',
};

// First match wins, so more specific keywords come first.
const RULES = [
  [/medical/, 'medical'],
  [/engineering|admission/, 'exam'],
  [/a level phys/, 'advancedPhysics'],
  [/a level chem/, 'advancedChemistry'],
  [/higher math|calculus|a level math|o level math/, 'advancedMath'],
  [/math/, 'math'],
  [/phys/, 'physics'],
  [/chem/, 'chemistry'],
  [/bio/, 'biology'],
  [/ielts|spoken/, 'ielts'],
  [/english/, 'english'],
  [/bangla|literature|global studies/, 'literature'],
  [/ict|program|computer|python/, 'code'],
  [/statistic/, 'statistics'],
  [/account|econom|finance|business/, 'accounting'],
  [/general science|science/, 'kids'],
];

const LEVEL_FALLBACK = { 'Class 1-5': 'kids', 'Class 6': 'kids', Admission: 'exam' };

export function subjectImageKey(subject = '', classLevel = '') {
  const s = subject.toLowerCase();
  const hit = RULES.find(([rx]) => rx.test(s));
  return hit?.[1] || LEVEL_FALLBACK[classLevel] || 'general';
}

/** { src, srcSet } for a tuition banner. */
export function tuitionCover(tuition, { widths = [480, 800, 1200] } = {}) {
  if (tuition?.media?.length) return { src: tuition.media[0], srcSet: undefined, uploaded: true };
  return unsplash(IMAGES[subjectImageKey(tuition?.subject, tuition?.classLevel)], { widths, quality: 70 });
}

export const BANNER_FALLBACK = '/images/study-notes.jpg';
