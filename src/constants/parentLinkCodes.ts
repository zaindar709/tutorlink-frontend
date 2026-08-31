/**
 * Demo parent-link codes for FYP panel.
 * Same pool is mirrored in parent-dashboard/src/constants/linkCodes.ts
 * so the web Parent Dashboard can resolve a student by code without backend.
 */
export type DemoParentLinkEntry = {
  code: string;
  /** Default demo student name if profile name is unavailable */
  studentName: string;
  grade: string;
  board: string;
  subjects: string[];
};

export const DEMO_PARENT_LINK_CODES: DemoParentLinkEntry[] = [
  {
    code: 'TL7K2M',
    studentName: 'Ahmed Khan',
    grade: 'Class 10',
    board: 'Federal Board',
    subjects: ['Mathematics', 'Physics'],
  },
  {
    code: 'TL9P4Q',
    studentName: 'Sara Ali',
    grade: 'Class 9',
    board: 'Punjab Board',
    subjects: ['English', 'Biology'],
  },
  {
    code: 'TL3R8W',
    studentName: 'Hassan Raza',
    grade: 'Class 8',
    board: 'Federal Board',
    subjects: ['Science', 'Urdu'],
  },
  {
    code: 'TL5N1Y',
    studentName: 'Fatima Noor',
    grade: 'Class 11',
    board: 'Federal Board',
    subjects: ['Chemistry', 'Mathematics'],
  },
  {
    code: 'TL2B6H',
    studentName: 'Usman Malik',
    grade: 'Class 7',
    board: 'Sindh Board',
    subjects: ['Mathematics', 'English'],
  },
  {
    code: 'TL8C0D',
    studentName: 'Ayesha Siddiqui',
    grade: 'Class 10',
    board: 'Federal Board',
    subjects: ['Physics', 'Computer'],
  },
  {
    code: 'TL4J9K',
    studentName: 'Bilal Ahmed',
    grade: 'Class 12',
    board: 'Punjab Board',
    subjects: ['Mathematics', 'Chemistry'],
  },
  {
    code: 'TL6M3P',
    studentName: 'Zainab Fatima',
    grade: 'Class 9',
    board: 'Federal Board',
    subjects: ['Biology', 'English'],
  },
  {
    code: 'TL1V7X',
    studentName: 'Omar Farooq',
    grade: 'Class 8',
    board: 'KPK Board',
    subjects: ['Science', 'Mathematics'],
  },
  {
    code: 'TL0Z5A',
    studentName: 'Maryam Iqbal',
    grade: 'Class 10',
    board: 'Federal Board',
    subjects: ['Urdu', 'Islamic Studies'],
  },
  {
    code: 'TLQ8E2',
    studentName: 'Daniyal Shah',
    grade: 'Class 11',
    board: 'Punjab Board',
    subjects: ['Computer', 'Physics'],
  },
  {
    code: 'TLW4T9',
    studentName: 'Hira Bashir',
    grade: 'Class 7',
    board: 'Federal Board',
    subjects: ['English', 'Science'],
  },
  {
    code: 'TLG5U1',
    studentName: 'Rayyan Hussain',
    grade: 'Class 9',
    board: 'Sindh Board',
    subjects: ['Mathematics', 'Physics'],
  },
  {
    code: 'TLF3S8',
    studentName: 'Iqra Mehmood',
    grade: 'Class 12',
    board: 'Federal Board',
    subjects: ['Chemistry', 'Biology'],
  },
  {
    code: 'TLY6N0',
    studentName: 'Suleman Tariq',
    grade: 'Class 8',
    board: 'Punjab Board',
    subjects: ['Science', 'Computer'],
  },
];

export const findDemoParentLink = (
  code: string
): DemoParentLinkEntry | undefined => {
  const normalized = String(code || '')
    .trim()
    .toUpperCase();
  return DEMO_PARENT_LINK_CODES.find(item => item.code === normalized);
};

/** Embed real student name in the shareable code: TL7K2M~Afifa */
export const PARENT_LINK_NAME_SEP = '~';

export const packParentLinkCode = (
  poolCode: string,
  studentName: string
): string => {
  const code = String(poolCode || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  const name = String(studentName || '').trim() || 'Student';
  return `${code}${PARENT_LINK_NAME_SEP}${name}`;
};

export const parseParentLinkInput = (
  raw: string
): { poolCode: string; studentName?: string } => {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return { poolCode: '' };

  const sep = trimmed.indexOf(PARENT_LINK_NAME_SEP);
  if (sep >= 0) {
    return {
      poolCode: trimmed
        .slice(0, sep)
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, ''),
      studentName: trimmed.slice(sep + 1).trim() || undefined,
    };
  }

  // Also accept "CODE Student Name" from share paste
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2 && /^TL[A-Z0-9]+$/i.test(parts[0])) {
    return {
      poolCode: parts[0].toUpperCase().replace(/[^A-Z0-9]/g, ''),
      studentName: parts.slice(1).join(' ').trim() || undefined,
    };
  }

  return {
    poolCode: trimmed.toUpperCase().replace(/[^A-Z0-9]/g, ''),
  };
};

/**
 * Resolve a typed/shared parent link code to a dashboard entry.
 * Prefer the student name embedded at generate time (e.g. TL7K2M~Afifa).
 */
export const resolveParentLink = (
  raw: string,
  opts?: { studentNameOverride?: string }
): DemoParentLinkEntry | undefined => {
  const { poolCode, studentName: embeddedName } = parseParentLinkInput(raw);
  if (!poolCode) return undefined;

  const template =
    findDemoParentLink(poolCode) ||
    DEMO_PARENT_LINK_CODES[
      Math.abs(poolCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) %
        DEMO_PARENT_LINK_CODES.length
    ];

  if (!template) return undefined;

  const studentName =
    String(opts?.studentNameOverride || '').trim() ||
    embeddedName ||
    template.studentName;

  return {
    ...template,
    code: poolCode,
    studentName,
  };
};

/** Pick a demo template code (cycles through pool). */
export const pickDemoParentLinkCode = (
  seed = Date.now()
): DemoParentLinkEntry => {
  const index = Math.abs(seed) % DEMO_PARENT_LINK_CODES.length;
  return DEMO_PARENT_LINK_CODES[index];
};

/** Issue a shareable code bound to the logged-in student name. */
export const issueParentLinkForStudent = (
  studentName: string,
  seed = Date.now()
): DemoParentLinkEntry => {
  const template = pickDemoParentLinkCode(seed);
  const name = String(studentName || '').trim() || template.studentName;
  return {
    ...template,
    studentName: name,
    /** Packed redeem code shown in UI / share sheet */
    code: packParentLinkCode(template.code, name),
  };
};