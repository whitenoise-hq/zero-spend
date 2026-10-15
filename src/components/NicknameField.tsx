import { NICKNAME_MAX_LENGTH, NICKNAME_MIN_LENGTH } from "../domain/appState";

interface NicknameFieldProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

// 한글 조합 중에 글자를 자르면 입력이 깨져서, 길이는 자르지 않고 안내와 버튼 비활성화로만 막아요.
export function NicknameField({ value, onChange, autoFocus }: NicknameFieldProps) {
  const length = [...value.trim()].length;
  const isTooLong = length > NICKNAME_MAX_LENGTH;

  return (
    <div>
      <input
        className="won-input"
        placeholder={`${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}글자`}
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className={`field-counter${isTooLong ? " error" : ""}`}>
        {isTooLong ? `${NICKNAME_MAX_LENGTH}글자까지 쓸 수 있어요 · ` : ""}
        {length}/{NICKNAME_MAX_LENGTH}
      </p>
    </div>
  );
}
