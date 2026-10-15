import { Button } from "@toss/tds-mobile";
import { useState } from "react";

import { BottomActions } from "../components/BottomActions";
import { NicknameField } from "../components/NicknameField";
import { NumberField } from "../components/NumberField";
import { IS_REMINDER_READY, REMINDER_TIME_LABEL } from "../config/notification";
import { PageHeader } from "../components/PageHeader";
import { type AppState, isValidNickname, type Settings } from "../domain/appState";
import { formatWon, parseWonInput } from "../domain/format";

interface SettingsPageProps {
  state: AppState;
  onSave: (nickname: string, settings: Settings) => void;
  onRequestReminder: () => void;
}

export function SettingsPage({ state, onSave, onRequestReminder }: SettingsPageProps) {
  const [nickname, setNickname] = useState(state.nickname ?? "");
  const [dailyText, setDailyText] = useState(String(state.settings.dailyAverageSpend));
  const [goalText, setGoalText] = useState(String(state.settings.monthlyGoal));

  const daily = parseWonInput(dailyText);
  const goal = parseWonInput(goalText);
  const isValid = isValidNickname(nickname) && goal >= 1 && goal <= 31;

  return (
    <>
      <PageHeader title="설정" />
      <div className="page">
        <section className="card">
          <div className="field">
            <label>닉네임</label>
            <NicknameField value={nickname} onChange={setNickname} />
          </div>
          <div className="field">
            <label>하루 평균 지출</label>
            <p>무지출한 날마다 이만큼 아낀 것으로 계산해요.</p>
            <NumberField
              value={dailyText}
              onChange={setDailyText}
              placeholder="예: 20000"
              maxDigits={8}
              preview={formatWon(daily)}
            />
          </div>
          <div className="field">
            <label>한 달 무지출 목표</label>
            <p>1~31일 사이로 정해 주세요.</p>
            <NumberField
              value={goalText}
              onChange={setGoalText}
              placeholder="예: 10"
              maxDigits={2}
              preview={goal >= 1 && goal <= 31 ? `${goal}일` : "1~31일 사이로 입력해 주세요"}
            />
          </div>
        </section>
        {IS_REMINDER_READY && (
          <section className="card">
            <div className="field">
              <label>{REMINDER_TIME_LABEL} 기록 알림</label>
              {state.reminder.agreed ? (
                <p>
                  매일 {REMINDER_TIME_LABEL}에 기록 알림을 받고 있어요.
                  <br />
                  끄려면 토스 앱 전체 → 설정 → 알림 → 서비스별 알림에서 바꿀 수 있어요.
                </p>
              ) : (
                <>
                  <p>매일 {REMINDER_TIME_LABEL}에 오늘 기록을 알려드려요.</p>
                  <Button size="medium" variant="weak" onClick={onRequestReminder}>
                    알림 받기
                  </Button>
                </>
              )}
            </div>
          </section>
        )}
      </div>
      <BottomActions>
        <Button
          display="block"
          size="large"
          disabled={!isValid}
          onClick={() => onSave(nickname, { dailyAverageSpend: daily, monthlyGoal: goal })}
        >
          저장하기
        </Button>
      </BottomActions>
    </>
  );
}
