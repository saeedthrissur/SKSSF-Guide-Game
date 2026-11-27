export type LessonStage = 'prologue' | 'storyboard' | 'pov' | 'world';

export interface LessonDescriptor {
  id: string;
  stage: LessonStage;
  level?: 1 | 2 | 3 | 4;
  tab?: string;
  emoji: string;
  groupLabel: string;
  title: string;
}

export const ALL_LESSONS: LessonDescriptor[] = [
  // ആമുഖ ഘട്ടം (6 സ്വതന്ത്ര പാഠങ്ങൾ)
  {
    id: 'prologue_curiosity',
    stage: 'prologue',
    tab: 'prologue_curiosity',
    emoji: '🚐',
    groupLabel: 'ആമുഖം',
    title: 'പ്രചാരണ വാഹനവും നമ്മുടെ ദൗത്യവും',
  },
  {
    id: 'prologue_ch1',
    stage: 'prologue',
    tab: 'prologue_ch1',
    emoji: '🌌',
    groupLabel: 'ആമുഖം',
    title: 'പ്രപഞ്ചവും ഏക സൃഷ്ടാവും',
  },
  {
    id: 'prologue_ch2',
    stage: 'prologue',
    tab: 'prologue_ch2',
    emoji: '📖',
    groupLabel: 'ആമുഖം',
    title: 'ഖുർആനും തിരുനബി ﷺ മാതൃകയും',
  },
  {
    id: 'prologue_ch3',
    stage: 'prologue',
    tab: 'prologue_ch3',
    emoji: '🕌',
    groupLabel: 'ആമുഖം',
    title: '1926 സമസ്തയും സ്ഥാപക ലക്ഷ്യങ്ങളും',
  },
  {
    id: 'prologue_ch4',
    stage: 'prologue',
    tab: 'prologue_ch4',
    emoji: '🏫',
    groupLabel: 'ആമുഖം',
    title: '1951 വിദ്യാഭ്യാസ ബോർഡും 1989 SKSSF-ഉം',
  },
  {
    id: 'prologue_story',
    stage: 'prologue',
    tab: 'prologue_story',
    emoji: '🏆',
    groupLabel: 'ആമുഖം',
    title: 'SKSSF ഗൈഡ് ഗെയിം ദൗത്യം',
  },

  // സാഹചര്യ ബോർഡ് (4 സ്വതന്ത്ര പാഠങ്ങൾ)
  {
    id: 'storyboard_ch1',
    stage: 'storyboard',
    tab: 'sb0_roots',
    emoji: '🕌',
    groupLabel: 'സാഹചര്യങ്ങൾ',
    title: 'വഖഫ് & പണ്ഡിത പാരമ്പര്യം',
  },
  {
    id: 'storyboard_ch2',
    stage: 'storyboard',
    tab: 'sb1',
    emoji: '🌿',
    groupLabel: 'സാഹചര്യങ്ങൾ',
    title: '1995 ടാഗോർ ഹാൾ & TREND',
  },
  {
    id: 'storyboard_ch3',
    stage: 'storyboard',
    tab: 'sb2',
    emoji: '🌙',
    groupLabel: 'സാഹചര്യങ്ങൾ',
    title: 'ഇഖ്‌ലാസ് & സഹചാരി സേവനം',
  },
  {
    id: 'storyboard',
    stage: 'storyboard',
    tab: 'sb3',
    emoji: '📱',
    groupLabel: 'സാഹചര്യങ്ങൾ',
    title: 'സൈബർ മര്യാദ & സൈകോൺ',
  },

  // എന്റെ SKSSF യാത്ര — POV (8 സ്വതന്ത്ര പ്രായോഗിക പാഠങ്ങൾ)
  {
    id: 'pov_1',
    stage: 'pov',
    tab: 'pov_1_madrasa',
    emoji: '📚',
    groupLabel: 'POV യാത്ര',
    title: 'മദ്രസയും ലൈബ്രറി അദബും (SKSBV)',
  },
  {
    id: 'pov_2',
    stage: 'pov',
    tab: 'pov_2_spiritual',
    emoji: '📜',
    groupLabel: 'POV യാത്ര',
    title: 'മജ്‌ലിസുന്നൂർ അജണ്ടയും നോട്ടീസും',
  },
  {
    id: 'pov_3',
    stage: 'pov',
    tab: 'pov_3_programs',
    emoji: '🖌️',
    groupLabel: 'POV യാത്ര',
    title: 'സമ്മേളന ചുമരിലെഴുത്തും പ്രചാരണവും',
  },
  {
    id: 'pov_4',
    stage: 'pov',
    tab: 'pov_4_obstacles',
    emoji: '🏗️',
    groupLabel: 'POV യാത്ര',
    title: 'പരിപാടി സ്റ്റേജ് നിർമ്മാണവും കൂട്ടായ്മയും',
  },
  {
    id: 'pov_5',
    stage: 'pov',
    tab: 'pov_5_unit',
    emoji: '🚩',
    groupLabel: 'POV യാത്ര',
    title: 'ഔദ്യോഗിക SKSSF യൂണിറ്റ് രൂപീകരണം',
  },
  {
    id: 'pov_6',
    stage: 'pov',
    tab: 'pov_6_meeting',
    emoji: '💰',
    groupLabel: 'POV യാത്ര',
    title: 'പരിപാടി വരവ്–ചെലവ്–നീക്കിയിരിപ്പും ചീരണിയും',
  },
  {
    id: 'pov_7',
    stage: 'pov',
    tab: 'pov_7_cluster',
    emoji: '🏟️',
    groupLabel: 'POV യാത്ര',
    title: 'സ്റ്റേഡിയം ശുചീകരണവും വിഖായ ഡിസ്പോസലും',
  },
  {
    id: 'pov_journey',
    stage: 'pov',
    tab: 'pov_8_state_circular',
    emoji: '📋',
    groupLabel: 'POV യാത്ര',
    title: 'പരിപാടി അവലോകന റിപ്പോർട്ടും സർക്കുലറും',
  },

  // ഘട്ടം 1 · യൂണിറ്റ് തലം (8 സ്വതന്ത്ര പാഠങ്ങൾ — 5 ചരിത്ര കാലഘട്ടങ്ങൾ വേർതിരിച്ചു)
  {
    id: 'l1_era_1',
    stage: 'world',
    level: 1,
    tab: 'era_1',
    emoji: '🕌',
    groupLabel: 'യൂണിറ്റ് തലം',
    title: '1926 · സമസ്തയുടെ പിറവി',
  },
  {
    id: 'l1_era_2',
    stage: 'world',
    level: 1,
    tab: 'era_2',
    emoji: '📜',
    groupLabel: 'യൂണിറ്റ് തലം',
    title: '1934 · ഔദ്യോഗിക രജിസ്ട്രേഷൻ',
  },
  {
    id: 'l1_era_3',
    stage: 'world',
    level: 1,
    tab: 'era_3',
    emoji: '🏫',
    groupLabel: 'യൂണിറ്റ് തലം',
    title: '1951 · സമസ്ത വിദ്യാഭ്യാസ ബോർഡ്',
  },
  {
    id: 'l1_era_4',
    stage: 'world',
    level: 1,
    tab: 'era_4',
    emoji: '☎️',
    groupLabel: 'യൂണിറ്റ് തലം',
    title: '1989 · SKSSF പിറവിയും മുന്നേറ്റവും',
  },
  {
    id: 'l1_timeline',
    stage: 'world',
    level: 1,
    tab: 'era_5',
    emoji: '✈️',
    groupLabel: 'യൂണിറ്റ് തലം',
    title: '1993 · SKSBV & ആഗോള ശൃംഖല',
  },
  {
    id: 'l1_flags',
    stage: 'world',
    level: 1,
    tab: 'flags',
    emoji: '🚩',
    groupLabel: 'യൂണിറ്റ് തലം',
    title: 'പതാക നിർമ്മാണ ശാല (SKJU & SKSSF)',
  },
  {
    id: 'l1_cosmic',
    stage: 'world',
    level: 1,
    tab: 'cosmic',
    emoji: '🌱',
    groupLabel: 'യൂണിറ്റ് തലം',
    title: 'പ്രപഞ്ച സൃഷ്ടാവ് — വിശ്വാസ ശൃംഖല',
  },
  {
    id: 'l1_roots',
    stage: 'world',
    level: 1,
    tab: 'roots',
    emoji: '📚',
    groupLabel: 'യൂണിറ്റ് തലം',
    title: 'സമസ്തയുടെ വേരുകൾ & ചരിത്ര കാർഡുകൾ',
  },

  // ഘട്ടം 2 · ക്ലസ്റ്റർ & മേഖലാ തലം
  {
    id: 'l2_memory',
    stage: 'world',
    level: 2,
    tab: 'memory',
    emoji: '🃏',
    groupLabel: 'ക്ലസ്റ്റർ & മേഖല',
    title: 'പതാക മെമ്മറി ഗെയിം',
  },
  {
    id: 'l2_madrasa_board',
    stage: 'world',
    level: 2,
    tab: 'madrasa_board',
    emoji: '🏫',
    groupLabel: 'ക്ലസ്റ്റർ & മേഖല',
    title: 'സമസ്ത മദ്രസ ബോർഡ് നിർമ്മാണം',
  },
  {
    id: 'l2_tiers',
    stage: 'world',
    level: 2,
    tab: 'tiers',
    emoji: '🏛️',
    groupLabel: 'ക്ലസ്റ്റർ & മേഖല',
    title: '5 ഘടക ഘടന (15/19/21/25/31)',
  },
  {
    id: 'l2_election_roles',
    stage: 'world',
    level: 2,
    tab: 'election_roles',
    emoji: '🗳️',
    groupLabel: 'ക്ലസ്റ്റർ & മേഖല',
    title: 'കമ്മിറ്റി രൂപീകരണവും സ്ഥാനങ്ങളും',
  },
  {
    id: 'l2_centres',
    stage: 'world',
    level: 2,
    tab: 'centres',
    emoji: '🕌',
    groupLabel: 'ക്ലസ്റ്റർ & മേഖല',
    title: 'ഇസ്‌ലാമിക് സെന്ററുകളും ഹോസ്റ്റലുകളും',
  },
  {
    id: 'l2_dispatch',
    stage: 'world',
    level: 2,
    tab: 'dispatch',
    emoji: '🚑',
    groupLabel: 'ക്ലസ്റ്റർ & മേഖല',
    title: '17 സബ് വിങ്ങുകളും സേവന ദൗത്യവും',
  },
  {
    id: 'l2_dawa_age',
    stage: 'world',
    level: 2,
    tab: 'dawa_age',
    emoji: '🎯',
    groupLabel: 'ക്ലസ്റ്റർ & മേഖല',
    title: 'പ്രായപരിധിയും സംഘടനാ പ്രവർത്തനവും',
  },
  {
    id: 'l2_dawa_lanterns',
    stage: 'world',
    level: 2,
    tab: 'dawa_lanterns',
    emoji: '🏮',
    groupLabel: 'ക്ലസ്റ്റർ & മേഖല',
    title: 'നാട്ടിലെ 5 ദഅ്‌വത്ത് വിളക്കുകൾ',
  },
  {
    id: 'l2_vault',
    stage: 'world',
    level: 2,
    tab: 'vault',
    emoji: '📰',
    groupLabel: 'ക്ലസ്റ്റർ & മേഖല',
    title: 'പത്രങ്ങളും വിദ്യാഭ്യാസ സ്ഥാപനങ്ങളും',
  },

  // ഘട്ടം 3 · ജില്ലാ തലം
  {
    id: 'l3_sky_catcher',
    stage: 'world',
    level: 3,
    tab: 'sky_catcher',
    emoji: '🎈',
    groupLabel: 'ജില്ലാ തലം',
    title: 'നന്മയും കെണിയും (സ്കൈ ക്യാച്ചർ)',
  },
  {
    id: 'l3_scrolls',
    stage: 'world',
    level: 3,
    tab: 'scrolls',
    emoji: '📜',
    groupLabel: 'ജില്ലാ തലം',
    title: 'പ്രവാചക മാതൃക ﷺ — ജ്ഞാനച്ചുരുൾ',
  },
  {
    id: 'l3_mind_chain',
    stage: 'world',
    level: 3,
    tab: 'mind_chain',
    emoji: '🪜',
    groupLabel: 'ജില്ലാ തലം',
    title: 'മനസ്സിന്റെ 5 വളർച്ചാ പടവുകൾ',
  },
  {
    id: 'l3_unit_desks',
    stage: 'world',
    level: 3,
    tab: 'unit_desks',
    emoji: '📋',
    groupLabel: 'ജില്ലാ തലം',
    title: 'യൂണിറ്റ് ഓഫീസും ചുമതലകളും',
  },
  {
    id: 'l3_newsroom',
    stage: 'world',
    level: 3,
    tab: 'newsroom',
    emoji: '🫧',
    groupLabel: 'ജില്ലാ തലം',
    title: 'മാധ്യമ & വാർത്താ പരിശീലനം',
  },

  // ഘട്ടം 4 · സ്റ്റേറ്റ് & ഗ്ലോബൽ തലം
  {
    id: 'l4_climb',
    stage: 'world',
    level: 4,
    tab: 'climb',
    emoji: '🗼',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'ശാഖ മുതൽ ഗ്ലോബൽ വരെ',
  },
  {
    id: 'l4_viqaya_van',
    stage: 'world',
    level: 4,
    tab: 'viqaya_van',
    emoji: '🚑',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'വിഖായ & ഗ്ലോബൽ സേവന വാഹനം',
  },
  {
    id: 'l4_compass',
    stage: 'world',
    level: 4,
    tab: 'compass',
    emoji: '🧭',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'സംഘാടക വഴികാട്ടി സൂത്രങ്ങൾ',
  },
  {
    id: 'l4_bag',
    stage: 'world',
    level: 4,
    tab: 'bag',
    emoji: '🎒',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'സമ്മേളന ഒരുക്ക ബാഗ്',
  },
  {
    id: 'l4_crisis',
    stage: 'world',
    level: 4,
    tab: 'crisis',
    emoji: '🤝',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'പ്രതിസന്ധി നേരിടൽ പരിശീലനം',
  },
  {
    id: 'l4_cyber_shield',
    stage: 'world',
    level: 4,
    tab: 'cyber_shield',
    emoji: '📱',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'സൈബർ മര്യാദ & പ്രതിരോധം',
  },
  {
    id: 'l4_sahachari',
    stage: 'world',
    level: 4,
    tab: 'sahachari',
    emoji: '🤝',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'സഹചാരി റിലീഫ് സെല്ലും ജീവകാരുണ്യവും',
  },
  {
    id: 'l4_trend_career',
    stage: 'world',
    level: 4,
    tab: 'trend_career',
    emoji: '🎓',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'ട്രെൻഡ് (TREND) & കരിയർ വഴികാട്ടി',
  },
  {
    id: 'l4_sargalayam',
    stage: 'world',
    level: 4,
    tab: 'sargalayam',
    emoji: '🎨',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'സർഗ്ഗലയം & ഇസ്‌ലാമിക കലാവേദി',
  },
  {
    id: 'l4_green_earth',
    stage: 'world',
    level: 4,
    tab: 'green_earth',
    emoji: '🌿',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'ഹരിത ക്യാമ്പസും പരിസ്ഥിതി സംരക്ഷണവും',
  },
  {
    id: 'l4_samastha_portals',
    stage: 'world',
    level: 4,
    tab: 'samastha_portals',
    emoji: '🌐',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'സമസ്ത വിദ്യാഭ്യാസ ശൃംഖല & ഔദ്യോഗിക പോർട്ടലുകൾ',
  },
  {
    id: 'l4_media_youtube_hub',
    stage: 'world',
    level: 4,
    tab: 'media_youtube_hub',
    emoji: '📺',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'സമസ്ത മീഡിയ, മാസികകൾ & യൂട്യൂബ് സ്റ്റുഡിയോ',
  },
  {
    id: 'l4_twalaba',
    stage: 'world',
    level: 4,
    tab: 'twalaba',
    emoji: '📜',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'ത്വലബ വിംഗ്: ദർസ് & അറബിക് കോളേജ് പൈതൃകം',
  },
  {
    id: 'l4_isthiqama_maneesha',
    stage: 'world',
    level: 4,
    tab: 'isthiqama_maneesha',
    emoji: '🧠',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'ഇസ്തിഖാമ & മനീഷ: ആദർശ പ്രതിരോധവും സംവാദവും',
  },
  {
    id: 'l4_meem_health',
    stage: 'world',
    level: 4,
    tab: 'meem_health',
    emoji: '🩺',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'മീം (MEEM): മെഡിക്കൽ ക്യാമ്പും സാന്ത്വന സേവനവും',
  },
  {
    id: 'l4_ifc_family',
    stage: 'world',
    level: 4,
    tab: 'ifc_family',
    emoji: '🏡',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'ഇസ്‌ലാമിക് ഫാമിലി ക്ലസ്റ്റർ (IFC): 20-വീട് പദ്ധതി',
  },
  {
    id: 'l4_organet_portal',
    stage: 'world',
    level: 4,
    tab: 'organet_portal',
    emoji: '🖥️',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'ഓർഗാനെറ്റ് (Organet): ഡിജിറ്റൽ പോർട്ടലും ഓഡിറ്റും',
  },
  {
    id: 'l4_sathyadhara_isa',
    stage: 'world',
    level: 4,
    tab: 'sathyadhara_isa',
    emoji: '📖',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'സത്യധാര, ഫോർവേഡ് ഫൗണ്ടേഷൻ & ഇസ (ISA)',
  },
  {
    id: 'l4_national_global',
    stage: 'world',
    level: 4,
    tab: 'national_global',
    emoji: '🌍',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'SKSSF നാഷണൽ കമ്മിറ്റി, SIC & പ്രവാസി സെൽ',
  },
  {
    id: 'l4_samastha_cells',
    stage: 'world',
    level: 4,
    tab: 'samastha_cells',
    emoji: '⚖️',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'സമസ്ത പ്രത്യേക സെല്ലുകളും പോഷക സമിതികളും',
  },
  {
    id: 'l4_higher_education',
    stage: 'world',
    level: 4,
    tab: 'higher_education',
    emoji: '🎓',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'സമസ്ത ഉന്നത വിദ്യാഭ്യാസ ശൃംഖല & അഡ്മിഷൻ പാത',
  },
  {
    id: 'l4_social_verification',
    stage: 'world',
    level: 4,
    tab: 'social_verification',
    emoji: '🛡️',
    groupLabel: 'സ്റ്റേറ്റ് & ഗ്ലോബൽ',
    title: 'ഔദ്യോഗിക സോഷ്യൽ മീഡിയ & വ്യാജ പേജ് തിരിച്ചറിയൽ',
  },
];

