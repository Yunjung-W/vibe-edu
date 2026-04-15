"""
report.py — 글로벌 분쟁 현황 보고서 생성기
  1. Wikipedia에서 진행 중인 무력 분쟁 데이터 수집
  2. JSON 파일로 저장 (conflicts_data.json)
  3. index.html 보고서 자동 생성
인터넷 연결 실패 시 ../data/ongoing_conflicts.json 폴더의 백업 파일 사용
"""

import json
import os
import sys
from datetime import date
from pathlib import Path

# ── 경로 설정 ────────────────────────────────────────────────────────────────
BASE_DIR    = Path(__file__).parent
DATA_FILE   = BASE_DIR / "conflicts_data.json"
HTML_FILE   = BASE_DIR / "index.html"
FALLBACK    = BASE_DIR.parent / "data" / "ongoing_conflicts.json"
WIKI_URL    = "https://en.wikipedia.org/wiki/List_of_ongoing_armed_conflicts"
TODAY       = date.today().strftime("%Y년 %m월 %d일")
TODAY_ISO   = date.today().isoformat()

# ── 1. 데이터 수집 ────────────────────────────────────────────────────────────
def fetch_from_wikipedia() -> dict:
    """Wikipedia 페이지를 파싱해 분쟁 데이터를 반환한다."""
    import requests
    from bs4 import BeautifulSoup

    print(f"[fetch] Wikipedia 접속 중... {WIKI_URL}")
    resp = requests.get(WIKI_URL, timeout=15,
                        headers={"User-Agent": "Mozilla/5.0 (report.py educational use)"})
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # 규모별 카테고리 매핑 (위키피디아 섹션 헤딩 키워드 → 내부 코드)
    CATEGORY_MAP = {
        "major war":    ("major",     "대형전쟁",   "연간 사망자 10,000명 이상"),
        "wars":         ("minor_war", "소형전쟁",   "연간 사망자 1,000–9,999명"),
        "minor":        ("conflict",  "소규모 분쟁","연간 사망자 100–999명"),
        "skirmish":     ("skirmish",  "소규모 충돌","연간 사망자 100명 미만"),
    }

    def heading_to_cat(text: str):
        t = text.lower()
        if "major" in t:
            return CATEGORY_MAP["major war"]
        if "minor" in t and "conflict" not in t:
            return CATEGORY_MAP["minor"]
        if "war" in t or "wars" in t:
            return CATEGORY_MAP["wars"]
        if "skirmish" in t or "clash" in t:
            return CATEGORY_MAP["skirmish"]
        return None

    categories = []
    current_cat = None
    current_conflicts = []

    # h2/h3 헤딩과 이후 테이블을 순서대로 순회
    for tag in soup.find("div", {"id": "mw-content-text"}).descendants:
        if tag.name in ("h2", "h3"):
            heading = tag.get_text(strip=True)
            cat = heading_to_cat(heading)
            if cat:
                # 이전 카테고리 저장
                if current_cat and current_conflicts:
                    categories.append({
                        "id": current_cat[0],
                        "label": current_cat[1],
                        "description": current_cat[2],
                        "conflicts": current_conflicts,
                    })
                current_cat = cat
                current_conflicts = []

        if tag.name == "table" and current_cat:
            rows = tag.find_all("tr")
            for row in rows[1:]:  # 헤더 행 스킵
                cols = row.find_all(["td", "th"])
                if len(cols) < 2:
                    continue
                texts = [c.get_text(" ", strip=True) for c in cols]

                # 분쟁명 (첫 번째 또는 두 번째 컬럼에서 추출)
                name_raw = texts[0] if texts[0] else texts[1] if len(texts) > 1 else ""
                if not name_raw or len(name_raw) < 3:
                    continue

                # 위치 / 시작연도 추출 시도
                location = texts[1] if len(texts) > 1 else ""
                start_year = None
                for t in texts:
                    for word in t.split():
                        if word.isdigit() and 1900 <= int(word) <= 2026:
                            start_year = int(word)
                            break
                    if start_year:
                        break

                # 중복 방지
                if any(c["name_en"] == name_raw for c in current_conflicts):
                    continue

                current_conflicts.append({
                    "name":     name_raw,
                    "name_en":  name_raw,
                    "location": location,
                    "region":   guess_region(location),
                    "start":    start_year or 0,
                })

    # 마지막 카테고리 저장
    if current_cat and current_conflicts:
        categories.append({
            "id": current_cat[0],
            "label": current_cat[1],
            "description": current_cat[2],
            "conflicts": current_conflicts,
        })

    if not categories:
        raise ValueError("파싱 결과가 비어있습니다. 페이지 구조가 변경되었을 수 있습니다.")

    return {
        "source":    WIKI_URL,
        "retrieved": TODAY_ISO,
        "categories": categories,
    }


