import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Copyright, FileText, Gift, Lock, ShieldCheck, X } from 'lucide-react';
import { sound } from '../utils/sound';

type LegalSectionId = 'copyright' | 'privacy' | 'hadiya' | 'disclaimer';

interface LegalPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccordionItem: React.FC<{
  id: LegalSectionId;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, open, onToggle, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="w-full min-h-[48px] px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-emerald-50/60 transition-colors cursor-pointer"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">{title}</p>
          <p className="text-[11px] font-semibold text-slate-600 leading-snug">{subtitle}</p>
        </div>
      </div>
      <ChevronDown
        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
          open ? 'rotate-180' : ''
        }`}
      />
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden border-t border-slate-200 bg-white"
        >
          <div className="p-4 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export const LegalPrivacyModal: React.FC<LegalPrivacyModalProps> = ({ isOpen, onClose }) => {
  const [openSection, setOpenSection] = useState<LegalSectionId | null>('copyright');

  const toggle = (id: LegalSectionId) => {
    sound.unlockAudio();
    sound.playClick();
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[115] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-label="സ്വകാര്യതാ നയം, നിബന്ധനകൾ & കോപ്പിറൈറ്റ്"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border-2 border-emerald-300 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 my-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                    സ്വകാര്യതാ നയം, നിബന്ധനകൾ &amp; കോപ്പിറൈറ്റ്
                  </h2>
                  <p className="text-xs font-semibold text-slate-600">
                    Privacy Policy, Terms &amp; Copyright License
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                aria-label="അടയ്ക്കുക"
                className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <AccordionItem
                id="copyright"
                title="© കോപ്പിറൈറ്റ് & ഉപയോഗ അനുമതി"
                subtitle="സൗജന്യ പഠന ഉപയോഗവും സോഴ്സ് കോഡ് സംരക്ഷണവും"
                icon={<Copyright className="w-4 h-4" />}
                open={openSection === 'copyright'}
                onToggle={() => toggle('copyright')}
              >
                <p className="font-bold text-emerald-950">
                  © 2026 Muhammed Saeed. All Rights Reserved.
                </p>
                <p>
                  സമസ്ത കേരള ജംഇയ്യത്തുൽ ഉലമയുടെയും SKSSF-ന്റെയും പ്രവർത്തകർക്കും പഠിതാക്കൾക്കും ഈ ഗെയിം സൗജന്യമായി കളിക്കാനും ലിങ്ക് വഴി ഷെയർ ചെയ്യാനും എംബെഡ് (Embed) ചെയ്യാനും പൂർണ്ണ അനുവാദമുണ്ട്.
                </p>
                <p className="font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  എന്നാൽ ഇതിന്റെ സോഴ്സ് കോഡ് പകർത്തി, പേരോ ലോഗോയോ മാറ്റിയോ മറ്റൊരു സംഘടനയുടെയോ വ്യക്തിയുടെയോ പേരിലോ എഡിറ്റ് ചെയ്ത് വിതരണം ചെയ്യുന്നത് കർശനമായി നിരോധിച്ചിരിക്കുന്നു.
                </p>
              </AccordionItem>

              <AccordionItem
                id="privacy"
                title="🔒 സ്വകാര്യതാ നയം (Zero Server Tracking)"
                subtitle="നിങ്ങളുടെ ഡാറ്റയും ഫോട്ടോയും ഈ ഫോണിൽ മാത്രം"
                icon={<Lock className="w-4 h-4" />}
                open={openSection === 'privacy'}
                onToggle={() => toggle('privacy')}
              >
                <p>
                  ഈ ഗെയിം നിങ്ങളുടെ വ്യക്തിവിവരങ്ങളോ ഫോൺ നമ്പറോ ലൊക്കേഷനോ ഒരു സെർവറിലും ശേഖരിക്കുകയോ ട്രാക്ക് ചെയ്യുകയോ ചെയ്യുന്നില്ല.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    നിങ്ങളുടെ പഠന പുരോഗതി, XP, സ്ട്രീക്ക്, പേര്, യൂണിറ്റ് വിവരങ്ങൾ എന്നിവ നിങ്ങളുടെ ഫോണിലെ/ബ്രൗസറിലെ പ്രാദേശിക സ്റ്റോറേജിൽ (localStorage) മാത്രമാണ് സൂക്ഷിക്കുന്നത്.
                  </li>
                  <li>
                    ഫോട്ടോ ബാഡ്ജിലോ പ്രശംസാപത്രത്തിലോ നിങ്ങൾ തിരഞ്ഞെടുക്കുന്ന ഫോട്ടോ നിങ്ങളുടെ ഡിവൈസിൽ തന്നെ ചിത്രം തയ്യാറാക്കാൻ മാത്രമേ ഉപയോഗിക്കൂ — ഒരിക്കലും ഇന്റർനെറ്റിലേക്ക് അപ്‌ലോഡ് ചെയ്യില്ല.
                  </li>
                  <li>
                    സെറ്റിംഗ്സിലൂടെ എപ്പോൾ വേണമെങ്കിലും നിങ്ങൾക്ക് എല്ലാ വിവരങ്ങളും ഒറ്റ ക്ലിക്കിൽ മായ്ച്ചുകളയാം.
                  </li>
                </ul>
              </AccordionItem>

              <AccordionItem
                id="hadiya"
                title="🎁 ഹദിയ നയം (Voluntary Hadiya Policy)"
                subtitle="സ്വമേധയാ നൽകുന്ന പ്രോത്സാഹന സമ്മാനം"
                icon={<Gift className="w-4 h-4" />}
                open={openSection === 'hadiya'}
                onToggle={() => toggle('hadiya')}
              >
                <p>
                  ഈ ഗെയിം 100% സൗജന്യമാണ്. എല്ലാ 62 പാഠങ്ങളും ഗെയിമുകളും ബാഡ്ജുകളും സർട്ടിഫിക്കറ്റും ഒരു രൂപ പോലും നൽകാതെ എല്ലാവർക്കും പൂർണ്ണമായി ഉപയോഗിക്കാം.
                </p>
                <p>
                  ആപ്പിന്റെ നിർമ്മാണത്തെയും തുടർ പരിപാലനത്തെയും പ്രോത്സാഹിപ്പിക്കാൻ സ്വമേധയാ നൽകുന്ന ‘ഹദിയ’ (Voluntary Contribution) തികച്ചും ഐച്ഛികവും തിരിച്ചുകിട്ടാത്തതുമായ (non-refundable) വ്യക്തിപരമായ സമ്മാനമാണ്. ഇത് ഏതെങ്കിലും സംഘടനാ ഫണ്ടോ നിർബന്ധിത ഫീസോ അല്ല.
                </p>
              </AccordionItem>

              <AccordionItem
                id="disclaimer"
                title="📋 പഠന ഗെയിം അറിയിപ്പ് (Non-Official Disclaimer)"
                subtitle="ഔദ്യോഗിക അംഗത്വ രേഖയല്ല"
                icon={<FileText className="w-4 h-4" />}
                open={openSection === 'disclaimer'}
                onToggle={() => toggle('disclaimer')}
              >
                <p>
                  സമസ്തയുടെയും SKSSF-ന്റെയും ചരിത്രവും ഘടനയും പ്രവർത്തനങ്ങളും വിദ്യാർത്ഥികൾക്ക് രസകരമായി പരിചയപ്പെടുത്താൻ തയ്യാറാക്കിയ സ്വതന്ത്ര പഠന ഗെയിമാണിത്.
                </p>
                <p>
                  ഗെയിമിൽ ലഭിക്കുന്ന മെറ്റാലിക് ബാഡ്ജുകളും ‘ആദർശ വിജ്ഞാന പ്രതിഭ’ പ്രശംസാപത്രവും ഈ പഠന ക്വിസ് പൂർത്തിയാക്കിയതിന്റെ ഓൺലൈൻ അംഗീകാരം മാത്രമാണ് — അവ സംഘടനയുടെ ഔദ്യോഗിക അംഗത്വ കാർഡോ ഔദ്യോഗിക രേഖയോ അല്ല.
                </p>
              </AccordionItem>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-extrabold cursor-pointer"
              >
                മനസ്സിലായി, അടയ്ക്കാം
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
