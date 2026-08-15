"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type View = "validation" | "dashboard" | "report";
type Status = "정상" | "확인 필요";

type Row = {
  id: string;
  date: string;
  channel: string;
  campaign: string;
  orders: number;
  revenue: number;
  adSpend: number;
  refundRate: number;
  owner: string;
};

const sampleRows: Row[] = [
  { id: "OF-0811-01", date: "2026-08-11", channel: "네이버", campaign: "썸머 키트", orders: 128, revenue: 7840000, adSpend: 1210000, refundRate: 2.4, owner: "김서연" },
  { id: "OF-0811-02", date: "2026-08-11", channel: "카카오", campaign: "첫구매 쿠폰", orders: 91, revenue: 5260000, adSpend: 980000, refundRate: 3.1, owner: "박지후" },
  { id: "OF-0810-01", date: "2026-08-10", channel: "인스타그램", campaign: "리뷰 라이브", orders: 74, revenue: 4180000, adSpend: 860000, refundRate: 2.8, owner: "이도윤" },
  { id: "OF-0810-02", date: "2026-08-10", channel: "쿠팡", campaign: "로켓 특가", orders: 143, revenue: 8910000, adSpend: 1740000, refundRate: 4.6, owner: "최하린" },
  { id: "OF-0809-01", date: "2026-08-09", channel: "네이버", campaign: "브랜드 데이", orders: 110, revenue: 6920000, adSpend: 1080000, refundRate: 2.1, owner: "김서연" },
  { id: "OF-0809-02", date: "2026-08-09", channel: "카카오", campaign: "친구 추가", orders: 58, revenue: 3260000, adSpend: 720000, refundRate: 5.9, owner: "" },
  { id: "OF-0808-01", date: "2026-08-08", channel: "인스타그램", campaign: "크리에이터 A", orders: 82, revenue: 4770000, adSpend: 1180000, refundRate: 3.7, owner: "이도윤" },
  { id: "OF-0808-02", date: "2026-08-08", channel: "쿠팡", campaign: "주말 타임딜", orders: 156, revenue: 9340000, adSpend: 1960000, refundRate: 13.2, owner: "최하린" },
  { id: "OF-0807-01", date: "2026-08-07", channel: "네이버", campaign: "검색 리타겟", orders: 64, revenue: 3810000, adSpend: 690000, refundRate: 1.9, owner: "김서연" },
  { id: "OF-0807-01", date: "2026-08-07", channel: "네이버", campaign: "검색 리타겟", orders: 64, revenue: 3810000, adSpend: 690000, refundRate: 1.9, owner: "김서연" },
  { id: "OF-0806-01", date: "2026-08-06", channel: "카카오", campaign: "신제품 티저", orders: 49, revenue: 2890000, adSpend: 840000, refundRate: 4.2, owner: "박지후" },
  { id: "OF-0806-02", date: "2026-08-06", channel: "인스타그램", campaign: "크리에이터 B", orders: 71, revenue: 4060000, adSpend: 1020000, refundRate: 3.4, owner: "이도윤" },
];

const money = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

function statusFor(row: Row, index: number, rows: Row[]): Status {
  const duplicate = rows.findIndex((candidate) => candidate.id === row.id) !== index;
  return !row.owner || row.refundRate >= 10 || duplicate ? "확인 필요" : "정상";
}

function issueFor(row: Row, index: number, rows: Row[], ko: boolean) {
  if (!row.owner) return ko ? "담당자 누락" : "Missing owner";
  if (row.refundRate >= 10) return ko ? "환불률 임계치 초과" : "Refund threshold";
  if (rows.findIndex((candidate) => candidate.id === row.id) !== index) return ko ? "중복 행" : "Duplicate row";
  return ko ? "검증 통과" : "Passed";
}