def guess_region(location: str) -> str:
    """위치 문자열로부터 대략적인 권역을 추론한다."""
    loc = location.lower()
    if any(k in loc for k in ["ukraine", "russia", "europe", "poland", "germany", "france",
                               "armenia", "azerbaijan", "caucasus", "belarus"]):
        return "유럽"
    if any(k in loc for k in ["somalia", "congo", "sudan", "mali", "nigeria", "ethiopia",
                               "mozambique", "senegal", "libya", "morocco", "chad",
                               "cameroon", "angola", "burkina", "niger", "kenya"]):
        return "아프리카"
    if any(k in loc for k in ["syria", "israel", "palestine", "iraq", "yemen", "iran",
                               "jordan", "lebanon", "saudi", "kuwait", "egypt", "turkey"]):
        return "중동"
    if any(k in loc for k in ["india", "pakistan", "afghanistan", "kashmir",
                               "bangladesh", "nepal", "sri lanka"]):
        return "남아시아"
    if any(k in loc for k in ["myanmar", "thailand", "philippines", "indonesia",
                               "malaysia", "laos", "vietnam", "cambodia", "timor"]):
        return "동남아시아"
    if any(k in loc for k in ["china", "korea", "japan", "taiwan"]):
        return "동아시아"
    if any(k in loc for k in ["mexico", "colombia", "venezuela", "haiti",
                               "ecuador", "peru", "brazil", "honduras",
                               "el salvador", "paraguay", "jamaica"]):
        return "아메리카"
    return "기타"


# ── 2. 데이터 로드 (수집 실패 시 백업 사용) ─────────────────────────────────
def load_data() -> dict:
    try:
        data = fetch_from_wikipedia()
        # 수집 성공 → JSON 저장
        DATA_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"[save] 데이터 저장 완료 → {DATA_FILE.name}")
        return data
    except Exception as e:
        print(f"[warn] Wikipedia 수집 실패: {e}")
        # 기저장 파일 우선
        for path in (DATA_FILE, FALLBACK):
            if path.exists():
                print(f"[load] 백업 파일 사용 → {path}")
                raw = json.loads(path.read_text(encoding="utf-8"))
                return raw
        print("[error] 사용 가능한 데이터 파일이 없습니다.")
        sys.exit(1)


# ── 헬퍼: 카테고리 코드 → 한글/CSS 클래스 ────────────────────────────────────
CAT_META = {
    "major":     {"ko": "대형전쟁",   "css": "s-major",    "color": "#e53e3e"},
    "minor_war": {"ko": "소형전쟁",   "css": "s-minor",    "color": "#ed8936"},
    "conflict":  {"ko": "소규모 분쟁","css": "s-conflict", "color": "#d69e2e"},
    "skirmish":  {"ko": "소규모 충돌","css": "s-skirmish", "color": "#68d391"},
}

REGION_META = {
    "유럽":     {"css": "r-eu",  "color": "#76aee4"},
    "아프리카": {"css": "r-af",  "color": "#f6c05c"},
    "중동":     {"css": "r-me",  "color": "#fc8181"},
    "남아시아": {"css": "r-sa",  "color": "#68d391"},
    "동남아시아":{"css":"r-sea", "color": "#f6ad55"},
    "동아시아": {"css": "r-ea",  "color": "#76aee4"},
    "아메리카": {"css": "r-la",  "color": "#b794f4"},
    "기타":     {"css": "r-etc", "color": "#a0aec0"},
}


