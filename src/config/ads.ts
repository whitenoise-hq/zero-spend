// 개발 중(npm run dev)에는 테스트 광고 ID를, 출시 빌드(npm run build)에는 실제 광고 ID를 써요.
// 실제 광고 ID는 앱인토스 콘솔의 광고 그룹 상세 화면에서 확인할 수 있어요.
const LIVE_AD_GROUP_IDS = {
  interstitial: "ait.v2.live.527d5c6903a84812",
  rewarded: "ait.v2.live.329ffcc78d6e4e4f",
  banner: "ait.v2.live.35253bb9c390482d",
} as const;

const TEST_AD_GROUP_IDS = {
  interstitial: "ait-ad-test-interstitial-id",
  rewarded: "ait-ad-test-rewarded-id",
  banner: "ait-ad-test-banner-id",
} as const;

export const AD_GROUP_IDS = import.meta.env.PROD ? LIVE_AD_GROUP_IDS : TEST_AD_GROUP_IDS;