const STORAGE_KEY = 'skssf_guide_completed_lessons_v1';

export function loadCompletedLessonIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function saveCompletedLessonIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore private mode storage limits
  }
}

export function getSkippedUnseenLessonsBefore(
  currentLessonId: string,
  completedIds: string[]
): LessonDescriptor[] {
  const idx = ALL_LESSONS.findIndex((l) => l.id === currentLessonId);
  if (idx <= 0) return [];
  const completedSet = new Set(completedIds);
  return ALL_LESSONS.slice(0, idx).filter((l) => !completedSet.has(l.id));
}

export function getAllUnseenLessons(completedIds: string[]): LessonDescriptor[] {
  const completedSet = new Set(completedIds);
  return ALL_LESSONS.filter((l) => !completedSet.has(l.id));
}

/**
 * Returns the 0-based index of the learner's real sequential frontier
 * (the first lesson in ALL_LESSONS that is not yet completed, or the last lesson if all 52 are done).
 */
export function getSequentialFrontierIndex(completedIds: string[]): number {
  const completedSet = new Set(completedIds);
  const firstUncompleted = ALL_LESSONS.findIndex((l) => !completedSet.has(l.id));
  return firstUncompleted === -1 ? ALL_LESSONS.length - 1 : firstUncompleted;
}

/**
 * True ONLY if the learner has genuinely unlocked this lesson through sequential play
 * (or already completed it, or devUnlocked is active).
 */
export function isLessonSequentiallyUnlocked(
  lessonId: string,
  completedIds: string[],
  devUnlocked = false
): boolean {
  if (devUnlocked) return true;
  const idx = ALL_LESSONS.findIndex((l) => l.id === lessonId);
  if (idx < 0) return false;
  if (completedIds.includes(lessonId)) return true;
  return idx <= getSequentialFrontierIndex(completedIds);
}

