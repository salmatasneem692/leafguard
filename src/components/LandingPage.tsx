import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { NavTabId } from './Navbar.tsx';
import { FlyingLandingStage } from './FlyingLandingStage.tsx';
import { AnimatedCounter } from './AnimatedCounter.tsx';
import { MEDICINAL_PLANTS } from '../data/medicinalPlants.ts';
import { PlantSpeciesId } from '../types/index.ts';
import heroBotanicalBackdrop from '../assets/images/hero_botanical_backdrop_1794591671774.jpg';
import {
  Leaf,
  Microscope,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Sparkles,
  Layers,
  Server,
  Code2,
  BookOpen,
} from 'lucide-react';

interface LandingPageProps {
  selectedSampleKey?: string;
  onNavigate: (tab: NavTabId) => void;
  onSelectSpecimen: (sampleKey: string, img: string, healthStatus: 'healthy' | 'diseased') => void;
  onQuickInspect: (sampleKey: string, img: string, target: 'identify' | 'disease') => void;
  onInspectPlantLibrary: (plantId: PlantSpeciesId) => void;
}

const FLOATING_LEAVES = [
  { top: '12%', left: '6%', size: 28, rotate: -18, duration: 7.5, delay: 0 },
  { top: '74%', left: '14%', size: 22, rotate: 24, duration: 9.0, delay: 1.2 },
  { top: '20%', left: '46%', size: 24, rotate: 12, duration: 8.2, delay: 0.6 },
  { top: '82%', left: '54%', size: 30, rotate: -26, duration: 10.4, delay: 1.8 },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  selectedSampleKey,
  onNavigate,
  onSelectSpecimen,
  onQuickInspect,
  onInspectPlantLibrary,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const plantsList = Object.values(MEDICINAL_PLANTS);

  return (
    <div className="space-y-16 pb-8">
      {/* SECTION 1: PREMIUM STARTUP HERO WITH BOTANICAL BACKDROP, FLOATING LEAVES & FLYING CARD DECK */}
      <section className="relative rounded-3xl overflow-hidden bg-[#123D2A] text-white border border-[#123D2A]/20 shadow-2xl">
        {/* Background High-Res Botanical Macro Visual */}
        <img
          src={heroBotanicalBackdrop}
          alt="Medicinal leaves illuminated in a deep botanical forest backdrop"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />

        {/* Deep Forest & Glowing Emerald Radial Gradients */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 22% 28%, rgba(22, 163, 106, 0.34) 0%, transparent 52%), radial-gradient(circle at 82% 72%, rgba(22, 163, 106, 0.25) 0%, transparent 48%), linear-gradient(125deg, rgba(12, 41, 28, 0.94) 0%, rgba(18, 61, 42, 0.84) 55%, rgba(24, 37, 30, 0.95) 100%)',
          }}
        />

        {/* Animated Floating Botanical Elements */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {FLOATING_LEAVES.map((leaf, idx) => (
            <motion.div
              key={idx}
              style={{ top: leaf.top, left: leaf.left }}
              className="absolute text-[#4ade80]/20"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      y: [0, -16, 0],
                      x: [0, idx % 2 === 0 ? 8 : -8, 0],
                      rotate: [leaf.rotate, leaf.rotate + 12, leaf.rotate],
                    }
              }
              transition={{
                duration: leaf.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: leaf.delay,
              }}
            >
              <Leaf style={{ width: leaf.size, height: leaf.size }} />
            </motion.div>
          ))}
        </div>

        {/* Hero Split Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center p-6 sm:p-10 lg:p-14">
          {/* Left Narrative Column (6 cols) */}
          <motion.div
            className="lg:col-span-6 space-y-6"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-xs font-mono tracking-wide text-[#E8F5EC]/85 flex flex-wrap items-center gap-2">
              <span className="text-[#4ade80] font-semibold">LeafGuard AI Platform</span>
              <span aria-hidden="true">·</span>
              <span>Botanical Vision & Pathology Intelligence</span>
            </div>

            <h1
              className="font-extrabold tracking-tight text-white text-balance leading-[1.08]"
              style={{ fontSize: 'clamp(2.2rem, 4vw, 3.55rem)' }}
            >
              Discover Nature. Detect Diseases. Protect Plant Life.
            </h1>

            <p className="text-base sm:text-lg text-[#E8F5EC]/85 leading-relaxed max-w-xl">
              An AI-powered platform for medicinal plant identification and intelligent leaf disease detection.
            </p>

            {/* Primary CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('library')}
                className="px-6 py-3.5 rounded-xl bg-[#16A36A] hover:bg-[#19b877] text-white font-bold text-sm shadow-lg shadow-[#16A36A]/25 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Leaf className="w-4 h-4" />
                <span>Explore Plants</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('disease')}
                className="px-6 py-3.5 rounded-xl glass-forest border border-[#E8F5EC]/30 hover:border-[#4ade80] text-[#E8F5EC] hover:text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Microscope className="w-4 h-4 text-[#4ade80]" />
                <span>Detect Leaf Disease</span>
              </button>
            </div>

            {/* Glassmorphism Animated Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              <div className="glass-forest border border-[#E8F5EC]/15 rounded-2xl p-3.5">
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#4ade80]">
                  <AnimatedCounter value={94.58} decimals={2} suffix="%" />
                </div>
                <div className="text-[11px] text-[#E8F5EC]/75 mt-0.5">Species Accuracy</div>
              </div>
              <div className="glass-forest border border-[#E8F5EC]/15 rounded-2xl p-3.5">
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                  <AnimatedCounter value={95.5} decimals={1} suffix="%" />
                </div>
                <div className="text-[11px] text-[#E8F5EC]/75 mt-0.5">Disease Detection</div>
              </div>
              <div className="glass-forest border border-[#E8F5EC]/15 rounded-2xl p-3.5">
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#E8F5EC]">
                  <AnimatedCounter value={6} decimals={0} suffix=" Species" />
                </div>
                <div className="text-[11px] text-[#E8F5EC]/75 mt-0.5">Medicinal Flora</div>
              </div>
              <div className="glass-forest border border-[#E8F5EC]/15 rounded-2xl p-3.5">
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#4ade80]">
                  <AnimatedCounter value={260} decimals={0} prefix="< " suffix=" ms" />
                </div>
                <div className="text-[11px] text-[#E8F5EC]/75 mt-0.5">Inference Time</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column (6 cols): Interactive Flying Botanical Card Deck */}
          <motion.div
            className="lg:col-span-6"
            initial={prefersReducedMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <FlyingLandingStage
              selectedSampleKey={selectedSampleKey}
              onSelectSpecimen={onSelectSpecimen}
              onQuickInspect={onQuickInspect}
            />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: CORE AI PLATFORM WORKFLOWS */}
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-[#16A36A] uppercase tracking-wider">
              Intelligent Botanical Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123D2A] mt-1 tracking-tight text-balance">
              Dual-Stage Computer Vision & Multilingual Agronomy
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-bold text-[#123D2A] hover:text-[#16A36A] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>Open Full Command Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            type="button"
            onClick={() => onNavigate('identify')}
            className="text-left bg-white hover:bg-[#FAFCF8] rounded-2xl p-6 border border-[#123D2A]/12 hover:border-[#16A36A] shadow-xs hover:shadow-lg transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#E8F5EC] text-[#123D2A] flex items-center justify-center mb-4 group-hover:bg-[#16A36A] group-hover:text-white transition-colors">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#123D2A]">01. Medicinal Plant Identification</h3>
              <p className="text-sm text-[#18251E]/75 mt-2 leading-relaxed">
                Upload or capture a leaf to classify species with Top-6 Softmax probabilities, scientific taxonomy, active phytochemicals, and Ayurvedic properties.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#123D2A]/10 flex items-center justify-between text-xs font-bold text-[#16A36A]">
              <span>Launch Plant Identification</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('disease')}
            className="text-left bg-white hover:bg-[#FAFCF8] rounded-2xl p-6 border border-[#123D2A]/12 hover:border-[#16A36A] shadow-xs hover:shadow-lg transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#E8F5EC] text-[#123D2A] flex items-center justify-center mb-4 group-hover:bg-[#16A36A] group-hover:text-white transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#123D2A]">02. Leaf Disease Detection</h3>
              <p className="text-sm text-[#18251E]/75 mt-2 leading-relaxed">
                Detect Cercospora fungal leaf spot, rust, powdery mildew, and pest injury with symptoms, causal factors, organic remedies, and Grad-CAM heatmaps.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#123D2A]/10 flex items-center justify-between text-xs font-bold text-[#16A36A]">
              <span>Launch Disease Detection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="text-left bg-white hover:bg-[#FAFCF8] rounded-2xl p-6 border border-[#123D2A]/12 hover:border-[#16A36A] shadow-xs hover:shadow-lg transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#E8F5EC] text-[#123D2A] flex items-center justify-center mb-4 group-hover:bg-[#16A36A] group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#123D2A]">03. Batch, Compare & Kannada AI</h3>
              <p className="text-sm text-[#18251E]/75 mt-2 leading-relaxed">
                Screen multiple leaves in Batch Mode, compare specimens A vs B side-by-side, inspect 30-session health trends, and listen in Kannada, Hindi, or English.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-[#123D2A]/10 flex items-center justify-between text-xs font-bold text-[#16A36A]">
              <span>Open AI Analytics Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </motion.section>

      {/* SECTION 3: SUPPORTED MEDICINAL PLANTS PREVIEW GRID */}
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-[#16A36A] uppercase tracking-wider">
              Botanical Training Corpus
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123D2A] mt-1 tracking-tight">
              Supported Medicinal Flora Library
            </h2>
            <p className="text-sm text-[#18251E]/70 mt-1">
              Click any verified medicinal species to view full pharmacology or test its leaf in the analyzer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('library')}
            className="px-4 py-2 rounded-xl bg-[#E8F5EC] hover:bg-[#d7eee0] text-[#123D2A] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#16A36A]" />
            <span>View Full Plant Library</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plantsList.map((plant, idx) => (
            <motion.button
              key={plant.id}
              type="button"
              onClick={() => onInspectPlantLibrary(plant.id)}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={prefersReducedMotion ? undefined : { y: -4 }}
              className="text-left bg-white rounded-2xl overflow-hidden border border-[#123D2A]/12 hover:border-[#16A36A] shadow-xs hover:shadow-xl transition-all group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-16/10 bg-[#18251E] overflow-hidden">
                  <img
                    src={plant.sampleImage}
                    alt={plant.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#123D2A]/85 via-transparent to-transparent"
                  />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">{plant.name}</h3>
                      <p className="text-xs italic text-[#E8F5EC]/85 font-serif">
                        {plant.scientificName}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-[#E8F5EC]/90">
                      {plant.family.split(' ')[0]}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <p className="text-xs text-[#18251E]/80 leading-relaxed line-clamp-2">
                    {plant.primaryMedicinalUses[0]}
                  </p>
                  <div className="text-[11px] font-mono text-[#123D2A]/70 truncate">
                    Key Compound: {plant.activePhytochemicals[0].split('(')[0].trim()}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-[#123D2A]/10 bg-[#FAFCF8] flex items-center justify-between text-xs font-bold text-[#16A36A]">
                <span>Inspect Botanical Profile</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* SECTION 4: TECHNOLOGY STACK & METHODOLOGY HIGHLIGHT */}
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className="bg-[#123D2A] text-white rounded-3xl p-6 sm:p-10 border border-[#123D2A] shadow-xl overflow-hidden relative"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#4ade80] font-semibold">
              Deep Learning Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
              Engineered with Convolutional Neural Networks & Edge Transfer Learning
            </h2>
            <p className="text-sm text-[#E8F5EC]/80 leading-relaxed">
              LeafGuard AI pairs MobileNetV2 depthwise separable convolutions and ResNet residual representations in TensorFlow/Keras with a Python Flask REST inference API—delivering accurate plant classification and disease diagnosis at real-time speed.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="px-5 py-2.5 rounded-xl bg-[#16A36A] hover:bg-[#19b877] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>Read Full Methodology & Stack</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Layers, title: 'CNN & MobileNetV2', sub: '224×224 Depthwise Conv' },
              { icon: Cpu, title: 'ResNet & Deep Learning', sub: 'Residual Feature Extraction' },
              { icon: Code2, title: 'TensorFlow / Keras', sub: 'Transfer Learning Weights' },
              { icon: Server, title: 'Python & Flask API', sub: 'Live REST Model Serving' },
              { icon: Sparkles, title: 'Grad-CAM + Gemini AI', sub: 'Visual Saliency & Summaries' },
              { icon: ShieldCheck, title: 'Multilingual Voice', sub: 'Kannada, Hindi & English' },
            ].map((tech) => {
              const Icon = tech.icon;
              return (
                <div
                  key={tech.title}
                  className="glass-forest border border-[#E8F5EC]/15 rounded-2xl p-4 space-y-1.5"
                >
                  <Icon className="w-4 h-4 text-[#4ade80]" />
                  <div className="text-xs font-bold text-white">{tech.title}</div>
                  <div className="text-[11px] text-[#E8F5EC]/70">{tech.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>
    </div>
  );
};