function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const split = (line: string) => line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((cell) => cell.trim().replace(/^"|"$/g, ""));
  const headers = split(lines[0]).map((header) => header.toLowerCase());
  const at = (cells: string[], names: string[]) => {
    const index = headers.findIndex((header) => names.includes(header));
    return index >= 0 ? cells[index] : "";
  };
  return lines.slice(1, 101).map((line, index) => {
    const cells = split(line);
    return {
      id: at(cells, ["id", "번호", "record_id"]) || `UPLOAD-${String(index + 1).padStart(3, "0")}`,
      date: at(cells, ["date", "날짜"]) || "2026-08-11",
      channel: at(cells, ["channel", "채널"]) || "기타",
      campaign: at(cells, ["campaign", "캠페인", "항목"]) || "업로드 데이터",
      orders: Number(at(cells, ["orders", "주문", "건수"]).replace(/,/g, "")) || 0,
      revenue: Number(at(cells, ["revenue", "매출", "금액"]).replace(/,/g, "")) || 0,
      adSpend: Number(at(cells, ["adspend", "광고비", "비용"]).replace(/,/g, "")) || 0,
      refundRate: Number(at(cells, ["refundrate", "환불률"])) || 0,
      owner: at(cells, ["owner", "담당자"]),
    };
  });
}

