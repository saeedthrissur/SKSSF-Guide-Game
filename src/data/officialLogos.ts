export type OfficialWingLogoId =
  | 'viqaya'
  | 'cyber'
  | 'majlisunnoor'
  | 'meem'
  | 'organet'
  | 'campus'
  | 'ibad'
  | 'trend'
  | 'sargalayam'
  | 'ifc'
  | 'skicr'
  | 'skimvb'
  | 'snec'
  | 'skjmcc'
  | 'albirr_preschool'
  | 'thwalaba';

export interface OfficialWingLogo {
  id: OfficialWingLogoId;
  src: string;
  label: string;
  shortLabel: string;
}

export const OFFICIAL_WING_LOGOS: Record<OfficialWingLogoId, OfficialWingLogo> = {
  viqaya: {
    id: 'viqaya',
    src: './assets/aistudio/image_bff1977a.png',
    label: 'SKSSF VIQAYA / ALERT',
    shortLabel: 'VIQAYA',
  },
  cyber: {
    id: 'cyber',
    src: './assets/aistudio/image_9b3c7d1b.png',
    label: 'CYBER WING @SKSSF',
    shortLabel: 'CYBER WING',
  },
  majlisunnoor: {
    id: 'majlisunnoor',
    src: './assets/aistudio/image_fb461716.jpeg',
    label: 'മജ്‌ലിസുന്നൂർ (Majlisunnoor)',
    shortLabel: 'മജ്‌ലിസുന്നൂർ',
  },
  meem: {
    id: 'meem',
    src: './assets/aistudio/image_947c4779.png',
    label: 'MEEM · Medical Eminence for Ethical Movement',
    shortLabel: 'MEEM',
  },
  organet: {
    id: 'organet',
    src: './assets/aistudio/image_4e4d8322.png',
    label: 'Organet · A Venture to Create Models',
    shortLabel: 'Organet',
  },
  campus: {
    id: 'campus',
    src: './assets/aistudio/image_cbdfddd1.png',
    label: 'SKSSF Campus Wing',
    shortLabel: 'Campus Wing',
  },
  ibad: {
    id: 'ibad',
    src: './assets/aistudio/image_1b89440f.png',
    label: 'Ibaad · SKSSF State Committee',
    shortLabel: 'Ibaad',
  },
  trend: {
    id: 'trend',
    src: './assets/aistudio/image_19aa05cf.png',
    label: 'TREND · Team Resource for Education & National Development',
    shortLabel: 'TREND',
  },
  sargalayam: {
    id: 'sargalayam',
    src: './assets/aistudio/image_3024f4b6.png',
    label: 'സർഗലയ (Sargalayam) · SKSSF State Committee',
    shortLabel: 'സർഗലയ',
  },
  ifc: {
    id: 'ifc',
    src: './assets/aistudio/image_529d0eac.png',
    label: 'IFC · Islamic Family Cluster',
    shortLabel: 'IFC',
  },
  skicr: {
    id: 'skicr',
    src: './assets/aistudio/image_01158fbb.png',
    label: 'SKICR · Samastha Kerala Islamic Class Room',
    shortLabel: 'SKICR',
  },
  skimvb: {
    id: 'skimvb',
    src: './assets/aistudio/image_e03981e1.png',
    label: 'SKIMVB · സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ്',
    shortLabel: 'SKIMVB',
  },
  snec: {
    id: 'snec',
    src: './assets/aistudio/image_f64a2f00.png',
    label: 'SNEC · Samastha National Education Council',
    shortLabel: 'SNEC',
  },
  skjmcc: {
    id: 'skjmcc',
    src: './assets/aistudio/image_0335cd64.png',
    label: 'SKJMCC · സമസ്ത കേരള ജംഇയ്യത്തുൽ മുഅല്ലിമീൻ (1959)',
    shortLabel: 'SKJMCC',
  },
  albirr_preschool: {
    id: 'albirr_preschool',
    src: './assets/aistudio/image_58941a41.png',
    label: 'ALBIRR Islamic Pre School (مدرسة البر الإسلامية)',
    shortLabel: 'ALBIRR',
  },
  thwalaba: {
    id: 'thwalaba',
    src: './assets/aistudio/image_6fc99749.png',
    label: 'SKSSF ത്വലബ വിംഗ് (Twalaba Wing · الطلبة)',
    shortLabel: 'ത്വലബ വിംഗ്',
  },
};

