import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Search,
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
import { sound } from '../utils/sound';

const KIND_BADGE: Record<OfficialLinkItem['kind'], { label: string; cls: string }> = {
  website: { label: 'വെബ്സൈറ്റ്', cls: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  portal: { label: 'പോർട്ടൽ', cls: 'bg-sky-100 text-sky-900 border-sky-200' },
  youtube: { label: 'YouTube', cls: 'bg-rose-100 text-rose-900 border-rose-200' },
  epaper: { label: 'ഇ-പേപ്പർ', cls: 'bg-amber-100 text-amber-950 border-amber-200' },
  magazine: { label: 'മാസിക', cls: 'bg-purple-100 text-purple-900 border-purple-200' },
  pdf: { label: 'PDF', cls: 'bg-teal-100 text-teal-900 border-teal-200' },
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
      className={`rounded-xl border border-sky-200 bg-sky-50/75 ${
        compact ? 'p-2.5 space-y-2' : 'p-3 space-y-2'
      }`}
    >
      <p className="text-[11px] font-extrabold text-sky-950 flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-sky-700 shrink-0" />
        <span>{heading}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {links.map((item) => {
          const isYt = item.kind === 'youtube';
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className="inline-flex items-center rounded-xl bg-white border border-slate-200 hover:border-sky-400 shadow-2xs overflow-hidden max-w-full"
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-900 hover:text-sky-800 hover:bg-sky-50/70 transition-colors min-w-0"
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
 * FULL SEARCHABLE OFFICIAL LINKS & PDF STUDY LIBRARY MODAL
 * ========================================================================== */
export const OfficialResourceHubModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAwardXp?: (amount: number, actionId: string) => void;
}> = ({ isOpen, onClose, onAwardXp }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<OfficialLinkCategory | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
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
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="സമസ്ത & SKSSF ഔദ്യോഗിക ലിങ്കുകളും PDF ലൈബ്രറിയും"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-sky-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <p className="text-[10px] font-black tracking-wider uppercase text-amber-300">
                  OFFICIAL DIRECTORY · 2025 EDITION
                </p>
                <h2 className="text-base sm:text-lg font-extrabold leading-tight truncate">
                  🔗 സമസ്ത &amp; SKSSF ഔദ്യോഗിക ലിങ്കുകളും PDF ഗൈഡുകളും
                </h2>
                <p className="text-[11px] font-semibold text-emerald-100 mt-0.5">
                  {OFFICIAL_LINKS_CATALOG.length} ഔദ്യോഗിക വെബ്സൈറ്റുകളും യൂട്യൂബ് ചാനലുകളും + 2 PDF പഠന ഗൈഡുകൾ
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                aria-label="അടയ്ക്കുക"
                className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
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
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-extrabold">
                            📄 {pdf.pagesLabel}
                          </span>
                          <span className="text-[10px] font-bold text-amber-800">
                            ✨ വിദ്യാർത്ഥി റഫറൻസ്
                          </span>
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
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
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
                {filtered.map((item) => {
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
                          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={logoSrc}
                              alt={item.shortLabel}
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
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black ${badge.cls}`}
                            >
                              {badge.label}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 truncate">
                              {item.shortLabel}
                            </span>
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
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors ${
                            isYt
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          {isYt ? <Youtube className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                          <span>{isYt ? 'YouTube തുറക്കാം' : 'സൈറ്റ് തുറക്കാം'}</span>
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

              {filtered.length === 0 && (
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
