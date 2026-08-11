import type { Metadata } from "next";
import { OpsFlowDemo } from "./OpsFlowDemo";

export const metadata: Metadata = {
  title: "Forblune OpsFlow | 데이터 검증·리포트 자동화",
  description:
    "흩어진 CSV와 Excel 데이터를 검증하고, KPI 대시보드와 보고서로 정리하는 B2B 운영 자동화 데모입니다.",
  openGraph: {
    title: "Forblune OpsFlow",
    description: "데이터 취합부터 검증, 대시보드, 리포트까지 한 흐름으로.",
    images: ["/opsflow-hero.png"],
  },
};

export default function Home() {
  return <OpsFlowDemo />;
}
