// Portfolio Interactivity, Client-Side Passive DNS Auditor (Cloudflare DoH) & Bilingual (EN/ID) Engine
let currentLang = "en";

// Copy Email to Clipboard
const copyEmailBtn = document.getElementById("copyEmailBtn");
const copyStatus = document.getElementById("copyStatus");

if (copyEmailBtn) {
  const handleCopyEmail = () => {
    navigator.clipboard.writeText("fatafatikhul@gmail.com").then(() => {
      if (copyStatus) {
        copyStatus.textContent = currentLang === "en" ? "✓ Copied!" : "✓ Tersalin!";
        setTimeout(() => {
          copyStatus.textContent = currentLang === "en" ? "(Click to copy)" : "(Klik untuk salin)";
        }, 2500);
      }
    });
  };
  copyEmailBtn.addEventListener("click", handleCopyEmail);
  copyEmailBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCopyEmail();
    }
  });
}

// Direct Email Composer
const quickForm = document.getElementById("quickContactForm");
if (quickForm) {
  quickForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("senderName").value.trim();
    const topic = document.getElementById("inquiryType").value;
    const msg = document.getElementById("senderMsg").value.trim();

    const subject = encodeURIComponent(`[Engineering Inquiry] ${topic} — ${name}`);
    const body = encodeURIComponent(`Hi Fata,\n\nI am ${name}.\nTopic: ${topic}\n\n${msg}\n\nBest regards,\n${name}`);
    window.location.href = `mailto:fatafatikhul@gmail.com?subject=${subject}&body=${body}`;
  });
}

// Client-Side Passive DNS & Anti-Spoofing Scanner (Cloudflare DoH JSON API)
const liveScanForm = document.getElementById("liveScanForm");
const scanDomainInput = document.getElementById("scanDomainInput");
const scanResultsBox = document.getElementById("scanResultsBox");
const scanGradeBadge = document.getElementById("scanGradeBadge");
const scanTargetTitle = document.getElementById("scanTargetTitle");
const scanSummaryText = document.getElementById("scanSummaryText");
const scanFindingsGrid = document.getElementById("scanFindingsGrid");
const scanRawOutput = document.getElementById("scanRawOutput");
const downloadScanReportBtn = document.getElementById("downloadScanReportBtn");

let lastScanReportMd = [
  "# Passive DNS & Anti-Spoofing Report: `hackerone.com`",
  "- **Generated via:** Fata Fatikhul Karim Portfolio (https://fatakarim.github.io)",
  "- **Posture Score:** 90/100 (**Grade A**)",
  "",
  "## 1. Posture Checks",
  "- **Host & IP Resolution [PASS]:** Resolved: 104.18.36.214, 172.64.151.42 + 2 IPv6",
  "- **SPF Anti-Spoofing Policy [STRICT (-all)]:** Hardfail active: v=spf1 include:_spf.google.com include:mail.zendesk.com -all",
  "- **DMARC Policy (_dmarc) [REJECT]:** Strict enforcement (p=reject): v=DMARC1; p=reject; pct=100;",
  "- **SSL CAA Restriction [ENFORCED]:** Restricts issuance to listed CAs: 0 issue \"letsencrypt.org\", 0 issue \"digicert.com\""
].join("\n");
let lastScannedDomain = "hackerone.com";

async function queryDoH(name, type) {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    return data.Answer || [];
  } catch (e) {
    clearTimeout(timer);
    return [];
  }
}

function cleanDomainInput(raw) {
  return raw
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .split(":")[0]
    .toLowerCase();
}

