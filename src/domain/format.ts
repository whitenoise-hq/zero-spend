import type { DateKey, MonthKey } from "./date";

export function formatMonthDay(date: DateKey): string {
  const [, month, day] = date.split("-").map(Number);
  return `${month}월 ${day}일`;
}

export function formatMonthTitle(month: MonthKey): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return `${year}년 ${monthNumber}월`;
}

export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function parseWonInput(input: string): number {
  const digits = input.replace(/\D/g, "");
  return digits === "" ? 0 : Number(digits);
}

export function buildShareMessage(input: {
  month: MonthKey;
  successDays: number;
  savedAmount: number;
  streak: number;
}): string {
  const monthNumber = Number(input.month.split("-")[1]);
  const base = `${monthNumber}월 무지출 ${input.successDays}일 성공! 약 ${formatWon(input.savedAmount)} 아꼈어요.`;
  return input.streak > 0
    ? `${base} 지금 ${input.streak}일째 이어가는 중이에요.`
    : base;
}
