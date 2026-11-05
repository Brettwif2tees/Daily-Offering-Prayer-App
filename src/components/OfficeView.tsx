import React, { useState, useEffect } from 'react';
import { Share2, Timer } from 'lucide-react';
import { DailyReadingPlan } from '../data/defaultSchedule';
import { getScriptureReading } from '../data/scriptureData';

// Plays a resonant contemplative prayer bell / chime using Web Audio API
function playMeditationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Harmonic partials for a rich, sacred prayer bowl / chime bell (D5 chime)
    const partials = [
      { freq: 587.33, gain: 0.5 },  // Fundamental D5
      { freq: 880.00, gain: 0.25 }, // Perfect 5th A5
      { freq: 1174.66, gain: 0.18 }, // Octave D6
      { freq: 1760.00, gain: 0.08 }  // Octave + 5th A6
    ];

    partials.forEach(({ freq, gain: pGain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(pGain * 0.5, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 3.2);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.2);
    });
  } catch (err) {
    console.warn('Unable to play meditation chime:', err);
  }
}

interface OfficeViewProps {
  office: 'morning' | 'midday' | 'evening';
  readingPlan: DailyReadingPlan;
  currentDate: Date;
  onOpenSchedule: () => void;
}

export const OfficeView: React.FC<OfficeViewProps> = ({
  office,
  readingPlan,
  currentDate,
  onOpenSchedule,
}) => {
  // The daily appointed Psalm is read morning, midday (afternoon), and evening
  const psalmReading = getScriptureReading(readingPlan.morningPsalm || '1', 'Psalms', office);

  // In midday and evening, add the appointed proverb corresponding to the day in the schedule
  const proverbRef = office === 'midday' ? readingPlan.middayProverb : readingPlan.eveningProverb;
  const proverbReading = office !== 'morning' && proverbRef
    ? getScriptureReading(proverbRef, 'Proverbs', office)
    : null;

  // Reader customization state
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  // Meditation timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(120); // 2 minutes default
  const [selectedDuration, setSelectedDuration] = useState(120);

  // Copy status
  const [copied, setCopied] = useState(false);

  // Handle timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerActive && timerSecondsLeft === 0) {
      playMeditationChime();
      setTimerActive(false);
      setTimerSecondsLeft(selectedDuration);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timerSecondsLeft, selectedDuration]);

  const handleStartTimer = (seconds: number) => {
    // Unlock AudioContext on user interaction
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const testCtx = new AudioCtx();
        if (testCtx.state === 'suspended') {
          testCtx.resume();
        }
      }
    } catch {
      // AudioContext unavailable or error
    }

    setSelectedDuration(seconds);
    setTimerSecondsLeft(seconds);
    setTimerActive(true);
  };

  const handleStopTimer = () => {
    setTimerActive(false);
    setTimerSecondsLeft(selectedDuration);
  };

  const handleShareOrCopy = () => {
    let text = `${psalmReading.liturgicalTitle} (CSB)\n\n${psalmReading.verses
      .map((v) => (v.lines ? v.lines.join('\n') : v.text))
      .join('\n\n')}`;

    if (proverbReading) {
      text += `\n\n—\n\n${proverbReading.liturgicalTitle} (CSB)\n\n${proverbReading.verses
        .map((v) => `${(v.lines ? v.lines.join('\n   ') : v.text)}`)
        .join('\n\n')}`;
    }

    text += `\n\n—\n\nOur Father (the disciple's prayer)\n\nFather in Heaven,\n   may your name be treated as holy.\nYour kingdom come;\n   your will be done on earth as it is in heaven.\nGive me my daily bread, today.\nForgive my sins,\n   as I forgive those who have sinned against me\nDo not bring me into trials,\n   but rescue me from evil\n\nExtemporaneous pray may be added.\n\nGlory be to the Father, and to the Son, and to the Holy Spirit;\nAs it was in the beginning, is now, and ever shall be, world without end. Amen.\n\n— Daily Offering (${office.toUpperCase()} PRAYER · Christian Standard Bible)`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getOfficeMetadata = () => {
    if (office === 'morning') {
      return {
        name: 'Morning Offering',
        ruleNotice: 'Daily Appointed Psalm',
      };
    } else if (office === 'midday') {
      return {
        name: 'Midday Offering',
        ruleNotice: 'Daily Appointed Psalm & Midday Proverb',
      };
    } else {
      return {
        name: 'Evening Offering',
        ruleNotice: 'Daily Appointed Psalm & Evening Proverb',
      };
    }
  };

  const meta = getOfficeMetadata();

  const fontSizeClasses = {
    normal: 'text-base sm:text-lg leading-snug',
    large: 'text-lg sm:text-xl leading-snug',
    xlarge: 'text-xl sm:text-2xl leading-normal',
  }[fontSize];

  return (
    <article className="max-w-3xl mx-auto bg-[#FAF6EE] dark:bg-[#26282E] rounded-2xl shadow-sm border border-[#DCD0BE] dark:border-[#3D414B] p-6 sm:p-10 transition-colors">
      
      {/* Office Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#DCD0BE] dark:border-[#3D414B]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-[#2D251F] dark:text-[#E3E5EB]">
            {meta.name}
          </h1>
        </div>

        {/* Toolbar: Text Size + Copy */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Font size toggles */}
          <div className="flex items-center bg-[#ECE2D2] dark:bg-[#34373F] rounded-lg p-1 text-xs font-serif">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded transition-colors ${fontSize === 'normal' ? 'bg-[#FAF6EE] dark:bg-[#202227] shadow-xs text-[#2D251F] dark:text-[#E3E5EB] font-bold' : 'text-[#6B5E54] dark:text-[#9DA1AB]'}`}
              title="Standard text"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded transition-colors ${fontSize === 'large' ? 'bg-[#FAF6EE] dark:bg-[#202227] shadow-xs text-[#2D251F] dark:text-[#E3E5EB] font-bold' : 'text-[#6B5E54] dark:text-[#9DA1AB]'}`}
              title="Large text"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded transition-colors ${fontSize === 'xlarge' ? 'bg-[#FAF6EE] dark:bg-[#202227] shadow-xs text-[#2D251F] dark:text-[#E3E5EB] font-bold' : 'text-[#6B5E54] dark:text-[#9DA1AB]'}`}
              title="Extra large text"
            >
              A++
            </button>
          </div>

          {/* Copy button */}
          <button
            onClick={handleShareOrCopy}
            title="Copy reading to clipboard"
            className="p-2 rounded-lg border border-[#DCD0BE] dark:border-[#3D414B] bg-[#F3ECE1] dark:bg-[#2B2E35] text-[#2D251F] dark:text-[#E3E5EB] hover:bg-[#EAE0D0] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {copied && (
        <div className="my-3 py-1.5 px-3 bg-[#F2D8DC] dark:bg-[#3D414B] text-[#8B1527] dark:text-[#E57380] text-xs rounded-md border border-[#DCD0BE] dark:border-[#4B505C] text-center animate-fade-in">
          Scripture text copied to clipboard
        </div>
      )}

      {/* Liturgical Opening Invocation */}
      <section className="py-3">
        <div className="text-xs uppercase tracking-widest text-[#8B1527] dark:text-[#E57380] font-serif mb-1">
          The Opening Invocation
        </div>
        <p className="font-serif italic text-lg text-[#3D342C] dark:text-[#D1D3D8]">
          "{psalmReading.invocation}"
        </p>
      </section>

      {/* 1. Daily Appointed Psalm (Read in Morning, Midday, and Evening) */}
      <section className="py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B1527] dark:text-[#E57380] font-serif">
              <span>Daily Appointed Psalm</span>
              <span>·</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F2D8DC] dark:bg-[#34373F] text-[#8B1527] dark:text-[#E57380] border border-[#DCD0BE] dark:border-[#4B505C]">
                CSB
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D251F] dark:text-[#E3E5EB] mt-0.5">
              {psalmReading.liturgicalTitle}
            </h2>
          </div>

          <button
            onClick={onOpenSchedule}
            className="text-xs text-[#8B1527] dark:text-[#E57380] hover:underline font-sans"
          >
            View Schedule
          </button>
        </div>

        {/* Psalm Verses Container (No verse numbers, clean poetic line formatting) */}
        <div className={`prose-scripture text-[#2D251F] dark:text-[#E3E5EB] space-y-1.5 sm:space-y-2 ${fontSizeClasses}`}>
          {psalmReading.verses.map((verse, idx) => (
            <div key={idx} className="space-y-0.5 sm:space-y-1">
              {(verse.lines || [verse.text]).map((line, lIdx) => (
                <p key={lIdx} className="leading-snug font-serif">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 2. Appointed Proverb (Added in Midday and Evening) */}
      {proverbReading && (
        <section className="py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#8B1527] dark:text-[#E57380] font-serif">
                <span>{office === 'midday' ? 'Midday Appointed Proverb' : 'Evening Appointed Proverb'}</span>
                <span>·</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F2D8DC] dark:bg-[#34373F] text-[#8B1527] dark:text-[#E57380] border border-[#DCD0BE] dark:border-[#4B505C]">
                  CSB
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D251F] dark:text-[#E3E5EB] mt-0.5">
                {proverbReading.liturgicalTitle}
              </h2>
            </div>
          </div>

          {/* Proverbs Verses Container (No verse numbers, clean poetic line formatting) */}
          <div className={`prose-scripture text-[#2D251F] dark:text-[#E3E5EB] space-y-1.5 sm:space-y-2 ${fontSizeClasses}`}>
            {proverbReading.verses.map((verse, idx) => (
              <div key={idx} className="space-y-0.5 sm:space-y-1">
                {(verse.lines || [verse.text]).map((line, lIdx) => (
                  <p key={lIdx} className="leading-snug font-serif">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Silent Contemplation & Meditation Timer */}
      <section className="my-3 p-4 sm:p-5 rounded-2xl bg-[#F4EFE6] dark:bg-[#202227] border border-[#DCD0BE] dark:border-[#3D414B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F2D8DC] dark:bg-[#34373F] text-[#8B1527] dark:text-[#E57380] border border-[#DCD0BE] dark:border-[#4B505C] flex items-center justify-center shrink-0 shadow-xs">
              <Timer className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h4 className="text-base sm:text-lg font-serif font-semibold text-[#2D251F] dark:text-[#E3E5EB]">
              Pause, Breath and Contemplate
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {!timerActive ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleStartTimer(60)}
                  className="px-2.5 py-1 text-xs rounded border border-[#DCD0BE] dark:border-[#3D414B] bg-[#FAF6EE] dark:bg-[#2B2E35] hover:bg-[#EAE0D0] dark:hover:bg-[#34373F] text-[#2D251F] dark:text-[#E3E5EB]"
                >
                  1 min
                </button>
                <button
                  onClick={() => handleStartTimer(120)}
                  className="px-2.5 py-1 text-xs rounded border border-[#DCD0BE] dark:border-[#3D414B] bg-[#FAF6EE] dark:bg-[#2B2E35] hover:bg-[#EAE0D0] dark:hover:bg-[#34373F] text-[#2D251F] dark:text-[#E3E5EB]"
                >
                  2 min
                </button>
                <button
                  onClick={() => handleStartTimer(300)}
                  className="px-2.5 py-1 text-xs rounded border border-[#DCD0BE] dark:border-[#3D414B] bg-[#FAF6EE] dark:bg-[#2B2E35] hover:bg-[#EAE0D0] dark:hover:bg-[#34373F] text-[#2D251F] dark:text-[#E3E5EB]"
                >
                  5 min
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-medium text-[#8B1527] dark:text-[#E57380]">
                  {Math.floor(timerSecondsLeft / 60)}:
                  {String(timerSecondsLeft % 60).padStart(2, '0')}
                </span>
                <button
                  onClick={handleStopTimer}
                  className="px-2.5 py-1 text-xs rounded border border-[#C5B8A5] dark:border-[#4B505C] bg-[#E3D8C8] dark:bg-[#34373F] text-[#2D251F] dark:text-[#E3E5EB]"
                >
                  End Silence
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. The Our Father (The Disciple's Prayer) */}
      <section className="mt-4 pt-2">
        <div className="mb-3">
          <div className="text-xs uppercase tracking-widest text-[#8B1527] dark:text-[#E57380] font-serif mb-1">
            Prayers
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D251F] dark:text-[#E3E5EB]">
            Our Father
          </h2>
          <p className="text-sm font-serif italic text-[#6B5E54] dark:text-[#9DA1AB] mt-0.5">
            the disciple's prayer
          </p>
        </div>

        <div className={`prose-scripture text-[#2D251F] dark:text-[#E3E5EB] font-serif space-y-1 ${fontSizeClasses}`}>
          <div>
            <p className="leading-snug">Father in Heaven,</p>
            <p className="leading-snug pl-5 sm:pl-6 text-[#52443A] dark:text-[#BDC0C8]">
              may your name be treated as holy.
            </p>
          </div>

          <div>
            <p className="leading-snug">Your kingdom come;</p>
            <p className="leading-snug pl-5 sm:pl-6 text-[#52443A] dark:text-[#BDC0C8]">
              your will be done on earth as it is in heaven.
            </p>
          </div>

          <div>
            <p className="leading-snug">Give me my daily bread, today.</p>
          </div>

          <div>
            <p className="leading-snug">Forgive my sins,</p>
            <p className="leading-snug pl-5 sm:pl-6 text-[#52443A] dark:text-[#BDC0C8]">
              as I forgive those who have sinned against me
            </p>
          </div>

          <div>
            <p className="leading-snug">Do not bring me into trials,</p>
            <p className="leading-snug pl-5 sm:pl-6 text-[#52443A] dark:text-[#BDC0C8]">
              but rescue me from evil
            </p>
          </div>
        </div>

        {/* Liturgical Rubric: Intercession */}
        <div className="mt-2.5">
          <p className="font-serif text-xs sm:text-sm text-[#8B1527] dark:text-[#E57380]">
            Extemporaneous pray may be added.
          </p>
        </div>

        {/* Concluding Doxology */}
        <div className="pt-6 mt-8 sm:pt-8 sm:mt-10">
          <div className="text-xs uppercase tracking-widest text-[#8B1527] dark:text-[#E57380] font-serif mb-1">
            Gloria
          </div>
          <div className="space-y-1">
            <p className="leading-snug font-serif font-bold text-[#2D251F] dark:text-[#E3E5EB]">
              Glory be to the Father, and to the Son, and to the Holy Spirit;
            </p>
            <p className="leading-snug font-serif font-bold text-[#2D251F] dark:text-[#E3E5EB]">
              As it was in the beginning, is now, and ever shall be, world without end. Amen.
            </p>
          </div>
        </div>
      </section>

    </article>
  );
};
