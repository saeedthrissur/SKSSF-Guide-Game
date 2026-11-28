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
  | 'thwalaba'
  | 'sathyadhara'
  | 'isthiqama'
  | 'maneesha'
  | 'sahachari'
  | 'isa'
  | 'samastha_elearning'
  | 'smf'
  | 'cswc'
  | 'asmi'
  | 'samastha_magazines'
  | 'suprabhaatham'
  | 'sic'
  | 'skjq'
  | 'slc'
  | 'spc'
  | 'skmma';

export interface OfficialWingLogo {
  id: OfficialWingLogoId;
  src: string;
  label: string;
  shortLabel: string;
}

export const OFFICIAL_WING_LOGOS: Record<OfficialWingLogoId, OfficialWingLogo> = {
  viqaya: {
    id: 'viqaya',
    src: './assets/illustrations/image_bff1977a.webp',
    label: 'SKSSF VIQAYA / ALERT',
    shortLabel: 'VIQAYA',
  },
  cyber: {
    id: 'cyber',
    src: './assets/illustrations/image_9b3c7d1b.webp',
    label: 'CYBER WING @SKSSF',
    shortLabel: 'CYBER WING',
  },
  majlisunnoor: {
    id: 'majlisunnoor',
    src: './assets/illustrations/image_fb461716.jpeg',
    label: 'മജ്‌ലിസുന്നൂർ (Majlisunnoor)',
    shortLabel: 'മജ്‌ലിസുന്നൂർ',
  },
  meem: {
    id: 'meem',
    src: './assets/illustrations/image_947c4779.webp',
    label: 'MEEM · Medical Eminence for Ethical Movement',
    shortLabel: 'MEEM',
  },
  organet: {
    id: 'organet',
    src: './assets/illustrations/image_4e4d8322.png',
    label: 'Organet · A Venture to Create Models',
    shortLabel: 'Organet',
  },
  campus: {
    id: 'campus',
    src: './assets/illustrations/image_cbdfddd1.png',
    label: 'SKSSF Campus Wing',
    shortLabel: 'Campus Wing',
  },
  ibad: {
    id: 'ibad',
    src: './assets/illustrations/image_1b89440f.png',
    label: 'Ibaad · SKSSF State Committee',
    shortLabel: 'Ibaad',
  },
  trend: {
    id: 'trend',
    src: './assets/illustrations/image_19aa05cf.png',
    label: 'TREND · Team Resource for Education & National Development',
    shortLabel: 'TREND',
  },
  sargalayam: {
    id: 'sargalayam',
    src: './assets/illustrations/image_3024f4b6.png',
    label: 'സർഗലയ (Sargalayam) · SKSSF State Committee',
    shortLabel: 'സർഗലയ',
  },
  ifc: {
    id: 'ifc',
    src: './assets/illustrations/image_529d0eac.png',
    label: 'IFC · Islamic Family Cluster',
    shortLabel: 'IFC',
  },
  skicr: {
    id: 'skicr',
    src: './assets/illustrations/image_01158fbb.png',
    label: 'SKICR · Samastha Kerala Islamic Class Room',
    shortLabel: 'SKICR',
  },
  skimvb: {
    id: 'skimvb',
    src: './assets/illustrations/image_e03981e1.png',
    label: 'SKIMVB · സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ്',
    shortLabel: 'SKIMVB',
  },
  snec: {
    id: 'snec',
    src: './assets/illustrations/image_f64a2f00.png',
    label: 'SNEC · Samastha National Education Council',
    shortLabel: 'SNEC',
  },
  skjmcc: {
    id: 'skjmcc',
    src: './assets/illustrations/image_0335cd64.png',
    label: 'SKJMCC · സമസ്ത കേരള ജംഇയ്യത്തുൽ മുഅല്ലിമീൻ (1959)',
    shortLabel: 'SKJMCC',
  },
  albirr_preschool: {
    id: 'albirr_preschool',
    src: './assets/illustrations/image_58941a41.webp',
    label: 'ALBIRR Islamic Pre School (مَدْرَسَةُ الْبِرِّ الْإِسْلَامِيَّةُ)',
    shortLabel: 'ALBIRR',
  },
  thwalaba: {
    id: 'thwalaba',
    src: './assets/illustrations/image_6fc99749.webp',
    label: 'SKSSF ത്വലബ വിംഗ് (Twalaba Wing · الطَّلَبَةُ)',
    shortLabel: 'ത്വലബ വിംഗ്',
  },
  sathyadhara: {
    id: 'sathyadhara',
    src: './assets/illustrations/image_a722d7c1.jpeg',
    label: 'സത്യധാര ദ്വൈവാരിക (Sathyadhara Fortnightly)',
    shortLabel: 'സത്യധാര',
  },
  isthiqama: {
    id: 'isthiqama',
    src: './assets/illustrations/image_da9db877.jpeg',
    label: 'SKSSF ഇസ്തിഖാമ (Isthiqama · الِاسْتِقَامَةُ)',
    shortLabel: 'ഇസ്തിഖാമ',
  },
  maneesha: {
    id: 'maneesha',
    src: './assets/illustrations/image_fcca636a.jpeg',
    label: 'SKSSF മനീഷ (Maneesha)',
    shortLabel: 'മനീഷ',
  },
  sahachari: {
    id: 'sahachari',
    src: './assets/illustrations/image_7cf7f156.jpeg',
    label: 'സഹചാരി SKSSF റിലീഫ് സെൽ (Sahachari Relief Cell)',
    shortLabel: 'സഹചാരി',
  },
  isa: {
    id: 'isa',
    src: './assets/illustrations/image_bad0c499.jpeg',
    label: 'ISA · Islamic Sahithya Academy (SKSSF)',
    shortLabel: 'ISA',
  },
  samastha_elearning: {
    id: 'samastha_elearning',
    src: './assets/illustrations/image_9c27ac58.png',
    label: 'സമസ്ത ഇ-ലേണിംഗ് (Samastha E-Learning)',
    shortLabel: 'ഇ-ലേണിംഗ്',
  },
  smf: {
    id: 'smf',
    src: './assets/illustrations/image_9a278b9b.jpeg',
    label: 'SMF · സമസ്ത കേരള സുന്നി മഹല്ല് ഫെഡറേഷൻ (1976)',
    shortLabel: 'SMF',
  },
  cswc: {
    id: 'cswc',
    src: './assets/illustrations/image_c1bda163.jpeg',
    label: 'CSWC · കൗൺസിൽ ഓഫ് സമസ്ത വിമൻസ് കോളേജസ്',
    shortLabel: 'CSWC',
  },
  asmi: {
    id: 'asmi',
    src: './assets/illustrations/image_07511eec.jpeg',
    label: 'ASMI · അസോസിയേഷൻ ഓഫ് സമസ്ത മൈനോറിറ്റി ഇൻസ്റ്റിറ്റ്യൂഷൻസ്',
    shortLabel: 'ASMI',
  },
  samastha_magazines: {
    id: 'samastha_magazines',
    src: './assets/illustrations/image_71a32d40.jpeg',
    label: 'സന്തുഷ്ട കുടുംബം · കുരുന്നുകൾ · അൽ-മുഅല്ലിം മാസികകൾ',
    shortLabel: 'സമസ്ത മാസികകൾ',
  },
  suprabhaatham: {
    id: 'suprabhaatham',
    src: './assets/illustrations/image_f07ebfa0.jpeg',
    label: 'സുപ്രഭാതം ദിനപത്രം (Suprabhaatham Daily)',
    shortLabel: 'സുപ്രഭാതം',
  },
  sic: {
    id: 'sic',
    src: './assets/illustrations/image_612066df.jpeg',
    label: 'SIC · സമസ്ത ഇസ്‌ലാമിക് സെന്റർ',
    shortLabel: 'SIC',
  },
  skjq: {
    id: 'skjq',
    src: './assets/official/logo_skjq.png',
    label: 'SKJQ · സമസ്ത കേരള ജംഇയ്യത്തുൽ ഖുത്വബാഅ്',
    shortLabel: 'SKJQ',
  },
  slc: {
    id: 'slc',
    src: './assets/official/logo_slc.png',
    label: 'SLC · സമസ്ത ലീഗൽ സെൽ',
    shortLabel: 'SLC',
  },
  spc: {
    id: 'spc',
    src: './assets/official/logo_spc.png',
    label: 'SPC · സമസ്ത പ്രവാസി സെൽ',
    shortLabel: 'SPC',
  },
  skmma: {
    id: 'skmma',
    src: './assets/official/logo_skmma.png',
    label: 'SKMMA · സമസ്ത കേരള മദ്രസാ മാനേജ്മെന്റ് അസോസിയേഷൻ',
    shortLabel: 'SKMMA',
  },
};

