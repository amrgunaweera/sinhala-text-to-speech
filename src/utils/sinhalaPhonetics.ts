// Phonetic mapping for client-side Singlish to Sinhala transliteration
// Based on Sinhala Unicode phonetic scheme (Wijesekara / phonetic transliteration)

export const SINHALA_DIACRITICS = [
  { char: '්', name: 'හල් කිරීම (Hal)' },
  { char: 'ා', name: 'ඇලපිල්ල (Alepilla)' },
  { char: 'ැ', name: 'ඇදපිල්ල (Aedapilla)' },
  { char: 'ෑ', name: 'දිග ඇදපිල්ල' },
  { char: 'ි', name: 'ඉස්පිල්ල (Ispilla)' },
  { char: 'ී', name: 'දිග ඉස්පිල්ල' },
  { char: 'ු', name: 'පාපිල්ල (Paapilla)' },
  { char: 'ූ', name: 'දිග පාපිල්ල' },
  { char: 'ෘ', name: 'ගැටය සහිත ඇලපිල්ල' },
  { char: 'ෙ', name: 'කොම්බුව (Kombuwa)' },
  { char: 'ේ', name: 'කොම්බුව සහ හල්කිරීම' },
  { char: 'ෛ', name: 'දෙකොම්බුව' },
  { char: 'ො', name: 'කොම්බුව සහ ඇලපිල්ල' },
  { char: 'ෝ', name: 'කොම්බුව, ඇලපිල්ල සහ හල්' },
  { char: 'ෞ', name: 'කොම්බුව සහ ගයනුකිත්ත' },
  { char: 'ං', name: 'අනුස්වාරය (Binduwa)' },
  { char: 'ඃ', name: 'විසර්ගය (Visargaya)' },
  { char: 'ඟ', name: 'සඤ්ඤක ග (Nga)' },
  { char: 'ඳ', name: 'සඤ්ඤක ද (Nda)' },
  { char: 'ඬ', name: 'සඤ්ඤක ඩ (Ndda)' },
  { char: 'ඹ', name: 'සඤ්ඤක බ (Mba)' },
];

export const SINHALA_VOWELS = [
  'අ', 'ආ', 'ඇ', 'ඈ', 'ඉ', 'ඊ', 'උ', 'ඌ', 'ඍ', 'එ', 'ඒ', 'ඓ', 'ඔ', 'ඕ', 'ඖ'
];

export const SINHALA_CONSONANTS = [
  'ක', 'ඛ', 'ග', 'ඝ', 'ඞ', 'ඟ',
  'ච', 'ඡ', 'ජ', 'ඣ', 'ඤ', 'ඥ', 'ඦ',
  'ට', 'ඨ', 'ඩ', 'ඪ', 'ණ', 'ඬ',
  'ත', 'ථ', 'ද', 'ධ', 'න', 'ඳ',
  'ප', 'ඵ', 'බ', 'භ', 'ම', 'ඹ',
  'ය', 'ර', 'ල', 'ව', 'ශ', 'ෂ', 'ස', 'හ', 'ළ', 'ෆ'
];

interface PhoneticRule {
  key: string;
  val: string;
}

// Ordered substitution rules for Singlish transliteration
const CONSONANT_MAP: Record<string, string> = {
  th: 'ත',
  Th: 'ථ',
  dh: 'ද',
  Dh: 'ධ',
  ch: 'ච',
  Ch: 'ඡ',
  sh: 'ශ',
  Sh: 'ෂ',
  gn: 'ඤ',
  kn: 'ඥ',
  kh: 'ඛ',
  gh: 'ඝ',
  ph: 'ඵ',
  bh: 'භ',
  jh: 'ඣ',
  nnd: 'ඬ',
  nng: 'ඟ',
  mmb: 'ඹ',
  nndh: 'ඳ',
  k: 'ක',
  g: 'ග',
  j: 'ජ',
  t: 'ට',
  T: 'ඨ',
  d: 'ඩ',
  D: 'ඪ',
  n: 'න',
  N: 'ණ',
  p: 'ප',
  b: 'බ',
  m: 'ම',
  y: 'ය',
  r: 'ර',
  l: 'ල',
  L: 'ළ',
  v: 'ව',
  w: 'ව',
  s: 'ස',
  S: 'ශ',
  h: 'හ',
  f: 'ෆ',
};

