import { Button } from "@toss/tds-mobile";
import { UserRound } from "lucide-react";
import { useState } from "react";

import { BottomActions } from "../components/BottomActions";
import { NicknameField } from "../components/NicknameField";
import { PageHeader } from "../components/PageHeader";
import { isValidNickname } from "../domain/appState";

interface OnboardingPageProps {
  onSubmit: (nickname: string) => void;
}

export function OnboardingPage({ onSubmit }: OnboardingPageProps) {
  const [nickname, setNickname] = useState("");
  const isValid = isValidNickname(nickname);

  return (
    <>
      <PageHeader
        title="반가워요! 닉네임을 설정해 주세요."
        subtitle="매일 돈 안 쓴 날을 기록하고 연속 기록을 이어가 봐요."
      />
      <div className="page">
        <section className="card onboarding">
          <div className="icon-circle large">
            <UserRound size={32} strokeWidth={2.2} />
          </div>
          <p className="card-title">닉네임</p>
          <NicknameField value={nickname} onChange={setNickname} autoFocus />
          <p className="hint">
            닉네임은 2~4글자로 정해 주세요.
            <br />
            설정에서 바꿀 수 있어요.
          </p>
        </section>
      </div>
      <BottomActions withNav={false}>
        <Button display="block" size="large" disabled={!isValid} onClick={() => onSubmit(nickname)}>
          시작하기
        </Button>
      </BottomActions>
    </>
  );
}