function Icon({ name }: { name: "upload" | "check" | "chart" | "report" | "download" | "arrow" }) {
  const paths = {
    upload: <><path d="M12 16V4m0 0 4 4m-4-4L8 8"/><path d="M5 14v5h14v-5"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    chart: <><path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/></>,
    report: <><path d="M6 3h9l3 3v15H6z"/><path d="M9 11h6M9 15h6M9 7h3"/></>,
    download: <><path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M5 20h14"/></>,
    arrow: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export function OpsFlowDemo() {
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [view, setView] = useState<View>("validation");
  const [rows, setRows] = useState<Row[]>(sampleRows);
  const [channel, setChannel] = useState("전체 채널");
  const [notice, setNotice] = useState("샘플 데이터 12건을 불러왔습니다.");

  const filtered = useMemo(
    () => channel === "전체 채널" ? rows : rows.filter((row) => row.channel === channel),
    [channel, rows],
  );
  const ko = language === "ko";
  const tr = (korean: string, english: string) => ko ? korean : english;

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const checked = useMemo(
    () => filtered.map((row, index) => ({ ...row, status: statusFor(row, index, filtered), issue: issueFor(row, index, filtered, ko) })),
    [filtered, ko],
  );
  const validRows = checked.filter((row) => row.status === "정상");
  const revenue = validRows.reduce((sum, row) => sum + row.revenue, 0);
  const orders = validRows.reduce((sum, row) => sum + row.orders, 0);
  const spend = validRows.reduce((sum, row) => sum + row.adSpend, 0);
  const roas = spend ? revenue / spend : 0;
  const channels = ["전체 채널", ...Array.from(new Set(rows.map((row) => row.channel)))];

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const parsed = parseCsv(await file.text());
    if (!parsed.length) {
      setNotice(tr("열 이름과 데이터 행을 확인해 주세요.", "Check the column names and data rows."));
      return;
    }
    setRows(parsed);
    setChannel("전체 채널");
    setNotice(tr(`${file.name}에서 ${parsed.length}건을 읽고 검증했습니다.`, `${parsed.length} rows from ${file.name} were parsed and validated.`));
  };

  const resetSample = () => {
    setRows(sampleRows);
    setChannel("전체 채널");
    setNotice(tr("샘플 데이터 12건을 다시 불러왔습니다.", "The 12-row sample dataset has been restored."));
  };

  const downloadCleanCsv = () => {
    const header = "id,date,channel,campaign,orders,revenue,adSpend,refundRate,owner";
    const body = validRows.map((row) => [row.id, row.date, row.channel, row.campaign, row.orders, row.revenue, row.adSpend, row.refundRate, row.owner].join(","));
    const url = URL.createObjectURL(new Blob([[header, ...body].join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "opsflow-clean-data.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(tr(`검증을 통과한 ${validRows.length}건을 CSV로 만들었습니다.`, `${validRows.length} validated rows were exported as CSV.`));
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label={tr("Forblune OpsFlow 홈", "Forblune OpsFlow home")}>
          <span className="brand-mark">F</span>
          <span>Forblune <strong>OpsFlow</strong></span>
        </a>
        <nav aria-label={tr("주요 메뉴", "Primary navigation")}>
          <a href="#demo">{tr("데모", "Demo")}</a>
          <a href="#process">{tr("구축 범위", "Delivery")}</a>
          <a href="#case-study">{tr("프로젝트 설명", "Case study")}</a>
        </nav>
        <div className="header-tools">
          <button className="language-switch" onClick={() => { const next = ko ? "en" : "ko"; setLanguage(next); setNotice(next === "ko" ? "한국어 화면으로 전환했습니다." : "Switched to English."); }} aria-label={tr("영어로 전환", "Switch to Korean")}>{ko ? "EN" : "한국어"}</button>
          <a className="header-cta" href="#demo">{tr("샘플 실행", "Run sample")}</a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> OPERATIONS DATA AUTOMATION</p>
          <h1>
            {ko ? <><span>흩어진</span><span>운영 데이터를</span><span><em>결정 가능한</em></span><span><em>보고서로.</em></span></> : <><span>Turn scattered</span><span>operations data</span><span><em>into decisions</em></span><span><em>you can trust.</em></span></>}
          </h1>
          <p className="hero-lead">{tr("CSV·Excel 취합부터 오류 검증, KPI 대시보드, 정산 리포트까지. 반복 업무를 줄이고 숫자의 근거를 남기는 B2B 운영 자동화 데모입니다.", "From CSV and spreadsheet imports to validation, KPI dashboards, and export-ready reports. A B2B operations demo that reduces repetitive work while preserving the evidence behind every number.")}</p>
          <div className="hero-actions">
            <a className="button primary" href="#demo">{tr("인터랙티브 데모 보기", "Explore the live demo")} <Icon name="arrow" /></a>
            <a className="button ghost" href="#case-study">{tr("구축 내용 확인", "Read the case study")}</a>
          </div>
          <dl className="hero-metrics">
            <div><dt>{tr("4단계", "4 steps")}</dt><dd>{tr("취합 → 검증 → 분석 → 보고", "Import → validate → analyze → report")}</dd></div>
            <div><dt>100%</dt><dd>{tr("가상 데이터 기반 안전한 데모", "Safe synthetic dataset")}</dd></div>
            <div><dt>{tr("3종", "3 views")}</dt><dd>{tr("검증표·대시보드·리포트", "Validation · dashboard · report")}</dd></div>
          </dl>
        </div>
        <div className="hero-proof" aria-label={tr("실제 데모와 같은 검증 결과 미리보기", "Validation preview using the same sample data as the live demo")}>
          <div className="hero-proof__topbar">
            <div>
              <span>{tr("8월 운영 데이터", "August operations data")}</span>
              <strong>{tr("가져오기 완료", "Import complete")}</strong>
            </div>
            <span className="hero-proof__file">campaign-report.csv</span>
          </div>
          <div className="hero-proof__summary">
            <div><strong>12</strong><span>{tr("읽은 행", "rows read")}</span></div>
            <div><strong>9</strong><span>{tr("검증 통과", "passed")}</span></div>
            <div><strong>3</strong><span>{tr("확인 필요", "to review")}</span></div>
          </div>
          <div className="hero-proof__table" role="table" aria-label={tr("샘플 검증 결과", "Sample validation results")}>
            <div className="hero-proof__row hero-proof__row--header" role="row"><span>{tr("상태", "Status")}</span><span>ID</span><span>{tr("검증 결과", "Result")}</span></div>
            <div className="hero-proof__row" role="row"><span className="result result--pass">{tr("통과", "Pass")}</span><span>OF-0811-01</span><strong>{tr("규칙 3개 통과", "3 rules passed")}</strong></div>
            <div className="hero-proof__row hero-proof__row--review" role="row"><span className="result result--review">{tr("검토", "Review")}</span><span>OF-0809-02</span><strong>{tr("담당자 누락", "Missing owner")}</strong></div>
            <div className="hero-proof__row hero-proof__row--review" role="row"><span className="result result--review">{tr("검토", "Review")}</span><span>OF-0808-02</span><strong>{tr("환불률 13.2%", "Refund rate 13.2%")}</strong></div>
            <div className="hero-proof__row" role="row"><span className="result result--pass">{tr("통과", "Pass")}</span><span>OF-0806-02</span><strong>{tr("규칙 3개 통과", "3 rules passed")}</strong></div>
          </div>
          <div className="hero-proof__footer"><span className="pulse" /> {tr("오류 행은 보고서에서 제외됩니다", "Flagged rows stay out of the report")} <strong>9 / 12</strong></div>
        </div>
      </section>

      <section className="trust-strip" aria-label={tr("지원 업무", "Capabilities")}>
        <span>CSV / Excel</span><i />
        <span>Data validation</span><i />
        <span>KPI dashboard</span><i />
        <span>Rule engine</span><i />
        <span>Report export</span>
      </section>

      <section className="demo-section" id="demo">
        <div className="section-heading">
          <div><p className="eyebrow"><span /> LIVE PRODUCT DEMO</p><h2>{ko ? <>샘플 파일을 넣고<br/>검증 흐름을 직접 확인하세요.</> : <>Import a sample file.<br/>Inspect every validation step.</>}</h2></div>
          <p>{tr("예시는 라이브커머스 성과 취합 업무입니다. 파일은 브라우저에서만 처리되며 서버로 전송되지 않습니다.", "This demo uses a live-commerce performance workflow. Uploaded files are processed in your browser and are not sent to a server.")}</p>
        </div>

        <div className="app-shell">
          <aside className="app-sidebar">
            <div className="app-logo"><span>OF</span><div>OpsFlow<small>WORKSPACE</small></div></div>
            <div className="workspace-select">Forblune Demo <b>⌄</b></div>
            <p className="nav-label">WORKFLOW</p>
            <button className="side-active"><span>01</span> {tr("데이터 검증", "Data validation")} <b>{checked.length}</b></button>
            <button><span>02</span> {tr("KPI 대시보드", "KPI dashboard")}</button>
            <button><span>03</span> {tr("리포트 생성", "Report builder")}</button>
            <p className="nav-label">SYSTEM</p>
            <button><span>04</span> {tr("규칙 설정", "Rule settings")}</button>
            <button><span>05</span> {tr("작업 이력", "Audit log")}</button>
            <div className="sidebar-footer"><span className="avatar">FG</span><div>Demo workspace<small>{tr("가상 데이터 전용", "SYNTHETIC DATA ONLY")}</small></div></div>
          </aside>

          <div className="app-main">
            <div className="app-topbar">
              <div><span className="breadcrumb">Workspace / {tr("성과 리포트", "Performance report")}</span><h3>{tr("8월 운영 데이터", "August operations data")}</h3></div>
              <div className="top-actions">
                <button className="small-ghost" onClick={resetSample}>{tr("샘플 복원", "Restore sample")}</button>
                <label className="small-primary"><Icon name="upload" /> {tr("CSV 불러오기", "Import CSV")}<input type="file" accept=".csv,text/csv" onChange={onUpload} /></label>
              </div>
            </div>

            <div className="notice" role="status"><Icon name="check" /><span>{notice}</span><button onClick={() => setNotice("")}>×</button></div>

            <div className="tabbar" role="tablist" aria-label={tr("데이터 보기", "Data views")}>
              <button type="button" id="tab-validation" role="tab" aria-selected={view === "validation"} aria-controls="panel-validation" className={view === "validation" ? "active" : ""} onClick={() => setView("validation")}><Icon name="check" /> {tr("검증 결과", "Validation")} <span>{checked.length - validRows.length}</span></button>
              <button type="button" id="tab-dashboard" role="tab" aria-selected={view === "dashboard"} aria-controls="panel-dashboard" className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}><Icon name="chart" /> {tr("대시보드", "Dashboard")}</button>
              <button type="button" id="tab-report" role="tab" aria-selected={view === "report"} aria-controls="panel-report" className={view === "report" ? "active" : ""} onClick={() => setView("report")}><Icon name="report" /> {tr("리포트", "Report")}</button>
            </div>

            <div className="toolbar">
              <label>{tr("채널", "Channel")}<select value={channel} onChange={(event) => setChannel(event.target.value)}>{channels.map((item) => <option key={item} value={item}>{item === "전체 채널" ? tr("전체 채널", "All channels") : item}</option>)}</select></label>
              <div className="toolbar-summary"><span className="dot ok" /> {tr("정상", "Passed")} {validRows.length}<span className="dot warn" /> {tr("확인 필요", "Review")} {checked.length - validRows.length}</div>
              <button className="export-button" onClick={downloadCleanCsv}><Icon name="download" /> {tr("정제 CSV", "Clean CSV")}</button>
            </div>

            {view === "validation" && (
              <div className="table-card">
                <div id="panel-validation" className="table-scroll" role="tabpanel" aria-labelledby="tab-validation" tabIndex={0}><table><thead><tr><th>{tr("검증", "Validation")}</th><th>{tr("레코드", "Record")}</th><th>{tr("날짜", "Date")}</th><th>{tr("채널", "Channel")}</th><th>{tr("캠페인", "Campaign")}</th><th>{tr("주문", "Orders")}</th><th>{tr("매출", "Revenue")}</th><th>{tr("환불률", "Refund rate")}</th><th>{tr("담당자", "Owner")}</th></tr></thead>
                  <tbody>{checked.map((row, index) => <tr key={`${row.id}-${index}`} className={row.status === "확인 필요" ? "flagged" : ""}><td><span className={`status ${row.status === "정상" ? "ok" : "warn"}`}>{row.issue}</span></td><td className="mono">{row.id}</td><td>{row.date.slice(5)}</td><td>{row.channel}</td><td><strong>{row.campaign}</strong></td><td>{row.orders.toLocaleString()}</td><td>{money.format(row.revenue)}</td><td>{row.refundRate}%</td><td>{row.owner || <em>{tr("미지정", "Unassigned")}</em>}</td></tr>)}</tbody>
                </table></div>
                <div className="table-footer"><span>{tr(`총 ${checked.length}건 중 ${validRows.length}건 통과`, `${validRows.length} of ${checked.length} rows passed`)}</span><span>{tr("검증 시각", "Validated at")} 2026.08.11 15:40</span></div>
              </div>
            )}

            {view === "dashboard" && (
              <div id="panel-dashboard" className="dashboard-grid" role="tabpanel" aria-labelledby="tab-dashboard" tabIndex={0}>
                <article className="kpi"><p>{tr("검증 통과 매출", "Validated revenue")}</p><strong>{money.format(revenue)}</strong><span>{tr("오류 행 제외 기준", "Invalid rows excluded")}</span></article>
                <article className="kpi"><p>{tr("유효 주문", "Valid orders")}</p><strong>{orders.toLocaleString()}{tr("건", "")}</strong><span>{tr("채널 합산", "All channels")}</span></article>
                <article className="kpi"><p>{tr("광고 수익률", "Return on ad spend")}</p><strong>{roas.toFixed(2)}×</strong><span>{tr("매출 ÷ 광고비", "Revenue ÷ ad spend")}</span></article>
                <article className="kpi accent"><p>{tr("데이터 신뢰도", "Data confidence")}</p><strong>{checked.length ? Math.round((validRows.length / checked.length) * 100) : 0}%</strong><span>{tr("검증 통과 비율", "Validation pass rate")}</span></article>
                <article className="chart-card wide"><div className="card-title"><div><p>{tr("채널별 매출", "Revenue by channel")}</p><span>{tr("검증 통과 데이터만 반영", "Validated rows only")}</span></div><b>KRW</b></div><div className="bars">{Array.from(new Set(validRows.map((row) => row.channel))).map((item) => { const value = validRows.filter((row) => row.channel === item).reduce((sum, row) => sum + row.revenue, 0); const max = Math.max(...validRows.map((row) => row.revenue), 1); return <div key={item}><span>{item}</span><i><b style={{width: `${Math.min(100, (value / (max * 2)) * 100)}%`}} /></i><strong>{ko ? `${Math.round(value / 10000).toLocaleString()}만` : money.format(value)}</strong></div>; })}</div></article>
                <article className="chart-card"><div className="card-title"><div><p>{tr("자동 판단 규칙", "Automated rules")}</p><span>{tr("설정된 임계치", "Configured thresholds")}</span></div></div><ul className="rule-list"><li><span className="rule-icon">01</span><div>{tr("담당자 필수", "Owner required")}<strong>{tr("빈 값은 검토 큐로 이동", "Missing values move to review")}</strong></div></li><li><span className="rule-icon">02</span><div>{tr("환불률 10% 미만", "Refund rate below 10%")}<strong>{tr("이상치 자동 분리", "Outliers are isolated")}</strong></div></li><li><span className="rule-icon">03</span><div>{tr("레코드 ID 고유", "Unique record ID")}<strong>{tr("중복 행 제외", "Duplicate rows excluded")}</strong></div></li></ul></article>
              </div>
            )}

            {view === "report" && (
              <div id="panel-report" className="report-layout" role="tabpanel" aria-labelledby="tab-report" tabIndex={0}>
                <article className="report-sheet"><div className="report-head"><div><span>FORBLUNE OPSFLOW</span><h4>{tr("주간 운영 성과 리포트", "Weekly operations report")}</h4><p>2026.08.06 — 2026.08.11</p></div><b>{tr("검증 완료", "Validated")}</b></div><div className="report-kpis"><div><span>{tr("매출", "Revenue")}</span><strong>{money.format(revenue)}</strong></div><div><span>{tr("주문", "Orders")}</span><strong>{orders.toLocaleString()}{tr("건", "")}</strong></div><div><span>ROAS</span><strong>{roas.toFixed(2)}×</strong></div></div><h5>{tr("자동 요약", "Automated summary")}</h5><p className="report-copy">{tr(`검증을 통과한 ${validRows.length}개 레코드를 기준으로 집계했습니다. 전체 ${checked.length}개 중 ${checked.length - validRows.length}개는 담당자 누락, 환불률 임계치 초과 또는 중복으로 분리되어 합계에서 제외되었습니다.`, `Metrics use ${validRows.length} validated records. ${checked.length - validRows.length} of ${checked.length} rows were excluded for missing owners, refund-rate exceptions, or duplicates.`)}</p><h5>{tr("검토 권장 사항", "Recommended review")}</h5><ul><li>{tr("확인 필요 항목의 원본 담당자를 지정한 뒤 재검증", "Assign owners to flagged source rows, then revalidate")}</li><li>{tr("환불률 10% 이상 캠페인의 상품·채널별 원인 확인", "Review product and channel causes for refund rates above 10%")}</li><li>{tr("중복 ID 제거 후 정제 CSV를 회계·운영팀에 전달", "Remove duplicate IDs before sharing the clean CSV")}</li></ul><footer>{tr("본 화면의 수치와 회사명은 포트폴리오용 가상 데이터입니다.", "All figures and names on this screen are synthetic portfolio data.")}</footer></article>
                <aside className="report-actions"><div className="completion-ring"><span>92<small>%</small></span></div><h4>{tr("리포트 준비 완료", "Report ready")}</h4><p>{tr("검증 규칙, KPI, 예외 목록이 한 문서에 포함됩니다.", "Rules, KPIs, and exception lists are combined in one document.")}</p><button onClick={() => window.print()}><Icon name="report" /> {tr("인쇄 / PDF 저장", "Print / save PDF")}</button><button className="secondary" onClick={downloadCleanCsv}><Icon name="download" /> {tr("근거 데이터 받기", "Download source data")}</button></aside>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="process" id="process">
        <div className="section-heading inverse"><div><p className="eyebrow"><span /> DELIVERY SCOPE</p><h2>{ko ? <>화면만 예쁜 데모가 아니라,<br/>실제 납품 흐름을 설계했습니다.</> : <>More than a polished screen.<br/>A delivery workflow built for evidence.</>}</h2></div><p>{tr("요구사항과 원본 파일을 먼저 정리하고, 사람이 다시 확인할 수 있는 규칙과 근거를 남깁니다.", "Requirements and source files are clarified first, then every rule and result stays available for human review.")}</p></div>
        <div className="process-grid">
          {(ko ? [{n:"01",t:"원본 구조 분석",d:"CSV·Excel 열 구조, 필수값, 중복 기준과 업무 규칙을 먼저 정의합니다."},{n:"02",t:"검증 규칙 구현",d:"누락·중복·형식 오류·임계치 초과를 자동 분리하고 사람이 검토할 큐를 만듭니다."},{n:"03",t:"대시보드 구성",d:"의사결정에 필요한 KPI와 필터만 남기고, 검증된 데이터만 집계합니다."},{n:"04",t:"리포트·인수인계",d:"정제 파일과 요약 보고서, 규칙 문서, 테스트 결과를 함께 전달합니다."}] : [{n:"01",t:"Analyze source structure",d:"Define spreadsheet columns, required values, duplicate criteria, and business rules first."},{n:"02",t:"Implement validation",d:"Separate missing, duplicate, malformed, and threshold-breaking rows into a human review queue."},{n:"03",t:"Build the dashboard",d:"Keep only decision-relevant KPIs and filters, calculated from validated data."},{n:"04",t:"Report and handoff",d:"Deliver clean files, a summary report, rule documentation, and test results together."}]).map((step) => <article key={step.n}><span>{step.n}</span><h3>{step.t}</h3><p>{step.d}</p></article>)}
        </div>
      </section>

      <section className="case-study" id="case-study">
        <div className="case-intro"><p className="eyebrow"><span /> CASE STUDY</p><h2>{ko ? <>반복 수요를 한 제품 흐름으로<br/>정리한 자주형 포트폴리오</> : <>A self-directed product built around<br/>repeated freelance demand</>}</h2><p>{tr("위시켓 공개 외주 공고에서 반복된 데이터 취합, 관리자 화면, 자동 리포트 요구를 바탕으로 만든 독립 데모입니다. 특정 고객의 데이터나 디자인은 사용하지 않았습니다.", "This independent demo responds to recurring needs across public freelance briefs: data intake, admin workflows, and automated reporting. It does not use any client data or design assets.")}</p></div>
        <div className="case-details">
          <article><span>{tr("문제", "PROBLEM")}</span><h3>{tr("파일은 많고, 숫자의 근거는 흩어져 있습니다.", "Too many files, with the evidence behind each number scattered across them.")}</h3><p>{tr("수작업 복사와 필터링이 반복되면 누락·중복·잘못된 합계가 보고서까지 이어집니다.", "Repeated copy-and-filter work allows omissions, duplicates, and incorrect totals to reach the final report.")}</p></article>
          <article><span>{tr("해결", "SOLUTION")}</span><h3>{tr("검증을 집계보다 앞에 둡니다.", "Validation comes before aggregation.")}</h3><p>{tr("오류 행을 먼저 분리하고, 통과 데이터만 KPI와 리포트에 반영하도록 흐름을 고정했습니다.", "Exception rows are isolated first, and only validated data reaches KPIs and reports.")}</p></article>
          <article><span>{tr("검증", "PROOF")}</span><h3>{tr("입력과 결과를 다시 확인할 수 있습니다.", "Inputs and outcomes stay inspectable.")}</h3><p>{tr("샘플 CSV 업로드, 규칙별 상태, 정제 파일 다운로드, 인쇄용 보고서까지 브라우저에서 동작합니다.", "CSV import, rule-level status, clean-data export, and print-ready reporting all work in the browser.")}</p></article>
        </div>
        <div className="stack-row"><span>React 19</span><span>TypeScript</span><span>Responsive UI</span><span>CSV parsing</span><span>Deterministic rules</span><span>Accessible HTML</span></div>
      </section>

      <section className="final-cta"><div><p>OPERATIONS, MADE CLEAR.</p><h2>{ko ? <>반복되는 데이터 업무를<br/>검증 가능한 흐름으로 바꿉니다.</> : <>Turn repetitive data work<br/>into a verifiable workflow.</>}</h2></div><a className="button light" href="#demo">{tr("데모 다시 보기", "Return to demo")} <Icon name="arrow" /></a></section>

      <footer className="site-footer"><div className="brand"><span className="brand-mark">F</span><span>Forblune <strong>OpsFlow</strong></span></div><p>Portfolio demo · Synthetic data only · 2026</p><a href="#top">{tr("맨 위로 ↑", "Back to top ↑")}</a></footer>
    </main>
  );
}
