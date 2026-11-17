import React from 'react';
import { Mail, Linkedin, ArrowLeft, ExternalLink, GraduationCap, Leaf } from 'lucide-react';

interface MeetOurTeamViewProps {
  onBackToHome: () => void;
}

const LINKEDIN_URL = 'https://www.linkedin.com/in/salma-tasneem-884729310';
const EMAIL_ADDRESS = 'salmatasneem75@gmail.com';

const BANNER_LEAVES = [
  {
    id: 'leaf-1',
    top: '18%',
    sizeClass: 'w-4 h-4',
    colorClass: 'text-[#86EFAC]/55',
    animClass: 'team-leaf-drift-a',
    delay: '0s',
    duration: '13s',
  },
  {
    id: 'leaf-2',
    top: '54%',
    sizeClass: 'w-3.5 h-3.5',
    colorClass: 'text-[#E8F5EC]/45',
    animClass: 'team-leaf-drift-a',
    delay: '-5.2s',
    duration: '16s',
  },
  {
    id: 'leaf-3',
    top: '28%',
    sizeClass: 'w-5 h-5',
    colorClass: 'text-[#6EE7B7]/40',
    animClass: 'team-leaf-drift-b',
    delay: '-2s',
    duration: '15s',
  },
  {
    id: 'leaf-4',
    top: '64%',
    sizeClass: 'w-3.5 h-3.5',
    colorClass: 'text-[#A7F3D0]/50',
    animClass: 'team-leaf-drift-b',
    delay: '-8.5s',
    duration: '14s',
  },
  {
    id: 'leaf-5',
    top: '14%',
    sizeClass: 'w-3 h-3',
    colorClass: 'text-[#D1FAE5]/50',
    animClass: 'team-leaf-drift-a',
    delay: '-9.4s',
    duration: '12s',
  },
];

export const MeetOurTeamView: React.FC<MeetOurTeamViewProps> = ({ onBackToHome }) => {
  return (
    <section
      aria-labelledby="meet-our-team-heading"
      className="max-w-3xl mx-auto py-4 sm:py-8 px-1 sm:px-0 space-y-6 sm:space-y-8"
    >
      {/* Back Navigation */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#E8F5EC] text-[#123D2A] border border-[#123D2A]/15 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-xs hover:shadow-sm cursor-pointer whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 text-[#16A36A]" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Page Header */}
      <div className="text-center space-y-2.5 team-card-enter">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#16A36A] uppercase tracking-wider">
          <Leaf className="w-4 h-4" />
          <span>LeafGuard AI</span>
        </div>
        <h1
          id="meet-our-team-heading"
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#123D2A] leading-tight"
        >
          Meet Our Team
        </h1>
        <p className="text-sm sm:text-base text-[#18251E]/75 max-w-2xl mx-auto leading-relaxed">
          The team behind intelligent plant disease detection and smarter agricultural solutions.
        </p>
      </div>

      {/* Floating Profile Card */}
      <div className="team-card-enter">
        <article className="team-card-float bg-white rounded-3xl border border-[#123D2A]/12 shadow-md overflow-visible">
          {/* Compact Forest-to-Emerald Banner with Confined Flying Leaves */}
          <div className="relative z-0 h-20 sm:h-24 rounded-t-[calc(1.5rem-1px)] bg-gradient-to-r from-[#123D2A] via-[#175138] to-[#16A36A] overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 18% 45%, rgba(232, 245, 236, 0.45) 0%, transparent 45%), radial-gradient(circle at 84% 30%, rgba(232, 245, 236, 0.35) 0%, transparent 42%)',
              }}
            />

            {/* Gently Flying Leaves (strictly confined inside the green banner) */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
              {BANNER_LEAVES.map((leaf) => (
                <div
                  key={leaf.id}
                  className={`absolute left-0 right-0 ${leaf.animClass}`}
                  style={{
                    top: leaf.top,
                    animationDelay: leaf.delay,
                    animationDuration: leaf.duration,
                  }}
                >
                  <span className="inline-block team-leaf-tumble">
                    <Leaf className={`${leaf.sizeClass} ${leaf.colorClass}`} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Content Wrapper */}
          <div className="relative z-10 px-5 sm:px-8 pb-6 sm:pb-8">
            {/* Fully Visible Left-Aligned Overlapping Avatar */}
            <div className="relative z-20 -mt-10 sm:-mt-12 mb-4 flex items-end">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#123D2A] to-[#16A36A] p-1 shadow-lg border-4 border-white shrink-0">
                <div className="w-full h-full rounded-xl bg-[#0c291c] flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl tracking-tight select-none">
                  ST
                </div>
              </div>
            </div>

            {/* Identity & Academic Qualification */}
            <div className="space-y-1.5 pb-5 border-b border-[#123D2A]/10">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#123D2A] tracking-tight">
                Salma Tasneem
              </h2>
              <div className="flex items-start sm:items-center gap-2 text-sm sm:text-base text-[#18251E]/85 font-medium">
                <GraduationCap className="w-5 h-5 text-[#16A36A] shrink-0 mt-0.5 sm:mt-0" />
                <span>Bachelor of Engineering – Electronics and Communication Engineering</span>
              </div>
            </div>

            {/* Equal-Height Interactive Contact Cards */}
            <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              <a
                href={`mailto:${EMAIL_ADDRESS}`}
                className="h-full flex items-center gap-3.5 p-4 rounded-2xl bg-[#FAFCF8] hover:bg-[#E8F5EC]/75 border border-[#123D2A]/12 hover:border-[#16A36A] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="team-icon-float w-11 h-11 rounded-xl bg-[#E8F5EC] text-[#123D2A] group-hover:bg-[#16A36A] group-hover:text-white flex items-center justify-center transition-colors duration-300 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#18251E]/60 block">
                    EMAIL
                  </span>
                  <span className="text-sm font-bold text-[#123D2A] group-hover:text-[#16A36A] transition-colors break-all block mt-0.5">
                    {EMAIL_ADDRESS}
                  </span>
                </div>
              </a>

              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="h-full flex items-center gap-3.5 p-4 rounded-2xl bg-[#FAFCF8] hover:bg-[#E8F5EC]/75 border border-[#123D2A]/12 hover:border-[#16A36A] shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="team-icon-float-delayed w-11 h-11 rounded-xl bg-[#E8F5EC] text-[#123D2A] group-hover:bg-[#16A36A] group-hover:text-white flex items-center justify-center transition-colors duration-300 shrink-0">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#18251E]/60 flex items-center gap-1.5">
                    <span>LINKEDIN</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </span>
                  <span className="text-sm font-bold text-[#123D2A] group-hover:text-[#16A36A] transition-colors break-all leading-snug block mt-0.5">
                    {LINKEDIN_URL}
                  </span>
                </div>
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
