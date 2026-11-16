import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { SAMPLE_IMAGES } from '../data/medicinalPlants.ts';
import { PlantSpeciesId } from '../types/index.ts';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  Cpu,
} from 'lucide-react';

export interface FlyingCardItem {
  id: string;
  sampleKey: string;
  plantId: PlantSpeciesId;
  title: string;
  scientificName: string;
  family: string;
  image: string;
  healthStatus: 'healthy' | 'diseased';
  diseaseLabel: string;
  confidence: string;
  keyCompound: string;
  kannadaName: string;
}

export const FLYING_SPECIMEN_CARDS: FlyingCardItem[] = [
  {
    id: 'card-tulsi',
    sampleKey: 'tulsi',
    plantId: 'tulsi',
    title: 'Tulsi (Holy Basil)',
    scientificName: 'Ocimum tenuiflorum',
    family: 'Lamiaceae',
    image: SAMPLE_IMAGES.tulsi,
    healthStatus: 'healthy',
    diseaseLabel: 'Healthy Chloroplast Tissue',
    confidence: '96.4%',
    keyCompound: 'Eugenol & Ursolic Acid',
    kannadaName: 'ತುಳಸಿ',
  },
  {
    id: 'card-neem',
    sampleKey: 'neem',
    plantId: 'neem',
    title: 'Neem (Margosa)',
    scientificName: 'Azadirachta indica',
    family: 'Meliaceae',
    image: SAMPLE_IMAGES.neem,
    healthStatus: 'healthy',
    diseaseLabel: 'Healthy Foliar Margin',
    confidence: '97.2%',
    keyCompound: 'Azadirachtin Limonoid',
    kannadaName: 'ಬೇವು',
  },
  {
    id: 'card-disease',
    sampleKey: 'disease',
    plantId: 'tulsi',
    title: 'Tulsi (Leaf Spot)',
    scientificName: 'Ocimum tenuiflorum',
    family: 'Pathology Specimen',
    image: SAMPLE_IMAGES.diseased_sample,
    healthStatus: 'diseased',
    diseaseLabel: 'Cercospora Fungal Spot',
    confidence: '93.8%',
    keyCompound: 'Chlorotic Lesion Alert',
    kannadaName: 'ರೋಗಪೀಡಿತ ತುಳಸಿ',
  },
  {
    id: 'card-aloe',
    sampleKey: 'aloe',
    plantId: 'aloe_vera',
    title: 'Aloe Vera',
    scientificName: 'Aloe barbadensis miller',
    family: 'Asphodelaceae',
    image: SAMPLE_IMAGES.aloe_vera,
    healthStatus: 'healthy',
    diseaseLabel: 'Optimal Succulent Turgor',
    confidence: '97.9%',
    keyCompound: 'Acemannan Polysaccharide',
    kannadaName: 'ಲೋಳೆಸರ',
  },
  {
    id: 'card-ashwagandha',
    sampleKey: 'ashwagandha',
    plantId: 'ashwagandha',
    title: 'Ashwagandha',
    scientificName: 'Withania somnifera',
    family: 'Solanaceae',
    image: SAMPLE_IMAGES.ashwagandha,
    healthStatus: 'healthy',
    diseaseLabel: 'Healthy Lamina Vigor',
    confidence: '94.1%',
    keyCompound: 'Withanolides',
    kannadaName: 'ಅಶ್ವಗಂಧ',
  },
  {
    id: 'card-mint',
    sampleKey: 'mint',
    plantId: 'mint',
    title: 'Mint (Pudina)',
    scientificName: 'Mentha spicata',
    family: 'Lamiaceae',
    image: SAMPLE_IMAGES.mint,
    healthStatus: 'healthy',
    diseaseLabel: 'Crisp Serrated Foliage',
    confidence: '95.3%',
    keyCompound: 'L-Menthol & Carvone',
    kannadaName: 'ಪುದೀನ',
  },
  {
    id: 'card-curry',
    sampleKey: 'curry',
    plantId: 'curry_leaf',
    title: 'Curry Leaf',
    scientificName: 'Murraya koenigii',
    family: 'Rutaceae',
    image: SAMPLE_IMAGES.curry_leaf,
    healthStatus: 'healthy',
    diseaseLabel: 'Healthy Pinnate Gloss',
    confidence: '95.8%',
    keyCompound: 'Carbazole Alkaloids',
    kannadaName: 'ಕರಿಬೇವು',
  },
];

