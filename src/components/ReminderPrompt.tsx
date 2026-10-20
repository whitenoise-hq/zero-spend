import { BellRing, X } from "lucide-react";

import { REMINDER_TIME_LABEL } from "../config/notification";

interface ReminderPromptProps {
  onRequest: () => void;
  onDismiss: () => void;
}

// 홈 화면 안에 놓는 알림 안내. 앱에 들어오자마자 시트를 띄우면 검수에서 반려돼서, 사용자가 눌렀을 때만 동의를 받아요.
export function ReminderPrompt({ onRequest, onDismiss }: ReminderPromptProps) {
  return (
    <section className="card reminder-prompt">
      <button type="button" className="reminder-prompt-main" onClick={onRequest}>
        <span className="today-done-icon success">
          <BellRing size={22} strokeWidth={2.2} />
        </span>
        <span className="today-done-text">
          <strong>기록 알림을 받아볼까요?</strong>
          <span>매일 {REMINDER_TIME_LABEL}에 알려드려요</span>
        </span>
      </button>
      <button type="button" className="reminder-prompt-close" aria-label="알림 안내 닫기" onClick={onDismiss}>
        <X size={18} strokeWidth={2.2} />
      </button>
    </section>
  );
}