export const ALL_OFFICIAL_WING_LOGOS: OfficialWingLogo[] = [
  OFFICIAL_WING_LOGOS.viqaya,
  OFFICIAL_WING_LOGOS.sahachari,
  OFFICIAL_WING_LOGOS.cyber,
  OFFICIAL_WING_LOGOS.skicr,
  OFFICIAL_WING_LOGOS.sathyadhara,
  OFFICIAL_WING_LOGOS.majlisunnoor,
  OFFICIAL_WING_LOGOS.isthiqama,
  OFFICIAL_WING_LOGOS.maneesha,
  OFFICIAL_WING_LOGOS.meem,
  OFFICIAL_WING_LOGOS.organet,
  OFFICIAL_WING_LOGOS.campus,
  OFFICIAL_WING_LOGOS.thwalaba,
  OFFICIAL_WING_LOGOS.ibad,
  OFFICIAL_WING_LOGOS.trend,
  OFFICIAL_WING_LOGOS.sargalayam,
  OFFICIAL_WING_LOGOS.ifc,
  OFFICIAL_WING_LOGOS.isa,
];

/** Map SKSSF sub-wing IDs (in level2Data.ts) to their uploaded official logos */
export const SUBWING_OFFICIAL_LOGO_MAP: Partial<Record<string, OfficialWingLogo>> = {
  viqaya: OFFICIAL_WING_LOGOS.viqaya,
  sahachari: OFFICIAL_WING_LOGOS.sahachari,
  cyber: OFFICIAL_WING_LOGOS.cyber,
  sathyadhara: OFFICIAL_WING_LOGOS.sathyadhara,
  isthiqama: OFFICIAL_WING_LOGOS.isthiqama,
  maneesha: OFFICIAL_WING_LOGOS.maneesha,
  meem: OFFICIAL_WING_LOGOS.meem,
  organet: OFFICIAL_WING_LOGOS.organet,
  campus: OFFICIAL_WING_LOGOS.campus,
  thwalaba: OFFICIAL_WING_LOGOS.thwalaba,
  ibad: OFFICIAL_WING_LOGOS.ibad,
  trend: OFFICIAL_WING_LOGOS.trend,
  sargalayam: OFFICIAL_WING_LOGOS.sargalayam,
  ifc: OFFICIAL_WING_LOGOS.ifc,
  forward_isa: OFFICIAL_WING_LOGOS.isa,
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
      OFFICIAL_WING_LOGOS.samastha_elearning,
      OFFICIAL_WING_LOGOS.snec,
      OFFICIAL_WING_LOGOS.cswc,
      OFFICIAL_WING_LOGOS.asmi,
      OFFICIAL_WING_LOGOS.suprabhaatham,
      OFFICIAL_WING_LOGOS.samastha_magazines,
      OFFICIAL_WING_LOGOS.sathyadhara,
    ];
  }
  if (id === 'l2_madrasa_board' || id === 'p3') {
    return [
      OFFICIAL_WING_LOGOS.skimvb,
      OFFICIAL_WING_LOGOS.samastha_elearning,
      OFFICIAL_WING_LOGOS.skjmcc,
      OFFICIAL_WING_LOGOS.snec,
      OFFICIAL_WING_LOGOS.cswc,
      OFFICIAL_WING_LOGOS.asmi,
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
    return [OFFICIAL_WING_LOGOS.skimvb, OFFICIAL_WING_LOGOS.skjmcc, OFFICIAL_WING_LOGOS.smf];
  }
  if (id === 'l4_sargalayam' || id === 'l2_election_roles') {
    list.push('sargalayam');
  }
  if (id === 'p0_prophet' || id === 'pov_7' || id === 'l4_viqaya_van' || id === 'l4_crisis') {
    list.push('viqaya');
  }
  if (id === 'l2_centres') {
    list.push('smf', 'sic', 'viqaya');
  }
  if (id === 'l4_climb') {
    list.push('sic');
  }
  if (id === 'l4_cyber_shield' || id === 'l3_newsroom') {
    list.push('suprabhaatham', 'cyber', 'sathyadhara', 'skicr');
  }
  if (id === 'l4_media_youtube_hub') {
    list.push('suprabhaatham', 'samastha_magazines', 'skicr');
  }
  if (id === 'storyboard') {
    list.push('cyber');
  }
  if (id === 'pov_2') {
    list.push('majlisunnoor', 'ibad');
  }
  if (id === 'l4_sahachari' || id === 'storyboard_ch3' || id === 'sb_ch3') {
    list.push('sahachari', 'meem', 'viqaya');
  }
  if (id === 'l2_tiers' || id === 'pov_5' || id === 'l4_compass') {
    list.push('organet');
  }
  if (id === 'l4_green_earth') {
    list.push('campus');
  }
  if (id === 'l2_dawa_lanterns' || id === 'l2_dawa_age') {
    list.push('ibad', 'isthiqama', 'smf');
  }
  if (id === 'l4_samastha_portals') {
    list.push('samastha_elearning', 'cswc', 'asmi', 'snec');
  }
  if (id === 'l4_trend_career' || id === 'l3_mind_chain' || id === 'storyboard_ch2' || id === 'sb_ch2') {
    list.push('trend');
  }

  return Array.from(new Set(list)).map((k) => OFFICIAL_WING_LOGOS[k]);
}

export type LogoGuideCategory = 'flags' | 'skssf_wings' | 'samastha_boards' | 'media_community';

export interface OfficialLogoGuideEntry {
  id: string;
  src: string;
  shortLabel: string;
  title: string;
  category: LogoGuideCategory;
  categoryLabelMl: string;
  summaryMl: string;
  highlightsMl: string[];
  logoId?: OfficialWingLogoId;
  relatedLinkIds: string[];
}

export const OFFICIAL_LOGO_GUIDE_CATEGORIES: {
  id: LogoGuideCategory | 'all';
  label: string;
}[] = [
  { id: 'all', label: 'എല്ലാം (35)' },
  { id: 'flags', label: 'ഔദ്യോഗിക കൊടികൾ' },
  { id: 'skssf_wings', label: 'SKSSF വിംഗുകൾ' },
  { id: 'samastha_boards', label: 'സമസ്ത വിദ്യാഭ്യാസം' },
  { id: 'media_community', label: 'മീഡിയ & ഘടകങ്ങൾ' },
];