interface FlyingLandingStageProps {
  selectedSampleKey?: string;
  onSelectSpecimen: (sampleKey: string, img: string, healthStatus: 'healthy' | 'diseased') => void;
  onQuickInspect: (sampleKey: string, img: string, target: 'identify' | 'disease') => void;
}

export const FlyingLandingStage: React.FC<FlyingLandingStageProps> = ({
  selectedSampleKey,
  onSelectSpecimen,
  onQuickInspect,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const findMatchingCardIndex = (key?: string): number => {
    if (!key) return -1;
    const bySampleKey = FLYING_SPECIMEN_CARDS.findIndex((c) => c.sampleKey === key);
    if (bySampleKey >= 0) return bySampleKey;
    return FLYING_SPECIMEN_CARDS.findIndex((c) => c.plantId === key);
  };

  const [activeIndex, setActiveIndex] = useState<number>(() => {
    const found = findMatchingCardIndex(selectedSampleKey);
    return found >= 0 ? found : 0;
  });
  const [layoutMode, setLayoutMode] = useState<'fan' | 'spread'>('fan');

  useEffect(() => {
    const matched = findMatchingCardIndex(selectedSampleKey);
    if (matched >= 0 && matched !== activeIndex) {
      setActiveIndex(matched);
    }
  }, [selectedSampleKey]);

  const activeCard = FLYING_SPECIMEN_CARDS[activeIndex] || FLYING_SPECIMEN_CARDS[0];

  const handleCardSelect = (idx: number) => {
    setActiveIndex(idx);
    const chosen = FLYING_SPECIMEN_CARDS[idx];
    if (chosen) {
      onSelectSpecimen(chosen.sampleKey, chosen.image, chosen.healthStatus);
    }
  };

  const handleCycleNext = () => {
    handleCardSelect((activeIndex + 1) % FLYING_SPECIMEN_CARDS.length);
  };

  const handleCyclePrev = () => {
    handleCardSelect((activeIndex - 1 + FLYING_SPECIMEN_CARDS.length) % FLYING_SPECIMEN_CARDS.length);
  };

  const getDeckTransform = (idx: number) => {
    const total = FLYING_SPECIMEN_CARDS.length;
    let offset = idx - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    if (layoutMode === 'spread') {
      const cols = 4;
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const spreadX = (col - 1.38) * 96 + (row === 1 ? 44 : 0);
      const spreadY = row === 0 ? -70 : 72;
      const spreadRotate = (col - 1.5) * 3.5 + (row === 0 ? -2 : 2);
      const isSelected = idx === activeIndex;
      return {
        x: spreadX,
        y: spreadY,
        rotate: isSelected ? 0 : spreadRotate,
        scale: isSelected ? 0.74 : 0.6,
        zIndex: isSelected ? 40 : 10 + idx,
        opacity: 1,
      };
    }

    const absOffset = Math.abs(offset);
    const x = offset * 62;
    const y = absOffset * 13 + (offset === 0 ? -8 : 8);
    const rotate = offset * 7;
    const scale = offset === 0 ? 1 : Math.max(0.74, 1 - absOffset * 0.085);
    const zIndex = 30 - absOffset * 4;
    const opacity = absOffset > 3 ? 0 : 1 - absOffset * 0.12;

    return { x, y, rotate, scale, zIndex, opacity };
  };

  return (
    <div className="glass-forest rounded-2xl border border-[#E8F5EC]/15 p-4 sm:p-5 shadow-2xl">
      {/* Deck Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="text-xs font-mono text-[#E8F5EC]/80 flex items-center gap-2">
          <span className="text-[#4ade80] font-semibold">Botanical Specimen Deck</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {activeIndex + 1} / {FLYING_SPECIMEN_CARDS.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-[#0c291c]/90 rounded-lg border border-[#E8F5EC]/15">
            <button
              type="button"
              onClick={() => setLayoutMode('fan')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                layoutMode === 'fan'
                  ? 'bg-[#16A36A] text-white font-semibold'
                  : 'text-[#E8F5EC]/70 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Deck Fan</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('spread')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                layoutMode === 'spread'
                  ? 'bg-[#16A36A] text-white font-semibold'
                  : 'text-[#E8F5EC]/70 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Spread Cards</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCyclePrev}
              aria-label="Previous Specimen Card"
              className="p-1.5 rounded-lg bg-[#0c291c]/90 hover:bg-[#16A36A]/30 border border-[#E8F5EC]/15 text-[#E8F5EC] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCycleNext}
              aria-label="Next Specimen Card"
              className="p-1.5 rounded-lg bg-[#0c291c]/90 hover:bg-[#16A36A]/30 border border-[#E8F5EC]/15 text-[#E8F5EC] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Perspective Flying Stage */}
      <div
        className="relative w-full h-[335px] sm:h-[360px] flex items-center justify-center select-none overflow-hidden rounded-xl"
        style={{ perspective: '1200px' }}
      >
        {/* Left Floating Phytochemical Wing Card */}
        <AnimatePresence mode="wait">
          {layoutMode === 'fan' && (
            <motion.div
              key={`left-${activeCard.id}`}
              initial={prefersReducedMotion ? false : { opacity: 0, x: -40, y: 16, rotate: -5 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 1, x: 0, y: 0, rotate: -3 }
                  : { opacity: 1, x: 0, y: [0, -6, 0], rotate: -3 }
              }
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: -24, rotate: -6 }}
              transition={{
                opacity: { duration: 0.25 },
                x: { type: 'spring', stiffness: 220, damping: 22 },
                y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="hidden sm:block absolute left-2 top-5 z-40 w-44 rounded-xl bg-[#0c291c]/90 border border-[#E8F5EC]/20 p-3 shadow-xl pointer-events-none"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#E8F5EC]/70 mb-1">
                <span>Phytochemical</span>
                <Cpu className="w-3.5 h-3.5 text-[#4ade80]" />
              </div>
              <div className="text-xs font-bold text-white leading-snug">
                {activeCard.keyCompound}
              </div>
              <div className="mt-2 pt-2 border-t border-[#E8F5EC]/15 flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#E8F5EC]/70">Confidence</span>
                <span className="text-[#4ade80] font-bold tabular-nums">{activeCard.confidence}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Floating Health & Voice Wing Card */}
        <AnimatePresence mode="wait">
          {layoutMode === 'fan' && (
            <motion.div
              key={`right-${activeCard.id}`}
              initial={prefersReducedMotion ? false : { opacity: 0, x: 40, y: -14, rotate: 5 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 1, x: 0, y: 0, rotate: 3 }
                  : { opacity: 1, x: 0, y: [0, 6, 0], rotate: 3 }
              }
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: 24, rotate: 6 }}
              transition={{
                opacity: { duration: 0.25 },
                x: { type: 'spring', stiffness: 220, damping: 22 },
                y: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="hidden sm:block absolute right-2 bottom-5 z-40 w-48 rounded-xl bg-[#0c291c]/90 border border-[#E8F5EC]/20 p-3 shadow-xl pointer-events-none"
            >
              <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1">
                {activeCard.healthStatus === 'healthy' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                    <span className="text-[#E8F5EC]">Healthy Specimen</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-amber-300">Pathology Alert</span>
                  </>
                )}
              </div>
              <div className="text-xs font-medium text-[#E8F5EC]/90 truncate">
                {activeCard.diseaseLabel}
              </div>
              <div className="mt-2 pt-2 border-t border-[#E8F5EC]/15 flex items-center gap-1.5 text-[11px] text-[#E8F5EC]">
                <Volume2 className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                <span className="truncate">ಕನ್ನಡ: {activeCard.kannadaName}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flying Leaf Cards */}
        {FLYING_SPECIMEN_CARDS.map((card, idx) => {
          const t = getDeckTransform(idx);
          const isActive = idx === activeIndex;
          const entryOffsetX = (idx - 3) * 80;
          const entryOffsetY = idx % 2 === 0 ? -120 : 120;

          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={() => handleCardSelect(idx)}
              aria-label={`Select ${card.title} specimen`}
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      x: entryOffsetX,
                      y: entryOffsetY,
                      rotate: (idx - 3) * 16,
                      scale: 0.55,
                    }
              }
              animate={{
                opacity: t.opacity,
                x: t.x,
                y: t.y,
                rotate: t.rotate,
                scale: t.scale,
                zIndex: t.zIndex,
              }}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: t.y - 10,
                      scale: t.scale * 1.05,
                      rotate: 0,
                      zIndex: 50,
                    }
              }
              whileTap={{ scale: t.scale * 0.98 }}
              transition={{
                type: 'spring',
                stiffness: 230,
                damping: 22,
                delay: layoutMode === 'fan' && !isActive ? idx * 0.03 : 0,
              }}
              style={{ zIndex: t.zIndex }}
              className={`absolute w-[198px] sm:w-[220px] rounded-2xl overflow-hidden text-left cursor-pointer border transition-shadow ${
                isActive
                  ? 'bg-[#0c291c] border-[#16A36A] shadow-2xl ring-2 ring-[#16A36A]/40'
                  : 'bg-[#123D2A]/95 border-[#E8F5EC]/20 shadow-xl hover:border-[#16A36A]/70'
              }`}
            >
              <div className="relative aspect-4/3 bg-[#18251E] overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0c291c]/95 via-[#0c291c]/25 to-transparent"
                />
                <div className="absolute bottom-2.5 left-3 right-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#E8F5EC]/80">
                    <span>{card.family}</span>
                    <span
                      className={`font-bold tabular-nums ${
                        card.healthStatus === 'healthy' ? 'text-[#4ade80]' : 'text-amber-300'
                      }`}
                    >
                      {card.confidence}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate mt-0.5">{card.title}</h3>
                </div>
              </div>

              <div className="p-3 bg-[#0c291c] space-y-1">
                <p className="text-[11px] italic text-[#E8F5EC]/65 truncate">
                  {card.scientificName}
                </p>
                <div className="flex items-center justify-between text-[11px] font-medium">
                  <span
                    className={
                      card.healthStatus === 'healthy' ? 'text-[#4ade80]' : 'text-amber-300'
                    }
                  >
                    {card.healthStatus === 'healthy' ? 'Healthy' : 'Diseased'}
                  </span>
                  <span className="text-[#E8F5EC]/60 font-mono text-[10px]">
                    {isActive ? 'Active' : 'Select'}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Direct Quick Action Footer on Selected Card */}
      <div className="mt-3 pt-3 border-t border-[#E8F5EC]/15 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-[#E8F5EC]/80">
          Selected: <strong className="text-white">{activeCard.title}</strong>
        </div>
        <button
          type="button"
          onClick={() =>
            onQuickInspect(
              activeCard.sampleKey,
              activeCard.image,
              activeCard.healthStatus === 'diseased' ? 'disease' : 'identify'
            )
          }
          className="px-3.5 py-1.5 rounded-lg bg-[#16A36A] hover:bg-[#19b877] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {activeCard.healthStatus === 'diseased'
              ? 'Diagnose Disease Now'
              : `Identify ${activeCard.title.split(' ')[0]}`}
          </span>
        </button>
      </div>
    </div>
  );
};
