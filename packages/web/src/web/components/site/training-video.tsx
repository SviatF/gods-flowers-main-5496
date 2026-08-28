import { useRef, useState } from "react";
import { ArrowRight, Check, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { offer } from "../../content/site";
import { openLeadApplication } from "./lead-modal";

const VIDEO_SRC = "/videos/IMG_1842_web_1080p.mp4";

export function TrainingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
      return;
    }

    video.pause();
    setPlaying(false);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const buy = () => {
    const url = offer.paymentUrl.trim();
    if (url) {
      window.location.href = url;
      return;
    }
    openLeadApplication(`Правильний догляд за квітами — ${offer.price}`);
  };

  return (
    <section className="relative overflow-hidden bg-cream py-16 md:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linen" />
      <div className="pointer-events-none absolute -left-24 top-20 size-72 rounded-full border border-taupe/10" />
      <div className="pointer-events-none absolute -right-28 bottom-10 size-96 rounded-full border border-terracotta/10" />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20 xl:gap-28">
        <div className="reveal order-2 lg:order-1">
          <span className="eyebrow">Реальний фрагмент навчання</span>
          <h2 className="mt-4 max-w-xl font-display text-[clamp(2.6rem,5.5vw,4.8rem)] leading-[0.94] text-ink">
            Подивись, як знання переходять <span className="italic text-taupe">у практику</span>
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft md:text-base">
            Квіти часто в’януть значно раніше, ніж могли б — через неправильний зріз, воду, температуру чи зберігання. У цьому онлайн-курсі ти дізнаєшся прості професійні прийоми, які легко повторити вдома, щоб букети довше залишалися свіжими, красивими й доглянутими.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {["Робота наживо", "Пояснення техніки", "Практичний підхід"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.14em] text-taupe-deep">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-sand text-taupe-deep">
                  <Check className="size-3.5" strokeWidth={2} />
                </span>
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 max-w-md">
            <button
              type="button"
              onClick={buy}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.18em] text-cream transition-colors duration-300 hover:bg-taupe-deep sm:w-auto"
            >
              Отримати курс за {offer.price}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-[10px] leading-relaxed text-taupe-deep">
              Один курс · онлайн-доступ · практичні правила догляду за квітами
            </p>
          </div>
        </div>

        <div className="reveal order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="relative w-full max-w-[350px] sm:max-w-[370px]">
            <div className="pointer-events-none absolute inset-0 translate-x-4 translate-y-5 rounded-[32px] border border-taupe/20 bg-sand/60 sm:translate-x-6 sm:translate-y-6" />
            <div className="pointer-events-none absolute -left-7 top-14 hidden h-32 w-12 rounded-full border border-linen bg-cream lg:block" />

            <div className="group relative aspect-[9/16] overflow-hidden rounded-[30px] border border-linen bg-ink shadow-[0_35px_80px_-40px_rgba(51,51,51,0.7)]">
              <video
                ref={videoRef}
                src={VIDEO_SRC}
                preload="metadata"
                playsInline
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
                className="h-full w-full object-cover"
              />

              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/20 transition-opacity duration-300 ${playing ? "opacity-45" : "opacity-80"}`} />

              <div className="absolute left-4 top-4 rounded-full border border-white/25 bg-black/30 px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-white backdrop-blur-md">
                Реальне навчання
              </div>

              {!playing ? (
                <button
                  type="button"
                  onClick={togglePlayback}
                  aria-label="Відтворити відео"
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white"
                >
                  <span className="inline-flex size-20 items-center justify-center rounded-full border border-white/35 bg-white/15 backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                    <Play className="ml-1 size-7 fill-current" />
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em]">Дивитися фрагмент</span>
                </button>
              ) : null}

              <div className={`absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 transition-opacity duration-300 ${playing ? "opacity-100" : "pointer-events-none opacity-0"}`}>
                <button
                  type="button"
                  onClick={togglePlayback}
                  aria-label="Пауза"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md"
                >
                  <Pause className="size-4 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Увімкнути звук" : "Вимкнути звук"}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md"
                >
                  {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
              </div>
            </div>

            <div className="relative mt-5 flex items-center justify-center gap-3 text-center lg:justify-start lg:pl-2 lg:text-left">
              <span className="h-px w-8 bg-taupe/40" />
              <p className="text-[10px] uppercase tracking-[0.16em] text-taupe-deep">Вертикальний фрагмент · 9:16</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
