import type { ReactNode } from "react";

interface BottomActionsProps {
  children: ReactNode;
  // 하단 네비게이션이 없는 화면(닉네임 입력 등)에서는 맨 아래에 붙여요.
  withNav?: boolean;
  // 버튼 바로 위에 보여줄 안내 (예: 누르면 광고가 나온다는 안내)
  note?: ReactNode;
}

export function BottomActions({ children, withNav = true, note }: BottomActionsProps) {
  return (
    <div className={`bottom-actions${withNav ? "" : " no-nav"}${note ? " with-note" : ""}`}>
      {note && <p className="bottom-actions-note">{note}</p>}
      <div className="bottom-actions-row">{children}</div>
    </div>
  );
}