export const ALL_OFFICIAL_WING_LOGOS: OfficialWingLogo[] = [
  OFFICIAL_WING_LOGOS.viqaya,
  OFFICIAL_WING_LOGOS.cyber,
  OFFICIAL_WING_LOGOS.skicr,
  OFFICIAL_WING_LOGOS.majlisunnoor,
  OFFICIAL_WING_LOGOS.meem,
  OFFICIAL_WING_LOGOS.organet,
  OFFICIAL_WING_LOGOS.campus,
  OFFICIAL_WING_LOGOS.thwalaba,
  OFFICIAL_WING_LOGOS.ibad,
  OFFICIAL_WING_LOGOS.trend,
  OFFICIAL_WING_LOGOS.sargalayam,
  OFFICIAL_WING_LOGOS.ifc,
];

/** Map SKSSF sub-wing IDs (in level2Data.ts) to their uploaded official logos */
export const SUBWING_OFFICIAL_LOGO_MAP: Partial<Record<string, OfficialWingLogo>> = {
  viqaya: OFFICIAL_WING_LOGOS.viqaya,
  cyber: OFFICIAL_WING_LOGOS.cyber,
  meem: OFFICIAL_WING_LOGOS.meem,
  organet: OFFICIAL_WING_LOGOS.organet,
  campus: OFFICIAL_WING_LOGOS.campus,
  thwalaba: OFFICIAL_WING_LOGOS.thwalaba,
  ibad: OFFICIAL_WING_LOGOS.ibad,
  trend: OFFICIAL_WING_LOGOS.trend,
  sargalayam: OFFICIAL_WING_LOGOS.sargalayam,
  ifc: OFFICIAL_WING_LOGOS.ifc,
};

/** Map lesson IDs & mini-game keys to their corresponding official logos */
export function getOfficialLogosForLesson(lessonId: string): OfficialWingLogo[] {
  const id = lessonId.toLowerCase();
  const list: OfficialWingLogoId[] = [];

  if (id === 'l2_dispatch') {
    return ALL_OFFICIAL_WING_LOGOS;
  }
  if (id === 'l2_vault') {
    return [
      OFFICIAL_WING_LOGOS.skimvb,
      OFFICIAL_WING_LOGOS.snec,
      OFFICIAL_WING_LOGOS.skjmcc,
      OFFICIAL_WING_LOGOS.skicr,
      OFFICIAL_WING_LOGOS.albirr_preschool,
      OFFICIAL_WING_LOGOS.thwalaba,
      OFFICIAL_WING_LOGOS.cyber,
      OFFICIAL_WING_LOGOS.ifc,
    ];
  }
  if (id === 'l2_madrasa_board' || id === 'p3') {
    return [
      OFFICIAL_WING_LOGOS.skimvb,
      OFFICIAL_WING_LOGOS.skjmcc,
      OFFICIAL_WING_LOGOS.snec,
      OFFICIAL_WING_LOGOS.albirr_preschool,
    ];
  }
  if (id === 'prologue_story' || id === 'p4') {
    return [
      OFFICIAL_WING_LOGOS.trend,
      OFFICIAL_WING_LOGOS.viqaya,
      OFFICIAL_WING_LOGOS.cyber,
      OFFICIAL_WING_LOGOS.sargalayam,
    ];
  }
  if (id === 'l1_era_3') {
    return [OFFICIAL_WING_LOGOS.skimvb, OFFICIAL_WING_LOGOS.snec];
  }
  if (id === 'l1_cosmic') {
    return [OFFICIAL_WING_LOGOS.albirr_preschool, OFFICIAL_WING_LOGOS.skimvb];
  }
  if (id === 'l2_memory') {
    return [OFFICIAL_WING_LOGOS.skimvb, OFFICIAL_WING_LOGOS.skjmcc];
  }
  if (id === 'l4_sargalayam' || id === 'l2_election_roles') {
    list.push('sargalayam');
  }
  if (id === 'p0_prophet' || id === 'pov_7' || id === 'l4_viqaya_van' || id === 'l4_crisis' || id === 'l2_centres') {
    list.push('viqaya');
  }
  if (id === 'l4_cyber_shield' || id === 'l3_newsroom') {
    list.push('cyber', 'skicr');
  }
  if (id === 'storyboard') {
    list.push('cyber');
  }
  if (id === 'pov_2') {
    list.push('majlisunnoor', 'ibad');
  }
  if (id === 'l4_sahachari' || id === 'storyboard_ch3' || id === 'sb_ch3') {
    list.push('meem', 'viqaya');
  }
  if (id === 'l2_tiers' || id === 'pov_5' || id === 'l4_compass') {
    list.push('organet');
  }
  if (id === 'l4_green_earth') {
    list.push('campus');
  }
  if (id === 'l2_dawa_lanterns' || id === 'l2_dawa_age') {
    list.push('ibad', 'majlisunnoor');
  }
  if (id === 'l4_trend_career' || id === 'l3_mind_chain' || id === 'storyboard_ch2' || id === 'sb_ch2') {
    list.push('trend');
  }

  return Array.from(new Set(list)).map((k) => OFFICIAL_WING_LOGOS[k]);
}
