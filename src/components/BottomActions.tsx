import type { ReactNode } from "react";

interface BottomActionsProps {
  children: ReactNode;
  // 하단 네비게이션이 없는 화면(닉네임 입력 등)에서는 맨 아래에 붙여요.
  withNav?: boolean;
}

export function BottomActions({ children, withNav = true }: BottomActionsProps) {
  return (
    <div className={`bottom-actions${withNav ? "" : " no-nav"}`}>{children}</div>
  );
}
