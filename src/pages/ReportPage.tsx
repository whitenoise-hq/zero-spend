import { Button } from "@toss/tds-mobile";
import { useState } from "react";

import { BadgeGrid } from "../components/BadgeGrid";
import { BottomActions } from "../components/BottomActions";
import { MonthNav } from "../components/MonthNav";
import { PageHeader } from "../components/PageHeader";
import type { AppState } from "../domain/appState";
import { monthlyBadges } from "../domain/badges";
import { type DateKey, monthKeyOf } from "../domain/date";
import { buildShareMessage, formatWon } from "../domain/format";
import { currentStreak, longestStreak, monthStats } from "../domain/records";

interface ReportPageProps {
  state: AppState;
  today: DateKey;
  onShare: (message: string) => void;
}

export function ReportPage({ state, today, onShare }: ReportPageProps) {
  const currentMonth = monthKeyOf(today);
  const [month, setMonth] = useState(currentMonth);
  const isCurrentMonth = month === currentMonth;
  const stats = monthStats(state.records, month, state.settings.dailyAverageSpend);
  const longest = longestStreak(state.records);
  const badges = monthlyBadges(state.records, month, state.settings.monthlyGoal);
  const earnedCount = badges.filter((badge) => badge.earnedOn).length;

  const share = () =>
    onShare(
      buildShareMessage({
        month,
        successDays: stats.successDays,
        savedAmount: stats.savedAmount,
        streak: isCurrentMonth ? currentStreak(state.records, today) : 0,
      }),
    );

  return (
    <>
      <PageHeader title="리포트" />
      <div className="page">
        <section className="card">
          <MonthNav month={month} maxMonth={currentMonth} onChange={setMonth} />
          <div className="saved-inline">
            <span>{isCurrentMonth ? "이번 달" : "이 달"} 아낀 돈</span>
            <strong>약 {formatWon(stats.savedAmount)}</strong>
          </div>
          <div className="stats">
            <div className="stat">
              <strong>{stats.successDays}일</strong>
              <span>무지출</span>
            </div>
            <div className="stat">
              <strong>{stats.spentDays}일</strong>
              <span>쓴 날</span>
            </div>
            <div className="stat">
              <strong>{formatWon(stats.spentAmount)}</strong>
              <span>기록한 지출</span>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="badge-header">
            <p className="card-title">받은 배지</p>
            <span>
              {earnedCount}/{badges.length}
            </span>
          </div>
          <BadgeGrid badges={badges} />
          <p className="hint badge-note">
            배지는 매달 1일에 새로 시작해요.
            <br />
            최장 연속 기록은 {longest}일이에요.
          </p>
        </section>
      </div>
      <BottomActions>
        <Button display="block" size="large" onClick={share}>
          친구에게 자랑하기
        </Button>
      </BottomActions>
    </>
  );
}