def flatten_conflicts(data: dict) -> list[dict]:
    """categories 구조를 평탄화해 단일 리스트로 반환한다."""
    rows = []
    for cat in data.get("categories", []):
        cat_id = cat.get("id", "conflict")
        for c in cat.get("conflicts", []):
            rows.append({**c, "category": cat_id})
    return rows


# ── 3. HTML 생성 ──────────────────────────────────────────────────────────────
def build_html(data: dict) -> str:
    conflicts = flatten_conflicts(data)
    source     = data.get("source", WIKI_URL)
    retrieved  = data.get("retrieved", TODAY_ISO)

    total  = len(conflicts)
    major  = sum(1 for c in conflicts if c["category"] in ("major", "minor_war"))
    minor  = sum(1 for c in conflicts if c["category"] in ("conflict", "skirmish"))

    # 지역별 집계
    from collections import Counter
    region_counts = Counter(c["region"] for c in conflicts)
    region_max    = max(region_counts.values(), default=1)

    # ── 지역 카드 HTML ──
    region_cards_html = ""
    for region, cnt in region_counts.most_common():
        meta = REGION_META.get(region, REGION_META["기타"])
        pct  = round(cnt / region_max * 100)
        region_cards_html += f"""
        <div class="region-card">
          <div class="rc-name">{region}</div>
          <div class="rc-num">{cnt}<span style="font-size:.9rem;font-weight:400;color:var(--text-muted)"> 건</span></div>
          <div class="rc-bar"><div class="rc-fill" style="width:{pct}%;background:{meta['color']}"></div></div>
        </div>"""

    # ── 분쟁 행 HTML ──
    rows_html = ""
    for i, c in enumerate(conflicts, 1):
        cat_id   = c.get("category", "conflict")
        cat_meta = CAT_META.get(cat_id, CAT_META["conflict"])
        reg_meta = REGION_META.get(c.get("region", "기타"), REGION_META["기타"])
        start    = c.get("start") or "—"
        loc      = c.get("location", "")
        name     = c.get("name") or c.get("name_en", "")
        rows_html += f"""
        <tr data-category="{cat_id}">
          <td>{i}</td>
          <td>
            <div class="conflict-name">{name}</div>
            <div class="location-text">{loc}</div>
          </td>
          <td><span class="region-badge {reg_meta['css']}">{c.get('region','기타')}</span></td>
          <td><span class="scale-badge {cat_meta['css']}">{cat_meta['ko']}</span></td>
          <td class="year-text">{start}</td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>글로벌 정세 리포트 2026</title>
  <style>
    :root {{
      --bg-base:    #0a0c10;
      --bg-panel:   #111520;
      --bg-card:    #161b28;
      --border:     #1e2535;
      --accent-red: #e53e3e;
      --accent-ora: #dd6b20;
      --accent-yel: #d69e2e;
      --accent-blu: #3182ce;
      --text-pri:   #e2e8f0;
      --text-sec:   #8899aa;
      --text-muted: #4a5568;
    }}
    * {{ box-sizing:border-box; margin:0; padding:0; }}
    body {{ background:var(--bg-base); color:var(--text-pri);
            font-family:'Segoe UI','Apple SD Gothic Neo',sans-serif; min-height:100vh; }}

    /* ── Header ── */
    header {{
      background:linear-gradient(180deg,#0d111c 0%,var(--bg-base) 100%);
      border-bottom:1px solid var(--border);
      padding:2.5rem 2rem 2rem; text-align:center;
    }}
    .header-tag {{
      display:inline-block; font-size:.7rem; font-weight:700;
      letter-spacing:.18em; text-transform:uppercase;
      color:var(--accent-red); border:1px solid var(--accent-red);
      border-radius:2px; padding:.2rem .6rem; margin-bottom:1rem;
    }}
    header h1 {{ font-size:clamp(1.8rem,4vw,3rem); font-weight:800;
                 letter-spacing:-.02em; }}
    header h1 span {{ color:var(--accent-red); }}
    .header-sub  {{ margin-top:.6rem; font-size:.95rem; color:var(--text-sec); }}
    .header-date {{ margin-top:.4rem; font-size:.8rem; color:var(--text-muted);
                    letter-spacing:.06em; text-transform:uppercase; }}

    /* ── Layout ── */
    main {{ max-width:1200px; margin:0 auto; padding:2.5rem 1.5rem 4rem; }}

    /* ── Cards ── */
    .cards {{ display:grid; grid-template-columns:repeat(3,1fr); gap:1.2rem; margin-bottom:2.5rem; }}
    @media(max-width:640px) {{ .cards {{ grid-template-columns:1fr; }} }}
    .card {{
      background:var(--bg-card); border:1px solid var(--border);
      border-radius:8px; padding:1.6rem 1.8rem; position:relative; overflow:hidden;
    }}
    .card::before {{ content:''; position:absolute; top:0; left:0; width:100%; height:3px; }}
    .card.total::before {{ background:var(--accent-blu); }}
    .card.major::before {{ background:var(--accent-red); }}
    .card.minor::before {{ background:var(--accent-yel); }}
    .card .label {{ font-size:.72rem; font-weight:700; letter-spacing:.12em;
                    text-transform:uppercase; margin-bottom:.5rem; }}
    .card.total .label {{ color:var(--accent-blu); }}
    .card.major .label {{ color:var(--accent-red); }}
    .card.minor .label {{ color:var(--accent-yel); }}
    .card .number {{ font-size:3rem; font-weight:900; line-height:1; margin-bottom:.4rem; }}
    .card.total .number {{ color:var(--accent-blu); }}
    .card.major .number {{ color:var(--accent-red); }}
    .card.minor .number {{ color:var(--accent-yel); }}
    .card .desc {{ font-size:.8rem; color:var(--text-sec); line-height:1.5; }}

    /* ── Section title ── */
    .section-title {{
      font-size:.72rem; font-weight:700; letter-spacing:.14em; text-transform:uppercase;
      color:var(--text-muted); margin-bottom:1rem;
      display:flex; align-items:center; gap:.6rem;
    }}
    .section-title::after {{ content:''; flex:1; height:1px; background:var(--border); }}

    /* ── Region grid ── */
    .region-grid {{
      display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
      gap:.8rem; margin-bottom:2.5rem;
    }}
    .region-card {{
      background:var(--bg-card); border:1px solid var(--border);
      border-radius:6px; padding:1rem 1.2rem;
    }}
    .region-card .rc-name {{ font-size:.72rem; font-weight:700; letter-spacing:.08em;
      text-transform:uppercase; color:var(--text-muted); margin-bottom:.3rem; }}
    .region-card .rc-num {{ font-size:1.6rem; font-weight:800; color:var(--text-pri); }}
    .region-card .rc-bar {{ margin-top:.5rem; height:3px; background:var(--border);
      border-radius:2px; overflow:hidden; }}
    .region-card .rc-fill {{ height:100%; border-radius:2px; transition:width .4s ease; }}

    /* ── Filter ── */
    .filter-bar {{ display:flex; flex-wrap:wrap; gap:.5rem; margin-bottom:1.2rem; }}
    .filter-btn {{
      background:var(--bg-card); border:1px solid var(--border); color:var(--text-sec);
      font-size:.75rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase;
      padding:.35rem .9rem; border-radius:4px; cursor:pointer; transition:all .15s;
    }}
    .filter-btn:hover {{ border-color:var(--text-sec); color:var(--text-pri); }}
    .filter-btn.active-all     {{ border-color:var(--accent-blu); color:var(--accent-blu); background:rgba(49,130,206,.12); }}
    .filter-btn.active-major   {{ border-color:var(--accent-red); color:var(--accent-red); background:rgba(229,62,62,.12); }}
    .filter-btn.active-minor   {{ border-color:#ed8936;           color:#ed8936;           background:rgba(221,107,32,.12); }}
    .filter-btn.active-conf    {{ border-color:var(--accent-yel); color:var(--accent-yel); background:rgba(214,158,46,.12); }}
    .filter-btn.active-skirmish{{ border-color:#68d391;           color:#68d391;           background:rgba(104,211,145,.10); }}

    /* ── Table ── */
    .table-wrap {{ background:var(--bg-panel); border:1px solid var(--border);
                   border-radius:8px; overflow:hidden; }}
    table {{ width:100%; border-collapse:collapse; font-size:.875rem; }}
    thead tr {{ background:#0d1117; border-bottom:1px solid var(--border); }}
    th {{ padding:.85rem 1rem; text-align:left; font-size:.68rem; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase; color:var(--text-muted); white-space:nowrap; }}
    tbody tr {{ border-bottom:1px solid var(--border); transition:background .12s; }}
    tbody tr:last-child {{ border-bottom:none; }}
    tbody tr:hover {{ background:rgba(255,255,255,.025); }}
    td {{ padding:.8rem 1rem; vertical-align:middle; line-height:1.45; }}
    td:first-child {{ color:var(--text-muted); font-size:.75rem; font-weight:600; }}
    .conflict-name {{ font-weight:600; color:var(--text-pri); }}
    .location-text {{ font-size:.78rem; color:var(--text-sec); margin-top:.2rem; }}

    /* ── Badges ── */
    .region-badge {{
      display:inline-block; font-size:.68rem; font-weight:600; letter-spacing:.05em;
      padding:.15rem .55rem; border-radius:3px; white-space:nowrap;
    }}
    .r-eu  {{ background:rgba(49,130,206,.15);  color:#76aee4; border:1px solid rgba(49,130,206,.25); }}
    .r-af  {{ background:rgba(214,158,46,.15);  color:#f6c05c; border:1px solid rgba(214,158,46,.25); }}
    .r-me  {{ background:rgba(229,62,62,.15);   color:#fc8181; border:1px solid rgba(229,62,62,.25); }}
    .r-sa  {{ background:rgba(104,211,145,.15); color:#68d391; border:1px solid rgba(104,211,145,.25); }}
    .r-sea {{ background:rgba(237,137,54,.15);  color:#f6ad55; border:1px solid rgba(237,137,54,.25); }}
    .r-ea  {{ background:rgba(49,130,206,.15);  color:#76aee4; border:1px solid rgba(49,130,206,.25); }}
    .r-la  {{ background:rgba(183,148,246,.15); color:#b794f4; border:1px solid rgba(183,148,246,.25); }}
    .r-etc {{ background:rgba(160,174,192,.1);  color:#a0aec0; border:1px solid rgba(160,174,192,.2); }}

    .scale-badge {{
      display:inline-block; font-size:.68rem; font-weight:700; letter-spacing:.06em;
      padding:.2rem .6rem; border-radius:3px; white-space:nowrap;
    }}
    .s-major    {{ background:rgba(229,62,62,.15);   color:#e53e3e; border:1px solid rgba(229,62,62,.3); }}
    .s-minor    {{ background:rgba(221,107,32,.15);  color:#ed8936; border:1px solid rgba(237,137,54,.3); }}
    .s-conflict {{ background:rgba(214,158,46,.15);  color:#d69e2e; border:1px solid rgba(214,158,46,.3); }}
    .s-skirmish {{ background:rgba(104,211,145,.10); color:#68d391; border:1px solid rgba(104,211,145,.25); }}

    .year-text {{ color:var(--text-sec); font-size:.82rem; }}
    tr.hidden  {{ display:none; }}

    /* ── Footer ── */
    footer {{ border-top:1px solid var(--border); padding:1.8rem 2rem; text-align:center; }}
    .footer-label {{ font-size:.68rem; font-weight:700; letter-spacing:.12em;
                     text-transform:uppercase; color:var(--text-muted); margin-bottom:.4rem; }}
    footer a {{ color:var(--accent-blu); text-decoration:none; font-size:.85rem; }}
    footer a:hover {{ text-decoration:underline; }}
    .footer-note {{ margin-top:.6rem; font-size:.75rem; color:var(--text-muted); }}
    .generated-tag {{
      display:inline-block; margin-top:.8rem; font-size:.68rem;
      color:var(--text-muted); border:1px solid var(--border);
      border-radius:3px; padding:.2rem .6rem; letter-spacing:.08em;
    }}
  </style>
</head>
<body>

<header>
  <div class="header-tag">LIVE INTELLIGENCE BRIEF</div>
  <h1>글로벌 정세 리포트 <span>2026</span></h1>
  <p class="header-sub">전 세계 진행 중인 무력 분쟁 현황 분석</p>
  <p class="header-date">기준일: {TODAY} &nbsp;|&nbsp; 출처: Wikipedia</p>
</header>

<main>

  <!-- 요약 카드 -->
  <div class="cards">
    <div class="card total">
      <div class="label">전체 분쟁 건수</div>
      <div class="number">{total}</div>
      <div class="desc">현재 전 세계에서 진행 중인<br>모든 무력 분쟁</div>
    </div>
    <div class="card major">
      <div class="label">대규모 분쟁</div>
      <div class="number">{major}</div>
      <div class="desc">연간 사망자 1,000명 이상<br>(대형전쟁 + 소형전쟁)</div>
    </div>
    <div class="card minor">
      <div class="label">소규모 분쟁</div>
      <div class="number">{minor}</div>
      <div class="desc">연간 사망자 999명 이하<br>(소규모 분쟁 + 소규모 충돌)</div>
    </div>
  </div>

  <!-- 지역별 분포 -->
  <div class="section-title">지역별 분포</div>
  <div class="region-grid">{region_cards_html}
  </div>

  <!-- 전체 분쟁 목록 -->
  <div class="section-title">전체 분쟁 목록</div>
  <div class="filter-bar">
    <button class="filter-btn active-all"      onclick="setFilter('all')">전체</button>
    <button class="filter-btn"                 onclick="setFilter('major')">대형전쟁</button>
    <button class="filter-btn"                 onclick="setFilter('minor_war')">소형전쟁</button>
    <button class="filter-btn"                 onclick="setFilter('conflict')">소규모 분쟁</button>
    <button class="filter-btn"                 onclick="setFilter('skirmish')">소규모 충돌</button>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>분쟁명</th>
          <th>지역</th>
          <th>규모</th>
          <th>시작</th>
        </tr>
      </thead>
      <tbody id="tbody">
{rows_html}
      </tbody>
    </table>
  </div>

</main>

<footer>
  <div class="footer-label">데이터 출처</div>
  <a href="{source}" target="_blank" rel="noopener">{source}</a>
  <p class="footer-note">데이터 수집일: {retrieved} &nbsp;|&nbsp; 수치는 추정치이며 지속적으로 변동될 수 있습니다.</p>
  <div class="generated-tag">GENERATED BY report.py</div>
</footer>

<script>
  const CLASS_MAP = {{
    all:'active-all', major:'active-major', minor_war:'active-minor',
    conflict:'active-conf', skirmish:'active-skirmish'
  }};
  let cur = 'all';
  function setFilter(cat) {{
    cur = cat;
    document.querySelectorAll('.filter-btn').forEach(b => b.className = 'filter-btn');
    const labels = {{
      all:'전체', major:'대형전쟁', minor_war:'소형전쟁',
      conflict:'소규모 분쟁', skirmish:'소규모 충돌'
    }};
    document.querySelectorAll('.filter-btn').forEach(b => {{
      if (b.textContent.trim() === labels[cat]) b.classList.add(CLASS_MAP[cat]);
    }});
    document.querySelectorAll('#tbody tr').forEach(tr => {{
      tr.classList.toggle('hidden', cat !== 'all' && tr.dataset.category !== cat);
    }});
  }}
</script>
</body>
</html>"""


# ── 4. 메인 ──────────────────────────────────────────────────────────────────
def main():
    print("=" * 55)
    print("  글로벌 분쟁 현황 보고서 생성기  report.py")
    print("=" * 55)

    # 데이터 수집 / 로드
    data = load_data()

    conflicts = flatten_conflicts(data)
    print(f"[info] 총 {len(conflicts)}건의 분쟁 데이터 로드 완료")

    # HTML 생성
    print(f"[html] 보고서 생성 중...")
    html = build_html(data)
    HTML_FILE.write_text(html, encoding="utf-8")
    print(f"[html] 저장 완료 → {HTML_FILE}")
    print("=" * 55)
    print(f"  완료!  브라우저에서 index.html 을 열어보세요.")
    print("=" * 55)


if __name__ == "__main__":
    main()
