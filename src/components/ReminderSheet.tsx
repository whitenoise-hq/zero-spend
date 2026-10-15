import { BottomSheet, Button } from "@toss/tds-mobile";
import { BellRing } from "lucide-react";

import { REMINDER_TIME_LABEL } from "../config/notification";

interface ReminderSheetProps {
  open: boolean;
  onAgree: () => void;
  onLater: () => void;
}

// 첫 기록을 마친 직후에 한 번만 물어봐요. 나중에는 설정에서 켤 수 있어요.
export function ReminderSheet({ open, onAgree, onLater }: ReminderSheetProps) {
  return (
    <BottomSheet
      open={open}
      onDimmerClick={onLater}
      header={<BottomSheet.Header>기록 알림을 받아볼까요?</BottomSheet.Header>}
      cta={
        <div className="sheet-cta sheet-cta-double">
          <Button display="block" size="large" variant="weak" color="dark" onClick={onLater}>
            다음에
          </Button>
          <Button display="block" size="large" onClick={onAgree}>
            알림 받기
          </Button>
        </div>
      }
    >
      <div className="day-detail">
        <div className="today-done-icon success">
          <BellRing size={24} strokeWidth={2.2} />
        </div>
        <div className="today-done-text">
          <strong>매일 {REMINDER_TIME_LABEL}에 알려드려요</strong>
          <span>깜빡하지 않고 연속 기록을 이어갈 수 있어요.</span>
        </div>
      </div>
    </BottomSheet>
  );
}
