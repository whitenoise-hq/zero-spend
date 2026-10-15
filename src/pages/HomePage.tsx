import { Button, ProgressBar } from "@toss/tds-mobile";
import {
  CircleCheck,
  Flame,
  type LucideIcon,
  Receipt,
  Sprout,
  Target,
  Trophy,
} from "lucide-react";
import { useState } from "react";

import { BottomActions } from "../components/BottomActions";
import { PageHeader } from "../components/PageHeader";
import { SpendForm } from "../components/SpendForm";
import type { AppState } from "../domain/appState";
import { addDays, type DateKey, monthKeyOf } from "../domain/date";
import { formatMonthDay, formatWon } from "../domain/format";
import {
  currentStreak,
  type DayRecord,
  monthStats,
  SPEND_CATEGORIES,
} from "../domain/records";

interface HomePageProps {
  state: AppState;
  today: DateKey;
  canRecoverYesterday: boolean;
  onRecord: (date: DateKey, record: DayRecord) => void;
  onRecoverYesterday: () => void;
}

function streakIcon(streak: number): LucideIcon {
  if (streak >= 30) return Trophy;
  if (streak >= 7) return Flame;
  if (streak >= 1) return Sprout;
  return Target;
}

function TodayResult({ record }: { record: DayRecord }) {
  if (record.status === "success") {
    return (
      <div className="today-done">
        <div className="today-done-icon success">
          <CircleCheck size={26} strokeWidth={2.2} />
        </div>
        <div className="today-done-text">
          <strong>오늘 무지출 성공!</strong>
          <span>내일도 이어가 봐요.</span>
        </div>
      </div>
    );
  }
  const label = SPEND_CATEGORIES.find((c) => c.id === record.category)?.label;
  const detail = [label, record.amount ? formatWon(record.amount) : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="today-done">
      <div className="today-done-icon spent">
        <Receipt size={24} strokeWidth={2.2} />
      </div>
      <div className="today-done-text">
        <strong>오늘은 썼어요</strong>
        <span>{detail || "괜찮아요, 내일 다시 해봐요."}</span>
      </div>
    </div>
  );
}

export function HomePage(props: HomePageProps) {
  const { state, today, canRecoverYesterday, onRecord, onRecoverYesterday } = props;
  const [isSpendFormOpen, setIsSpendFormOpen] = useState(false);
  const streak = currentStreak(state.records, today);
  const stats = monthStats(state.records, monthKeyOf(today), state.settings.dailyAverageSpend);
  const goal = state.settings.monthlyGoal;
  const todayRecord = state.records[today];
  const StreakIcon = streakIcon(streak);

  return (
    <>
      <PageHeader title={`${state.nickname}님, 오늘 무지출 했나요?`} subtitle={formatMonthDay(today)} />
      <div className="page">
        <section className="card streak">
          <div className="icon-circle large">
            <StreakIcon size={30} strokeWidth={2.2} />
          </div>
          <div className="streak-number">{streak}일</div>
          <div className="streak-caption">
            {streak > 0 ? "연속 무지출 중이에요" : "오늘부터 시작해 봐요"}
          </div>
        </section>

        <section className="card">
          <p className="card-title">이번 달 목표</p>
          <div className="goal-row">
            <span className="goal-value">
              {stats.successDays}일 <small>/ {goal}일</small>
            </span>
            <span className="streak-caption">약 {formatWon(stats.savedAmount)} 아낌</span>
          </div>
          <ProgressBar size="normal" progress={Math.min(stats.successDays / goal, 1)} animate />
        </section>

        {todayRecord ? (
          <section className="card">
            <TodayResult record={todayRecord} />
          </section>
        ) : isSpendFormOpen ? (
          <SpendForm
            onSubmit={(record) => {
              onRecord(today, record);
              setIsSpendFormOpen(false);
            }}
            onCancel={() => setIsSpendFormOpen(false)}
          />
        ) : (
          <BottomActions>
            <Button display="block" size="large" variant="weak" color="dark" onClick={() => setIsSpendFormOpen(true)}>
              오늘은 썼어요
            </Button>
            <Button display="block" size="large" onClick={() => onRecord(today, { status: "success" })}>
              무지출 성공
            </Button>
          </BottomActions>
        )}

        {canRecoverYesterday && (
          <section className="card">
            <p className="card-title">어제 기록을 깜빡했나요?</p>
            <Button display="block" size="large" variant="weak" onClick={onRecoverYesterday}>
              광고 보고 어제 무지출 기록하기
            </Button>
            <p className="hint">어제({formatMonthDay(addDays(today, -1))}) 정말 안 썼을 때만 눌러 주세요.</p>
          </section>
        )}
      </div>
    </>
  );
}
