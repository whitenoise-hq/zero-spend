import { describe, expect, it } from "vitest";

import { pathForTab, tabFromPath } from "./tabRoute";

describe("tabFromPath", () => {
  it("경로에 맞는 탭을 찾아요", () => {
    expect(tabFromPath("/calendar")).toBe("calendar");
    expect(tabFromPath("/report")).toBe("report");
    expect(tabFromPath("/settings")).toBe("settings");
  });

  it("끝 슬래시나 대소문자가 달라도 찾아요", () => {
    expect(tabFromPath("/Calendar/")).toBe("calendar");
  });

  it("루트나 모르는 경로는 홈이에요", () => {
    expect(tabFromPath("/")).toBe("home");
    expect(tabFromPath("")).toBe("home");
    expect(tabFromPath("/unknown")).toBe("home");
  });
});

describe("pathForTab", () => {
  it("탭마다 주소 경로를 돌려줘요", () => {
    expect(pathForTab("home")).toBe("/");
    expect(pathForTab("calendar")).toBe("/calendar");
    expect(pathForTab("report")).toBe("/report");
  });
});
