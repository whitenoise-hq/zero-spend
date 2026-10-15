import { useCallback, useEffect, useRef, useState } from "react";

import {
  type AppState,
  DEFAULT_STATE,
  parseAppState,
  recordToday,
  saveProfile as saveProfileState,
  markReminderPrompted as markReminderPromptedState,
  serializeAppState,
  setNickname,
  setReminderAgreed as setReminderAgreedState,
  type Settings,
} from "../domain/appState";
import type { DateKey } from "../domain/date";
import type { DayRecord } from "../domain/records";
import { loadStateRaw, saveStateRaw } from "../platform/storage";

type LoadStatus = "loading" | "ready" | "error";

interface UseAppStateReturn {
  state: AppState;
  loadStatus: LoadStatus;
  saveError: boolean;
  retryLoad: () => void;
  record: (date: DateKey, record: DayRecord) => { previous: AppState; next: AppState };
  changeNickname: (nickname: string) => void;
  saveProfile: (nickname: string, settings: Partial<Settings>) => void;
  markReminderPrompted: () => void;
  setReminderAgreed: (agreed: boolean) => void;
}

export function useAppState(): UseAppStateReturn {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [saveError, setSaveError] = useState(false);
  const stateRef = useRef(state);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());

  const load = useCallback(() => {
    setLoadStatus("loading");
    loadStateRaw()
      .then((raw) => {
        const loaded = parseAppState(raw);
        stateRef.current = loaded;
        setState(loaded);
        setLoadStatus("ready");
      })
      .catch(() => setLoadStatus("error"));
  }, []);

  useEffect(load, [load]);

  // 저장 요청을 순서대로 처리해서 오래된 상태가 나중에 덮어쓰지 않게 해요.
  const commit = useCallback((next: AppState) => {
    stateRef.current = next;
    setState(next);
    const serialized = serializeAppState(next);
    saveChainRef.current = saveChainRef.current
      .then(() => saveStateRaw(serialized))
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, []);

  const record = useCallback(
    (date: DateKey, dayRecord: DayRecord) => {
      const previous = stateRef.current;
      const next = recordToday(previous, date, dayRecord);
      commit(next);
      return { previous, next };
    },
    [commit],
  );

  const changeNickname = useCallback(
    (nickname: string) => commit(setNickname(stateRef.current, nickname)),
    [commit],
  );

  const saveProfile = useCallback(
    (nickname: string, settings: Partial<Settings>) =>
      commit(saveProfileState(stateRef.current, nickname, settings)),
    [commit],
  );

  const markReminderPrompted = useCallback(
    () => commit(markReminderPromptedState(stateRef.current)),
    [commit],
  );

  const setReminderAgreed = useCallback(
    (agreed: boolean) => commit(setReminderAgreedState(stateRef.current, agreed)),
    [commit],
  );

  return {
    state,
    loadStatus,
    saveError,
    retryLoad: load,
    record,
    changeNickname,
    saveProfile,
    markReminderPrompted,
    setReminderAgreed,
  };
}
