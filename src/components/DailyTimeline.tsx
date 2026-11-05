import { Sunrise, Sun, Sunset, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { DailyReadingPlan, DayOneAnchor } from '../data/defaultSchedule';

interface DailyTimelineProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  activeOffice: 'morning' | 'midday' | 'evening';
  setActiveOffice: (office: 'morning' | 'midday' | 'evening') => void;
  readingPlan: DailyReadingPlan;
  dayOneAnchor: DayOneAnchor;
  onOpenDayOneModal: () => void;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({
  currentDate,
  setCurrentDate,
  activeOffice,
  setActiveOffice,
  readingPlan,
  dayOneAnchor,
  onOpenDayOneModal,
}) => {
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handlePrevDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = new Date().toDateString() === currentDate.toDateString();

  const offices = [
    {
      id: 'morning' as const,
      title: 'Morning',
      traditionalName: 'Prime',
      icon: Sunrise,
    },
    {
      id: 'midday' as const,
      title: 'Midday',
      traditionalName: 'Sext',
      icon: Sun,
    },
    {
      id: 'evening' as const,
      title: 'Evening',
      traditionalName: 'Vespers',
      icon: Sunset,
    }
  ];

  return (
    <section className="mb-4">
      {/* Date Header with Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCD0BE] dark:border-[#3D414B]">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-widest text-[#8B1527] dark:text-[#E57380] font-serif font-semibold">
              {readingPlan.label} of 365
            </span>
            <span className="text-[#C5B8A5] dark:text-[#4B505C]">·</span>
            <button
              onClick={onOpenDayOneModal}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-sans font-medium bg-[#F2D8DC] dark:bg-[#34373F] text-[#8B1527] dark:text-[#E57380] hover:bg-[#EAC8CE] dark:hover:bg-[#3D414B] border border-[#DCD0BE] dark:border-[#4B505C] transition-colors"
              title="Change which date marks Day 1 of the reading year"
            >
              <Calendar className="w-3 h-3" />
              <span>Day 1 Anchor: <strong>{dayOneAnchor.label}</strong></span>
              <span className="underline ml-0.5 opacity-80 hover:opacity-100">Change</span>
            </button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#2D251F] dark:text-[#E3E5EB]">
            {formattedDate}
          </h2>
          <p className="text-sm sm:text-base font-serif text-[#6B5E54] dark:text-[#9DA1AB] mt-1 font-medium flex flex-wrap items-center">
            <span className="text-[#2D251F] dark:text-[#E3E5EB]">{readingPlan.morningPsalm}</span>
            {readingPlan.middayProverb && (
              <>
                <span className="mx-2 text-[#C5B8A5] dark:text-[#4B505C]">·</span>
                <span>{readingPlan.middayProverb}</span>
              </>
            )}
            {readingPlan.eveningProverb && (
              <>
                <span className="mx-2 text-[#C5B8A5] dark:text-[#4B505C]">·</span>
                <span>{readingPlan.eveningProverb}</span>
              </>
            )}
          </p>
        </div>

        {/* Date controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handlePrevDay}
            title="Previous Day"
            className="p-2 rounded-md border border-[#DCD0BE] dark:border-[#3D414B] bg-[#FAF6EE] dark:bg-[#2B2E35] hover:bg-[#F2EAE0] dark:hover:bg-[#34373F] text-[#2D251F] dark:text-[#E3E5EB] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isToday && (
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-[#8B1527]/30 text-[#8B1527] dark:text-[#E57380] bg-[#F2D8DC] dark:bg-[#34373F] hover:bg-[#EAC8CE] transition-colors"
            >
              Today
            </button>
          )}
          <button
            onClick={handleNextDay}
            title="Next Day"
            className="p-2 rounded-md border border-[#DCD0BE] dark:border-[#3D414B] bg-[#FAF6EE] dark:bg-[#2B2E35] hover:bg-[#F2EAE0] dark:hover:bg-[#34373F] text-[#2D251F] dark:text-[#E3E5EB] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Appointed Prayer Office Selector Tabs (Horizontally side-by-side, larger icons, title below, active label removed) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-3">
        {offices.map((office) => {
          const Icon = office.icon;
          const isActive = activeOffice === office.id;

          return (
            <button
              key={office.id}
              type="button"
              onClick={() => setActiveOffice(office.id)}
              className={`group relative flex flex-col items-center justify-center text-center rounded-2xl p-3 sm:p-5 transition-all border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1527] ${
                isActive
                  ? 'bg-[#FAF6EE] dark:bg-[#2B2E35] border-[#8B1527] dark:border-[#E57380] shadow-md ring-2 ring-[#8B1527]/25 dark:ring-[#E57380]/35'
                  : 'bg-[#F9F5EB] dark:bg-[#26282E] border-[#DCD0BE] dark:border-[#3D414B] hover:bg-[#FAF6EE] dark:hover:bg-[#2B2E35] hover:border-[#C5B8A5]'
              }`}
            >
              <span
                className={`p-3 sm:p-4 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-[#F2D8DC] dark:bg-[#3D414B] text-[#8B1527] dark:text-[#E57380] shadow-xs scale-105'
                    : 'bg-[#EAE2D2] dark:bg-[#30333A] text-[#6B5E54] dark:text-[#9DA1AB] group-hover:scale-105'
                }`}
              >
                <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
              </span>

              <span
                className={`font-serif font-semibold text-xs sm:text-base leading-tight mt-2.5 sm:mt-3 transition-colors ${
                  isActive
                    ? 'text-[#8B1527] dark:text-[#E57380]'
                    : 'text-[#2D251F] dark:text-[#E3E5EB] group-hover:text-[#8B1527] dark:group-hover:text-[#E57380]'
                }`}
              >
                {office.title}
              </span>

              <span
                className={`font-serif italic text-[11px] sm:text-xs mt-0.5 sm:mt-1 transition-colors ${
                  isActive
                    ? 'text-[#9B1B30] dark:text-[#E88C98]'
                    : 'text-[#8C7F72] dark:text-[#8E929C] group-hover:text-[#6B5E54] dark:group-hover:text-[#B0B4BE]'
                }`}
              >
                {office.traditionalName}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