export const OFFICIAL_LOGO_GUIDE_ITEMS: OfficialLogoGuideEntry[] = [
  {
    id: 'flag_samastha',
    src: './assets/illustrations/image_376c67eb.png',
    shortLabel: 'സമസ്ത (SKJU)',
    title: 'സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ ഔദ്യോഗിക പതാക',
    category: 'flags',
    categoryLabelMl: 'മാതൃസംഘടന · 1926',
    summaryMl:
      '1926 ജൂൺ 26-ന് കോഴിക്കോട് രൂപീകൃതമായ അഹ്ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ ആധികാരിക പണ്ഡിത സഭയുടെ ഔദ്യോഗിക പതാക.',
    highlightsMl: [
      'നൂറ്റാണ്ടിലേറെയായി ഇസ്‌ലാമിക വിദ്യാഭ്യാസത്തിനും സമാധാനത്തിനും നേതൃത്വം നൽകുന്നു.',
      'SKIMVB, SYS, SKSSF, SMF, SKSBV ഉൾപ്പെടെ 14 പോഷക സംഘടനകളുടെ മാതൃപ്രസ്ഥാനം.',
    ],
    relatedLinkIds: ['skju_web', 'skju_org_list', 'skju_yt', 'skju_centenary_ig'],
  },
  {
    id: 'flag_skssf',
    src: './assets/illustrations/image_26225796.png',
    shortLabel: 'SKSSF പതാക',
    title: 'സമസ്ത കേരള സുന്നി സ്റ്റുഡന്റ്സ് ഫെഡറേഷൻ (SKSSF · 1989)',
    category: 'flags',
    categoryLabelMl: 'വിദ്യാർത്ഥി പ്രസ്ഥാനം · 1989',
    summaryMl:
      '“വിജ്ഞാനം · വിനയം · സേവനം” എന്ന മുദ്രാവാക്യവുമായി 1989 ഫെബ്രുവരി 19-ന് രൂപീകൃതമായ വിദ്യാർത്ഥി പ്രസ്ഥാനത്തിന്റെ ഔദ്യോഗിക പതാക.',
    highlightsMl: [
      'യൂണിറ്റ് മുതൽ സ്റ്റേറ്റ്, നാഷണൽ, വിദേശ ഘടകങ്ങൾ വരെ വ്യാപിച്ച സംഘടനാ സംവിധാനം.',
      'വിദ്യാഭ്യാസം, കാരുണ്യം, മീഡിയ, പരിസ്ഥിതി, ആത്മീയ മേഖലകളിൽ 17 സബ് വിംഗുകൾ.',
    ],
    relatedLinkIds: ['skssf_web', 'skssf_ig', 'skssf_fb', 'skssf_x', 'skssf_yt', 'sathyadhara_site'],
  },
  {
    id: 'flag_sksbv',
    src: './assets/illustrations/image_6f3b1f1a.png',
    shortLabel: 'SKSBV പതാക',
    title: 'സമസ്ത കേരള സുന്നി ബാല വേദി (SKSBV · 1993)',
    category: 'flags',
    categoryLabelMl: 'ബാലവേദി · 1993',
    summaryMl:
      'മദ്രസാ വിദ്യാർത്ഥികളിൽ ചെറുപ്രായത്തിൽ തന്നെ ധാർമ്മിക മൂല്യങ്ങളും കലാ-സാഹിത്യ-നേതൃത്വ കഴിവുകളും വളർത്തുന്ന സമസ്തയുടെ ബാലവിഭാഗം.',
    highlightsMl: [
      'മദ്രസാ തലത്തിൽ ബാലസഭകൾ, സർഗ്ഗമേളകൾ, പഠന ക്യാമ്പുകൾ എന്നിവ സംഘടിപ്പിക്കുന്നു.',
      'കുട്ടികളെ നല്ല സ്വഭാവത്തിലും അറിവിലും വളർത്തുന്ന ആദ്യ സംഘടനാ കളരി.',
    ],
    relatedLinkIds: ['sksbv_web', 'sksbv_ig', 'sksbv_fb', 'sksbv_yt'],
  },
  {
    id: 'guide_viqaya',
    src: OFFICIAL_WING_LOGOS.viqaya.src,
    shortLabel: 'വിഖായ (VIQAYA)',
    title: 'SKSSF വിഖായ · സന്നദ്ധ സേവന വിഭാഗം',
    category: 'skssf_wings',
    categoryLabelMl: 'സേവന വിഭാഗം',
    summaryMl:
      'പ്രളയം, അപകടം, രോഗീ പരിചരണം, രക്തദാനം തുടങ്ങിയ അടിയന്തര ഘട്ടങ്ങളിൽ ജാതി-മത ഭേദമന്യേ ഓടിയെത്തുന്ന സന്നദ്ധ സേന.',
    highlightsMl: [
      'ആംബുലൻസ്, ദുരന്ത നിവാരണ പരിശീലനം, സൗജന്യ ഹെൽപ്പ് ഡെസ്കുകൾ.',
      'പൊതുസമ്മേളനങ്ങളിലും ആശുപത്രികളിലും സദാസന്നദ്ധരായ വളണ്ടിയർമാർ.',
    ],
    logoId: 'viqaya',
    relatedLinkIds: ['viqaya_web', 'viqaya_skssf_page', 'viqaya_fb', 'sahachari_web'],
  },
  {
    id: 'guide_cyber',
    src: OFFICIAL_WING_LOGOS.cyber.src,
    shortLabel: 'സൈബർ വിംഗ്',
    title: 'SKSSF Cyber Wing · ഡിജിറ്റൽ മീഡിയ & ബോധവൽക്കരണം',
    category: 'skssf_wings',
    categoryLabelMl: 'ഡിജിറ്റൽ & മീഡിയ',
    summaryMl:
      'സോഷ്യൽ മീഡിയയിൽ സത്യസന്ധമായ വിവരങ്ങൾ പ്രചരിപ്പിക്കുകയും വ്യാജവാർത്തകൾക്കും സൈബർ തട്ടിപ്പുകൾക്കുമെതിരെ ബോധവൽക്കരണം നടത്തുകയും ചെയ്യുന്നു.',
    highlightsMl: [
      'സൈബർ മര്യാദ, ഫാക്ട് ചെക്കിംഗ്, സുരക്ഷിത ഡിജിറ്റൽ ഉപയോഗം എന്നിവയിൽ പരിശീലനം.',
      'CYCON പോലുള്ള ഡിജിറ്റൽ കോൺക്ലേവുകളും മീഡിയ ക്യാമ്പയിനുകളും.',
    ],
    logoId: 'cyber',
    relatedLinkIds: ['cyber_web', 'cyber_yt'],
  },
  {
    id: 'guide_trend',
    src: OFFICIAL_WING_LOGOS.trend.src,
    shortLabel: 'ട്രെൻഡ് (TREND)',
    title: 'TREND · വിദ്യാഭ്യാസവും കരിയർ മാർഗ്ഗനിർദ്ദേശവും',
    category: 'skssf_wings',
    categoryLabelMl: 'വിദ്യാഭ്യാസം & കരിയർ',
    summaryMl:
      'വിദ്യാർത്ഥികൾക്ക് ഉന്നത പഠനം, സിവിൽ സർവീസ്, സ്കോളർഷിപ്പുകൾ, കരിയർ തിരഞ്ഞെടുപ്പ് എന്നിവയിൽ വഴികാട്ടുന്ന വിംഗ്.',
    highlightsMl: [
      'പ്ലസ് ടു, ഡിഗ്രി, പ്രൊഫഷണൽ കോഴ്സ് അഡ്മിഷൻ ഹെൽപ്പ് ഡെസ്കുകൾ.',
      'സിവിൽ സർവീസ് & മത്സര പരീക്ഷാ പരിശീലന പരിപാടികൾ.',
    ],
    logoId: 'trend',
    relatedLinkIds: ['trend_web', 'trend_skssf', 'trend_yt'],
  },
  {
    id: 'guide_campus',
    src: OFFICIAL_WING_LOGOS.campus.src,
    shortLabel: 'ക്യാമ്പസ് വിംഗ്',
    title: 'SKSSF Campus Wing · സ്കൂൾ & കോളേജ് വിദ്യാർത്ഥികൾ',
    category: 'skssf_wings',
    categoryLabelMl: 'ക്യാമ്പസ് കൂട്ടായ്മ',
    summaryMl:
      'ഹയർ സെക്കൻഡറി, കോളേജ്, യൂണിവേഴ്സിറ്റി ക്യാമ്പസുകളിൽ ധാർമ്മിക മൂല്യങ്ങളും ലഹരിവിരുദ്ധ സന്ദേശവും സൗഹൃദവും വളർത്തുന്നു.',
    highlightsMl: [
      'ക്യാമ്പസ് പഠന ക്യാമ്പുകൾ, ലഹരി വിരുദ്ധ-പരിസ്ഥിതി സൗഹൃദ പദ്ധതികൾ.',
      'വിദ്യാർത്ഥികളുടെ സർഗ്ഗാത്മകവും നേതൃത്വപരവുമായ കഴിവുകൾ വികസിപ്പിക്കൽ.',
    ],
    logoId: 'campus',
    relatedLinkIds: ['campus_web', 'campus_yt'],
  },
  {
    id: 'guide_thwalaba',
    src: OFFICIAL_WING_LOGOS.thwalaba.src,
    shortLabel: 'ത്വലബ വിംഗ്',
    title: 'SKSSF Twalaba Wing · ദർസ് & അറബിക് കോളേജ് വിദ്യാർത്ഥികൾ',
    category: 'skssf_wings',
    categoryLabelMl: 'മതപഠന വിദ്യാർത്ഥികൾ',
    summaryMl:
      'പള്ളിദർസുകളിലും ഇസ്‌ലാമിക് ശരീഅത്ത് കോളേജുകളിലും പഠിക്കുന്ന വിദ്യാർത്ഥികളുടെ വൈജ്ഞാനികവും സംഘടനാപരവുമായ കൂട്ടായ്മ.',
    highlightsMl: [
      'പണ്ഡിത പാരമ്പര്യവും ആധുനിക വിജ്ഞാനവും സമന്വയിപ്പിക്കുന്ന പഠന വേദികൾ.',
      'പ്രഭാഷണം, രചന, ഗവേഷണ ശിൽപശാലകൾ.',
    ],
    logoId: 'thwalaba',
    relatedLinkIds: ['twalaba_web', 'twalaba_yt'],
  },
  {
    id: 'guide_ibad',
    src: OFFICIAL_WING_LOGOS.ibad.src,
    shortLabel: 'ഇബാദ് (Ibaad)',
    title: 'SKSSF Ibaad · ആത്മീയ-ദഅ്‌വ വിഭാഗം',
    category: 'skssf_wings',
    categoryLabelMl: 'ആത്മീയ & ദഅ്‌വ',
    summaryMl:
      'ആത്മീയ ശുദ്ധീകരണം, ഇസ്‌ലാമിക പ്രബോധനം, സദാചാര ബോധവൽക്കരണം എന്നിവയ്ക്ക് നേതൃത്വം നൽകുന്ന വിംഗ്.',
    highlightsMl: [
      'ആത്മീയ സദസ്സുകൾ, ഖുർആൻ-ഹദീസ് പഠന ക്ലാസുകൾ.',
      'പ്രബോധകർക്കും വിദ്യാർത്ഥികൾക്കുമുള്ള ദഅ്‌വ പരിശീലനം.',
    ],
    logoId: 'ibad',
    relatedLinkIds: ['ibad_web', 'ibad_yt'],
  },
  {
    id: 'guide_majlisunnoor',
    src: OFFICIAL_WING_LOGOS.majlisunnoor.src,
    shortLabel: 'മജ്‌ലിസുന്നൂർ',
    title: 'മജ്‌ലിസുന്നൂർ · ആത്മീയ പ്രാർത്ഥനാ സദസ്സ്',
    category: 'skssf_wings',
    categoryLabelMl: 'ആത്മീയ സംഗമം',
    summaryMl:
      'പാണക്കാട് സയ്യിദ് ഹൈദരലി ശിഹാബ് തങ്ങൾ (ന.മ.) തുടക്കമിട്ട ബദ്‌രീങ്ങളുടെ നാമത്തിലുള്ള ആത്മീയ പ്രാർത്ഥനാ സദസ്സ്.',
    highlightsMl: [
      'എല്ലാ മാസവും കേരളത്തിനകത്തും വിദേശത്തും ലക്ഷക്കണക്കിന് വിശ്വാസികൾ പങ്കെടുക്കുന്നു.',
      'ആത്മീയ സമാധാനത്തിനും സാമൂഹിക ഐക്യത്തിനുമുള്ള പ്രതിമാസ സംഗമം.',
    ],
    logoId: 'majlisunnoor',
    relatedLinkIds: ['ibad_web', 'ibad_yt'],
  },
  {
    id: 'guide_sargalayam',
    src: OFFICIAL_WING_LOGOS.sargalayam.src,
    shortLabel: 'സർഗലയ',
    title: 'SKSSF സർഗലയ (Sargalayam) · കലാ-സാഹിത്യ വേദി',
    category: 'skssf_wings',
    categoryLabelMl: 'കല & സാഹിത്യം',
    summaryMl:
      'വിദ്യാർത്ഥികളുടെ എഴുത്ത്, പ്രസംഗം, മാപ്പിളപ്പാട്ട്, കലിഗ്രഫി, സാഹിത്യ കഴിവുകൾ പ്രോത്സാഹിപ്പിക്കുന്ന കലോത്സവ-സാഹിത്യ വിഭാഗം.',
    highlightsMl: [
      'യൂണിറ്റ് മുതൽ സംസ്ഥാന തലം വരെ നീളുന്ന സർഗലയ കലാ-സാഹിത്യ മേളകൾ.',
      'യുവ എഴുത്തുകാർക്കും പ്രാസംഗികർക്കുമുള്ള ശിൽപശാലകൾ.',
    ],
    logoId: 'sargalayam',
    relatedLinkIds: ['sargalayam_web', 'sargalayam_yt'],
  },
  {
    id: 'guide_organet',
    src: OFFICIAL_WING_LOGOS.organet.src,
    shortLabel: 'ഓർഗനെറ്റ് (Organet)',
    title: 'SKSSF Organet · സംഘടനാ ശാക്തീകരണം & പരിശീലനം',
    category: 'skssf_wings',
    categoryLabelMl: 'സംഘടനാ പരിശീലനം',
    summaryMl:
      'യൂണിറ്റ്, ക്ലസ്റ്റർ, മേഖല, ജില്ലാ കമ്മിറ്റികളെ മാതൃകാപരമായി നയിക്കാൻ നേതാക്കൾക്കും പ്രവർത്തകർക്കും പരിശീലനം നൽകുന്നു.',
    highlightsMl: [
      'നേതൃത്വ പരിശീലന ക്യാമ്പുകളും സംഘടനാ ഭരണഘടനാ പഠനവും.',
      'മാതൃകാ യൂണിറ്റുകൾ സൃഷ്ടിക്കാനുള്ള ‘Organet’ പദ്ധതികൾ.',
    ],
    logoId: 'organet',
    relatedLinkIds: ['organet_web', 'skssf_web'],
  },
  {
    id: 'guide_sahachari',
    src: OFFICIAL_WING_LOGOS.sahachari.src,
    shortLabel: 'സഹചാരി (Sahachari)',
    title: 'സഹചാരി · SKSSF ആതുരസേവന റിലീഫ് സെൽ',
    category: 'skssf_wings',
    categoryLabelMl: 'ആതുരസേവനം & റിലീഫ്',
    summaryMl:
      '“ആതുരസേവനത്തിന് സഹചാരി” എന്ന സന്ദേശവുമായി നിർധന രോഗികൾക്ക് ചികിത്സാ സഹായവും ഡയാലിസിസ്-കാൻസർ കെയർ പിന്തുണയും നൽകുന്നു.',
    highlightsMl: [
      'റമളാനിലെ ആദ്യ വെള്ളിയാഴ്ച സമാഹരിക്കുന്ന ഫണ്ട് സുതാര്യമായി ചികിത്സാ സഹായത്തിന് വിനിയോഗിക്കുന്നു.',
      'മെഡിക്കൽ കോളേജുകളിലും പ്രധാന ആശുപത്രികളിലും സഹായ കേന്ദ്രങ്ങൾ.',
    ],
    logoId: 'sahachari',
    relatedLinkIds: ['sahachari_web', 'sahachari_skssf'],
  },
  {
    id: 'guide_isthiqama',
    src: OFFICIAL_WING_LOGOS.isthiqama.src,
    shortLabel: 'ഇസ്തിഖാമ',
    title: 'SKSSF ഇസ്തിഖാമ (الِاسْتِقَامَةُ) · ആദർശ വിഭാഗം',
    category: 'skssf_wings',
    categoryLabelMl: 'ആശയ-ആദർശ വിഭാഗം',
    summaryMl:
      '“കൽപിക്കപ്പെട്ടതുപോലെ നേരായ മാർഗ്ഗത്തിൽ ഉറച്ചുനിൽക്കുക” (فَاسْتَقِمْ كَمَا أُمِرْتَ) എന്ന ഖുർആൻ സന്ദേശവുമായി അഹ്ലുസ്സുന്നത്തിന്റെ ആദർശം പ്രചരിപ്പിക്കുന്നു.',
    highlightsMl: [
      'സംശയ നിവാരണ ക്ലാസുകൾ, ആദർശ സമ്മേളനങ്ങൾ, സംവാദ പരിശീലനം.',
      'യുവതലമുറയ്ക്ക് ശരിയായ വിശ്വാസ-കർമ്മ പാഠങ്ങൾ പകർന്നു നൽകുന്നു.',
    ],
    logoId: 'isthiqama',
    relatedLinkIds: ['isthiqama_web', 'isthiqama_yt'],
  },
  {
    id: 'guide_maneesha',
    src: OFFICIAL_WING_LOGOS.maneesha.src,
    shortLabel: 'മനീഷ (Maneesha)',
    title: 'SKSSF മനീഷ · ബൗദ്ധിക-സാംസ്കാരിക വേദി',
    category: 'skssf_wings',
    categoryLabelMl: 'ബൗദ്ധിക & സാംസ്കാരികം',
    summaryMl:
      '“ഇടം നേടുകയല്ല, ഇടപെടുകയാണ്” എന്ന മുദ്രാവാക്യത്തോടെ സാമൂഹിക-സാംസ്കാരിക-ബൗദ്ധിക മേഖലകളിൽ ക്രിയാത്മക ഇടപെടലുകൾ നടത്തുന്നു.',
    highlightsMl: [
      'സെമിനാറുകൾ, സാംസ്കാരിക ചർച്ചകൾ, ഗവേഷണ പ്രബന്ധ അവതരണങ്ങൾ.',
      'സമകാലിക വിഷയങ്ങളിൽ വ്യക്തമായ ധാർമ്മിക-ബൗദ്ധിക നിലപാടുകൾ രൂപപ്പെടുത്തുന്നു.',
    ],
    logoId: 'maneesha',
    relatedLinkIds: ['maneesha_web', 'maneesha_yt'],
  },
  {
    id: 'guide_sathyadhara',
    src: OFFICIAL_WING_LOGOS.sathyadhara.src,
    shortLabel: 'സത്യധാര',
    title: 'സത്യധാര ദ്വൈവാരിക · SKSSF ഔദ്യോഗിക മുഖപത്രം (1997)',
    category: 'skssf_wings',
    categoryLabelMl: 'പ്രസിദ്ധീകരണം · 1997',
    summaryMl:
      '“വെറും വായനയല്ല, നട്ടെല്ലുള്ള നിലപാടുകൾ” എന്ന മുദ്രാവാക്യവുമായി 1997 മുതൽ പുറത്തിറങ്ങുന്ന SKSSF-ന്റെ ഔദ്യോഗിക ദ്വൈവാരിക.',
    highlightsMl: [
      'ആനുകാലിക വിശകലനങ്ങൾ, ചരിത്ര ലേഖനങ്ങൾ, വിദ്യാർത്ഥി-സാഹിത്യ പംക്തികൾ.',
      'കേരളത്തിന് പുറമെ പ്രവാസികൾക്കായി ഗൾഫ് സത്യധാരയും പ്രസിദ്ധീകരിക്കുന്നു.',
    ],
    logoId: 'sathyadhara',
    relatedLinkIds: ['sathyadhara_site', 'sathyadhara_web', 'sathyadhara_fb', 'sathyadhara_yt'],
  },
  {
    id: 'guide_isa',
    src: OFFICIAL_WING_LOGOS.isa.src,
    shortLabel: 'ISA അക്കാദമി',
    title: 'ISA · ഇസ്‌ലാമിക് സാഹിത്യ അക്കാദമി (കോഴിക്കോട്)',
    category: 'skssf_wings',
    categoryLabelMl: 'പ്രസിദ്ധീകരണം & സാഹിത്യം',
    summaryMl:
      'SKSSF സ്റ്റേറ്റ് കമ്മിറ്റിയുടെ കീഴിൽ ഇസ്‌ലാമിക ഗ്രന്ഥങ്ങൾ, ചരിത്ര കൃതികൾ, ബാലസാഹിത്യം, ഓഡിയോ-വീഡിയോ ഉള്ളടക്കങ്ങൾ പ്രസിദ്ധീകരിക്കുന്ന അക്കാദമി.',
    highlightsMl: [
      'കോഴിക്കോട് ഇസ്‌ലാമിക് സെന്റർ ആസ്ഥാനമായി പ്രവർത്തിക്കുന്നു.',
      'പഠന ഗ്രന്ഥങ്ങളും റഫറൻസ് പുസ്തകങ്ങളും വായനക്കാരിലേക്ക് എത്തിക്കുന്നു.',
    ],
    logoId: 'isa',
    relatedLinkIds: ['forward_foundation_ig', 'isa_web', 'isa_yt'],
  },
  {
    id: 'guide_meem',
    src: OFFICIAL_WING_LOGOS.meem.src,
    shortLabel: 'മീം (MEEM)',
    title: 'MEEM · Medical Eminence for Ethical Movement',
    category: 'skssf_wings',
    categoryLabelMl: 'ആരോഗ്യം & മെഡിക്കൽ',
    summaryMl:
      'മെഡിക്കൽ വിദ്യാർത്ഥികളും ഡോക്ടർമാരും ചേർന്ന് ആരോഗ്യ ബോധവൽക്കരണം, മെഡിക്കൽ ക്യാമ്പുകൾ, ധാർമ്മിക ചികിത്സാ സേവനങ്ങൾ നടത്തുന്നു.',
    highlightsMl: [
      'സൗജന്യ മെഡിക്കൽ ക്യാമ്പുകളും രോഗപ്രതിരോധ ബോധവൽക്കരണവും.',
      'സഹചാരി റിലീഫ് സെല്ലുമായി ചേർന്നുള്ള ജീവകാരുണ്യ ആരോഗ്യ പ്രവർത്തനങ്ങൾ.',
    ],
    logoId: 'meem',
    relatedLinkIds: ['meem_web', 'sahachari_web'],
  },
  {
    id: 'guide_ifc',
    src: OFFICIAL_WING_LOGOS.ifc.src,
    shortLabel: 'ഐ.എഫ്.സി (IFC)',
    title: 'IFC · Islamic Family Cluster (കുടുംബ ശാക്തീകരണം)',
    category: 'skssf_wings',
    categoryLabelMl: 'കുടുംബ & കൗൺസലിംഗ്',
    summaryMl:
      'ആരോഗ്യകരമായ കുടുംബബന്ധങ്ങൾ, മാതൃകാ രക്ഷാകർതൃത്വം, പ്രീ-മാരിറ്റൽ & ഫാമിലി കൗൺസലിംഗ് എന്നിവ നൽകുന്ന വിഭാഗം.',
    highlightsMl: [
      'കുടുംബ സെമിനാറുകളും വിവാഹപൂർവ്വ ബോധവൽക്കരണ ക്ലാസുകളും.',
      'രക്ഷിതാക്കൾക്കും യുവാക്കൾക്കുമുള്ള മാർഗ്ഗനിർദ്ദേശ വേദികൾ.',
    ],
    logoId: 'ifc',
    relatedLinkIds: ['ifc_web', 'ifc_yt'],
  },
  {
    id: 'guide_skicr',
    src: OFFICIAL_WING_LOGOS.skicr.src,
    shortLabel: 'SKICR',
    title: 'SKICR · Samastha Kerala Islamic Class Room',
    category: 'skssf_wings',
    categoryLabelMl: 'ഓൺലൈൻ ക്ലാസ് റൂം',
    summaryMl:
      'ലോകത്തിന്റെ ഏത് കോണിലുമുള്ളവർക്ക് ഓൺലൈൻ വഴി ആധികാരിക ഇസ്‌ലാമിക ക്ലാസുകളും തത്സമയ സംപ്രേഷണവും എത്തിക്കുന്ന ഡിജിറ്റൽ ക്ലാസ് റൂം.',
    highlightsMl: [
      'പ്രഗത്ഭ പണ്ഡിതരുടെ തത്സമയ-റെക്കോർഡഡ് ദീനീ ക്ലാസുകൾ.',
      'യൂട്യൂബ് വഴിയും വെബ് പോർട്ടൽ വഴിയും സൗജന്യ പഠന സൗകര്യം.',
    ],
    logoId: 'skicr',
    relatedLinkIds: ['skicr_portal', 'skicr_tv_yt', 'skicr_fb', 'skicr_telegram', 'skicr_app'],
  },
  {
    id: 'guide_skimvb',
    src: OFFICIAL_WING_LOGOS.skimvb.src,
    shortLabel: 'SKIMVB',
    title: 'സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ് (1951)',
    category: 'samastha_boards',
    categoryLabelMl: 'മദ്രസാ വിദ്യാഭ്യാസ ബോർഡ്',
    summaryMl:
      '1951-ൽ സ്ഥാപിതമായ ഈ ബോർഡ് 11,000-ത്തിലധികം മദ്രസകളും ഏകീകൃത സിലബസും പൊതുപരീക്ഷകളും നിയന്ത്രിക്കുന്നു.',
    highlightsMl: [
      'ലക്ഷക്കണക്കിന് വിദ്യാർത്ഥികൾ പഠിക്കുന്ന ലോകത്തിലെ ഏറ്റവും വലിയ മദ്രസാ ശൃംഖലകളിലൊന്ന്.',
      '26+ രാജ്യങ്ങളിലേക്കായി സമസ്ത ഇ-ലേണിംഗ് ഓൺലൈൻ മദ്രസയും പ്രവർത്തിക്കുന്നു.',
    ],
    logoId: 'skimvb',
    relatedLinkIds: ['skimvb_portal', 'skju_yt', 'elearning_web'],
  },
  {
    id: 'guide_skjmcc',
    src: OFFICIAL_WING_LOGOS.skjmcc.src,
    shortLabel: 'SKJMCC',
    title: 'സമസ്ത കേരള ജംഇയ്യത്തുൽ മുഅല്ലിമീൻ (1959)',
    category: 'samastha_boards',
    categoryLabelMl: 'മുഅല്ലിം സംഘടന',
    summaryMl:
      'ഒരു ലക്ഷത്തിലധികം മദ്രസാ അധ്യാപകരുടെ (മുഅല്ലിമീങ്ങൾ) ക്ഷേമവും പരിശീലനവും പ്രസിദ്ധീകരണങ്ങളും ഏകോപിപ്പിക്കുന്ന കേന്ദ്ര കൗൺസിൽ.',
    highlightsMl: [
      'ചേളാരി ആസ്ഥാനമായി പ്രവർത്തിക്കുന്നു; അധ്യാപക ക്ഷേമനിധിയും പരിശീലനവും.',
      'കുരുന്നുകൾ, അൽ-മുഅല്ലിം, സന്തുഷ്ട കുടുംബം തുടങ്ങിയ പ്രമുഖ മാസികകൾ.',
    ],
    logoId: 'skjmcc',
    relatedLinkIds: ['skjmcc_web', 'skjmcc_magazine', 'skjmcc_fb', 'skjmcc_yt'],
  },
  {
    id: 'guide_snec',
    src: OFFICIAL_WING_LOGOS.snec.src,
    shortLabel: 'SNEC',
    title: 'SNEC · സമസ്ത നാഷണൽ എജ്യുക്കേഷൻ കൗൺസിൽ',
    category: 'samastha_boards',
    categoryLabelMl: 'സമന്വയ ഉന്നത വിദ്യാഭ്യാസം',
    summaryMl:
      'മത-ഭൗതിക വിദ്യാഭ്യാസത്തെ സമന്വയിപ്പിച്ച് ശരീഅഃ, ഷീ, ലൈഫ് കോഴ്സുകൾ നടത്തുന്ന സമസ്തയുടെ ഉന്നത വിദ്യാഭ്യാസ കൗൺസിൽ.',
    highlightsMl: [
      'ആൺകുട്ടികൾക്കായി ശരീഅഃ, പെൺകുട്ടികൾക്കായി ഷീ (SHE), പ്ലസ് ടു/ഡിഗ്രി സമന്വയമായ ലൈഫ്.',
      'SNEET, SLET പ്രവേശന പരീക്ഷകൾ വഴി അഡ്മിഷൻ.',
    ],
    logoId: 'snec',
    relatedLinkIds: ['snec_web', 'snec_yt'],
  },
  {
    id: 'guide_albirr',
    src: OFFICIAL_WING_LOGOS.albirr_preschool.src,
    shortLabel: 'അൽബിർ (ALBIRR)',
    title: 'ALBIRR ഇസ്‌ലാമിക് പ്രീ-സ്കൂൾ (مَدْرَسَةُ الْبِرِّ الْإِسْلَامِيَّةُ)',
    category: 'samastha_boards',
    categoryLabelMl: 'ഇസ്‌ലാമിക് പ്രീ-സ്കൂൾ',
    summaryMl:
      'കുഞ്ഞുമക്കൾക്ക് കളിയും ആധുനിക പഠനവും ധാർമ്മിക മൂല്യങ്ങളും ഒന്നിച്ച് പകർന്നു നൽകുന്ന സമസ്തയുടെ പ്രീ-സ്കൂൾ ശൃംഖല.',
    highlightsMl: [
      'കേരളം, കർണാടക, ഗൾഫ് രാജ്യങ്ങളിലായി 350-ലധികം ശാഖകൾ.',
      'ശാസ്ത്രീയവും ശിശുസൗഹൃദവുമായ പ്രീ-പ്രൈമറി പാഠ്യപദ്ധതി.',
    ],
    logoId: 'albirr_preschool',
    relatedLinkIds: ['albirr_web', 'albirr_yt'],
  },
  {
    id: 'guide_samastha_elearning',
    src: OFFICIAL_WING_LOGOS.samastha_elearning.src,
    shortLabel: 'സമസ്ത ഇ-ലേണിംഗ്',
    title: 'സമസ്ത ഇ-ലേണിംഗ് · ഗ്ലോബൽ ഓൺലൈൻ മദ്രസ',
    category: 'samastha_boards',
    categoryLabelMl: 'ഓൺലൈൻ മദ്രസ · 26+ രാജ്യങ്ങൾ',
    summaryMl:
      'ലോകമെമ്പാടുമുള്ള പ്രവാസി കുട്ടികൾക്കും വിദ്യാർത്ഥികൾക്കും വീട്ടിലിരുന്ന് 1 മുതൽ 10 വരെ ക്ലാസുകളിലെ സമസ്ത മദ്രസാ സിലബസ് പഠിക്കാനുള്ള ഓൺലൈൻ സംവിധാനം.',
    highlightsMl: [
      '26-ലധികം രാജ്യങ്ങളിലെ കുട്ടികൾക്ക് ഓൺലൈൻ ലൈവ് മദ്രസാ ക്ലാസുകൾ.',
      'സമസ്ത വിദ്യാഭ്യാസ ബോർഡിന്റെ അംഗീകൃത പാഠ്യപദ്ധതിയും പരീക്ഷകളും.',
    ],
    logoId: 'samastha_elearning',
    relatedLinkIds: ['elearning_web', 'elearning_yt'],
  },
  {
    id: 'guide_cswc',
    src: OFFICIAL_WING_LOGOS.cswc.src,
    shortLabel: 'CSWC',
    title: 'CSWC · കൗൺസിൽ ഓഫ് സമസ്ത വിമൻസ് കോളേജസ്',
    category: 'samastha_boards',
    categoryLabelMl: 'വനിതാ ഉന്നത വിദ്യാഭ്യാസം',
    summaryMl:
      'പെൺകുട്ടികൾക്കായി മത-ഭൗതിക സമന്വയ വിദ്യാഭ്യാസവും ഫളീല-ഫാദീല കോഴ്സുകളും നടത്തുന്ന സമസ്ത വനിതാ കോളേജുകളുടെ കേന്ദ്ര സമിതി.',
    highlightsMl: [
      '93 ഡേ കോളേജുകളും 21 റെസിഡൻഷ്യൽ കോളേജുകളും ഏകോപിപ്പിക്കുന്നു.',
      'മൂന്ന് വർഷത്തെ ഫളീലയും രണ്ട് വർഷത്തെ ഫാദീലയും ഉൾപ്പെടെ ഉന്നത കോഴ്സുകൾ.',
    ],
    logoId: 'cswc',
    relatedLinkIds: ['cswc_web', 'cswc_courses', 'cswc_yt'],
  },
  {
    id: 'guide_asmi',
    src: OFFICIAL_WING_LOGOS.asmi.src,
    shortLabel: 'ASMI',
    title: 'ASMI · അസോസിയേഷൻ ഓഫ് സമസ്ത മൈനോറിറ്റി ഇൻസ്റ്റിറ്റ്യൂഷൻസ്',
    category: 'samastha_boards',
    categoryLabelMl: 'ഇംഗ്ലീഷ് മീഡിയം സ്കൂളുകൾ',
    summaryMl:
      'ധാർമ്മിക മൂല്യങ്ങളും മികച്ച ആധുനിക അക്കാദമിക് നിലവാരവും ഒരുമിപ്പിക്കുന്ന സമസ്തയുടെ ഇംഗ്ലീഷ് മീഡിയം സ്കൂളുകളുടെ കൂട്ടായ്മ.',
    highlightsMl: [
      'SKIMVB-യുടെ മേൽനോട്ടത്തിൽ സ്കൂളുകളുടെ നിലവാരവും അധ്യാപക പരിശീലനവും ഉറപ്പാക്കുന്നു.',
      'വിദ്യാർത്ഥികളുടെ ബഹുമുഖ വളർച്ചയ്ക്കായി സവിശേഷ പാഠ്യപദ്ധതി.',
    ],
    logoId: 'asmi',
    relatedLinkIds: ['asmi_web', 'asmi_yt'],
  },
  {
    id: 'guide_smf',
    src: OFFICIAL_WING_LOGOS.smf.src,
    shortLabel: 'SMF (മഹല്ല്)',
    title: 'SMF · സമസ്ത കേരള സുന്നി മഹല്ല് ഫെഡറേഷൻ (1976)',
    category: 'media_community',
    categoryLabelMl: 'മഹല്ല് കൂട്ടായ്മ · 1976',
    summaryMl:
      '1976-ൽ സ്ഥാപിതമായ ഈ സംഘടന മഹല്ലുകളുടെ വ്യവസ്ഥാപിത ഭരണം, പള്ളിദർസ് സംരക്ഷണം, സാമൂഹിക ഐക്യം എന്നിവയ്ക്ക് നേതൃത്വം നൽകുന്നു.',
    highlightsMl: [
      'ആയിരക്കണക്കിന് മഹല്ല് കമ്മിറ്റികളെ ഒറ്റ കുടക്കീഴിൽ ഏകോപിപ്പിക്കുന്നു.',
      'മഹല്ല് ശാക്തീകരണം, കുടുംബ ബോധവൽക്കരണം, ദുരന്തനിവാരണ പ്രവർത്തനങ്ങൾ.',
    ],
    logoId: 'smf',
    relatedLinkIds: ['smf_web', 'smf_fb', 'smf_yt'],
  },
  {
    id: 'guide_sic',
    src: OFFICIAL_WING_LOGOS.sic.src,
    shortLabel: 'SIC (പ്രവാസി)',
    title: 'SIC · സമസ്ത ഇസ്‌ലാമിക് സെന്റർ',
    category: 'media_community',
    categoryLabelMl: 'ആഗോള ഘടകം',
    summaryMl:
      'ഗൾഫ് നാടുകളിലും മറ്റ് വിദേശ രാജ്യങ്ങളിലുമുള്ള സമസ്തയുടെ പ്രവർത്തനങ്ങളും പ്രവാസി മദ്രസകളും കാരുണ്യ സേവനങ്ങളും ഏകോപിപ്പിക്കുന്ന വേദി.',
    highlightsMl: [
      'യു.എ.ഇ, സൗദി, ഒമാൻ, ഖത്തർ, കുവൈറ്റ്, ബഹ്‌റൈൻ തുടങ്ങിയ രാജ്യങ്ങളിൽ സജീവ സാന്നിധ്യം.',
      'പ്രവാസി മലയാളികൾക്ക് മതപഠന-സാമൂഹിക-ക്ഷേമ പിന്തുണ നൽകുന്നു.',
    ],
    logoId: 'sic',
    relatedLinkIds: ['cell_sic', 'skju_web'],
  },
  {
    id: 'guide_suprabhaatham',
    src: OFFICIAL_WING_LOGOS.suprabhaatham.src,
    shortLabel: 'സുപ്രഭാതം',
    title: 'സുപ്രഭാതം ദിനപത്രം (Suprabhaatham Daily)',
    category: 'media_community',
    categoryLabelMl: 'മലയാള ദിനപത്രം',
    summaryMl:
      'സത്യസന്ധമായ വാർത്തകളും ധാർമ്മിക മാധ്യമ പ്രവർത്തനവുമായി കേരളത്തിലും ഗൾഫിലും വൻ പ്രചാരമുള്ള സമസ്തയുടെ ഔദ്യോഗിക ദിനപത്രം.',
    highlightsMl: [
      'കേരളത്തിലെ വിവിധ എഡിഷനുകൾക്ക് പുറമെ ദുബായ്-ഗൾഫ് എഡിഷനും ഇ-പേപ്പറും.',
      'വിദ്യാഭ്യാസം, കരിയർ, സാംസ്കാരിക പംക്തികളും തത്സമയ വാർത്തകളും.',
    ],
    logoId: 'suprabhaatham',
    relatedLinkIds: ['suprabhaatham_web', 'suprabhaatham_epaper', 'suprabhaatham_yt'],
  },
  {
    id: 'guide_samastha_magazines',
    src: OFFICIAL_WING_LOGOS.samastha_magazines.src,
    shortLabel: 'സമസ്ത മാസികകൾ',
    title: 'സന്തുഷ്ട കുടുംബം · കുരുന്നുകൾ · അൽ-മുഅല്ലിം മാസികകൾ',
    category: 'media_community',
    categoryLabelMl: 'SKJMCC പ്രസിദ്ധീകരണങ്ങൾ',
    summaryMl:
      'കുടുംബങ്ങൾക്കായി ‘സന്തുഷ്ട കുടുംബം’, കുട്ടികൾക്കായി ‘കുരുന്നുകൾ’, മദ്രസാ അധ്യാപകർക്കായി ‘അൽ-മുഅല്ലിം’ — സമസ്തയുടെ ജനപ്രിയ മാസികകൾ.',
    highlightsMl: [
      'ലക്ഷക്കണക്കിന് വീടുകളിലും മദ്രസകളിലും എത്തുന്ന മൂല്യവത്തായ വായനാ ശേഖരം.',
      'ഓൺലൈൻ പോർട്ടൽ വഴി വായനയ്ക്കും മദ്രസാ ബൾക്ക് ബുക്കിംഗിനും സൗകര്യം.',
    ],
    logoId: 'samastha_magazines',
    relatedLinkIds: ['skjmcc_magazine', 'kurunnukal_web', 'kurunnukal_bulk'],
  },
  {
    id: 'guide_skmma',
    src: OFFICIAL_WING_LOGOS.skmma.src,
    shortLabel: 'SKMMA',
    title: 'SKMMA · സമസ്ത കേരള മദ്രസാ മാനേജ്മെന്റ് അസോസിയേഷൻ',
    category: 'samastha_boards',
    categoryLabelMl: 'മദ്രസാ മാനേജ്മെന്റ്',
    summaryMl:
      'സമസ്തയ്ക്ക് കീഴിലുള്ള മദ്രസകളുടെ ഭരണസമിതികളെ ഏകോപിപ്പിക്കുകയും അടിസ്ഥാന സൗകര്യങ്ങളും ഭരണ മികവും ഉയർത്തുകയും ചെയ്യുന്ന സംഘടന.',
    highlightsMl: [
      'മദ്രസാ കമ്മിറ്റികൾക്ക് സംഘടനാ-ഭരണ മാർഗ്ഗനിർദ്ദേശങ്ങൾ നൽകുന്നു.',
      'മദ്രസാ വികസനത്തിനും മുഅല്ലിം ക്ഷേമ പദ്ധതികൾക്കും ശക്തമായ പിന്തുണ.',
    ],
    logoId: 'skmma',
    relatedLinkIds: ['cell_skmma', 'skimvb_portal'],
  },
  {
    id: 'guide_skjq',
    src: OFFICIAL_WING_LOGOS.skjq.src,
    shortLabel: 'SKJQ',
    title: 'SKJQ · സമസ്ത കേരള ജംഇയ്യത്തുൽ ഖുത്വബാഅ്',
    category: 'media_community',
    categoryLabelMl: 'ഇമാമുമാരും ഖത്തീബുമാരും',
    summaryMl:
      'പള്ളികളിൽ ജുമുഅ ഖുതുബയും മതപ്രബോധനവും നിർവ്വഹിക്കുന്ന ഇമാമുമാരുടെയും ഖത്തീബുമാരുടെയും സമസ്തയുടെ ഔദ്യോഗിക സംഘടന.',
    highlightsMl: [
      'ഖത്തീബുമാർക്കായി പ്രത്യേക പഠന-പരിശീലന സംഗമങ്ങളും റഫറൻസ് പിന്തുണയും.',
      'മഹല്ലുകളിൽ സമാധാനവും ആധികാരിക ദീനീ സന്ദേശവും ഉറപ്പാക്കുന്നു.',
    ],
    logoId: 'skjq',
    relatedLinkIds: ['cell_skjq', 'skju_web'],
  },
  {
    id: 'guide_slc',
    src: OFFICIAL_WING_LOGOS.slc.src,
    shortLabel: 'SLC (ലീഗൽ സെൽ)',
    title: 'SLC · സമസ്ത ലീഗൽ സെൽ',
    category: 'media_community',
    categoryLabelMl: 'നിയമ സഹായ വേദി',
    summaryMl:
      'മഹല്ലുകൾക്കും സ്ഥാപനങ്ങൾക്കും പൊതുസമൂഹത്തിനും ആധികാരിക നിയമോപദേശവും നിയമസഹായവും ബോധവൽക്കരണവും നൽകുന്ന സമസ്തയുടെ നിയമ വിഭാഗം.',
    highlightsMl: [
      'അഭിഭാഷകരുടെയും നിയമവിദഗ്ധരുടെയും കൂട്ടായ്മ.',
      'വഖഫ്, വിദ്യാഭ്യാസ-ഭരണഘടനാ അവകാശ സംരക്ഷണത്തിൽ നിയമപരമായ ഇടപെടലുകൾ.',
    ],
    logoId: 'slc',
    relatedLinkIds: ['cell_slc', 'skju_web'],
  },
  {
    id: 'guide_spc',
    src: OFFICIAL_WING_LOGOS.spc.src,
    shortLabel: 'SPC (പ്രവാസി സെൽ)',
    title: 'SPC · സമസ്ത പ്രവാസി സെൽ',
    category: 'media_community',
    categoryLabelMl: 'പ്രവാസി ക്ഷേമ വിഭാഗം',
    summaryMl:
      'വിദേശ രാജ്യങ്ങളിൽ ജോലി ചെയ്യുന്ന പ്രവാസി മലയാളികളുടെ ക്ഷേമവും പുനരധിവാസവും സാമൂഹിക സഹായങ്ങളും ഏകോപിപ്പിക്കുന്ന സമസ്തയുടെ പ്രത്യേക സെൽ.',
    highlightsMl: [
      'പ്രവാസികൾക്കും അവരുടെ കുടുംബങ്ങൾക്കും ക്ഷേമ-സഹായ പദ്ധതികൾ.',
      'ഗൾഫ് ഉൾപ്പെടെയുള്ള വിദേശ ഘടകങ്ങളുമായി ചേർന്ന് പ്രവർത്തിക്കുന്നു.',
    ],
    logoId: 'spc',
    relatedLinkIds: ['cell_spc', 'cell_sic'],
  },
];
