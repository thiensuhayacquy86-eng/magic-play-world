import React from 'react';
import { Sparkles, Star } from 'lucide-react';
import { ResilientImage } from './ResilientImage';
import { COMPANIONS } from '../data/worldData';

export const AppFooter: React.FC = () => {
  return (
    <footer className="relative mt-6 overflow-hidden border-t border-sky-200/80 bg-gradient-to-b from-sky-50/90 via-cyan-50/55 to-amber-50/90">
      {/* Dải cầu vồng 3D rực rỡ viền trên */}
      <div
        aria-hidden="true"
        className="h-1.5 w-full bg-gradient-to-r from-rose-400 via-amber-400 via-emerald-400 to-sky-500"
      />

      {/* Chi tiết trang trí ánh sáng, cầu vồng, mây bồng bềnh và sao lấp lánh */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Ánh sáng cầu vồng dịu nhẹ */}
        <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-amber-300/25 blur-3xl" />

        {/* Cầu vồng SVG mờ phía góc phải */}
        <svg
          viewBox="0 0 220 120"
          className="absolute right-4 -bottom-4 w-44 sm:w-56 opacity-25"
          fill="none"
        >
          <path d="M20 115 A90 90 0 0 1 200 115" stroke="#FB7185" strokeWidth="10" strokeLinecap="round" />
          <path d="M32 115 A78 78 0 0 1 188 115" stroke="#FBBF24" strokeWidth="10" strokeLinecap="round" />
          <path d="M44 115 A66 66 0 0 1 176 115" stroke="#34D399" strokeWidth="10" strokeLinecap="round" />
          <path d="M56 115 A54 54 0 0 1 164 115" stroke="#38BDF8" strokeWidth="10" strokeLinecap="round" />
        </svg>

        {/* Đám mây bồng bềnh chuyển động nhẹ */}
        <svg
          viewBox="0 0 140 60"
          className="animate-cloud-drift absolute top-4 left-[6%] w-24 sm:w-28 text-white/80 drop-shadow-xs"
          fill="currentColor"
        >
          <path d="M32 48h76a16 16 0 0 0 2-31.8A24 24 0 0 0 64 12a20 20 0 0 0-36 10.5A14 14 0 0 0 32 48Z" />
        </svg>

        <svg
          viewBox="0 0 140 60"
          className="animate-cloud-drift absolute top-6 right-[14%] w-20 sm:w-24 text-white/70 drop-shadow-xs"
          style={{ animationDelay: '2.2s' }}
          fill="currentColor"
        >
          <path d="M32 48h76a16 16 0 0 0 2-31.8A24 24 0 0 0 64 12a20 20 0 0 0-36 10.5A14 14 0 0 0 32 48Z" />
        </svg>

        {/* Ngôi sao lấp lánh chuyển động nhẹ */}
        <Star className="animate-sparkle absolute top-5 left-[44%] w-4 h-4 fill-amber-400 text-amber-400" />
        <Star
          className="animate-sparkle absolute bottom-12 left-[28%] w-3.5 h-3.5 fill-sky-400 text-sky-400"
          style={{ animationDelay: '0.9s' }}
        />
        <Star
          className="animate-sparkle absolute top-10 right-[6%] w-4 h-4 fill-rose-400 text-rose-400"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4">
        {/* Khối nội dung chính: Giới thiệu + Nhân vật 3D & Thông tin cô giáo / nhà trường */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Cột trái: Tiêu đề, giới thiệu & dàn nhân vật 3D đồng hành */}
          <div className="lg:col-span-7 space-y-2.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1 text-xs font-extrabold tracking-wider text-orange-600 shadow-xs border border-amber-200/80">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>✨ VỀ ỨNG DỤNG ✨</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-center lg:justify-start gap-2.5">
              <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-sky-600 via-indigo-600 to-orange-500 bg-clip-text text-transparent">
                MAGIC PLAY WORLD
              </h2>

              {/* Nhân vật hoạt hình 3D đáng yêu đồng hành */}
              <div className="flex items-center justify-center gap-1.5">
                {COMPANIONS.map((companion, idx) => (
                  <div
                    key={companion.id}
                    title={companion.name}
                    className="animate-companion-bounce w-8 h-8 rounded-xl overflow-hidden bg-white ring-2 ring-white shadow-sm border border-sky-200/80"
                    style={{ animationDelay: `${idx * 0.28}s` }}
                  >
                    <ResilientImage
                      src={companion.image}
                      alt={companion.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              Magic Play World – Thế giới vui chơi kỳ diệu, nơi bé thỏa sức khám phá, trải nghiệm,
              sáng tạo và học hỏi thông qua những trò chơi tương tác thú vị.
            </p>
          </div>

          {/* Cột phải: Thẻ 3D mềm mại hiển thị thông tin tác giả & đơn vị */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-white/85 backdrop-blur-md border border-sky-200/80 shadow-[0_10px_24px_-8px_rgba(14,165,233,0.18)] p-4 space-y-2">
              <p className="text-xs sm:text-sm text-slate-700 leading-snug">
                <span aria-hidden="true">🌷 </span>
                Phần mềm được phát triển bởi cô:{' '}
                <strong className="font-display font-extrabold text-rose-600">
                  NGUYỄN THỊ VÂN
                </strong>
              </p>

              <p className="text-xs sm:text-sm text-slate-700 leading-snug">
                <span aria-hidden="true">🏫 </span>
                Đơn vị công tác:{' '}
                <strong className="font-display font-extrabold text-sky-700">
                  TRƯỜNG MẦM NON HOA SEN
                </strong>
              </p>

              <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                <span aria-hidden="true">📍 </span>
                Địa chỉ đơn vị:{' '}
                <span className="font-semibold text-slate-700">
                  510, Khu phố 6, phường Tam Hiệp, thành phố Đồng Nai.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Dòng thông điệp cuối trang & bản quyền */}
        <div className="pt-3 border-t border-sky-200/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-xs sm:text-sm font-display font-bold text-slate-700">
            💖 Mỗi trò chơi là một hành trình khám phá – Mỗi trải nghiệm là một bước trưởng thành của bé!
          </p>
          <span className="text-xs font-extrabold tracking-wide text-sky-700 whitespace-nowrap shrink-0">
            © 2026 MAGIC PLAY WORLD
          </span>
        </div>
      </div>
    </footer>
  );
};