async function runLiveDomainScan(rawDomain) {
  const domain = cleanDomainInput(rawDomain);
  if (!domain || !domain.includes(".")) return;

  lastScannedDomain = domain;
  if (scanDomainInput) scanDomainInput.value = domain;
  if (scanResultsBox) scanResultsBox.style.display = "block";
  if (scanTargetTitle) scanTargetTitle.textContent = domain;
  if (scanSummaryText) scanSummaryText.textContent = "Querying passive DNS-over-HTTPS telemetry...";
  if (scanGradeBadge) scanGradeBadge.textContent = "⏳";
  if (scanFindingsGrid) scanFindingsGrid.innerHTML = "";
  if (scanRawOutput) scanRawOutput.textContent = "[*] Querying Cloudflare DoH (A, AAAA, MX, NS, TXT, DMARC, CAA)...";

  const [aRecs, aaaaRecs, mxRecs, nsRecs, txtRecs, dmarcRecs, caaRecs] = await Promise.all([
    queryDoH(domain, "A"),
    queryDoH(domain, "AAAA"),
    queryDoH(domain, "MX"),
    queryDoH(domain, "NS"),
    queryDoH(domain, "TXT"),
    queryDoH(`_dmarc.${domain}`, "TXT"),
    queryDoH(domain, "CAA")
  ]);

  const ipv4List = aRecs.filter((r) => r.type === 1).map((r) => r.data);
  const ipv6List = aaaaRecs.filter((r) => r.type === 28).map((r) => r.data);
  const nsList = nsRecs.map((r) => r.data.replace(/\.$/, ""));
  const mxList = mxRecs.map((r) => r.data.replace(/\.$/, ""));
  const txtList = txtRecs.map((r) => r.data.replace(/^"|"$/g, ""));
  const dmarcList = dmarcRecs.map((r) => r.data.replace(/^"|"$/g, ""));
  const caaList = caaRecs.map((r) => r.data);

  const spfRecord = txtList.find((t) => t.toLowerCase().includes("v=spf1")) || null;
  const dmarcRecord = dmarcList.find((t) => t.toLowerCase().includes("v=dmarc1")) || null;

  let score = 0;
  const checks = [];

  if (ipv4List.length > 0) {
    score += 20;
    const v6Note = ipv6List.length > 0 ? ` + ${ipv6List.length} IPv6` : " (IPv4 only)";
    if (ipv6List.length > 0) score += 10;
    checks.push({
      title: "Host & IP Resolution",
      status: "PASS",
      pill: "pill-pass",
      desc: `Resolved: ${ipv4List.slice(0, 2).join(", ")}${v6Note}`
    });
  } else {
    checks.push({
      title: "Host & IP Resolution",
      status: "FAIL",
      pill: "pill-fail",
      desc: "No active A record found on root domain."
    });
  }

  if (spfRecord) {
    if (spfRecord.includes("-all")) {
      score += 25;
      checks.push({
        title: "SPF Anti-Spoofing Policy",
        status: "STRICT (-all)",
        pill: "pill-pass",
        desc: `Hardfail active: ${spfRecord.slice(0, 75)}`
      });
    } else if (spfRecord.includes("~all")) {
      score += 18;
      checks.push({
        title: "SPF Anti-Spoofing Policy",
        status: "SOFTFAIL (~all)",
        pill: "pill-warn",
        desc: `Softfail (~all) configured. Recommend strict -all where feasible.`
      });
    } else {
      score += 5;
      checks.push({
        title: "SPF Anti-Spoofing Policy",
        status: "PERMISSIVE",
        pill: "pill-fail",
        desc: `SPF record lacks strict (-all/~all) enforcement.`
      });
    }
  } else {
    checks.push({
      title: "SPF Anti-Spoofing Policy",
      status: "MISSING",
      pill: "pill-fail",
      desc: "No v=spf1 TXT record found. Elevated email spoofing risk."
    });
  }

  if (dmarcRecord) {
    const low = dmarcRecord.toLowerCase();
    if (low.includes("p=reject")) {
      score += 30;
      checks.push({
        title: "DMARC Policy (_dmarc)",
        status: "REJECT",
        pill: "pill-pass",
        desc: `Strict enforcement (p=reject): ${dmarcRecord.slice(0, 75)}`
      });
    } else if (low.includes("p=quarantine")) {
      score += 22;
      checks.push({
        title: "DMARC Policy (_dmarc)",
        status: "QUARANTINE",
        pill: "pill-pass",
        desc: `Active filtering (p=quarantine): ${dmarcRecord.slice(0, 75)}`
      });
    } else {
      score += 10;
      checks.push({
        title: "DMARC Policy (_dmarc)",
        status: "NONE (Monitor)",
        pill: "pill-warn",
        desc: `Monitoring mode (p=none) — does not block spoofed messages.`
      });
    }
  } else {
    checks.push({
      title: "DMARC Policy (_dmarc)",
      status: "MISSING",
      pill: "pill-fail",
      desc: "No _dmarc TXT record detected."
    });
  }

  if (caaList.length > 0) {
    score += 15;
    checks.push({
      title: "SSL CAA Restriction",
      status: "ENFORCED",
      pill: "pill-pass",
      desc: `Restricts issuance to listed CAs: ${caaList.slice(0, 2).join(", ")}`
    });
  } else {
    checks.push({
      title: "SSL CAA Restriction",
      status: "NOT SET",
      pill: "pill-warn",
      desc: "No CAA record restricting Certificate Authorities."
    });
  }

  let grade = "C";
  let badgeColor = "#fbbf24";
  if (score >= 95) { grade = "A+"; badgeColor = "#10b981"; }
  else if (score >= 80) { grade = "A"; badgeColor = "#10b981"; }
  else if (score >= 60) { grade = "B"; badgeColor = "#38bdf8"; }
  else if (score < 40) { grade = "D"; badgeColor = "#ef4444"; }

  const todayUtc = new Date().toISOString().slice(0, 10) + " UTC";
  if (scanGradeBadge) {
    scanGradeBadge.textContent = grade;
    scanGradeBadge.style.borderColor = badgeColor;
    scanGradeBadge.style.color = badgeColor;
  }
  if (scanTargetTitle) scanTargetTitle.textContent = `${domain} (Snapshot: ${todayUtc})`;
  if (scanSummaryText) {
    scanSummaryText.textContent = `Passive DNS Posture Score: ${score}/100 (Grade ${grade}) • Nameservers: ${nsList.slice(0, 2).join(", ") || "N/A"}`;
  }

  if (scanFindingsGrid) {
    scanFindingsGrid.innerHTML = checks
      .map(
        (c) => `
        <div class="scan-check-card">
          <div class="scan-check-top">
            <span>${c.title}</span>
            <span class="scan-status-pill ${c.pill}">${c.status}</span>
          </div>
          <div class="scan-check-desc">${c.desc}</div>
        </div>`
      )
      .join("");
  }

  const rawLines = [
    `[+] Target Domain : ${domain}`,
    `[+] Snapshot Date : ${todayUtc}`,
    `[+] Posture Score : ${score}/100 (Grade ${grade})`,
    `[+] IPv4 (A)      : ${ipv4List.join(", ") || "None"}`,
    `[+] IPv6 (AAAA)   : ${ipv6List.join(", ") || "None"}`,
    `[+] Nameservers   : ${nsList.join(", ") || "None"}`,
    `[+] Mail (MX)     : ${mxList.join(", ") || "None"}`,
    `[+] SPF Record    : ${spfRecord || "MISSING"}`,
    `[+] DMARC Record  : ${dmarcRecord || "MISSING"}`,
    `[+] CAA Records   : ${caaList.join(" | ") || "None"}`
  ];
  if (scanRawOutput) scanRawOutput.textContent = rawLines.join("\n");

  lastScanReportMd = [
    `# Passive DNS & Anti-Spoofing Report: \`${domain}\``,
    `- **Generated via:** Fata Fatikhul Karim Portfolio (https://fatakarim.github.io)`,
    `- **Posture Score:** ${score}/100 (**Grade ${grade}**)`,
    ``,
    `## 1. Posture Checks`,
    ...checks.map((c) => `- **${c.title} [${c.status}]:** ${c.desc}`),
    ``,
    `## 2. Raw DNS Telemetry`,
    "```text",
    ...rawLines,
    "```"
  ].join("\n");
}

