import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the Korean OpsFlow portfolio page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<html[^>]+lang="ko"/i);
  assert.match(html, /Forblune OpsFlow/);
  assert.match(html, /<span>흩어진<\/span><span>운영 데이터를<\/span>/);
  assert.match(html, /가상 데이터/);
  assert.doesNotMatch(html, /Your site is taking shape/);
});

test("exposes the interactive demo controls", async () => {
  const html = await (await render()).text();
  assert.match(html, /CSV 불러오기/);
  assert.match(html, /검증 결과/);
  assert.match(html, /대시보드/);
  assert.match(html, /리포트/);
  assert.match(html, /정제 CSV/);
});
