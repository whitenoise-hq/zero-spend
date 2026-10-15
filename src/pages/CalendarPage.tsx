import { useState } from "react";

import { BannerAd } from "../components/BannerAd";
import { DayDetailSheet } from "../components/DayDetailSheet";
import { MonthNav } from "../components/MonthNav";
import { PageHeader } from "../components/PageHeader";
import { buildMonthGrid, type DateKey, monthKeyOf } from "../domain/date";
import type { RecordMap } from "../domain/records";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarPageProps {
  records: RecordMap;
  today: DateKey;
}

function dayClassName(date: DateKey, records: RecordMap, today: DateKey): string {
  const status = records[date]?.status;
  return [
    "day-cell",
    status,
    date === today ? "today" : null,
    date > today ? "future" : null,
  ]
    .filter(Boolean)
    .join(" ");
}

export function CalendarPage({ records, today }: CalendarPageProps) {
  const currentMonth = monthKeyOf(today);
  const [month, setMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState<DateKey | null>(null);

  return (
    <>
      <PageHeader title="무지출 달력" />
      <div className="page">
        <section className="card">
          <MonthNav month={month} maxMonth={currentMonth} onChange={setMonth} />
          <div className="calendar">
            {WEEKDAYS.map((weekday) => (
              <div key={weekday} className="weekday">
                {weekday}
              </div>
            ))}
            {buildMonthGrid(month).map((date, index) => (
              <div key={date ?? `empty-${index}`} className="day">
                {date && (
                  <button
                    type="button"
                    className={dayClassName(date, records, today)}
                    disabled={date > today}
                    aria-label={`${Number(date.slice(5, 7))}월 ${Number(date.slice(8))}일 기록 보기`}
                    onClick={() => setSelectedDate(date)}
                  >
                    {Number(date.slice(8))}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="legend">
            <span>
              <i style={{ background: "var(--color-primary)" }} />
              무지출
            </span>
            <span>
              <i style={{ background: "var(--color-spent)" }} />
              썼어요
            </span>
          </div>
        </section>
        <BannerAd />
      </div>
      <DayDetailSheet
        date={selectedDate}
        record={selectedDate ? records[selectedDate] : undefined}
        isToday={selectedDate === today}
        onClose={() => setSelectedDate(null)}
      />
    </>
  );
}