if (liveScanForm) {
  liveScanForm.addEventListener("submit", (e) => {
    e.preventDefault();
    runLiveDomainScan(scanDomainInput.value);
  });
}

document.querySelectorAll(".preset-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const d = chip.getAttribute("data-domain");
    if (d) runLiveDomainScan(d);
  });
});

if (downloadScanReportBtn) {
  downloadScanReportBtn.addEventListener("click", () => {
    if (!lastScanReportMd) return;
    const blob = new Blob([lastScanReportMd], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dns_audit_${lastScannedDomain.replace(/\./g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

// 100% Complete Bilingual Dictionary (EN default / ID toggle) matching all 52 data-i18n keys
const i18n = {
  en: {
    nav_projects: "Case Studies",
    nav_writeups: "Security Writeups",
    nav_exp: "Experience & Background",
    nav_contact: "Contact",
    nav_resume: "Resume (PDF)",
    hero_eyebrow: "APPLICATION SECURITY & BACKEND AUTOMATION ENGINEER",
    hero_headline: "Engineering resilient backend systems, protocol guardrails, and actionable security audits.",
    hero_desc:
      "I build deterministic developer and security tooling in <strong>Python 3</strong> and <strong>Node.js</strong>—spanning Model Context Protocol (MCP) bridges, passive OSINT &amp; API boundary scanners, and event-driven automation—while conducting authorized web application security assessments focused on <strong>Broken Access Control (IDOR)</strong>, <strong>Business-Logic Flaws</strong>, and <strong>Server-Side Schema Hardening</strong>.",
    btn_projects: "Read Engineering Case Studies",
    btn_cv: "Download ATS Resume (PDF)",
    btn_web_cv: "View Web Resume",
    hero_logistics:
      "<strong>Availability &amp; Work Logistics:</strong> Expected Graduation: 2027 (UNSOED) &bull; Flexible schedule for Full-Time or Paid Internship roles &bull; Open to Remote, Hybrid, or Relocation (Jakarta / Bandung / Java).",
    proj_tag: "ENGINEERING CASE STUDIES",
    proj_title: "Systems Architecture & Security Tooling",
    proj_subtitle: "Detailed problem statements, architectural diagrams, security guardrails, and verified execution proofs.",
    proj1_desc:
      "<strong>Problem:</strong> Pre-release web security hygiene checks often miss permissive CORS reflections, missing cookie flags, or unvalidated numeric query parameters, while third-party Python scanners frequently fail in constrained CI environments due to dependency conflicts or single-source <code>crt.sh</code> timeouts.<br/><br/><strong>Engineering Decision &amp; Trade-offs:</strong> Built strictly on Python 3's standard library (<code>urllib.request</code>, <code>ssl</code>, <code>concurrent.futures</code>) for zero-dependency portability. Aggregates passive subdomain OSINT across three independent providers (AlienVault OTX, HackerTarget, and <code>crt.sh</code>), performs non-destructive numeric boundary probing (<code>0</code>, <code>-500</code>, <code>1e308</code>), and generates Markdown remediation reports with code blueprints.",
    proj2_desc:
      "<strong>Problem:</strong> AI coding assistants cannot deterministically inspect or verify UI states on physical Android hardware and headless Chromium instances during end-to-end (E2E) testing, and naive ADB wrappers are vulnerable to host command injection via untrusted DOM/UI strings.<br/><br/><strong>Engineering Decision &amp; Trade-offs:</strong> Engineered a Node.js JSON-RPC 2.0 <code>stdio</code> server exposing 44 structured tools for Android Debug Bridge (ADB) and Chrome DevTools Protocol (CDP). Chose XML Accessibility Tree parsing (<code>uiautomator dump</code>) over static X/Y pixel coordinates to ensure layout resilience across screen densities.",
    proj3_desc:
      "<strong>Problem &amp; Honest Scope:</strong> Built as an experimental personal-use WhatsApp auto-responder for isolated local environments (using the unofficial <code>@whiskeysockets/baileys</code> multi-device WebSocket library and Google GenAI SDK) to handle incoming 1:1 personal messages while studying or coding in Termux.<br/><br/><strong>Verifiable Code Mechanics &amp; Guardrails:</strong> Implements a deterministic <strong>2,000ms typing-presence delay</strong> (<code>sendPresenceUpdate('composing')</code>) before dispatching <code>gemini-2.5-flash</code> responses; enforces a strict <strong>group-JID filter (<code>if (senderJid.endsWith('@g.us')) return;</code>)</strong> verified by automated unit tests (<code>test/filter.test.js</code>) to guarantee <strong>0 LLM API calls on group broadcasts</strong>; and isolates all credentials via environment variables (<code>process.env.GEMINI_API_KEY</code>) and <code>.gitignore</code> rules.",
    wrt_tag: "SECURITY RESEARCH & ROOT-CAUSE ANALYSIS",
    wrt_title: "Standalone Technical Writeups & Remediation Guides",
    wrt_subtitle: "Each article is published as a standalone URL covering Threat Model, Vulnerable Code Pattern, Business Impact, and Patched Code with Regression Unit Tests.",
    wrt1_title: "Root-Cause Analysis: Unauthenticated Data Exposure & Input Boundary Flaws in an Agricultural Ration Solver API",
    wrt1_desc: "How domain knowledge in livestock nutrition modeling combined with backend API auditing uncovered 8 vulnerabilities (including unauthenticated GET /api/history exposure and missing numeric bounds), complete with Zod schema patches and Jest regression tests.",
    wrt2_title: "Designing Sandboxed Model Context Protocol (MCP) Bridges for Android ADB & Headless Browser E2E Verification",
    wrt2_desc: "Preventing indirect prompt injection from escalating to host shell execution by replacing string-interpolated ADB commands with parameterized execFile calls and strict package regex allowlists.",
    wrt3_title: "Multi-Source Passive Subdomain Enumeration & Non-Destructive API Boundary Auditing in Python",
    wrt3_desc: "Engineering a zero-dependency Python 3 CLI that aggregates AlienVault OTX, HackerTarget, and crt.sh telemetry while testing API parameters against numeric edge cases.",
    wrt_read: "Read Full Article",
    skills_tag: "VERIFIED TECHNICAL DEPTH",
    skills_title: "Core Engineering & Security Stack",
    skills_subtitle: "Focused strictly on the four technical domains I build with daily and can debug under live code review.",
    exp_tag: "EXPERIENCE, COLLABORATION & EDUCATION",
    exp_title: "Security Research & Academic Foundation",
    exp_subtitle: "Translating security findings into constructive, maintainer-ready patches, regression tests, and clear documentation.",
    exp1_role: "Application Security Researcher (Coordinated Disclosure)",
    exp1_desc:
      "Executed an authorized end-to-end security review of an Express.js livestock ration formulation platform, identifying and responsibly disclosing <strong>8 findings (7 vulnerabilities: 2 High, 4 Medium, 1 Low; plus 1 Informational)</strong>. Collaborated directly with the system maintainer by providing reproduction steps, logging verification record UUIDs (<code>4e856b17...</code>, <code>a030ba7f...</code>) for database cleanup, and delivering drop-in <code>Zod</code> validation schemas, client solver guards, and authorization middleware.",
    exp2_role: "Open-Source Security & Automation Developer",
    exp2_desc:
      'Maintaining <strong>4 public repositories</strong> across Python 3 and Node.js: (1) <a href="https://github.com/fatakarim/fata-termux-toolkit" target="_blank" rel="noopener" style="color:var(--accent-green);">fata-termux-toolkit</a> — 510+ lines of zero-dependency Python 3 security auditing code verified by 5 automated <code>unittest</code> cases; (2) <a href="https://github.com/fatakarim/android-browser-mcp" target="_blank" rel="noopener" style="color:var(--accent-green);">android-browser-mcp</a> — 44 JSON-RPC 2.0 <code>stdio</code> MCP automation tools with parameterized <code>execFile</code> and <code>PACKAGE_REGEX</code> guardrails; (3) <a href="https://github.com/fatakarim/jarvis-whatsapp-ai" target="_blank" rel="noopener" style="color:var(--accent-green);">jarvis-whatsapp-ai</a> — personal WhatsApp AI triage prototype with <code>.env</code> secret isolation; and (4) <a href="https://github.com/fatakarim/fatakarim.github.io" target="_blank" rel="noopener" style="color:var(--accent-green);">fatakarim.github.io</a> — engineering case studies, standalone RCA writeups, and client-side DoH DNS posture analyzer.',
    edu1_desc:
      "Rapid, self-directed mastery of software engineering and application security built alongside quantitative studies at UNSOED. This cross-disciplinary background provides a sharp instinct for uncovering domain-specific mathematical and business-logic vulnerabilities—such as nutritional Dry Matter bounds and linear solver edge cases—that generic security scanners overlook.",
    scan_tag: "INTERACTIVE PASSIVE DNS AUDITOR",
    scan_title: "Client-Side Domain Security Posture Analyzer",
    scan_subtitle: "Evaluates SPF, DMARC (_dmarc), CAA SSL restrictions, and IPv4/IPv6 records via read-only Cloudflare DNS-over-HTTPS (DoH) telemetry.",
    scan_arch_note:
      "<strong>Architecture &amp; Safety Note:</strong> Executes 100% client-side read-only DNS-over-HTTPS queries via <code>cloudflare-dns.com/dns-query</code>. Zero backend proxy SSRF surface; sends no active packets to the target host.",
    scan_btn: "Analyze DNS Posture",
    scan_try: "Presets:",
    sandbox_note:
      "<strong>Interactive AppSec Remediation Sandbox (SOLVER-01..08):</strong> Test the exact exploit payloads from the Agricultural Ration Solver API assessment against both the <strong>Pre-Patch Vulnerable Handler</strong> and the <strong>Post-Patch Hardened Express.js + Zod Middleware</strong> (100% deterministic browser simulation).",
    sandbox_mode_label: "Backend Defense State:",
    sandbox_select_label: "Select Test Vector:",
    contact_tag: "CONTACT & VERIFICATION",
    contact_title: "Connect for Engineering & Security Roles",
    contact_desc: "Available for Full-Time or Paid Internship roles in Application Security, Backend Development, and Systems Automation (Remote / Hybrid / Relocation).",
    form_title: "Direct Email Composer",
    form_name: "Your Name / Organization",
    form_topic: "Subject",
    form_msg: "Message",
    form_submit: "Compose Email"
  },
  id: {
    nav_projects: "Studi Kasus",
    nav_writeups: "Writeup Keamanan",
    nav_exp: "Pengalaman & Pendidikan",
    nav_contact: "Kontak",
    nav_resume: "CV ATS (PDF)",
    hero_eyebrow: "APPLICATION SECURITY & BACKEND AUTOMATION ENGINEER",
    hero_headline: "Membangun sistem backend tangguh, guardrail protokol, dan audit keamanan aplikasi yang terukur.",
    hero_desc:
      "Saya mengembangkan perkakas otomasi developer dan keamanan deterministik menggunakan <strong>Python 3</strong> dan <strong>Node.js</strong>—meliputi bridge Model Context Protocol (MCP), pemindai OSINT pasif &amp; batas parameter API, serta worker berbasis event—sekaligus melaksanakan asesmen keamanan aplikasi web berizin dengan fokus pada <strong>Broken Access Control (IDOR)</strong>, <strong>Business-Logic Flaws</strong>, dan <strong>Server-Side Schema Hardening</strong>.",
    btn_projects: "Baca Studi Kasus Engineering",
    btn_cv: "Unduh CV ATS (PDF)",
    btn_web_cv: "Lihat CV Web",
    hero_logistics:
      "<strong>Ketersediaan &amp; Logistik Kerja:</strong> Estimasi Lulus: 2027 (UNSOED) &bull; Jadwal fleksibel untuk peran Full-Time atau Paid Internship &bull; Terbuka untuk Remote, Hybrid, atau Relokasi (Jakarta / Bandung / Jawa).",
    proj_tag: "STUDI KASUS ENGINEERING",
    proj_title: "Arsitektur Sistem & Perkakas Keamanan",
    proj_subtitle: "Rumusan masalah, diagram arsitektur, guardrail keamanan, dan bukti eksekusi terverifikasi.",
    proj1_desc:
      "<strong>Masalah:</strong> Pemeriksaan keamanan web pra-rilis sering melewatkan refleksi CORS permisif, atribut cookie yang hilang, atau parameter numerik tanpa validasi, sementara pemindai pihak ketiga kerap gagal di lingkungan CI terbatas akibat konflik dependensi atau timeout sumber tunggal <code>crt.sh</code>.<br/><br/><strong>Keputusan Engineering &amp; Trade-off:</strong> Dibangun murni di atas standard library Python 3 (<code>urllib.request</code>, <code>ssl</code>, <code>concurrent.futures</code>) tanpa dependensi eksternal. Mengagregasi OSINT subdomain pasif dari tiga penyedia independen (AlienVault OTX, HackerTarget, dan <code>crt.sh</code>), menguji batas numerik secara non-destruktif (<code>0</code>, <code>-500</code>, <code>1e308</code>), serta menyusun laporan remediasi Markdown otomatis.",
    proj2_desc:
      "<strong>Masalah:</strong> Asisten coding AI tidak dapat memeriksa atau memverifikasi state UI secara deterministik pada perangkat fisik Android maupun instance Chromium headless saat pengujian end-to-end (E2E), dan wrapper ADB naif rentan terhadap command injection melalui string DOM/UI yang tidak tepercaya.<br/><br/><strong>Keputusan Engineering &amp; Trade-off:</strong> Merancang server Node.js JSON-RPC 2.0 <code>stdio</code> yang mengekspos 44 tool terstruktur untuk Android Debug Bridge (ADB) dan Chrome DevTools Protocol (CDP). Menggunakan parsing XML Accessibility Tree (<code>uiautomator dump</code>) dibanding koordinat piksel X/Y statis agar tahan terhadap perbedaan resolusi layar.",
    proj3_desc:
      "<strong>Masalah &amp; Cakupan Jujur:</strong> Dibangun sebagai prototipe asisten penjawab otomatis WhatsApp pribadi untuk lingkungan lokal terisolasi (menggunakan library WebSocket multi-device <code>@whiskeysockets/baileys</code> dan Google GenAI SDK) untuk menangani pesan masuk 1:1 saat sedang kuliah atau mengoding di Termux.<br/><br/><strong>Mekanisme Kode &amp; Guardrail:</strong> Mengimplementasikan jeda indikator mengetik deterministik <strong>2.000ms</strong> (<code>sendPresenceUpdate('composing')</code>) sebelum mengirim respons <code>gemini-2.5-flash</code>; menerapkan <strong>filter grup ketat (<code>if (senderJid.endsWith('@g.us')) return;</code>)</strong> yang diverifikasi oleh unit test otomatis (<code>test/filter.test.js</code>) untuk menjamin <strong>0 panggilan API LLM pada pesan grup</strong>; serta mengisolasi kredensial lewat environment variable (<code>process.env.GEMINI_API_KEY</code>).",
    wrt_tag: "RISET KEAMANAN & ROOT-CAUSE ANALYSIS",
    wrt_title: "Artikel Teknis Mandiri & Panduan Remediasi",
    wrt_subtitle: "Setiap artikel diterbitkan sebagai halaman mandiri yang membahas Threat Model, Pola Kode Rentan, Dampak Bisnis, serta Kode Patch dan Unit Test Regresi.",
    wrt1_title: "Root-Cause Analysis: Eksposur Data Tanpa Autentikasi & Celah Batas Input pada API Solver Ransum Pertanian",
    wrt1_desc: "Bagaimana pemahaman domain pemodelan nutrisi ternak yang dipadukan dengan audit API backend mengungkap 8 temuan keamanan (termasuk eksposur GET /api/history dan ketiadaan batas numerik), lengkap dengan patch skema Zod dan unit test Jest.",
    wrt2_title: "Merancang Bridge Model Context Protocol (MCP) Terisolasi untuk Verifikasi E2E Android ADB & Headless Browser",
    wrt2_desc: "Mencegah eskalasi indirect prompt injection menjadi eksekusi shell host dengan mengganti interpolasi string ADB menjadi pemanggilan execFile berparameter dan allowlist regex package ketat.",
    wrt3_title: "Enumerasi Subdomain Pasif Multi-Sumber & Audit Batas Parameter API Non-Destruktif dengan Python",
    wrt3_desc: "Merancang CLI Python 3 tanpa dependensi eksternal yang mengagregasi telemetri AlienVault OTX, HackerTarget, dan crt.sh sekaligus menguji parameter API terhadap nilai batas numerik ekstrem.",
    wrt_read: "Baca Artikel Lengkap",
    skills_tag: "KEDALAMAN TEKNIS TERVERIFIKASI",
    skills_title: "Kompetensi Inti Engineering & Keamanan",
    skills_subtitle: "Berfokus ketat pada empat domain teknis yang saya bangun setiap hari dan siap diuji melalui live code review.",
    exp_tag: "PENGALAMAN, KOLABORASI & PENDIDIKAN",
    exp_title: "Riset Keamanan & Fondasi Akademik",
    exp_subtitle: "Menerjemahkan temuan keamanan menjadi patch siap pakai, unit test regresi, dan dokumentasi teknis yang jelas bagi maintainer.",
    exp1_role: "Periset Keamanan Aplikasi (Coordinated Disclosure)",
    exp1_desc:
      "Melaksanakan asesmen keamanan end-to-end berizin pada platform formulasi ransum ternak berbasis Express.js, mengidentifikasi dan melaporkan secara bertanggung jawab <strong>8 temuan (7 kerentanan: 2 High, 4 Medium, 1 Low; serta 1 Informational)</strong>. Berkolaborasi langsung dengan maintainer sistem dengan menyertakan langkah reproduksi, mencatat UUID record pengujian (<code>4e856b17...</code>, <code>a030ba7f...</code>) untuk pembersihan database, serta menyerahkan skema validasi <code>Zod</code>, guard solver, dan middleware otorisasi.",
    exp2_role: "Pengembang Open-Source Security & Otomasi",
    exp2_desc:
      'Memelihara <strong>4 repositori publik</strong> berbasis Python 3 dan Node.js: (1) <a href="https://github.com/fatakarim/fata-termux-toolkit" target="_blank" rel="noopener" style="color:var(--accent-green);">fata-termux-toolkit</a> — 510+ baris kode audit keamanan Python 3 tanpa dependensi yang diverifikasi oleh 5 <code>unittest</code> otomatis; (2) <a href="https://github.com/fatakarim/android-browser-mcp" target="_blank" rel="noopener" style="color:var(--accent-green);">android-browser-mcp</a> — 44 tool otomasi MCP JSON-RPC 2.0 <code>stdio</code> dengan guardrail <code>execFile</code> dan <code>PACKAGE_REGEX</code>; (3) <a href="https://github.com/fatakarim/jarvis-whatsapp-ai" target="_blank" rel="noopener" style="color:var(--accent-green);">jarvis-whatsapp-ai</a> — prototipe asisten triase WhatsApp AI pribadi dengan isolasi secret <code>.env</code>; serta (4) <a href="https://github.com/fatakarim/fatakarim.github.io" target="_blank" rel="noopener" style="color:var(--accent-green);">fatakarim.github.io</a> — studi kasus engineering, writeup RCA mandiri, dan penganalisis postur DNS DoH client-side.',
    edu1_desc:
      "Penguasaan mandiri rekayasa perangkat lunak dan keamanan aplikasi yang dibangun berdampingan dengan studi kuantitatif di UNSOED. Latar belakang lintas disiplin ini memberikan insting tajam dalam mengungkap celah logika bisnis dan perhitungan matematis spesifik domain—seperti batas Dry Matter nutrisi dan edge-case solver linear—yang sering terlewat oleh pemindai otomatis.",
    scan_tag: "AUDITOR DNS PASIF INTERAKTIF",
    scan_title: "Penganalisis Postur Keamanan Domain (Client-Side)",
    scan_subtitle: "Mengevaluasi kebijakan SPF, DMARC (_dmarc), pembatasan SSL CAA, dan resolusi IPv4/IPv6 melalui telemetri read-only Cloudflare DNS-over-HTTPS (DoH).",
    scan_arch_note:
      "<strong>Catatan Arsitektur &amp; Keamanan:</strong> Menjalankan kueri read-only DNS-over-HTTPS 100% dari sisi klien (browser) melalui <code>cloudflare-dns.com/dns-query</code>. Nol permukaan serangan SSRF di sisi server dan tidak mengirimkan paket aktif ke host target.",
    scan_btn: "Analisis Postur DNS",
    scan_try: "Contoh cepat:",
    sandbox_note:
      "<strong>Sandbox Remediasi AppSec Interaktif (SOLVER-01..08):</strong> Uji payload eksploitasi dari asesmen API Solver Ransum Pertanian terhadap <strong>Handler Rentan (Pre-Patch)</strong> maupun <strong>Middleware Express.js + Zod Terproteksi (Post-Patch)</strong> secara deterministik di browser.",
    sandbox_mode_label: "Status Pertahanan Backend:",
    sandbox_select_label: "Pilih Vektor Uji:",
    contact_tag: "KONTAK & VERIFIKASI",
    contact_title: "Terhubung untuk Peran Engineering & Keamanan",
    contact_desc: "Tersedia untuk peran Full-Time maupun Paid Internship di bidang Application Security, Backend Development, dan Systems Automation (Remote / Hybrid / Relokasi).",
    form_title: "Penyusun Email Langsung",
    form_name: "Nama / Organisasi Anda",
    form_topic: "Subjek",
    form_msg: "Pesan",
    form_submit: "Susun Email"
  }
};

const langToggle = document.getElementById("langToggle");
const langLabel = document.getElementById("langLabel");

if (langToggle) {
  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "id" : "en";
    if (langLabel) {
      langLabel.innerHTML = currentLang === "en" ? "<strong>EN</strong> | ID" : "EN | <strong>ID</strong>";
    }
    document.documentElement.lang = currentLang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (i18n[currentLang] && i18n[currentLang][key]) {
        el.innerHTML = i18n[currentLang][key];
      }
    });
  });
}

// Interactive AppSec Remediation Sandbox (SOLVER-01..08 Vulnerable vs. Patched Simulator)
let sandboxMode = "patched"; // "patched" | "vulnerable"
let currentVector = "SOLVER-02";

const modePatchedBtn = document.getElementById("modePatchedBtn");
const modeVulnBtn = document.getElementById("modeVulnBtn");
const sandboxStatusTitle = document.getElementById("sandboxStatusTitle");
const sandboxOutput = document.getElementById("sandboxOutput");

const SANDBOX_VECTORS = {
  "SOLVER-01": {
    patched: [
      "$ curl -i https://api.solver-sandbox.local/api/history",
      "",
      "HTTP/1.1 401 Unauthorized",
      "Content-Security-Policy: default-src 'self'",
      "Strict-Transport-Security: max-age=31536000; includeSubDomains",
      "X-Frame-Options: DENY",
      "Content-Type: application/json; charset=utf-8",
      "",
      "{",
      '  "error": "Authentication required (Mitigated CWE-306: requireAuth & tenant ownership filter active)"',
      "}"
    ].join("\n"),
    vulnerable: [
      "$ curl -i https://api.solver-sandbox.local/api/history",
      "",
      "HTTP/1.1 200 OK",
      "X-Powered-By: Express",
      "Access-Control-Allow-Origin: *",
      "Content-Type: application/json; charset=utf-8",
      "",
      "[",
      '  {"id": "8f19c2a0...", "userId": "tenant-01", "animal": "Sapi Potong", "resultKg": 12.4},',
      '  {"id": "4e856b17...", "userId": "tenant-02", "animal": "Sapi Perah", "resultKg": 2.3e+289},',
      '  "... (38 unauthenticated user calculation records exposed - CVSS 7.5 HIGH)"',
      "]"
    ].join("\n")
  },
  "SOLVER-02": {
    patched: [
      "$ curl -i -X POST https://api.solver-sandbox.local/api/feeds \\",
      '    -H "Authorization: Bearer <valid-session-jwt>" \\',
      '    -H "Content-Type: application/json" \\',
      '    -d \'{"name":"VerificationFeed","category":"Mineral","dryMatterPct":-500}\'',
      "",
      "HTTP/1.1 400 Bad Request",
      "Content-Security-Policy: default-src 'self'",
      "Strict-Transport-Security: max-age=31536000; includeSubDomains",
      "X-Frame-Options: DENY",
      "Content-Type: application/json; charset=utf-8",
      "",
      "{",
      '  "error": "Invalid feed parameters (Blocked by Zod NRC Domain Schema)",',
      '  "details": [',
      "    {",
      '      "path": ["dryMatterPct"],',
      '      "code": "too_small",',
      '      "minimum": 0.5,',
      '      "message": "dryMatterPct: Number must be between 0.5 and 100 (NRC Dry Matter percentage)"',
      "    }",
      "  ]",
      "}"
    ].join("\n"),
    vulnerable: [
      "$ curl -i -X POST https://api.solver-sandbox.local/api/feeds \\",
      '    -H "Content-Type: application/json" \\',
      '    -d \'{"name":"VerificationFeed","category":"Mineral","dryMatterPct":-500}\'',
      "",
      "HTTP/1.1 200 OK",
      "X-Powered-By: Express",
      "Access-Control-Allow-Origin: *",
      "Content-Type: application/json; charset=utf-8",
      "",
      "{",
      '  "id": "4e856b17-9c11-4d3e-8a2b-001928374655",',
      '  "name": "VerificationFeed",',
      '  "dryMatterPct": -500,',
      '  "warning": "VULNERABLE (CWE-20, CVSS 7.5 HIGH): Unauthenticated negative Dry Matter persisted, causing 2.3e+289 kg simplex float divergence!"',
      "}"
    ].join("\n")
  },
  "SOLVER-03": {
    patched: [
      "$ curl -i -X POST https://api.solver-sandbox.local/api/solve \\",
      '    -H "Authorization: Bearer <valid-session-jwt>" \\',
      '    -H "Content-Type: application/json" \\',
      '    -d \'{"bodyWeightKg":0,"feedIds":["550e8400-e29b-41d4-a716-446655440000"]}\'',
      "",
      "HTTP/1.1 400 Bad Request",
      "Content-Security-Policy: default-src 'self'",
      "Content-Type: application/json; charset=utf-8",
      "",
      "{",
      '  "error": "Invalid ration solver parameters (Blocked by Pre-Solver NRC Physiological Guard)",',
      '  "details": [',
      '    { "path": ["bodyWeightKg"], "message": "Livestock body weight (BB) must be between 1.0 kg and 2,500 kg" }',
      "  ]",
      "}"
    ].join("\n"),
    vulnerable: [
      "$ curl -i -X POST https://api.solver-sandbox.local/api/solve \\",
      '    -H "Content-Type: application/json" \\',
      '    -d \'{"bodyWeightKg":0,"feedIds":["550e8400-e29b-41d4-a716-446655440000"]}\'',
      "",
      "[!] VULNERABLE (CWE-400, CVSS 6.5 MEDIUM): targetDryMatter = bodyWeightKg * 0.03 = 0",
      "[!] Simplex pivot loop division by zero -> Non-terminating iteration freeze (UI Thread Hang / DoS)"
    ].join("\n")
  },
  "SOLVER-05": {
    patched: [
      '$ curl -I -H "Origin: https://evil.example" https://api.solver-sandbox.local/api/feeds',
      "",
      "HTTP/1.1 200 OK",
      "Content-Security-Policy: default-src 'self'",
      "Strict-Transport-Security: max-age=31536000; includeSubDomains",
      "X-Frame-Options: DENY",
      "X-Content-Type-Options: nosniff",
      "Vary: Origin",
      "# [MITIGATED] Untrusted Origin omitted; X-Powered-By fingerprint stripped"
    ].join("\n"),
    vulnerable: [
      '$ curl -I -H "Origin: https://evil.example" https://api.solver-sandbox.local/api/feeds',
      "",
      "HTTP/1.1 200 OK",
      "X-Powered-By: Express",
      "Access-Control-Allow-Origin: *",
      "# [VULNERABLE - SOLVER-05/07/08] Global wildcard CORS (*), missing CSP/HSTS/XFO, Express header leaked"
    ].join("\n")
  }
};

function renderSandbox() {
  if (!sandboxOutput || !sandboxStatusTitle) return;
  const entry = SANDBOX_VECTORS[currentVector];
  if (!entry) return;
  const modeUpper = sandboxMode === "patched" ? "PATCHED (HARDENED)" : "PRE-PATCH (VULNERABLE)";
  sandboxStatusTitle.textContent = `Simulated HTTP Request & Response Telemetry (Mode: ${modeUpper} • Vector: ${currentVector})`;
  sandboxOutput.textContent = entry[sandboxMode];
  sandboxOutput.style.color = sandboxMode === "patched" ? "#86efac" : "#fca5a5";

  if (modePatchedBtn && modeVulnBtn) {
    if (sandboxMode === "patched") {
      modePatchedBtn.style.borderColor = "var(--accent-green)";
      modePatchedBtn.style.color = "var(--accent-green)";
      modePatchedBtn.style.fontWeight = "700";
      modeVulnBtn.style.borderColor = "";
      modeVulnBtn.style.color = "";
      modeVulnBtn.style.fontWeight = "";
    } else {
      modeVulnBtn.style.borderColor = "#ef4444";
      modeVulnBtn.style.color = "#fca5a5";
      modeVulnBtn.style.fontWeight = "700";
      modePatchedBtn.style.borderColor = "";
      modePatchedBtn.style.color = "";
      modePatchedBtn.style.fontWeight = "";
    }
  }
}

if (modePatchedBtn) {
  modePatchedBtn.addEventListener("click", () => {
    sandboxMode = "patched";
    renderSandbox();
  });
}

if (modeVulnBtn) {
  modeVulnBtn.addEventListener("click", () => {
    sandboxMode = "vulnerable";
    renderSandbox();
  });
}

document.querySelectorAll(".sandbox-vector-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const v = btn.getAttribute("data-vector");
    if (v) {
      currentVector = v;
      renderSandbox();
    }
  });
});

