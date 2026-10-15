// 저녁 8시 기록 알림. 문구와 발송 시간은 앱인토스 콘솔(푸시알림)에서 관리해요.
// 21~08시는 토스 방해 금지 시간이라 그 전에 보내요.
//   제목: 무지출 기록
//   본문: 오늘 무지출했는지 기록할 시간이에요.
//   발송: 토스에게 발송 요청 → 매일 20:00, 종료일 없음
// 콘솔 푸시 캠페인의 발송 코드예요. 알림 동의를 받을 때 이 코드로 어떤 알림인지 알려줘요.
export const REMINDER_TEMPLATE_CODE: string = "zero-spend-daily-reminder";

export const REMINDER_TIME_LABEL = "저녁 8시";

// 템플릿 코드가 없으면 알림 시트와 설정 항목을 숨겨요.
// (숨기지 않으면 '이미 물어봤다'로 저장돼서 코드가 생긴 뒤에도 다시 묻지 못해요.)
export const IS_REMINDER_READY = REMINDER_TEMPLATE_CODE !== "";
