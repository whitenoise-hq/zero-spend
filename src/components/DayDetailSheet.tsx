import { BottomSheet, Button } from "@toss/tds-mobile";
import { CalendarX2, CircleCheck, type LucideIcon, Receipt } from "lucide-react";

import type { DateKey } from "../domain/date";
import { formatMonthDay, formatWon } from "../domain/format";
import { type DayRecord, SPEND_CATEGORIES } from "../domain/records";

interface DayDetailSheetProps {
  date: DateKey | null;
  record: DayRecord | undefined;
  isToday: boolean;
  onClose: () => void;
}

interface DetailView {
  Icon: LucideIcon;
  tone: "success" | "spent" | "empty";
  title: string;
  description: string;
}

function toDetailView(record: DayRecord | undefined, isToday: boolean): DetailView {
  if (!record) {
    return {
      Icon: CalendarX2,
      tone: "empty",
      title: isToday ? "아직 기록 전이에요" : "기록이 없어요",
      description: isToday ? "오늘 탭에서 기록할 수 있어요." : "이날은 기록하지 않았어요.",
    };
  }
  if (record.status === "success") {
    return {
      Icon: CircleCheck,
      tone: "success",
      title: "무지출 성공",
      description: "이날은 돈을 쓰지 않았어요.",
    };
  }
  const category = SPEND_CATEGORIES.find((c) => c.id === record.category)?.label;
  return {
    Icon: Receipt,
    tone: "spent",
    title: record.amount ? `${formatWon(record.amount)} 썼어요` : "썼어요",
    description: category ?? "어디에 썼는지는 기록하지 않았어요.",
  };
}

export function DayDetailSheet({ date, record, isToday, onClose }: DayDetailSheetProps) {
  const view = toDetailView(record, isToday);

  return (
    <BottomSheet
      open={date !== null}
      onDimmerClick={onClose}
      header={<BottomSheet.Header>{date ? formatMonthDay(date) : ""}</BottomSheet.Header>}
      cta={
        <div className="sheet-cta">
          <Button display="block" size="large" onClick={onClose}>
            확인
          </Button>
        </div>
      }
    >
      <div className="day-detail">
        <div className={`today-done-icon ${view.tone}`}>
          <view.Icon size={24} strokeWidth={2.2} />
        </div>
        <div className="today-done-text">
          <strong>{view.title}</strong>
          <span>{view.description}</span>
        </div>
      </div>
    </BottomSheet>
  );
}