const VOWEL_DIACRITICS: Record<string, string> = {
  aa: 'ා',
  a: '',
  A: 'ා',
  ae: 'ැ',
  aae: 'ෑ',
  ii: 'ී',
  ee: 'ී',
  i: 'ි',
  I: 'ී',
  uu: 'ූ',
  oo: 'ූ',
  u: 'ු',
  U: 'ූ',
  ea: 'ේ',
  e: 'ෙ',
  E: 'ේ',
  ai: 'ෛ',
  o: 'ො',
  O: 'ෝ',
  oa: 'ෝ',
  au: 'ෞ',
  ou: 'ෞ',
};

const INDEPENDENT_VOWELS: Record<string, string> = {
  aae: 'ඈ',
  ae: 'ඇ',
  aa: 'ආ',
  A: 'ආ',
  a: 'අ',
  ii: 'ඊ',
  ee: 'ඊ',
  i: 'ඉ',
  I: 'ඊ',
  uu: 'ඌ',
  u: 'උ',
  U: 'ඌ',
  e: 'එ',
  E: 'ඒ',
  ea: 'ඒ',
  ai: 'ඓ',
  oo: 'ඕ',
  o: 'ඔ',
  O: 'ඕ',
  au: 'ඖ',
  ou: 'ඖ',
};

/**
 * Fast client-side phonetic converter for quick draft writing
 */
export function fastSinglishToSinhala(input: string): string {
  if (!input) return '';

  let res = '';
  let i = 0;
  const len = input.length;

  while (i < len) {
    const ch = input[i];

    // Preserve non-alphanumerics, spaces, existing Sinhala unicode
    if (!/[a-zA-Z]/.test(ch)) {
      res += ch;
      i++;
      continue;
    }

    // Try multi-letter consonant matches
    let matchedConsonant = '';
    let consLen = 0;
    const consCandidates = [
      input.substring(i, i + 4),
      input.substring(i, i + 3),
      input.substring(i, i + 2),
      input.substring(i, i + 1),
    ];

    for (const cand of consCandidates) {
      if (CONSONANT_MAP[cand]) {
        matchedConsonant = CONSONANT_MAP[cand];
        consLen = cand.length;
        break;
      }
    }

    if (matchedConsonant) {
      i += consLen;

      // Look for following vowel sound
      let matchedVowel = '';
      let vowLen = 0;
      const vowCandidates = [
        input.substring(i, i + 3),
        input.substring(i, i + 2),
        input.substring(i, i + 1),
      ];

      for (const cand of vowCandidates) {
        if (VOWEL_DIACRITICS[cand] !== undefined) {
          matchedVowel = VOWEL_DIACRITICS[cand];
          vowLen = cand.length;
          break;
        }
      }

      if (vowLen > 0) {
        res += matchedConsonant + matchedVowel;
        i += vowLen;
      } else {
        // No vowel immediately follows -> Hal kirima (්)
        res += matchedConsonant + '්';
      }
      continue;
    }

    // Check independent vowel
    let matchedIndVowel = '';
    let indVowLen = 0;
    const indCandidates = [
      input.substring(i, i + 3),
      input.substring(i, i + 2),
      input.substring(i, i + 1),
    ];

    for (const cand of indCandidates) {
      if (INDEPENDENT_VOWELS[cand]) {
        matchedIndVowel = INDEPENDENT_VOWELS[cand];
        indVowLen = cand.length;
        break;
      }
    }

    if (matchedIndVowel) {
      res += matchedIndVowel;
      i += indVowLen;
      continue;
    }

    // Fallback: append as is
    res += ch;
    i++;
  }

  return res;
}
