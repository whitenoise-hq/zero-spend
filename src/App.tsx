import { Button, useToast } from "@toss/tds-mobile";
import { useState } from "react";

import "./App.css";
import { BottomNav, type TabId } from "./components/BottomNav";
import { ReminderSheet } from "./components/ReminderSheet";
import { AD_GROUP_IDS } from "./config/ads";
import { REMINDER_TIME_LABEL } from "./config/notification";
import { hasOnboarded, shouldPromptReminder } from "./domain/appState";
import { newlyEarnedBadges } from "./domain/badges";
import { addDays, type DateKey, monthKeyOf } from "./domain/date";
import { type DayRecord, shouldShowInterstitial } from "./domain/records";
import { useAppState } from "./hooks/useAppState";
import { useFullScreenAd } from "./hooks/useFullScreenAd";
import { useToday } from "./hooks/useToday";
import { pathForTab, tabFromPath } from "./navigation/tabRoute";
import { CalendarPage } from "./pages/CalendarPage";
import { HomePage } from "./pages/HomePage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ReportPage } from "./pages/ReportPage";
import { SettingsPage } from "./pages/SettingsPage";
import { requestReminderAgreement } from "./platform/notification";
import { shareText } from "./platform/share";

function App() {
  const {
    state,
    loadStatus,
    saveError,
    retryLoad,
    record,
    changeNickname,
    saveProfile,
    markReminderPrompted,
    setReminderAgreed,
  } = useAppState();
  const today = useToday();
  const [tab, setTab] = useState<TabId>(() => tabFromPath(window.location.pathname));

  // 탭을 바꾸면 주소도 맞춰 둬요. 뒤로가기 기록은 쌓지 않아요.
  const changeTab = (next: TabId) => {
    setTab(next);
    window.history.replaceState(window.history.state, "", pathForTab(next));
  };
  const interstitial = useFullScreenAd(AD_GROUP_IDS.interstitial);
  const rewarded = useFullScreenAd(AD_GROUP_IDS.rewarded);
  const toast = useToast();
  // 하단은 버튼·네비게이션이 차지해서 토스트는 상단에 띄워요.
  const notify = (message: string) => toast.openToast(message, { type: "top", gap: 16 });

  if (loadStatus === "loading") return <div className="loading">불러오는 중이에요</div>;
  if (loadStatus === "error") {
    return (
      <div className="loading">
        <p>기록을 불러오지 못했어요.</p>
        <Button size="medium" variant="weak" onClick={retryLoad}>
          다시 시도
        </Button>
      </div>
    );
  }
  if (!hasOnboarded(state)) return <OnboardingPage onSubmit={changeNickname} />;

  const yesterday = addDays(today, -1);
  const hasAnyRecord = Object.keys(state.records).length > 0;
  const canRecoverYesterday =
    hasAnyRecord && state.records[yesterday] === undefined && rewarded.isReady;

  // 기록 전후를 비교해서 새로 받은 배지가 있으면 알려줘요.
  const recordWithBadges = (date: DateKey, dayRecord: DayRecord, fallbackToast?: string) => {
    const { previous, next } = record(date, dayRecord);
    const earned = newlyEarnedBadges(
      previous.records,
      next.records,
      monthKeyOf(date),
      next.settings.monthlyGoal,
    );
    if (earned.length > 0) {
      notify(`새 배지를 받았어요: ${earned.map((badge) => badge.label).join(", ")}`);
    } else if (fallbackToast) {
      notify(fallbackToast);
    }
    return next;
  };

  // 기록을 먼저 저장한 뒤, 3번에 한 번 결과로 넘어가는 시점에 전면 광고를 보여줘요.
  const handleRecord = (date: DateKey, dayRecord: DayRecord) => {
    const next = recordWithBadges(date, dayRecord);
    if (shouldShowInterstitial(next.recordCount)) interstitial.show();
  };

  const handleRecoverYesterday = () =>
    rewarded.show({
      onReward: () => {
        recordWithBadges(yesterday, { status: "success" }, "어제 무지출을 기록했어요");
      },
    });

  // 시트를 먼저 닫고 토스 알림 동의 화면을 띄워요.
  const handleRequestReminder = () => {
    markReminderPrompted();
    requestReminderAgreement().then((result) => {
      if (result === "agreed") {
        setReminderAgreed(true);
        notify(`매일 ${REMINDER_TIME_LABEL}에 알려드릴게요`);
      } else if (result === "rejected") {
        setReminderAgreed(false);
      } else {
        notify("토스 앱에서만 알림을 설정할 수 있어요");
      }
    });
  };

  const handleShare = (message: string) =>
    shareText(message).catch(() => notify("공유하지 못했어요. 다시 시도해 주세요."));

  return (
    <div className="app">
      {saveError && <div className="card save-error">기록을 저장하지 못했어요. 앱을 다시 열어 주세요.</div>}
      {tab === "home" && (
        <HomePage
          state={state}
          today={today}
          canRecoverYesterday={canRecoverYesterday}
          onRecord={handleRecord}
          onRecoverYesterday={handleRecoverYesterday}
        />
      )}
      {tab === "calendar" && <CalendarPage records={state.records} today={today} />}
      {tab === "report" && <ReportPage state={state} today={today} onShare={handleShare} />}
      {tab === "settings" && (
        <SettingsPage
          state={state}
          onRequestReminder={handleRequestReminder}
          onSave={(nickname, settings) => {
            saveProfile(nickname, settings);
            notify("저장했어요");
          }}
        />
      )}
      <ReminderSheet
        open={shouldPromptReminder(state)}
        onAgree={handleRequestReminder}
        onLater={markReminderPrompted}
      />
      <BottomNav current={tab} onChange={changeTab} />
    </div>
  );
}

export default App;
