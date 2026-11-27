import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  RotateCcw,
  Shield,
  Trophy,
  XCircle,
} from 'lucide-react';
import { SKSSF_SUBWINGS, WingCategory } from '../data/level2Data';
import { sound } from '../utils/sound';

interface WingScenario {
  id: string;
  category: WingCategory;
  contextLabel: string;
  situation: string;
  correctWingId: string;
  distractorIds: [string, string, string];
  whyNote: string;
}

const WING_SCENARIOS: WingScenario[] = [
  {
    id: 'sc_viqaya',
    category: 'service',
    contextLabel: 'ദുരന്തനിവാരണം & സന്നദ്ധ സേവനം',
    situation:
      'കനത്ത മഴയിൽ വീടുകളിൽ വെള്ളം കയറിയപ്പോൾ അടിയന്തര രക്ഷാപ്രവർത്തനത്തിനും പ്രഥമ ശുശ്രൂഷയ്ക്കും ആംബുലൻസ് സേവനത്തിനുമായി പരിശീലനം ലഭിച്ച വളണ്ടിയർമാരെ ഉടൻ അയക്കണം. ഏത് ഉപസമിതിയാണ് നേതൃത്വം നൽകുക?',
    correctWingId: 'viqaya',
    distractorIds: ['sahachari', 'meem', 'organet'],
    whyNote:
      'വിഖായ (VIQAYA) ആണ് ALERT എമർജൻസി റെസ്ക്യൂ ടീം, ആംബുലൻസ് ശൃംഖല, അടിയന്തര രക്തദാനം, ഹജ്ജ് സന്നദ്ധ സേവനം എന്നിവ നയിക്കുന്നത്.',
  },
  {
    id: 'sc_sahachari',
    category: 'service',
    contextLabel: 'ആതുരസേവനം & സാമ്പത്തിക കൈത്താങ്ങ്',
    situation:
      'തിരുവനന്തപുരം ആർ.സി.സിയിലോ കോഴിക്കോട് മെഡിക്കൽ കോളേജിലോ കാൻസർ–ഡയാലിസിസ് ചികിത്സയ്ക്കും മരുന്നിനും വീൽചെയറിനും പ്രയാസപ്പെടുന്ന ഒരു നിർധന കുടുംബത്തിന് സ്ഥിരമായി സഹായം എത്തിക്കണം.',
    correctWingId: 'sahachari',
    distractorIds: ['viqaya', 'meem', 'ifc'],
    whyNote:
      'സഹചാരി റിലീഫ് സെല്ലാണ് മെഡിക്കൽ കോളേജ് സെന്ററുകൾ വഴി ചികിത്സാ സഹായവും മരുന്നും മെഡിക്കൽ ഉപകരണങ്ങളും എത്തിക്കുന്നത്.',
  },
  {
    id: 'sc_meem',
    category: 'service',
    contextLabel: 'ഡോക്ടർമാരും ആരോഗ്യ ക്യാമ്പും',
    situation:
      'ഒരു പിന്നാക്ക ഗ്രാമത്തിൽ വിദഗ്ധ ഡോക്ടർമാരെയും മെഡിക്കൽ വിദ്യാർത്ഥികളെയും പങ്കെടുപ്പിച്ച് സൗജന്യ സ്പെഷ്യാലിറ്റി മെഡിക്കൽ ക്യാമ്പും മെഡിക്കൽ എത്തിക്സ് സംഗമവും സംഘടിപ്പിക്കണം.',
    correctWingId: 'meem',
    distractorIds: ['sahachari', 'viqaya', 'trend'],
    whyNote:
      'മീം (MEEM — Medical Eminence for Ethical Movement) ഡോക്ടർമാരുടെയും ആരോഗ്യപ്രവർത്തകരുടെയും കൂട്ടായ്മയാണ്.',
  },
  {
    id: 'sc_trend',
    category: 'education',
    contextLabel: 'കരിയർ & ഉന്നത വിദ്യാഭ്യാസം',
    situation:
      'പ്ലസ്‌ടു കഴിഞ്ഞ വിദ്യാർത്ഥികൾക്ക് സ്കോളർഷിപ്പ് വിവരങ്ങളും സിവിൽ സർവീസ്–നീറ്റ്–സിയുഇടി പരീക്ഷാ മാർഗ്ഗനിർദ്ദേശവും AISER ഗവേഷണ സഹായവും നൽകാൻ ഒരു ക്യാമ്പ് വേണം.',
    correctWingId: 'trend',
    distractorIds: ['campus', 'thwalaba', 'sargalayam'],
    whyNote:
      'ട്രെൻഡ് (TREND) ആണ് കരിയർ കൗൺസിലിംഗ്, TASTE, AISER റിസർച്ച് വിംഗ്, പ്രീ-സ്കൂൾ തുടങ്ങിയ വിദ്യാഭ്യാസ പദ്ധതികൾ നയിക്കുന്നത്.',
  },
  {
    id: 'sc_campus',
    category: 'education',
    contextLabel: 'കോളേജ് & ഹയർ സെക്കൻഡറി',
    situation:
      'ഒരു കോളേജിലും ഹയർ സെക്കൻഡറി സ്കൂളിലും പുതിയ വിദ്യാർത്ഥികൾക്കായി അഡ്മിഷൻ ഹെൽപ്പ് ഡെസ്കും ലഹരിവിരുദ്ധ കൂട്ടായ്മയും ‘കയാക്’ വായനാ സംഗമവും സംഘടിപ്പിക്കണം.',
    correctWingId: 'campus',
    distractorIds: ['trend', 'thwalaba', 'ibad'],
    whyNote:
      'ക്യാമ്പസ് & ഹയർ സെക്കൻഡറി വിംഗ് ആണ് കലാലയങ്ങളിലെ വിദ്യാർത്ഥി കൂട്ടായ്മകളും നാഷണൽ ക്യാമ്പസ് കോളും നയിക്കുന്നത്.',
  },
  {
    id: 'sc_thwalaba',
    category: 'education',
    contextLabel: 'ദർസ് & അറബിക് കോളേജ് വിദ്യാർത്ഥികൾ',
    situation:
      'പള്ളി ദർസുകളിലും ശരീഅത്ത്–അറബിക് കോളേജുകളിലും പഠിക്കുന്ന വിദ്യാർത്ഥികൾക്കായി അറബി–ഇംഗ്ലീഷ്–ഉറുദു പ്രഭാഷണ പരിശീലനവും സാഹിത്യ സംഗമവും സംഘടിപ്പിക്കണം.',
    correctWingId: 'thwalaba',
    distractorIds: ['campus', 'sargalayam', 'isthiqama'],
    whyNote:
      'ത്വലബ വിംഗ് (TWALABA) ആണ് ദർസ്–അറബിക് കോളേജ് വിദ്യാർത്ഥികളുടെ അക്കാദമിക്, കലാ, ക്ഷേമ പ്രവർത്തനങ്ങൾ ഏകോപിപ്പിക്കുന്നത്.',
  },
  {
    id: 'sc_sargalayam',
    category: 'education',
    contextLabel: 'കലയും സാഹിത്യവും',
    situation:
      'വിദ്യാർത്ഥികളുടെ മാപ്പിളപ്പാട്ട്, പ്രസംഗം, കഥ, കവിത, കാലിഗ്രഫി തുടങ്ങിയ കലാവാസനകൾ വളർത്താൻ ശാഖ മുതൽ സംസ്ഥാനം വരെ കലാ-സാഹിത്യ മേളകളും കളരികളും നടത്തണം.',
    correctWingId: 'sargalayam',
    distractorIds: ['maneesha', 'sathyadhara', 'trend'],
    whyNote:
      'സർഗ്ഗലയ (SARGALAYA) ആണ് കലാ-സാഹിത്യ മേളകളും യുവ എഴുത്തുകാരുടെയും കലാകാരന്മാരുടെയും കളരികളും സംഘടിപ്പിക്കുന്നത്.',
  },
  {
    id: 'sc_ibad',
    category: 'ideology',
    contextLabel: 'ദഅ്‌വത്തും ആത്മീയ ശിക്ഷണവും',
    situation:
      'കൗമാരക്കാർക്കായി ഇസ്‌ലാമിക് ടീനേജ് ക്യാമ്പും (ITC), മഹല്ലുകളിൽ ലഹരിവിരുദ്ധ ബോധവൽക്കരണവും, സ്നേഹപൂർവ്വമായ ‘ഖാഫില’ പ്രബോധന യാത്രയും സംഘടിപ്പിക്കണം.',
    correctWingId: 'ibad',
    distractorIds: ['isthiqama', 'ifc', 'campus'],
    whyNote:
      'ഇബാദ് (IBAD) ദഅ്‌വാ വിംഗ് ആണ് ഖാഫില പ്രബോധന യാത്ര, ITC ടീനേജ് ക്യാമ്പ്, ആത്മീയ തസ്കിയത്ത് ക്ലാസുകൾ എന്നിവ നയിക്കുന്നത്.',
  },
  {
    id: 'sc_isthiqama',
    category: 'ideology',
    contextLabel: 'ആദർശ പ്രതിരോധം',
    situation:
      'നിരീശ്വരവാദം, ലിബറലിസം, പുത്തനാശയങ്ങൾ എന്നിവയെക്കുറിച്ച് യുവാക്കൾക്ക് സംശയങ്ങൾ നീക്കാനും അഹ്‌ലുസ്സുന്നത്തിന്റെ ആശയം വ്യക്തമാക്കാനും ആദർശ പഠന സംവാദം നടത്തണം.',
    correctWingId: 'isthiqama',
    distractorIds: ['ibad', 'maneesha', 'thwalaba'],
    whyNote:
      'ഇസ്തിഖാമ (ISTHIQAMA) ആണ് അഹ്‌ലുസ്സുന്നത്തിന്റെ ആദർശ പ്രചാരണത്തിനും ആശയ പ്രതിരോധത്തിനുമായി പ്രവർത്തിക്കുന്ന വിഭാഗം.',
  },
  {
    id: 'sc_ifc',
    category: 'ideology',
    contextLabel: 'കുടുംബ ഭദ്രത & വനിതാ ക്ലസ്റ്റർ',
    situation:
      'ഒരു മഹല്ലിലെ 20 വീടുകളെ ഒരു ക്ലസ്റ്ററാക്കി തിരിച്ച് വനിതകൾക്ക് മതപഠനവും യുവദമ്പതികൾക്ക് വിവാഹപൂർവ്വ കൗൺസിലിംഗും നല്ല പാരന്റിംഗ് ശിൽപശാലയും നടത്തണം.',
    correctWingId: 'ifc',
    distractorIds: ['ibad', 'sahachari', 'organet'],
    whyNote:
      'ഇസ്‌ലാമിക് ഫാമിലി ക്ലസ്റ്റർ (IFC) ആണ് 20 വീടുകൾ ചേർന്ന കുടുംബ–വനിതാ പഠന ക്ലസ്റ്ററുകളും കൗൺസിലിംഗും നയിക്കുന്നത്.',
  },
  {
    id: 'sc_maneesha',
    category: 'ideology',
    contextLabel: 'സാംസ്കാരിക & ബൗദ്ധിക ഇടപെടൽ',
    situation:
      'എഴുത്തുകാരെയും അധ്യാപകരെയും ഗവേഷകരെയും ഉൾപ്പെടുത്തി കേരള ഇസ്‌ലാമിക പൈതൃകത്തെക്കുറിച്ച് പുസ്തക ചർച്ചയും സാംസ്കാരിക സെമിനാറും ചരിത്ര ഡോക്യുമെന്റേഷനും നടത്തണം.',
    correctWingId: 'maneesha',
    distractorIds: ['sargalayam', 'sathyadhara', 'isthiqama'],
    whyNote:
      'മനീഷ (MANEESHA) സാംസ്കാരിക–ബൗദ്ധിക ഫോറമാണ് സെമിനാറുകൾ, പുസ്തക ചർച്ചകൾ, ചരിത്ര ഗവേഷണം എന്നിവ നടത്തുന്നത്.',
  },
  {
    id: 'sc_cyber',
    category: 'media_org',
    contextLabel: 'ഡിജിറ്റൽ മീഡിയ & ഓൺലൈൻ ക്ലാസ്',
    situation:
      'ലോകമെമ്പാടുമുള്ള വിദ്യാർത്ഥികൾക്കായി ലൈവ് ഇസ്‌ലാമിക ഓൺലൈൻ ക്ലാസ് മുറിയും, സോഷ്യൽ മീഡിയ വ്യാജവാർത്താ പ്രതിരോധവും, സൈകോൺ ക്യാമ്പും സംഘടിപ്പിക്കണം.',
    correctWingId: 'cyber',
    distractorIds: ['organet', 'sathyadhara', 'trend'],
    whyNote:
      'മീഡിയ വിംഗ് (SKICR & സൈബർ വിംഗ്) ആണ് @SKICRTV ലൈവ് ക്ലാസുകളും സൈബർ ബോധവൽക്കരണവും സൈകോണും നയിക്കുന്നത്.',
  },
  {
    id: 'sc_organet',
    category: 'media_org',
    contextLabel: 'സംഘടനാ മോണിറ്ററിംഗ് & മെന്ററിംഗ്',
    situation:
      'ശാഖ–ക്ലസ്റ്റർ–മേഖല കമ്മിറ്റികളുടെ പ്രതിമാസ പ്രവർത്തന റിപ്പോർട്ടുകൾ ഓൺലൈൻ പോർട്ടലിൽ രേഖപ്പെടുത്താനും പുതിയ ഭാരവാഹികൾക്ക് മെന്ററിംഗ് കോഴ്സ് നൽകാനും വേണം.',
    correctWingId: 'organet',
    distractorIds: ['cyber', 'national_committee', 'forward_isa'],
    whyNote:
      'ഓർഗാനെറ്റ് (ORGANET) ആണ് organet.skssf.in പോർട്ടൽ വഴിയുള്ള ഡിജിറ്റൽ മോണിറ്ററിംഗും മെന്ററിംഗ് കോഴ്സുകളും നയിക്കുന്നത്.',
  },
  {
    id: 'sc_sathyadhara',
    category: 'media_org',
    contextLabel: 'ഔദ്യോഗിക പ്രസിദ്ധീകരണം & വായന',
    situation:
      'ഓരോ ശാഖയിലും SKSSF-ന്റെ ഔദ്യോഗിക ദൈ്വവാരികയ്ക്ക് പുതിയ വരിക്കാരെ ചേർക്കാനും സമകാലിക ലേഖനങ്ങളെക്കുറിച്ച് വായനാ കൂട്ടായ്മ സംഘടിപ്പിക്കാനും വേണം.',
    correctWingId: 'sathyadhara',
    distractorIds: ['maneesha', 'forward_isa', 'cyber'],
    whyNote:
      'സത്യധാര ദൈ്വവാരിക & ഗൾഫ് സത്യധാര ആണ് SKSSF-ന്റെ ഔദ്യോഗിക പ്രസിദ്ധീകരണവും വായനാ പ്രസ്ഥാനവും.',
  },
  {
    id: 'sc_national',
    category: 'media_org',
    contextLabel: 'ദേശീയ ക്യാമ്പസ് & ഹോസ്റ്റൽ സഹായം',
    situation:
      'കേരളത്തിന് പുറത്ത് ഡൽഹിയിലോ ബംഗളൂരുവിലോ കേന്ദ്ര സർവ്വകലാശാലയിൽ അഡ്മിഷൻ കിട്ടിയ വിദ്യാർത്ഥിക്ക് സുരക്ഷിതമായ ഹോസ്റ്റൽ താമസവും മാർഗ്ഗനിർദ്ദേശവും വേണം.',
    correctWingId: 'national_committee',
    distractorIds: ['campus', 'trend', 'organet'],
    whyNote:
      'SKSSF ദേശീയ സമിതി (National Committee) ആണ് ഡൽഹി–ബംഗളൂരു ഹോസ്റ്റലുകളും ഇതര സംസ്ഥാന വിദ്യാർത്ഥി ഏകോപനവും നടത്തുന്നത്.',
  },
  {
    id: 'sc_forward_isa',
    category: 'service',
    contextLabel: 'പുസ്തക പ്രസാധനം & യുവജന ശാക്തീകരണം',
    situation:
      'വിദ്യാർത്ഥികൾക്കായി ആധികാരിക ചരിത്ര–ആദർശ പുസ്തകങ്ങൾ പ്രസിദ്ധീകരിക്കാനും യുവജന നൈപുണ്യ വികസന പ്രോജക്ടുകൾ ആവിഷ്കരിക്കാനും ഏത് വിഭാഗമാണ് പ്രവർത്തിക്കുന്നത്?',
    correctWingId: 'forward_isa',
    distractorIds: ['sathyadhara', 'maneesha', 'sargalayam'],
    whyNote:
      'ഫോർവേഡ് ഫൗണ്ടേഷനും ഇസ്‌ലാമിക് സാഹിത്യ അക്കാദമിയും (ISA) ആണ് യുവജന ശാക്തീകരണ പദ്ധതികളും ആധികാരിക പുസ്തക പ്രസാധനവും നയിക്കുന്നത്.',
  },
];

