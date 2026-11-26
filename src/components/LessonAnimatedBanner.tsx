import React from 'react';
import { motion } from 'motion/react';
import { getOfficialLogosForLesson } from '../data/officialLogos';
import { getLinksForLesson } from '../data/officialLinks';
import { InlineOfficialLinksStrip } from './OfficialResourceHubModal';

type BannerTheme =
  | 'mosque_heritage'
  | 'cosmic_nature'
  | 'ocean_voyage'
  | 'madrasa_book'
  | 'flag_unit'
  | 'relief_vehicle'
  | 'global_airport'
  | 'office_budget'
  | 'cyber_media'
  | 'stage_art';

interface LessonQuickGuide {
  theme: BannerTheme;
  points: string[];
}

/* Concise, quiz-aligned 2–3 bullet quick points + matched animated banner for ALL 50 lessons */
const LESSON_QUICK_GUIDES: Record<string, LessonQuickGuide> = {
  prologue_curiosity: {
    theme: 'flag_unit',
    points: [
      '1926-ൽ രൂപീകൃതമായ സമസ്തയുടെ വിദ്യാർത്ഥി വിഭാഗമാണ് 1989 ഫെബ്രുവരി 19-ന് പിറന്ന SKSSF.',
      'മുദ്രാവാക്യം: “വിജ്ഞാനം · വിനയം · സേവനം” — അറിവും സേവനവും ഒരുമിപ്പിക്കുന്ന പ്രസ്ഥാനം.',
    ],
  },
  prologue_ch1: {
    theme: 'cosmic_nature',
    points: [
      'വിത്ത്, മഴ, സൂര്യൻ, ഹൃദയമിടിപ്പ് തുടങ്ങി പ്രപഞ്ചത്തിലെ ഓരോ കൃത്യതയും ഏക സൃഷ്ടാവായ അല്ലാഹുവിലേക്കുള്ള ദൃഷ്ടാന്തമാണ്.',
      'തുടക്കവും ഒടുക്കവുമില്ലാത്ത ഏക സൃഷ്ടാവായ അല്ലാഹുവിനെ തിരിച്ചറിയലാണ് വിശ്വാസത്തിന്റെ അടിത്തറ.',
    ],
  },
  prologue_ch2: {
    theme: 'madrasa_book',
    points: [
      'ഖുർആൻ ജീവിതത്തിൽ പ്രാവർത്തികമാക്കി കാണിച്ചുതരാനാണ് അല്ലാഹു മുഹമ്മദ് നബി ﷺ-യെ നിയോഗിച്ചത്.',
      'സ്വഹാബികൾ → താബിഉകൾ → പണ്ഡിത പരമ്പര വഴിയാണ് ശുദ്ധമായ അറിവ് നമ്മളിലെത്തിയത്.',
    ],
  },
  prologue_ch3: {
    theme: 'mosque_heritage',
    points: [
      '1926 ജൂൺ 26-ന് കോഴിക്കോട് ടൗൺ ഹാളിൽ വരക്കൽ മുല്ലക്കോയ തങ്ങളുടെ നേതൃത്വത്തിൽ സമസ്ത രൂപീകൃതമായി.',
      'അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ ആദർശ സംരക്ഷണവും മതവിദ്യാഭ്യാസ പ്രചാരണവുമാണ് പ്രധാന ലക്ഷ്യങ്ങൾ.',
    ],
  },
  prologue_ch4: {
    theme: 'madrasa_book',
    points: [
      '1951-ൽ സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ് (SKIMVB) നിലവിൽ വന്നു — ഇന്ന് 11,000+ മദ്രസകൾ!',
      '1989 ഫെബ്രുവരി 19-ന് SKSSF-ഉം 1993-ൽ മദ്രസ ബാലവേദിയായ SKSBV-യും രൂപീകൃതമായി.',
    ],
  },
  prologue_story: {
    theme: 'flag_unit',
    points: [
      'SKSSF-ന് യൂണിറ്റ്, ക്ലസ്റ്റർ, മേഖല, ജില്ല, സംസ്ഥാനം എന്നീ 5 സംഘടനാ ഘടകങ്ങളുണ്ട്.',
      'TREND, സഹചാരി, വിഖായ, സൈകോൺ, ഇബാദ് തുടങ്ങിയ 17 സബ് വിങ്ങുകൾ സമൂഹസേവനം നടത്തുന്നു.',
    ],
  },
  storyboard_ch1: {
    theme: 'mosque_heritage',
    points: [
      'പൂർവികർ വഖഫ് ചെയ്ത പള്ളികളിലെ മൗലിദ്, ഹദ്ദാദ് റാതീബ്, ദിക്ർ സദസ്സുകൾ പണ്ഡിത പാരമ്പര്യത്തിന്റെ ഭാഗമാണ്.',
      'ഖുർആനും ഹദീസും തോന്നിയപോലെ വ്യാഖ്യാനിക്കാതെ പണ്ഡിത പരമ്പരയോടൊപ്പം നിൽക്കണം.',
    ],
  },
  storyboard_ch2: {
    theme: 'global_airport',
    points: [
      '1995-ൽ കോഴിക്കോട് ടാഗോർ ഹാളിൽ ശംസുൽ ഉലമയുടെ സാന്നിധ്യത്തിൽ സമാധാനവും മതസൗഹാർദ്ദവും ഉയർത്തിപ്പിടിച്ചു.',
      'SKSSF TREND (TASTE, Educare, Future India IAS) വിദ്യാർത്ഥികളെ ഉന്നത വിദ്യാഭ്യാസത്തിലേക്ക് നയിക്കുന്നു.',
    ],
  },
  storyboard_ch3: {
    theme: 'relief_vehicle',
    points: [
      'ആത്മാർത്ഥതയോടെ (ഇഖ്‌ലാസ്) നിർധന രോഗികളെ സഹായിക്കാനുള്ള ജീവകാരുണ്യ വേദിയാണ് സഹചാരി റിലീഫ് സെൽ.',
      'ജാതി-മത ഭേദമന്യേ മരുന്ന്, രക്തദാനം, ചികിത്സാ സഹായം എത്തിക്കലാണ് സഹചാരിയുടെ മാതൃക.',
    ],
  },
  storyboard: {
    theme: 'cyber_media',
    points: [
      'സോഷ്യൽ മീഡിയയിൽ സത്യാവസ്ഥ പരിശോധിക്കാതെ വ്യാജവാർത്തകൾ ഫോർവേഡ് ചെയ്യരുത്.',
      'തർക്കുൽ മാലായഅ്നി (ആവശ്യമില്ലാത്ത തർക്കങ്ങൾ ഒഴിവാക്കൽ) ആണ് SKSSF സൈകോൺ (Cycone) സൈബർ മര്യാദ.',
    ],
  },
  pov_1: {
    theme: 'madrasa_book',
    points: [
      'മദ്രസയിൽ SKSBV-യിലൂടെ തുടങ്ങുന്ന വായനയും അദബും മികച്ച സംഘാടകനാക്കി വളർത്തുന്നു.',
      'ഖുർആൻ, ഹദീസ്, ഫിഖ്ഹ്, ചരിത്ര ഗ്രന്ഥങ്ങൾ ക്രമമായി സൂക്ഷിക്കുകയും വായിക്കുകയും വേണം.',
    ],
  },
  pov_2: {
    theme: 'mosque_heritage',
    points: [
      'മജ്‌ലിസുന്നൂർ ആത്മീയ സദസ്സിന് കൃത്യമായ അജണ്ടയും പണ്ഡിത സാന്നിധ്യവും നോട്ടീസും ഒരുക്കണം.',
      'നോട്ടീസിൽ ഔദ്യോഗിക SKSSF പതാകയും കൃത്യമായ സ്ഥലവും സമയവും വ്യക്തമാക്കണം.',
    ],
  },
  pov_3: {
    theme: 'stage_art',
    points: [
      'സമ്മേളന ചുമരിലെഴുത്തും പോസ്റ്ററുകളും വൃത്തിയായും അനുവാദത്തോടെയും ആദർശ സന്ദേശത്തോടെയും ഒരുക്കണം.',
      'പൊതുസ്വത്തിന് കേടുപാട് വരാതെയും മാന്യമായ ഭാഷയിലും പ്രചാരണം നടത്തണം.',
    ],
  },
  pov_4: {
    theme: 'stage_art',
    points: [
      'പരിപാടി സ്റ്റേജ് തറ മുതൽ മേൽക്കൂര, ബാനർ, കസേര, മൈക്ക് വരെ കൃത്യമായ ക്രമത്തിലും സുരക്ഷയിലും ഒരുക്കണം.',
      'കൂട്ടായ്മയോടെ (ടീം വർക്ക്) ഓരോ ചുമതലയും പങ്കിട്ടെടുത്താൽ ഏതു പ്രോഗ്രാമും വിജയിക്കും.',
    ],
  },
  pov_5: {
    theme: 'flag_unit',
    points: [
      'യൂണിറ്റ് കമ്മിറ്റിയിൽ 15 അംഗങ്ങളുണ്ടാകും — പ്രസിഡന്റ്, ജനറൽ സെക്രട്ടറി, ട്രഷറർ എന്നിവർ മുഖ്യ ഭാരവാഹികൾ.',
      'ഓർഗാനെറ്റ് (Organet) പോർട്ടൽ വഴിയാണ് യൂണിറ്റ് മെമ്പർഷിപ്പും കമ്മിറ്റിയും ഔദ്യോഗികമായി രജിസ്റ്റർ ചെയ്യുന്നത്.',
    ],
  },
  pov_6: {
    theme: 'office_budget',
    points: [
      'ഏത് പരിപാടിക്കും സുതാര്യമായ വരവ്–ചെലവ് കണക്കും കൃത്യമായ നീക്കിയിരിപ്പും (വരവ് − ചെലവ്) സൂക്ഷിക്കണം.',
      'ബറക്കത്തിന് നൽകുന്ന ചീരണിയും ഭക്ഷണവും വൃത്തിയോടെ വിതരണം ചെയ്ത് കണക്ക് കമ്മിറ്റിയിൽ അവതരിപ്പിക്കണം.',
    ],
  },
  pov_7: {
    theme: 'relief_vehicle',
    points: [
      'പരിപാടി കഴിഞ്ഞാൽ ഗ്രൗണ്ടും പരിസരവും പൂർണ്ണമായി വൃത്തിയാക്കി മാലിന്യം സുരക്ഷിതമായി നീക്കണം.',
      'വിഖായ വോളണ്ടിയർമാരുടെ ഈ ശുചീകരണ മാതൃക സമൂഹത്തിന് വലിയ സന്ദേശമാണ് നൽകുന്നത്.',
    ],
  },
  pov_journey: {
    theme: 'office_budget',
    points: [
      'പരിപാടിക്ക് ശേഷം അവലോകന യോഗം ചേർന്ന് പങ്കാളിത്തം, വരവ്-ചെലവ്, മിനിറ്റ്സ് എന്നിവ രേഖപ്പെടുത്തണം.',
      'മേൽഘടകത്തിൽ നിന്നുള്ള സർക്കുലറുകൾ കൃത്യമായി നടപ്പിലാക്കി റിപ്പോർട്ട് സമർപ്പിക്കണം.',
    ],
  },
  l1_era_1: {
    theme: 'ocean_voyage',
    points: [
      '1926 ജൂൺ 26-ന് കോഴിക്കോട് ടൗൺ ഹാളിൽ സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമ രൂപീകൃതമായി.',
      'വരക്കൽ മുല്ലക്കോയ തങ്ങൾ പ്രഥമ പ്രസിഡന്റും പാങ്ങിൽ അഹമ്മദ് കുട്ടി മുസ്‌ലിയാർ മുഖ്യ സംഘാടകനുമായിരുന്നു.',
    ],
  },
  l1_era_2: {
    theme: 'office_budget',
    points: [
      '1934 നവംബർ 14-ന് സമസ്ത ഔദ്യോഗികമായി സൊസൈറ്റീസ് ആക്ട് പ്രകാരം രജിസ്റ്റർ ചെയ്തു.',
      'അഹ്‌ലുസ്സുന്നത്തി വൽ ജമാഅത്തിന്റെ ആശയാദർശങ്ങൾ നിയമപരമായും വ്യവസ്ഥാപിതമായും ഉറപ്പിച്ചു.',
    ],
  },
  l1_era_3: {
    theme: 'madrasa_book',
    points: [
      '1951 സെപ്റ്റംബർ 17-ന് സമസ്ത കേരള ഇസ്‌ലാം മത വിദ്യാഭ്യാസ ബോർഡ് (SKIMVB) രൂപീകരിച്ചു.',
      'ഏകീകൃത പാഠ്യപദ്ധതിയോടെ 11,000-ത്തിലധികം മദ്രസകളിലൂടെ ലക്ഷക്കണക്കിന് കുട്ടികൾക്ക് മതവിദ്യാഭ്യാസം നൽകുന്നു.',
    ],
  },
  l1_era_4: {
    theme: 'flag_unit',
    points: [
      '1989 ഫെബ്രുവരി 19-ന് കോഴിക്കോട് സാമൂതിരി ഹൈസ്കൂളിൽ SKSSF രൂപീകൃതമായി.',
      'വിദ്യാർത്ഥി സമൂഹത്തെ അറിവ്, വിനയം, സേവനം എന്നിവയിൽ വാർത്തെടുക്കുകയാണ് ലക്ഷ്യം.',
    ],
  },
  l1_timeline: {
    theme: 'global_airport',
    points: [
      '1993-ൽ മദ്രസ വിദ്യാർത്ഥികൾക്കായി SKSBV ബാലവേദി നിലവിൽ വന്നു.',
      'ഇന്ത്യയ്ക്കകത്തും വിദേശത്തും SIC (സമസ്ത ഇസ്‌ലാമിക് സെന്റർ) വഴി ആഗോള ശൃംഖലയായി വളർന്നു.',
    ],
  },
  l1_flags: {
    theme: 'flag_unit',
    points: [
      'SKSSF പതാകയിൽ ആകാശനീല ചതുരവും വെള്ള പശ്ചാത്തലവും പച്ച വരയും ചന്ദ്രക്കല–നക്ഷത്ര–മസ്ജിദ് അടയാളവുമുണ്ട്.',
      'സമസ്ത പതാകയിൽ കടും മെറൂൺ നിറമാണ് മുകളിലെ ചതുരത്തിന് ഉപയോഗിക്കുന്നത്.',
    ],
  },
  l1_cosmic: {
    theme: 'cosmic_nature',
    points: [
      'മഴയും ചെടികളും സൂര്യനും ചന്ദ്രനും കൃത്യമായ നിയമത്തിൽ ചലിക്കുന്നത് അല്ലാഹുവിന്റെ സൃഷ്ടിപ്പിന്റെ തെളിവാണ്.',
      'വെള്ളം അല്ലാഹുവിന്റെ അനുഗ്രഹമാണ് — ഒരു തുള്ളി പോലും പാഴാക്കാതെ സംരക്ഷിക്കണം.',
    ],
  },
  l1_roots: {
    theme: 'ocean_voyage',
    points: [
      'പൊന്നാനി വലിയ പള്ളി, വരക്കൽ മഖാം, 1951 SKIMVB, 1963 ജാമിഅ നൂരിയ്യ എന്നിവ സമസ്തയുടെ വിജ്ഞാന വേരുകളാണ്.',
      'മത-ഭൗതിക സമന്വയ വിദ്യാഭ്യാസവും പണ്ഡിത നേതൃത്വവുമാണ് ഈ പൈതൃകത്തിന്റെ കരുത്ത്.',
    ],
  },
  l2_memory: {
    theme: 'flag_unit',
    points: [
      'സമസ്ത (1926), SKIMVB (1951), SKSSF (1989), SKSBV (1993) എന്നിവയുടെ അടയാളങ്ങളും ദൗത്യങ്ങളും തിരിച്ചറിയണം.',
      'ഓരോ പോഷക സംഘടനയും സമസ്തയുടെ നേതൃത്വത്തിൽ ഒരേ ആദർശത്തിൽ പ്രവർത്തിക്കുന്നു.',
    ],
  },
  l2_madrasa_board: {
    theme: 'madrasa_book',
    points: [
      '1951-ൽ സ്ഥാപിതമായ SKIMVB ലോകത്തിലെ ഏറ്റവും വലിയ മതവിദ്യാഭ്യാസ ശൃംഖലകളിലൊന്നാണ്.',
      'അൽബിർ (Al-Birr) പ്രീ-സ്കൂളും SNEC സമന്വയ വിദ്യാഭ്യാസവും ഇതിന്റെ ആധുനിക മുന്നേറ്റങ്ങളാണ്.',
    ],
  },
  l2_tiers: {
    theme: 'office_budget',
    points: [
      '5 ഘടക കമ്മിറ്റി അംഗസംഖ്യ: യൂണിറ്റ് 15 · ക്ലസ്റ്റർ 19 · മേഖല 21 · ജില്ല 25 · സംസ്ഥാനം 31.',
      'ഓർഗാനെറ്റ് (Organet) ഡിജിറ്റൽ സംവിധാനം വഴിയാണ് എല്ലാ ഘടകങ്ങളും ബന്ധിപ്പിച്ചിരിക്കുന്നത്.',
    ],
  },
  l2_election_roles: {
    theme: 'office_budget',
    points: [
      'പ്രസിഡന്റ് യോഗ അധ്യക്ഷതയും കൂട്ടായ്മയും നയിക്കുന്നു; ജനറൽ സെക്രട്ടറി മിനിറ്റ്സും റിപ്പോർട്ടും കാര്യനിർവ്വഹണവും ചെയ്യുന്നു.',
      'ട്രഷറർ വരവ്-ചെലവ് കണക്കുകളും ഫണ്ടും സുതാര്യമായി സൂക്ഷിക്കുന്നു.',
    ],
  },
  l2_centres: {
    theme: 'global_airport',
    points: [
      'കോഴിക്കോട് ഇസ്‌ലാമിക് സെന്റർ ആസ്ഥാനവും ഡൽഹി, ബെംഗളൂരു, ചെന്നൈ തുടങ്ങിയ നഗരങ്ങളിൽ വിദ്യാർത്ഥി ഹോസ്റ്റലുകളുമുണ്ട്.',
      'സഹചാരി മെഡിക്കൽ ഹെൽപ്പ് ഡെസ്കുകൾ ആശുപത്രികളിൽ രോഗികൾക്ക് ആശ്രയമാകുന്നു.',
    ],
  },
  l2_dispatch: {
    theme: 'relief_vehicle',
    points: [
      'വിഖായ (രക്ഷാദൗത്യം), സഹചാരി (ആതുരസേവനം), ട്രെൻഡ് (വിദ്യാഭ്യാസം), ഇബാദ് (പ്രബോധനം), സൈകോൺ (സൈബർ), സർഗ്ഗലയം (കല) തുടങ്ങി 17 സബ് വിങ്ങുകൾ!',
      'ഓരോ സാമൂഹിക ആവശ്യത്തിനും കൃത്യമായ വിംഗ് വഴി സേവനം എത്തിക്കുന്നു.',
    ],
  },
  l2_dawa_age: {
    theme: 'flag_unit',
    points: [
      'മദ്രസ പ്രായത്തിൽ SKSBV-യിലും, 14 മുതൽ 40 വയസ്സ് വരെ SKSSF-ലും സജീവമായി പ്രവർത്തിക്കാം.',
      '18 വയസ്സ് തികഞ്ഞവർക്ക് SKSSF-നൊപ്പം SYS-ലും സഹകരിച്ച് പ്രവർത്തിക്കാം.',
    ],
  },
  l2_dawa_lanterns: {
    theme: 'mosque_heritage',
    points: [
      'സൽസ്വഭാവം, സൗഹൃദം, സേവനം, അറിവ്, പ്രാർത്ഥന എന്നീ 5 വിളക്കുകളാണ് നാട്ടിലെ പ്രബോധന വഴി.',
      'സ്നേഹത്തോടെയും മാതൃകയോടെയും പെരുമാറലാണ് ഏറ്റവും നല്ല ദഅ്‌വത്ത്.',
    ],
  },
  l2_vault: {
    theme: 'cyber_media',
    points: [
      'സുപ്രഭാതം ദിനപത്രവും സത്യധാര ദ്വൈവാരികയും സുന്നി അഫ്കാർ വാരികയും സമസ്തയുടെ ശബ്ദമാണ്.',
      'ജാമിഅ നൂരിയ്യ പട്ടിക്കാടും ദാറുൽ ഹുദാ ചെമ്മാടും ഉന്നത മത-ഭൗതിക സ്ഥാപനങ്ങളാണ്.',
    ],
  },
  l3_sky_catcher: {
    theme: 'cosmic_nature',
    points: [
      'വിനയം, സത്യസന്ധത, ഇഖ്‌ലാസ്, സേവന മനസ്സ് എന്നിവ ജീവിതത്തിൽ പിടിച്ചെടുക്കണം.',
      'അഹങ്കാരം, അസൂയ, പരദൂഷണം, അലസത എന്നീ കെണികളെ തകർത്ത് അകറ്റിനിർത്തണം.',
    ],
  },
  l3_scrolls: {
    theme: 'madrasa_book',
    points: [
      'തിരുനബി ﷺ-യുടെ വിനയം, കാരുണ്യം, രക്ഷിതാക്കളോടുള്ള സ്നേഹം, സത്യം പറയൽ എന്നിവയാണ് നമ്മുടെ മാതൃക.',
      'തെറ്റ് പറ്റിയാൽ വിനയത്തോടെ തിരുത്താൻ തയ്യാറാകുന്നവനാണ് യഥാർത്ഥ പ്രവർത്തകൻ.',
    ],
  },
  l3_mind_chain: {
    theme: 'stage_art',
    points: [
      'വിശ്വാസം → നല്ല ചിന്ത → നല്ല ശീലം → നല്ല സ്വഭാവം → വിജയകരമായ നേതൃത്വം ഇതാണ് മനസ്സിന്റെ 5 പടവുകൾ.',
      'TREND (TASTE & Educare) വിദ്യാർത്ഥികളുടെ ആത്മവിശ്വാസവും കരിയറും വളർത്തുന്നു.',
    ],
  },
  l3_unit_desks: {
    theme: 'office_budget',
    points: [
      'പ്രസിഡന്റ് അധ്യക്ഷതയും അംഗീകാരവും, സെക്രട്ടറി മിനിറ്റ്സും നോട്ടീസും, ട്രഷറർ രസീതും ബജറ്റും കൈകാര്യം ചെയ്യുന്നു.',
      'ഓരോ ഫയലും ഉത്തരവാദിത്തമുള്ള ഭാരവാഹിയുടെ മേൽനോട്ടത്തിൽ കൃത്യമായി സൂക്ഷിക്കണം.',
    ],
  },
  l3_newsroom: {
    theme: 'cyber_media',
    points: [
      'വാർത്തയിലും പത്രക്കുറിപ്പിലും 5W & 1H (എന്ത്, ആര്, എപ്പോൾ, എവിടെ, എന്തുകൊണ്ട്, എങ്ങനെ) കൃത്യമായിരിക്കണം.',
      'അതിശയോക്തി ഒഴിവാക്കി വസ്തുതകൾ മാത്രം മാന്യമായി എഴുതണം; യോഗ മിനിറ്റ്സിൽ ഒപ്പും തീയതിയും നിർബന്ധം.',
    ],
  },
  l4_climb: {
    theme: 'global_airport',
    points: [
      'ശാഖ → ക്ലസ്റ്റർ → മേഖല → ജില്ല → സംസ്ഥാനം → ദേശീയം → ആഗോളം (SIC & ഗ്ലോബൽ വിഖായ) ഇതാണ് 7 പടികൾ.',
      'ലോകമെമ്പാടുമുള്ള സമസ്ത ഇസ്‌ലാമിക് സെന്ററുകൾ (SIC) പ്രവാസി സമൂഹത്തിന് താങ്ങായി പ്രവർത്തിക്കുന്നു.',
    ],
  },
  l4_viqaya_van: {
    theme: 'relief_vehicle',
    points: [
      'പ്രളയം, അപകടം, മക്ക-മദീന ഹജ്ജ് സേവനം തുടങ്ങി ഏത് അടിയന്തര ഘട്ടത്തിലും മുൻനിരയിലാണ് വിഖായ & ALERT.',
      'നിസ്വാർത്ഥമായ സേവനവും കൃത്യമായ അച്ചടക്കവുമാണ് വിഖായ വോളണ്ടിയർമാരുടെ മുഖമുദ്ര.',
    ],
  },
  l4_compass: {
    theme: 'ocean_voyage',
    points: [
      'ശൂറ (കൂടിയാലോചന), 5 ആസൂത്രണ ചോദ്യങ്ങൾ, കൃത്യനിഷ്ഠ എന്നിവ മികച്ച സംഘാടകന്റെ കോമ്പസാണ്.',
      'ജിറാഫിന്റെ ദൂരക്കാഴ്ചയും കൂടെയുള്ളവരെ ഉയർത്തുന്ന ഏണി മനോഭാവവും നേതാവിന് വേണം.',
    ],
  },
  l4_bag: {
    theme: 'office_budget',
    points: [
      'സമ്മേളനത്തിന് പോകുമ്പോൾ മിനിറ്റ്സ് ബുക്ക്, മെമ്പർഷിപ്പ് രേഖ, SKSSF പതാക, ഫസ്റ്റ്-എയ്ഡ് കിറ്റ് എന്നിവ കരുതണം.',
      'കൃത്യമായ മുന്നൊരുക്കം (Pre-planning) സമ്മേളന വിജയത്തിന്റെ പകുതിയാണ്.',
    ],
  },
  l4_crisis: {
    theme: 'relief_vehicle',
    points: [
      'പ്രതിസന്ധിയിൽ പതറാതെ Leader–Plan–Communicate (L-P-C) മാതൃകയിൽ ടീമിനെ ഏകോപിപ്പിക്കണം.',
      'അഭിപ്രായവ്യത്യാസങ്ങൾ ശാന്തമായി സംസാരിച്ച് പരിഹരിച്ച് കൂട്ടായ്മ കാത്തുസൂക്ഷിക്കണം.',
    ],
  },
  l4_cyber_shield: {
    theme: 'cyber_media',
    points: [
      'ഉറവിടം ഉറപ്പില്ലാത്ത സന്ദേശങ്ങൾ പ്രചരിപ്പിക്കരുത്; പ്രകോപന കമന്റ് യുദ്ധങ്ങളിൽ നിന്ന് അകന്നുനിൽക്കണം.',
      'സൈബർ ലോകത്ത് നല്ല അറിവുകളും സേവന സന്ദേശങ്ങളും മാത്രം പങ്കുവെക്കുക.',
    ],
  },
  l4_sahachari: {
    theme: 'relief_vehicle',
    points: [
      'സഹചാരി റിലീഫ് സെൽ ഡയാലിസിസ്, മരുന്ന്, രക്തദാനം, ഭവന നിർമ്മാണം എന്നിവയിലൂടെ പാവപ്പെട്ടവർക്ക് തുണയാകുന്നു.',
      'എല്ലാ വർഷവും റിലീഫ് ഫണ്ട് സമാഹരിച്ച് ജാതി-മത ഭേദമന്യേ സഹായം വിതരണം ചെയ്യുന്നു.',
    ],
  },
  l4_trend_career: {
    theme: 'global_airport',
    points: [
      'TREND വഴി TASTE, Educare, Future India IAS, TREND CA തുടങ്ങി ഉന്നത കരിയർ പരിശീലനങ്ങൾ നൽകുന്നു.',
      'കൃത്യമായ ലക്ഷ്യബോധവും വായനയും ഉണ്ടെങ്കിൽ സിവിൽ സർവീസ് വരെ നേടാം.',
    ],
  },
  l4_sargalayam: {
    theme: 'stage_art',
    points: [
      'വിദ്യാർത്ഥികളുടെ പ്രസംഗം, ഖിറാഅത്ത്, എഴുത്ത്, മാപ്പിളപ്പാട്ട്, കലിഗ്രഫി കഴിവുകൾ വളർത്തുന്ന വേദിയാണ് സർഗ്ഗലയം.',
      'ധാർമ്മിക മൂല്യങ്ങളെ മുറുകെപ്പിടിച്ചുള്ള സർഗ്ഗാത്മക കലാപ്രതിഭകളെ വാർത്തെടുക്കുന്നു.',
    ],
  },
  l4_green_earth: {
    theme: 'cosmic_nature',
    points: [
      '“തൈ നടുന്നത് സ്വദഖയാണ്” എന്ന പ്രവാചക വചനം പകർത്തി മരങ്ങൾ നട്ടും പ്ലാസ്റ്റിക് കുറച്ചും പ്രകൃതിയെ കാക്കണം.',
      'മദ്‌റസയും ക്യാമ്പസും ഹരിതാഭമാക്കൽ നമ്മുടെ ഓരോരുത്തരുടെയും ഉത്തരവാദിത്തമാണ്.',
    ],
  },
  l4_samastha_portals: {
    theme: 'madrasa_book',
    points: [
      'SKIMVB (1951), SKJMCC (1959 · 1 ലക്ഷം അധ്യാപകർ), SNEC (ശരീഅഃ/ഷീ/ലൈഫ്), CSWC (114 വനിതാ കോളേജുകൾ), Al-Birr (350+ ശാഖകൾ) എന്നിവ സമസ്തയുടെ വിദ്യാഭ്യാസ നാവുകളാണ്.',
      'Samastha E-Learning (26+ രാജ്യങ്ങൾ), ASMI, ജാമിഅ നൂരിയ്യ (1963), ജാമിഅ ജലാലിയ്യ, MEAEC എന്നിവയുടെ ഔദ്യോഗിക സൈറ്റുകൾ നേരിട്ട് ഉപയോഗിക്കാം.',
    ],
  },
  l4_media_youtube_hub: {
    theme: 'cyber_media',
    points: [
      'സുപ്രഭാതം ദിനപത്രം & ഇ-പേപ്പർ, അൽ-മുഅല്ലിം (1959), സന്തുഷ്ട കുടുംബം, കുരുന്നുകൾ, സത്യധാര (1997) എന്നിവ സമസ്തയുടെ പ്രമുഖ പ്രസിദ്ധീകരണങ്ങളാണ്.',
      '@SAMASTHAONLINEOFFICAL, @SKICROfficial, @balavedhi, @trendkerala, @skssfsargalaya തുടങ്ങിയ യൂട്യൂബ് ചാനലുകൾ വിദ്യാർത്ഥികൾക്ക് പഠനത്തിനായി ഉപയോഗിക്കാം.',
    ],
  },
};

