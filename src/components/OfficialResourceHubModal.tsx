import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookOpen,
  Check,
  Compass,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Link2,
  Search,
  Shield,
  Sparkles,
  X,
  Youtube,
} from 'lucide-react';
import {
  getLogoSrcForLink,
  OFFICIAL_LINK_CATEGORIES,
  OFFICIAL_LINKS_CATALOG,
  OFFICIAL_PDF_GUIDES,
  OfficialLinkCategory,
  OfficialLinkItem,
} from '../data/officialLinks';
import {
  LogoGuideCategory,
  OFFICIAL_LOGO_GUIDE_CATEGORIES,
  OFFICIAL_LOGO_GUIDE_ITEMS,
  OfficialLogoGuideEntry,
} from '../data/officialLogos';
import { sound } from '../utils/sound';
import { WingsScenarioChallenge } from './WingsScenarioChallenge';

const KIND_BADGE: Record<OfficialLinkItem['kind'], { label: string; cls: string; cta: string; btnCls: string }> = {
  website: {
    label: 'വെബ്സൈറ്റ്',
    cls: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    cta: 'സൈറ്റ് തുറക്കാം',
    btnCls: 'bg-emerald-700 hover:bg-emerald-800 text-white',
  },
  portal: {
    label: 'പോർട്ടൽ',
    cls: 'bg-slate-100 text-slate-800 border-slate-200',
    cta: 'പോർട്ടൽ തുറക്കാം',
    btnCls: 'bg-emerald-700 hover:bg-emerald-800 text-white',
  },
  youtube: {
    label: 'YouTube',
    cls: 'bg-rose-50 text-rose-900 border-rose-200',
    cta: 'YouTube തുറക്കാം',
    btnCls: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  instagram: {
    label: 'Instagram',
    cls: 'bg-pink-50 text-pink-900 border-pink-200',
    cta: 'Instagram തുറക്കാം',
    btnCls: 'bg-pink-600 hover:bg-pink-700 text-white',
  },
  facebook: {
    label: 'Facebook',
    cls: 'bg-blue-50 text-blue-900 border-blue-200',
    cta: 'Facebook തുറക്കാം',
    btnCls: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  x: {
    label: 'X (Twitter)',
    cls: 'bg-slate-100 text-slate-900 border-slate-300',
    cta: 'X പേജ് തുറക്കാം',
    btnCls: 'bg-slate-900 hover:bg-slate-800 text-white',
  },
  telegram: {
    label: 'Telegram',
    cls: 'bg-sky-50 text-sky-900 border-sky-200',
    cta: 'Telegram തുറക്കാം',
    btnCls: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
  app: {
    label: 'Mobile App',
    cls: 'bg-teal-50 text-teal-900 border-teal-200',
    cta: 'ആപ്പ് തുറക്കാം',
    btnCls: 'bg-teal-700 hover:bg-teal-800 text-white',
  },
  epaper: {
    label: 'ഇ-പേപ്പർ',
    cls: 'bg-amber-50 text-amber-950 border-amber-200',
    cta: 'ഇ-പേപ്പർ വായിക്കാം',
    btnCls: 'bg-emerald-700 hover:bg-emerald-800 text-white',
  },
  magazine: {
    label: 'മാസിക',
    cls: 'bg-amber-50 text-amber-900 border-amber-200',
    cta: 'മാസിക തുറക്കാം',
    btnCls: 'bg-emerald-700 hover:bg-emerald-800 text-white',
  },
  pdf: {
    label: 'PDF',
    cls: 'bg-emerald-50 text-emerald-950 border-emerald-300',
    cta: 'PDF തുറക്കാം',
    btnCls: 'bg-emerald-700 hover:bg-emerald-800 text-white',
  },
};

/* ============================================================================
 * REUSABLE INLINE CLICKABLE OFFICIAL LINKS STRIP (FOR LESSONS, POPUPS & VAULT)
 * ========================================================================== */
export const InlineOfficialLinksStrip: React.FC<{
  links: OfficialLinkItem[];
  heading?: string;
  compact?: boolean;
  onLinkExplore?: () => void;
}> = ({ links, heading = '🔗 ഔദ്യോഗിക ലിങ്കുകളും യൂട്യൂബ് ചാനലുകളും', compact = false, onLinkExplore }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!links.length) return null;

  const handleCopy = (item: OfficialLinkItem) => {
    sound.playClick();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(item.url).catch(() => {});
    }
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 1800);
  };

  return (
    <div
      className={`rounded-xl border border-emerald-200 bg-emerald-50/60 ${
        compact ? 'p-2.5 space-y-2' : 'p-3 space-y-2'
      }`}
    >
      <p className="text-[11px] font-extrabold text-emerald-950 flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        <span>{heading}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {links.map((item) => {
          const isYt = item.kind === 'youtube';
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className="inline-flex items-center rounded-xl bg-white border border-slate-200 hover:border-emerald-400 shadow-2xs overflow-hidden max-w-full"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  sound.playClick();
                  onLinkExplore?.();
                }}
                title={`${item.title} — ${item.url}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-900 hover:text-emerald-800 hover:bg-emerald-50/70 transition-colors min-w-0"
              >
                {isYt ? (
                  <Youtube className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                ) : (
                  <ExternalLink className="w-3 h-3 text-emerald-700 shrink-0" />
                )}
                <span className="truncate max-w-[175px]">{item.shortLabel}</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(item)}
                title="ലിങ്ക് കോപ്പി ചെയ്യുക"
                aria-label={`${item.shortLabel} ലിങ്ക് കോപ്പി ചെയ്യുക`}
                className="px-2 py-1.5 border-l border-slate-200 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <Check className="w-3 h-3 text-emerald-700" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * TABBED OFFICIAL LOGOS & WINGS GUIDE + SEARCHABLE LINKS & PDF STUDY LIBRARY
 * ========================================================================== */
export const OfficialResourceHubModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAwardXp?: (amount: number, actionId: string) => void;
}> = ({ isOpen, onClose, onAwardXp }) => {
  const [hubTab, setHubTab] = useState<'logos' | 'links' | 'scenarios'>('logos');

  // Logos & Wings tab state
  const [logoQuery, setLogoQuery] = useState('');
  const [logoCategory, setLogoCategory] = useState<LogoGuideCategory | 'all'>('all');
  const [selectedLogoId, setSelectedLogoId] = useState<string>(OFFICIAL_LOGO_GUIDE_ITEMS[0].id);

  // Links & PDF tab state
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<OfficialLinkCategory | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogos = useMemo(() => {
    const q = logoQuery.trim().toLowerCase();
    return OFFICIAL_LOGO_GUIDE_ITEMS.filter((item) => {
      if (logoCategory !== 'all' && item.category !== logoCategory) return false;
      if (!q) return true;
      return (
        item.shortLabel.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.categoryLabelMl.toLowerCase().includes(q) ||
        item.summaryMl.toLowerCase().includes(q) ||
        item.highlightsMl.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [logoQuery, logoCategory]);

  const activeLogoEntry: OfficialLogoGuideEntry | null = useMemo(() => {
    const exact = filteredLogos.find((item) => item.id === selectedLogoId);
    return exact || filteredLogos[0] || null;
  }, [filteredLogos, selectedLogoId]);

  const activeLogoLinks = useMemo(() => {
    if (!activeLogoEntry) return [];
    const byId = new Map(OFFICIAL_LINKS_CATALOG.map((l) => [l.id, l]));
    const matched: OfficialLinkItem[] = [];
    for (const id of activeLogoEntry.relatedLinkIds) {
      const found = byId.get(id);
      if (found) matched.push(found);
    }
    return matched;
  }, [activeLogoEntry]);

  const filteredLinks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OFFICIAL_LINKS_CATALOG.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.shortLabel.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  const handleCopy = (item: OfficialLinkItem) => {
    sound.playClick();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(item.url).catch(() => {});
    }
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-label="സമസ്ത & SKSSF ലോഗോ ഗൈഡും ഔദ്യോഗിക ലിങ്കുകളും"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[85vh] my-auto bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-sky-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>സമസ്ത &amp; SKSSF റഫറൻസ് ഹബ്</span>
                </p>
                <h2 className="text-base sm:text-lg font-extrabold leading-snug mt-0.5">
                  ലോഗോ ഗൈഡും ഔദ്യോഗിക ലിങ്കുകളും
                </h2>
                <p className="text-[11px] font-semibold text-emerald-100 mt-0.5">
                  {OFFICIAL_LOGO_GUIDE_ITEMS.length} ഔദ്യോഗിക ലോഗോകൾ · {OFFICIAL_LINKS_CATALOG.length} ലിങ്കുകൾ · {OFFICIAL_PDF_GUIDES.length} PDF ഗൈഡുകൾ
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                aria-label="അടയ്ക്കുക"
                className="min-w-[40px] min-h-[40px] rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clean 3-Tab Segmented Switcher */}
            <div className="px-3.5 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-200/70">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setHubTab('logos');
                  }}
                  className={`min-w-0 inline-flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[11px] sm:text-xs font-extrabold leading-tight text-center transition-colors cursor-pointer ${
                    hubTab === 'logos'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-700 hover:text-emerald-950'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">ലോഗോകൾ ({OFFICIAL_LOGO_GUIDE_ITEMS.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setHubTab('scenarios');
                  }}
                  className={`min-w-0 inline-flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[11px] sm:text-xs font-extrabold leading-tight text-center transition-colors cursor-pointer ${
                    hubTab === 'scenarios'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-700 hover:text-emerald-950'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">സാഹചര്യങ്ങളും ഉപസമിതികളും</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setHubTab('links');
                  }}
                  className={`min-w-0 inline-flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-[11px] sm:text-xs font-extrabold leading-tight text-center transition-colors cursor-pointer ${
                    hubTab === 'links'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-700 hover:text-emerald-950'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">ലിങ്കുകളും PDF-ഉം</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
              {hubTab === 'scenarios' ? (
                <WingsScenarioChallenge onAwardXp={onAwardXp} />
              ) : hubTab === 'logos' ? (
                <>
                  {/* Search & Category Filter for Logos */}
                  <div className="space-y-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={logoQuery}
                        onChange={(e) => setLogoQuery(e.target.value)}
                        placeholder="ലോഗോ തിരയുക: വിഖായ, സൈബർ, ട്രെൻഡ്, SNEC, SKIMVB, ത്വലബ..."
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50"
                      />
                      {logoQuery && (
                        <button
                          type="button"
                          onClick={() => setLogoQuery('')}
                          aria-label="തിരച്ചിൽ മായ്ക്കുക"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {OFFICIAL_LOGO_GUIDE_CATEGORIES.map((cat) => {
                        const active = logoCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setLogoCategory(cat.id);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold border transition-colors cursor-pointer whitespace-nowrap ${
                              active
                                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                            }`}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Logo Detail Spotlight */}
                  {activeLogoEntry && (
                    <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start gap-3.5">
                        <div className="logo-emblem-frame w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-emerald-200 p-2 flex items-center justify-center shrink-0 shadow-xs">
                          <img
                            src={activeLogoEntry.src}
                            alt={activeLogoEntry.title}
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="text-[11px] font-extrabold text-emerald-800">
                            {activeLogoEntry.categoryLabelMl}
                          </p>
                          <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            {activeLogoEntry.title}
                          </h3>
                          <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-medium">
                            {activeLogoEntry.summaryMl}
                          </p>
                        </div>
                      </div>

                      <ul className="space-y-1 text-xs text-slate-700 font-semibold pl-1">
                        {activeLogoEntry.highlightsMl.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-700 font-black mt-0.5">•</span>
                            <span className="leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>

                      {activeLogoLinks.length > 0 && (
                        <div className="pt-2 border-t border-emerald-200/80 flex flex-wrap gap-2">
                          {activeLogoLinks.map((link) => {
                            const isYt = link.kind === 'youtube';
                            const meta = KIND_BADGE[link.kind];
                            return (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  sound.playClick();
                                  onAwardXp?.(10, 'official_links_explorer');
                                }}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors ${meta.btnCls}`}
                              >
                                {isYt ? (
                                  <Youtube className="w-3.5 h-3.5 shrink-0" />
                                ) : (
                                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                )}
                                <span>{link.shortLabel}</span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interactive Visual Logo Grid */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-extrabold text-slate-600">
                      ഏത് ലോഗോയിലും തൊട്ടാൽ മുകളിൽ അതിന്റെ പൂർണ്ണ വിവരവും ഔദ്യോഗിക ലിങ്കും കാണാം:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {filteredLogos.map((item) => {
                        const isSelected = activeLogoEntry?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              sound.playPop();
                              setSelectedLogoId(item.id);
                              onAwardXp?.(5, 'official_logos_guide_explorer');
                            }}
                            className={`text-left rounded-2xl border-2 p-2.5 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-slate-50'
                            }`}
                          >
                            <div className="logo-emblem-frame w-full h-16 sm:h-20 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center">
                              <img
                                src={item.src}
                                alt={item.shortLabel}
                                referrerPolicy="no-referrer"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="w-full text-center space-y-0.5">
                              <p className="text-xs font-extrabold text-slate-900 leading-tight truncate">
                                {item.shortLabel}
                              </p>
                              <p className="text-[10px] font-semibold text-slate-500 truncate">
                                {item.categoryLabelMl}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {filteredLogos.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center space-y-1">
                      <p className="text-sm font-extrabold text-slate-700">
                        “{logoQuery}” എന്ന തിരച്ചിലിന് ലോഗോകൾ കണ്ടെത്തിയില്ല.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoQuery('');
                          setLogoCategory('all');
                        }}
                        className="text-xs font-extrabold text-emerald-700 underline cursor-pointer"
                      >
                        എല്ലാ ലോഗോകളും കാണിക്കൂ
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Featured Downloadable Official PDF Study Guides */}
                  <div className="space-y-2">
                    <p className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>📚 ഔദ്യോഗിക PDF പഠന ഗൈഡുകൾ (തുറന്ന് വായിക്കാം / ഡൗൺലോഡ് ചെയ്യാം)</span>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {OFFICIAL_PDF_GUIDES.map((pdf) => (
                        <div
                          key={pdf.id}
                          className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/50 p-3.5 space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600">
                              <span className="font-extrabold text-emerald-800">{pdf.pagesLabel}</span>
                              <span>വിദ്യാർത്ഥി റഫറൻസ്</span>
                            </div>
                            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                              {pdf.title}
                            </h3>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{pdf.subtitle}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <a
                              href={pdf.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                sound.playPop();
                                onAwardXp?.(15, `pdf_read_${pdf.id}`);
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-xs transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>PDF തുറക്കാം</span>
                            </a>
                            <a
                              href={pdf.href}
                              download={pdf.downloadName}
                              onClick={() => {
                                sound.playClick();
                                onAwardXp?.(10, `pdf_dl_${pdf.id}`);
                              }}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 text-xs font-extrabold transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>ഡൗൺലോഡ്</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Search & Category Filter */}
                  <div className="space-y-2.5 pt-1 border-t border-slate-200">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="തിരയുക: SNEC, Albirr, Sargalayam, YouTube, Suprabhaatham, Viqaya..."
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:outline-none text-xs sm:text-sm font-semibold text-slate-900 bg-slate-50"
                      />
                      {query && (
                        <button
                          type="button"
                          onClick={() => setQuery('')}
                          aria-label="തിരച്ചിൽ മായ്ക്കുക"
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {OFFICIAL_LINK_CATEGORIES.map((cat) => {
                        const active = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setCategory(cat.id);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold border transition-colors cursor-pointer ${
                              active
                                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50'
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Filtered Official Links Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredLinks.map((item) => {
                      const badge = KIND_BADGE[item.kind];
                      const logoSrc = getLogoSrcForLink(item);
                      const isYt = item.kind === 'youtube';
                      const isCopied = copiedId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200 hover:border-emerald-400 bg-white p-3 shadow-2xs flex flex-col justify-between gap-2.5 transition-colors"
                        >
                          <div className="flex items-start gap-2.5">
                            {logoSrc ? (
                              <div className="logo-emblem-frame w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                                <img
                                  src={logoSrc}
                                  alt={item.shortLabel}
                                  referrerPolicy="no-referrer"
                                  className="max-h-9 w-full object-contain"
                                />
                              </div>
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                  isYt
                                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}
                              >
                                {isYt ? <Youtube className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                              </div>
                            )}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                                <span className="font-extrabold text-emerald-800">{badge.label}</span>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{item.shortLabel}</span>
                              </div>
                              <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                sound.playClick();
                                onAwardXp?.(10, 'official_links_explorer');
                              }}
                              className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors ${badge.btnCls}`}
                            >
                              {isYt ? <Youtube className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                              <span>{badge.cta}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleCopy(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-950 text-[11px] font-extrabold cursor-pointer transition-colors"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  <span className="text-emerald-800">കോപ്പി ചെയ്തു</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>കോപ്പി</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredLinks.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center space-y-1">
                      <p className="text-sm font-extrabold text-slate-700">
                        “{query}” എന്ന തിരച്ചിലിന് ലിങ്കുകൾ കണ്ടെത്തിയില്ല.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setQuery('');
                          setCategory('all');
                        }}
                        className="text-xs font-extrabold text-emerald-700 underline cursor-pointer"
                      >
                        എല്ലാ ലിങ്കുകളും കാണിക്കൂ
                      </button>
                    </div>
                  )}

                  <div className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5 flex items-center gap-2 text-[11px] font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      ടിപ്പ്: ഏത് ലിങ്കും ‘കോപ്പി’ ബട്ടൺ അമർത്തി കൂട്ടുകാർക്കോ മദ്രസാ/ക്യാമ്പസ് ഗ്രൂപ്പുകളിലോ എളുപ്പത്തിൽ പങ്കുവെക്കാം!
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