const CATEGORY_TABS: { id: 'all' | WingCategory; label: string }[] = [
  { id: 'all', label: 'എല്ലാം (17 വിങ്ങുകൾ)' },
  { id: 'service', label: 'സേവനം' },
  { id: 'education', label: 'വിദ്യാഭ്യാസം' },
  { id: 'ideology', label: 'ആദർശം' },
  { id: 'media_org', label: 'മീഡിയ & സംഘടന' },
];

function shuffleItems<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const WingsScenarioChallenge: React.FC<{
  onAwardXp?: (amount: number, actionId: string) => void;
}> = ({ onAwardXp }) => {
  const [catFilter, setCatFilter] = useState<'all' | WingCategory>('all');
  const [seed, setSeed] = useState(0);
  const [idx, setIdx] = useState(0);
  const [pickedWingId, setPickedWingId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const wingById = useMemo(
    () => new Map(SKSSF_SUBWINGS.map((w) => [w.id, w])),
    []
  );

  const deck = useMemo(() => {
    const pool =
      catFilter === 'all'
        ? WING_SCENARIOS
        : WING_SCENARIOS.filter((s) => s.category === catFilter);
    const shuffled = shuffleItems(pool);
    return catFilter === 'all' ? shuffled.slice(0, 8) : shuffled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catFilter, seed]);

  const activeScenario = deck[idx] || deck[0];

  const optionWings = useMemo(() => {
    if (!activeScenario) return [];
    const ids = shuffleItems([activeScenario.correctWingId, ...activeScenario.distractorIds]);
    return ids.map((id) => wingById.get(id)).filter((w): w is NonNullable<typeof w> => Boolean(w));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScenario?.id, seed]);

  const resetRound = (nextCat?: 'all' | WingCategory) => {
    sound.playClick();
    if (nextCat !== undefined) setCatFilter(nextCat);
    setSeed((s) => s + 1);
    setIdx(0);
    setPickedWingId(null);
    setScore(0);
    setFinished(false);
  };

  const handlePickWing = (wingId: string) => {
    if (pickedWingId || !activeScenario) return;
    sound.unlockAudio();
    setPickedWingId(wingId);
    const isCorrect = wingId === activeScenario.correctWingId;
    if (isCorrect) {
      sound.playSuccess(2);
      setScore((s) => s + 1);
    } else {
      sound.playError();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (idx + 1 >= deck.length) {
      setFinished(true);
      sound.playSuccess(3);
      onAwardXp?.(25, `wing_scenarios_${catFilter}`);
    } else {
      setIdx((i) => i + 1);
      setPickedWingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Geometric Intro Header */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50/50 p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                സാഹചര്യങ്ങളും ഉപസമിതികളും (Real-Life Wing Scenarios)
              </h3>
              <p className="text-[11px] font-semibold text-slate-600 leading-snug mt-0.5">
                യഥാർത്ഥ സാമൂഹിക–വിദ്യാർത്ഥി സാഹചര്യം വായിച്ച് 17 SKSSF ഉപസമിതികളിൽ ശരിയായത് തിരഞ്ഞെടുക്കൂ.
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-emerald-900 tabular-nums whitespace-nowrap">
            സ്കോർ: {score}/{deck.length}
          </span>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {CATEGORY_TABS.map((tab) => {
            const active = catFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => resetRound(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold border transition-colors cursor-pointer ${
                  active
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {finished ? (
        <div className="rounded-2xl border-2 border-emerald-300 bg-white p-5 text-center space-y-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base sm:text-lg font-black text-emerald-950">
              മികച്ച പ്രകടനം! 17 ഉപസമിതി ചലഞ്ച് പൂർത്തിയാക്കി
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1 tabular-nums">
              നിങ്ങളുടെ സ്കോർ: {score} / {deck.length} · +25 XP ബോണസ്
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => resetRound()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-extrabold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>പുതിയ സാഹചര്യങ്ങൾ കളിക്കാം</span>
            </button>
          </div>
        </div>
      ) : (
        activeScenario && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
            {/* Progress & Context */}
            <div className="flex items-center justify-between gap-2 text-[11px] font-extrabold text-slate-500 tabular-nums">
              <span className="text-emerald-800">
                സാഹചര്യം {idx + 1} / {deck.length} · {activeScenario.contextLabel}
              </span>
              <span>{Math.round(((idx + 1) / Math.max(1, deck.length)) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${Math.round(((idx + 1) / Math.max(1, deck.length)) * 100)}%` }}
              />
            </div>

            {/* Scenario Prompt Box */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 sm:p-4">
              <p className="text-sm sm:text-base font-extrabold text-slate-900 leading-relaxed">
                “{activeScenario.situation}”
              </p>
            </div>

            {/* 4 Wing Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {optionWings.map((wing) => {
                const isPicked = pickedWingId === wing.id;
                const isCorrect = wing.id === activeScenario.correctWingId;
                let cls =
                  'bg-white hover:bg-emerald-50/70 border-slate-200 hover:border-emerald-400 text-slate-900';
                if (pickedWingId) {
                  if (isCorrect) {
                    cls = 'bg-emerald-50 border-emerald-600 text-emerald-950';
                  } else if (isPicked) {
                    cls = 'bg-rose-50 border-rose-500 text-rose-950';
                  } else {
                    cls = 'bg-slate-50 border-slate-200 text-slate-400 opacity-75';
                  }
                }
                return (
                  <button
                    key={wing.id}
                    type="button"
                    disabled={Boolean(pickedWingId)}
                    onClick={() => handlePickWing(wing.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-colors flex items-start justify-between gap-2 cursor-pointer ${cls}`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-extrabold leading-snug break-words">
                        {wing.name}
                      </p>
                      <p className="text-[11px] font-semibold opacity-75 mt-0.5 leading-snug truncate">
                        {wing.englishName}
                      </p>
                    </div>
                    <span className="shrink-0 mt-0.5">
                      {pickedWingId && isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      ) : pickedWingId && isPicked ? (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Shield className="w-4 h-4 text-slate-400" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation + Next Button */}
            {pickedWingId && (
              <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 p-3.5 space-y-2.5">
                <p className="text-xs font-extrabold text-emerald-950 leading-relaxed">
                  {pickedWingId === activeScenario.correctWingId
                    ? '✅ കൃത്യമായ ഉത്തരം! '
                    : '💡 ശരിയായ ഉപസമിതി: '}
                  {activeScenario.whyNote}
                </p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold cursor-pointer"
                  >
                    <span>{idx + 1 >= deck.length ? 'ഫലം കാണാം' : 'അടുത്ത സാഹചര്യം'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