function resolveQuickGuide(lessonId: string): LessonQuickGuide {
  if (LESSON_QUICK_GUIDES[lessonId]) return LESSON_QUICK_GUIDES[lessonId];
  if (lessonId.includes('cyber') || lessonId.includes('news')) {
    return { theme: 'cyber_media', points: ['സത്യസന്ധമായ വിവരങ്ങളും മാന്യമായ ആശയവിനിമയവുമാണ് SKSSF മാതൃക.'] };
  }
  if (lessonId.includes('sahachari') || lessonId.includes('viqaya') || lessonId.includes('crisis')) {
    return { theme: 'relief_vehicle', points: ['നിസ്വാർത്ഥമായ സേവനവും കൃത്യമായ ആസൂത്രണവുമാണ് സംഘടനാ കരുത്ത്.'] };
  }
  return {
    theme: 'mosque_heritage',
    points: ['അറിവും വിനയവും സേവനവും ചേർന്ന SKSSF പാഠം ശ്രദ്ധയോടെ മനസ്സിലാക്കി ക്വിസ് വിജയിക്കാം.'],
  };
}

const AnimatedSceneArt: React.FC<{ theme: BannerTheme }> = ({ theme }) => {
  switch (theme) {
    case 'mosque_heritage':
      return (
        <svg viewBox="0 0 420 110" className="w-full h-24 sm:h-28 block" aria-hidden="true">
          <defs>
            <linearGradient id="bn-mosque" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#064E3B" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
          <rect width="420" height="110" fill="url(#bn-mosque)" />
          <motion.circle
            cx="54"
            cy="28"
            r="14"
            fill="#FDE047"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <circle cx="60" cy="24" r="11" fill="#064E3B" />
          {[110, 165, 290, 355].map((sx, i) => (
            <motion.circle
              key={sx}
              cx={sx}
              cy={18 + (i % 2) * 14}
              r="2.2"
              fill="#FEF08A"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2 + i * 0.4, repeat: Infinity }}
            />
          ))}
          <rect x="0" y="92" width="420" height="18" fill="#15803D" />
          {/* Mosque Silhouette */}
          <rect x="145" y="56" width="130" height="36" rx="3" fill="#ECFDF5" />
          <path d="M168 56 Q210 14 252 56 Z" fill="#F59E0B" stroke="#FEF08A" strokeWidth="2" />
          <line x1="210" y1="16" x2="210" y2="30" stroke="#FEF08A" strokeWidth="2.2" />
          <rect x="130" y="34" width="14" height="58" fill="#D1FAE5" />
          <path d="M128 34 Q137 20 146 34 Z" fill="#F59E0B" />
          <rect x="276" y="34" width="14" height="58" fill="#D1FAE5" />
          <path d="M274 34 Q283 20 292 34 Z" fill="#F59E0B" />
          <path d="M196 92 V72 Q210 62 224 72 V92 Z" fill="#065F46" />
        </svg>
      );

    case 'cosmic_nature':
      return (
        <svg viewBox="0 0 420 110" className="w-full h-24 sm:h-28 block" aria-hidden="true">
          <rect width="420" height="110" fill="#0EA5E9" />
          <motion.circle
            cx="355"
            cy="30"
            r="16"
            fill="#FACC15"
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          />
          <motion.g animate={{ x: [0, 18, 0] }} transition={{ duration: 6, repeat: Infinity }}>
            <ellipse cx="95" cy="30" rx="28" ry="12" fill="#FFFFFF" opacity="0.9" />
            <ellipse cx="115" cy="28" rx="20" ry="10" fill="#FFFFFF" opacity="0.95" />
          </motion.g>
          {[85, 102, 118].map((rx, i) => (
            <motion.line
              key={rx}
              x1={rx}
              y1="44"
              x2={rx - 4}
              y2="56"
              stroke="#E0F2FE"
              strokeWidth="2.5"
              strokeLinecap="round"
              animate={{ y: [0, 32], opacity: [1, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          <path d="M0 84 Q110 64 220 82 T420 76 L420 110 L0 110 Z" fill="#16A34A" />
          {[185, 245, 305].map((tx, i) => (
            <motion.g
              key={tx}
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 2.5 + i * 0.4, repeat: Infinity }}
              style={{ transformOrigin: `${tx}px 95px` }}
            >
              <rect x={tx - 3} y="66" width="6" height="28" fill="#78350F" />
              <circle cx={tx} cy="60" r="15" fill={i === 1 ? '#15803D' : '#22C55E'} />
            </motion.g>
          ))}
        </svg>
      );

    case 'ocean_voyage':
      return (
        <svg viewBox="0 0 420 110" className="w-full h-24 sm:h-28 block" aria-hidden="true">
          <rect width="420" height="110" fill="#38BDF8" />
          <circle cx="345" cy="28" r="14" fill="#FDE047" />
          <rect x="0" y="72" width="420" height="38" fill="#0284C7" />
          <motion.path
            d="M-20 78 Q30 70 80 78 T180 78 T280 78 T380 78 T460 78"
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="3"
            animate={{ x: [0, -35, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.g
            animate={{ x: [0, 36, 0], y: [0, -3, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M150 74 L218 74 L206 90 L162 90 Z" fill="#78350F" stroke="#FDE68A" strokeWidth="1.5" />
            <line x1="184" y1="30" x2="184" y2="74" stroke="#F8FAFC" strokeWidth="3" />
            <path d="M186 34 Q215 52 188 70 Z" fill="#FFFFFF" />
            <rect x="160" y="32" width="22" height="14" rx="2" fill="#0EA5E9" />
            <rect x="160" y="42" width="22" height="4" fill="#16A34A" />
          </motion.g>
        </svg>
      );

    case 'madrasa_book':
      return (
        <svg viewBox="0 0 420 110" className="w-full h-24 sm:h-28 block" aria-hidden="true">
          <rect width="420" height="110" fill="#1E3A8A" />
          {[80, 145, 275, 340].map((sx, i) => (
            <motion.text
              key={sx}
              x={sx}
              y={32 + (i % 2) * 18}
              fontSize="14"
              animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.2 + i * 0.3, repeat: Infinity }}
            >
              ✨
            </motion.text>
          ))}
          <motion.g
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          >
            <path d="M145 84 Q178 72 210 84 L210 38 Q178 26 145 38 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
            <path d="M275 84 Q242 72 210 84 L210 38 Q242 26 275 38 Z" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2.5" />
            <line x1="158" y1="50" x2="196" y2="54" stroke="#94A3B8" strokeWidth="2" />
            <line x1="158" y1="62" x2="196" y2="66" stroke="#94A3B8" strokeWidth="2" />
            <line x1="224" y1="54" x2="262" y2="50" stroke="#94A3B8" strokeWidth="2" />
            <line x1="224" y1="66" x2="262" y2="62" stroke="#94A3B8" strokeWidth="2" />
          </motion.g>
        </svg>
      );

    case 'flag_unit':
      return (
        <svg viewBox="0 0 420 110" className="w-full h-24 sm:h-28 block" aria-hidden="true">
          <rect width="420" height="110" fill="#065F46" />
          <rect x="0" y="90" width="420" height="20" fill="#16A34A" />
          <rect x="172" y="16" width="5" height="78" fill="#E2E8F0" />
          <circle cx="174.5" cy="15" r="5" fill="#FACC15" />
          <motion.g
            animate={{ skewY: [-2.5, 2.5, -2.5] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ transformOrigin: '177px 36px' }}
          >
            <rect x="177" y="18" width="84" height="48" rx="2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
            <rect x="177" y="18" width="32" height="32" fill="#0EA5E9" />
            <circle cx="193" cy="34" r="7" fill="#FFFFFF" />
            <circle cx="190" cy="32" r="5.5" fill="#0EA5E9" />
            <rect x="177" y="50" width="84" height="16" fill="#16A34A" />
            <text x="219" y="61" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="900">
              SKSSF
            </text>
          </motion.g>
        </svg>
      );

    case 'relief_vehicle':
      return (
        <svg viewBox="0 0 420 110" className="w-full h-24 sm:h-28 block" aria-hidden="true">
          <rect width="420" height="110" fill="#0F172A" />
          <rect x="0" y="84" width="420" height="26" fill="#334155" />
          <line x1="0" y1="97" x2="420" y2="97" stroke="#FACC15" strokeWidth="2.5" strokeDasharray="16 12" />
          {/* Ground Hospital & Mosque Silhouettes */}
          <rect x="30" y="42" width="56" height="42" rx="3" fill="#E2E8F0" />
          <rect x="52" y="50" width="12" height="4" fill="#EF4444" />
          <rect x="56" y="46" width="4" height="12" fill="#EF4444" />
          <rect x="330" y="48" width="60" height="36" rx="3" fill="#065F46" />
          <path d="M338 48 Q360 22 382 48 Z" fill="#F59E0B" />
          {/* Moving Rescue Van */}
          <motion.g
            animate={{ x: [-25, 45, -25] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <rect x="165" y="46" width="82" height="34" rx="7" fill="#FFFFFF" stroke="#0F766E" strokeWidth="2" />
            <rect x="214" y="52" width="26" height="14" rx="3" fill="#BAE6FD" />
            <rect x="180" y="56" width="14" height="5" fill="#10B981" />
            <rect x="184.5" y="51.5" width="5" height="14" fill="#10B981" />
            <motion.circle
              cx="205"
              cy="43"
              r="5"
              fill="#EF4444"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <circle cx="184" cy="82" r="8" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="230" cy="82" r="8" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2" />
          </motion.g>
        </svg>
      );

    case 'global_airport':
      return (
        <svg viewBox="0 0 420 110" className="w-full h-24 sm:h-28 block" aria-hidden="true">
          <defs>
            <linearGradient id="bn-air" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0C4A6E" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <rect width="420" height="110" fill="url(#bn-air)" />
          <rect x="0" y="84" width="420" height="26" fill="#334155" />
          <line x1="0" y1="97" x2="420" y2="97" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="18 14" />
          {/* Control Tower */}
          <rect x="335" y="44" width="14" height="40" fill="#CBD5E1" />
          <rect x="325" y="34" width="34" height="14" rx="3" fill="#0F172A" stroke="#FACC15" strokeWidth="1.5" />
          {/* Flying SIC Airplane */}
          <motion.g
            animate={{ x: [-40, 140], y: [18, -14] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ellipse cx="145" cy="48" rx="34" ry="8" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
            <polygon points="116,48 106,33 124,44" fill="#059669" />
            <polygon points="140,48 128,62 152,52" fill="#0EA5E9" />
            <circle cx="164" cy="46" r="2.2" fill="#0F172A" />
            <circle cx="155" cy="46" r="2.2" fill="#0F172A" />
          </motion.g>
        </svg>
      );

    case 'office_budget':
      return (
        <svg viewBox="0 0 420 110" className="w-full h-24 sm:h-28 block" aria-hidden="true">
          <rect width="420" height="110" fill="#1E293B" />
          <rect x="95" y="22" width="110" height="68" rx="8" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
          <rect x="108" y="34" width="52" height="7" rx="3" fill="#059669" />
          <rect x="108" y="48" width="84" height="5" rx="2" fill="#CBD5E1" />
          <rect x="108" y="60" width="74" height="5" rx="2" fill="#CBD5E1" />
          <rect x="108" y="72" width="60" height="5" rx="2" fill="#F59E0B" />
          <motion.g
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            <rect x="235" y="26" width="82" height="62" rx="10" fill="#0F766E" stroke="#FDE047" strokeWidth="2" />
            <rect x="247" y="36" width="58" height="16" rx="4" fill="#ECFDF5" />
            <text x="276" y="48" textAnchor="middle" fill="#065F46" fontSize="10" fontWeight="900">
              ₹ 2,000
            </text>
            {[250, 268, 286].map((bx) => (
              <rect key={bx} x={bx} y="59" width="13" height="9" rx="2" fill="#FDE047" />
            ))}
            {[250, 268, 286].map((bx) => (
              <rect key={bx} x={bx} y="73" width="13" height="9" rx="2" fill="#A7F3D0" />
            ))}
          </motion.g>
        </svg>
      );

    case 'cyber_media':
      return (
        <svg viewBox="0 0 420 110" className="w-full h-24 sm:h-28 block" aria-hidden="true">
          <rect width="420" height="110" fill="#0F172A" />
          <motion.circle
            cx="210"
            cy="55"
            r="34"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="6 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '210px 55px' }}
          />
          <motion.path
            d="M210 25 L236 36 V56 C236 72 224 82 210 87 C196 82 184 72 184 56 V36 Z"
            fill="#0284C7"
            stroke="#FEF08A"
            strokeWidth="2.5"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            style={{ transformOrigin: '210px 56px' }}
          />
          <path d="M200 56 L207 63 L222 48" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'stage_art':
    default:
      return (
        <svg viewBox="0 0 420 110" className="w-full h-24 sm:h-28 block" aria-hidden="true">
          <rect width="420" height="110" fill="#312E81" />
          <rect x="65" y="78" width="290" height="22" rx="4" fill="#92400E" stroke="#FDE047" strokeWidth="2" />
          <path d="M55 24 L365 24 L375 38 L45 38 Z" fill="#F59E0B" />
          {[110, 175, 245, 310].map((lx, i) => (
            <motion.circle
              key={lx}
              cx={lx}
              cy="31"
              r="4.5"
              fill="#FEF08A"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
          <rect x="130" y="44" width="160" height="32" rx="5" fill="#065F46" stroke="#FACC15" strokeWidth="2" />
          <text x="210" y="64" textAnchor="middle" fill="#FEF08A" fontSize="11" fontWeight="900">
            SKSSF വേദി
          </text>
        </svg>
      );
  }
};

export const LessonAnimatedBanner: React.FC<{
  lessonId: string;
  title: string;
  emoji?: string;
}> = ({ lessonId, title, emoji = '📖' }) => {
  const guide = resolveQuickGuide(lessonId);
  const wingLogos = getOfficialLogosForLesson(lessonId);
  const lessonLinks = getLinksForLesson(lessonId);

  return (
    <div className="space-y-3">
      {/* Animated Lesson-Relevant Visual Header */}
      <div className="relative rounded-xl overflow-hidden border border-emerald-200 shadow-xs">
        <AnimatedSceneArt theme={guide.theme} />
        {wingLogos.length > 0 && wingLogos.length <= 2 && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            {wingLogos.map((logo) => (
              <div
                key={logo.id}
                className="bg-white/95 backdrop-blur-xs rounded-xl px-2 py-1 border border-emerald-200 shadow-md flex items-center justify-center"
                title={logo.label}
              >
                <img
                  src={logo.src}
                  alt={logo.label}
                  className="h-8 sm:h-10 w-auto max-w-[92px] object-contain"
                />
              </div>
            ))}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent px-3.5 py-2 flex items-center gap-2">
          <span className="text-base shrink-0" aria-hidden="true">
            {emoji}
          </span>
          <p className="text-xs sm:text-sm font-extrabold text-white leading-tight truncate">
            {title}
          </p>
        </div>
      </div>

      {/* Multi-wing Official Logo Showcase Strip (for 17-wings & overview lessons) */}
      {wingLogos.length > 2 && (
        <div className="rounded-xl bg-white border border-emerald-200 p-2.5 shadow-xs space-y-1.5">
          <p className="text-[11px] font-extrabold text-emerald-900">
            🏅 ഔദ്യോഗിക വിംഗ് ലോഗോകൾ:
          </p>
          <div className="grid grid-cols-4 gap-2">
            {wingLogos.map((logo) => (
              <div
                key={logo.id}
                className="rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex flex-col items-center justify-center gap-1"
                title={logo.label}
              >
                <img
                  src={logo.src}
                  alt={logo.label}
                  className="h-9 sm:h-11 w-full object-contain"
                />
                <span className="text-[9px] font-extrabold text-slate-700 text-center leading-tight truncate w-full">
                  {logo.shortLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crisp, Concise Quick-Read Key Points (Everything needed for Quiz in 10 seconds!) */}
      <div className="rounded-xl bg-emerald-50/90 border border-emerald-200 p-3.5 space-y-2">
        <p className="text-xs font-extrabold text-emerald-900">
          ⚡ പ്രധാന പോയിന്റുകൾ (ചുരുക്കത്തിൽ):
        </p>
        <ul className="space-y-1.5">
          {guide.points.map((pt, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs sm:text-sm font-bold text-slate-800 leading-relaxed"
            >
              <span className="text-emerald-700 font-black shrink-0">{idx + 1}.</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Clickable Official Portals & YouTube Channels for this Lesson */}
      {lessonLinks.length > 0 && <InlineOfficialLinksStrip links={lessonLinks} compact />}
    </div>
  );
};
