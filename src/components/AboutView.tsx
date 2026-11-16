import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArchitectureView } from './ArchitectureView.tsx';
import { EvaluationView } from './EvaluationView.tsx';
import { AnimatedCounter } from './AnimatedCounter.tsx';
import {
  Cpu,
  Layers,
  Server,
  Code2,
  Brain,
  Leaf,
  ShieldCheck,
  Terminal,
  BarChart3,
  BookOpen,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [sectionTab, setSectionTab] = useState<'overview' | 'architecture' | 'benchmarks'>('overview');

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#123D2A] via-[#175138] to-[#18251E] text-white rounded-3xl p-6 sm:p-10 border border-[#123D2A]/20 shadow-lg"
      >
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#4ade80] font-semibold">
            <Brain className="w-4 h-4" />
            <span>About LeafGuard AI · Research & Engineering Platform</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Intelligent Botanical Vision for Medicinal Flora Preservation
          </h1>
          <p className="text-sm sm:text-base text-[#E8F5EC]/85 leading-relaxed">
            LeafGuard AI bridges traditional medicinal plant knowledge with modern deep learning. By combining lightweight Convolutional Neural Networks (MobileNetV2 & ResNet feature backbones) with a Flask inference server and Gemini multilingual voice intelligence, farmers, students, and herbal practitioners can accurately identify plants and diagnose leaf diseases in seconds.
          </p>
        </div>

        {/* Sub-Navigation Toggle */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 p-1 bg-[#0c291c]/80 rounded-xl border border-[#E8F5EC]/15 w-fit">
          <button
            type="button"
            onClick={() => setSectionTab('overview')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              sectionTab === 'overview'
                ? 'bg-[#16A36A] text-white'
                : 'text-[#E8F5EC]/75 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Methodology & Tech Stack</span>
          </button>
          <button
            type="button"
            onClick={() => setSectionTab('architecture')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              sectionTab === 'architecture'
                ? 'bg-[#16A36A] text-white'
                : 'text-[#E8F5EC]/75 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Pipeline & CLI Guide</span>
          </button>
          <button
            type="button"
            onClick={() => setSectionTab('benchmarks')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              sectionTab === 'benchmarks'
                ? 'bg-[#16A36A] text-white'
                : 'text-[#E8F5EC]/75 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Model Benchmarks</span>
          </button>
        </div>
      </motion.div>

      {sectionTab === 'overview' && (
        <div className="space-y-8">
          {/* Quantitative Impact Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#123D2A]/12 shadow-xs">
              <div className="text-xs font-mono text-[#18251E]/60 uppercase">Species Top-1 Accuracy</div>
              <div className="text-3xl font-extrabold font-mono text-[#123D2A] mt-1">
                <AnimatedCounter value={94.58} decimals={2} suffix="%" />
              </div>
              <div className="text-xs text-[#16A36A] mt-1">1,200 Holdout Specimens</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#123D2A]/12 shadow-xs">
              <div className="text-xs font-mono text-[#18251E]/60 uppercase">Disease Accuracy</div>
              <div className="text-3xl font-extrabold font-mono text-[#123D2A] mt-1">
                <AnimatedCounter value={95.5} decimals={2} suffix="%" />
              </div>
              <div className="text-xs text-[#16A36A] mt-1">ROC AUC 0.9842</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#123D2A]/12 shadow-xs">
              <div className="text-xs font-mono text-[#18251E]/60 uppercase">Model Footprint</div>
              <div className="text-3xl font-extrabold font-mono text-[#123D2A] mt-1">
                <AnimatedCounter value={2.26} decimals={2} suffix="M" />
              </div>
              <div className="text-xs text-[#18251E]/65 mt-1">MobileNetV2 Parameters</div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#123D2A]/12 shadow-xs">
              <div className="text-xs font-mono text-[#18251E]/60 uppercase">Input Tensor</div>
              <div className="text-3xl font-extrabold font-mono text-[#123D2A] mt-1">224×224</div>
              <div className="text-xs text-[#18251E]/65 mt-1">RGB Normalized [-1, 1]</div>
            </div>
          </div>

          {/* Core AI Methodology */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#123D2A]/12 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-mono font-semibold text-[#16A36A] uppercase tracking-wider">
                Deep Learning Methodology
              </span>
              <h2 className="text-2xl font-extrabold text-[#123D2A] mt-1">
                Neural Architectures & Model Engineering
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#FAFCF8] border border-[#123D2A]/10 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EC] text-[#123D2A] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#123D2A]">
                  Convolutional Neural Networks (CNN)
                </h3>
                <p className="text-xs text-[#18251E]/80 leading-relaxed">
                  Hierarchical convolutional filters extract fine leaf venation geometry, serrated margin contours, chlorophyll tone gradients, and early necrotic lesion rings directly from 224×224 RGB tensors.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCF8] border border-[#123D2A]/10 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EC] text-[#123D2A] flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#123D2A]">
                  MobileNet & ResNet Transfer Learning
                </h3>
                <p className="text-xs text-[#18251E]/80 leading-relaxed">
                  Built on ImageNet pre-trained weights using MobileNetV2 inverted residual blocks with linear bottlenecks (inspired by ResNet skip-connections) to prevent gradient vanishing while staying edge-friendly.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAFCF8] border border-[#123D2A]/10 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#E8F5EC] text-[#123D2A] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#123D2A]">
                  Dual-Head Deep Learning Pipeline
                </h3>
                <p className="text-xs text-[#18251E]/80 leading-relaxed">
                  Decouples multi-class botanical species classification (6 classes) from binary foliar pathology detection (Healthy vs. Diseased), verified with Grad-CAM visual saliency heatmaps.
                </p>
              </div>
            </div>
          </div>

          {/* Complete Technology Stack Grid */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#123D2A]/12 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-mono font-semibold text-[#16A36A] uppercase tracking-wider">
                Full-Stack Engineering Ecosystem
              </span>
              <h2 className="text-2xl font-extrabold text-[#123D2A] mt-1">
                Core Technologies Powering LeafGuard AI
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  name: 'Python',
                  role: 'Training, Augmentation & Image Pipelines',
                  desc: 'NumPy, Pillow, and scikit-learn metrics computation for reproducible academic evaluation.',
                  icon: Code2,
                },
                {
                  name: 'TensorFlow / Keras',
                  role: 'CNN, ResNet & MobileNetV2 Weights',
                  desc: 'Fine-tuned `.keras` models trained with Adam optimizer, early stopping, and learning rate scheduling.',
                  icon: Brain,
                },
                {
                  name: 'Flask',
                  role: 'REST Model Inference Server',
                  desc: 'Exposes `/api/health` and `/api/predict` endpoints in `serve_models.py` for live Keras inference.',
                  icon: Server,
                },
                {
                  name: 'Botanical Knowledge & AI Voice',
                  role: 'Pharmacognosy & Multilingual Care',
                  desc: 'Integrates Ayurvedic Dravya Guna records with Gemini AI summaries and Kannada/Hindi/English voice.',
                  icon: Leaf,
                },
              ].map((stack) => {
                const Icon = stack.icon;
                return (
                  <div
                    key={stack.name}
                    className="p-5 rounded-2xl border border-[#123D2A]/12 bg-[#FAFCF8] hover:border-[#16A36A] transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-[#123D2A]">{stack.name}</span>
                      <Icon className="w-4 h-4 text-[#16A36A]" />
                    </div>
                    <div className="text-[11px] font-mono text-[#16A36A] font-semibold">
                      {stack.role}
                    </div>
                    <p className="text-xs text-[#18251E]/75 leading-relaxed">{stack.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {sectionTab === 'architecture' && <ArchitectureView />}
      {sectionTab === 'benchmarks' && <EvaluationView />}
    </div>
  );
};
