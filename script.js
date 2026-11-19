// Initialize Lucide Icons
if (window.lucide) {
  lucide.createIcons();
}

// Typing Effect in Hero (100% Consistent per Language)
const roles = {
  en: [
    "Security-Focused Software Engineer (Python / TypeScript)",
    "Application Security & Backend Automation Engineer",
    "Model Context Protocol (MCP) & CLI Tooling Developer",
    "Coordinated Vulnerability Disclosure (HackerOne @zeonmaltius)"
  ],
  id: [
    "Security-Focused Software Engineer (Python / TypeScript)",
    "Insinyur Keamanan Aplikasi & Otomasi Backend",
    "Pengembang Perkakas Model Context Protocol (MCP) & CLI",
    "Periset Keamanan Aplikasi (HackerOne @zeonmaltius)"
  ]
};

let currentLang = "en";
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingEl = document.getElementById("typingText");

function typeLoop() {
  const list = roles[currentLang];
  const currentText = list[roleIndex % list.length];

  if (!isDeleting) {
    typingEl.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentText.length) {
      isDeleting = true;
      setTimeout(typeLoop, 2400);
      return;
    }
  } else {
    typingEl.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % list.length;
    }
  }
  setTimeout(typeLoop, isDeleting ? 30 : 55);
}

typeLoop();

// Technical Verification Terminal
const terminalOutput = document.getElementById("terminalOutput");
const termCommands = {
  skills: {
    cmd: "cat core-stack.txt",
    resp: "[Backend & CLI] TypeScript, Node.js, Python 3, SQL/PostgreSQL\n[Web Frontend ] Next.js, React, HTML5, Tailwind CSS\n[AppSec & QA  ] OWASP Top 10, Burp Suite, Nuclei, Zod Schema Hardening\n[Protocols    ] Model Context Protocol (MCP), Android ADB, Chrome CDP"
  },
  bounty: {
    cmd: "cat disclosure-log.txt",
    resp: "[Policy ] Strictly Authorized Testing & Coordinated Disclosure\n[Profile] HackerOne (@zeonmaltius)\n[Recent ] 8 vulnerabilities disclosed in an authorized agricultural solver audit\n          (Unauthenticated history endpoint, missing schema bounds, CORS/CSP)"
  },
  contact: {
    cmd: "cat contact.txt",
    resp: "Portfolio : https://fatakarim.github.io\nLinkedIn  : https://www.linkedin.com/in/fata-fatikhul-karim\nGitHub    : https://github.com/fatakarim\nEmail     : fatafatikhul@gmail.com"
  }
};

document.querySelectorAll(".term-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-cmd");
    if (key === "clear") {
      terminalOutput.innerHTML = `<div class="term-line"><span class="term-prompt">$</span> <span class="term-cmd">clear</span></div>`;
      return;
    }
    const item = termCommands[key];
    if (!item) return;

    const line = document.createElement("div");
    line.className = "term-line";
    line.innerHTML = `<span class="term-prompt">$</span> <span class="term-cmd">${item.cmd}</span>`;

    const resp = document.createElement("div");
    resp.className = "term-resp";
    resp.style.whiteSpace = "pre-line";
    resp.textContent = item.resp;

    terminalOutput.appendChild(line);
    terminalOutput.appendChild(resp);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  });
});

// Copy Email to Clipboard
const copyEmailBtn = document.getElementById("copyEmailBtn");
const copyStatus = document.getElementById("copyStatus");

if (copyEmailBtn) {
  copyEmailBtn.addEventListener("click", () => {
    navigator.clipboard.writeText("fatafatikhul@gmail.com").then(() => {
      copyStatus.textContent = currentLang === "en" ? "✓ Copied!" : "✓ Tersalin!";
      setTimeout(() => {
        copyStatus.textContent = currentLang === "en" ? "(Click to copy)" : "(Klik untuk salin)";
      }, 2500);
    });
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

let lastScanReportMd = "";
let lastScannedDomain = "";

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
  scanDomainInput.value = domain;
  scanResultsBox.style.display = "block";
  scanTargetTitle.textContent = domain;
  scanSummaryText.textContent = "Querying passive DNS-over-HTTPS telemetry...";
  scanGradeBadge.textContent = "⏳";
  scanFindingsGrid.innerHTML = "";
  scanRawOutput.textContent = "[*] Querying Cloudflare DoH (A, AAAA, MX, NS, TXT, DMARC, CAA)...";

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
      desc: `Restricts SSL issuance: ${caaList.slice(0, 2).join(", ")}`
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
  scanGradeBadge.textContent = grade;
  scanGradeBadge.style.borderColor = badgeColor;
  scanGradeBadge.style.color = badgeColor;
  scanTargetTitle.textContent = `${domain} (Snapshot: ${todayUtc})`;
  scanSummaryText.textContent = `Passive DNS Posture Score: ${score}/100 (Grade ${grade}) • Nameservers: ${nsList.slice(0, 2).join(", ") || "N/A"}`;

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
  scanRawOutput.textContent = rawLines.join("\n");

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

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

// 100% Consistent Bilingual Dictionary (EN default / ID toggle)
const i18n = {
  en: {
    nav_projects: "Case Studies",
    nav_writeups: "Security Research",
    nav_exp: "Experience",
    nav_edu: "Education",
    nav_scanner: "DNS Audit Tool",
    nav_contact: "Contact",
    nav_resume: "Resume (PDF)",
    hero_status: "Open to Software Engineering & Application Security Roles",
    hero_desc:
      "Software Engineer focused on <strong>Backend &amp; Automation Systems (Node.js, TypeScript, Python)</strong> and <strong>Application Security (OWASP Top 10)</strong>. I design deterministic automation tools and audit web applications for business-logic and access-control vulnerabilities to build resilient, secure-by-design software.",
    btn_projects: "Engineering Case Studies",
    btn_cv: "Download ATS Resume (PDF)",
    stat_disclosed: "Vulnerabilities Disclosed (Authorized Audit)",
    stat_core: "Primary Backend & AppSec Stack",
    stat_proto: "System & Browser Protocol Tooling",
    term_hint: "Inspect engineering modules below:",
    proj_tag: "// ENGINEERING CASE STUDIES",
    proj_title: "Selected Systems & Security Tooling",
    proj_subtitle: "Architectural breakdowns covering problem statements, security guardrails, technical trade-offs, and source code.",
    wrt_tag: "// SECURITY RESEARCH & RCA",
    wrt_title: "Vulnerability Root-Cause Analysis & Engineering Notes",
    wrt_subtitle: "Technical deep-dives into authorized security assessments, vulnerable code patterns, and defensive remediation.",
    wrt_read: "Read Technical RCA & Patch",
    skills_tag: "// CORE COMPETENCIES",
    skills_title: "Focused Technical Stack",
    skills_subtitle: "Core technologies actively used in my production repositories and security assessments.",
    exp_tag: "// EXPERIENCE & RESEARCH",
    exp_title: "Security Research & Engineering Track",
    exp_subtitle: "Practical application security assessments and open-source software development.",
    edu_tag: "// EDUCATION & CREDENTIALS",
    edu_title: "Academic Background & Security Training",
    edu_subtitle: "Combining formal quantitative domain studies with rigorous, project-driven computer science and application security training.",
    scan_tag: "// PASSIVE DNS & ANTI-SPOOFING AUDITOR",
    scan_title: "Client-Side Domain Security Posture Analyzer",
    scan_subtitle: "Queries public Cloudflare DNS-over-HTTPS (DoH) telemetry directly from your browser to evaluate SPF, DMARC (_dmarc), CAA SSL restrictions, and IPv4/IPv6 redundancy.",
    scan_btn: "Analyze DNS Posture",
    scan_try: "Quick presets:",
    contact_tag: "// GET IN TOUCH",
    contact_title: "Connect for Engineering & Security Roles",
    contact_desc: "Available for Software Engineering, Backend Automation, and Application Security opportunities. Reach out directly via email or LinkedIn.",
    form_title: "Direct Email Composer",
    form_name: "Your Name / Organization",
    form_topic: "Subject",
    form_msg: "Message",
    form_submit: "Compose Email"
  },
  id: {
    nav_projects: "Studi Kasus",
    nav_writeups: "Riset Keamanan",
    nav_exp: "Pengalaman",
    nav_edu: "Pendidikan",
    nav_scanner: "Audit DNS",
    nav_contact: "Kontak",
    nav_resume: "CV (PDF)",
    hero_status: "Terbuka untuk Peran Software Engineering & Application Security",
    hero_desc:
      "Software Engineer yang berfokus pada <strong>Sistem Backend &amp; Otomasi (Node.js, TypeScript, Python)</strong> serta <strong>Application Security (OWASP Top 10)</strong>. Merancang perkakas otomasi deterministik dan mengaudit celah logika bisnis serta kontrol akses untuk membangun perangkat lunak yang aman sejak perancangan.",
    btn_projects: "Studi Kasus Engineering",
    btn_cv: "Unduh CV ATS (PDF)",
    stat_disclosed: "Celah Dilaporkan (Audit Berizin)",
    stat_core: "Stack Utama Backend & AppSec",
    stat_proto: "Perkakas Protokol Sistem & Browser",
    term_hint: "Periksa modul teknis di bawah ini:",
    proj_tag: "// STUDI KASUS ENGINEERING",
    proj_title: "Arsitektur Sistem & Perkakas Keamanan",
    proj_subtitle: "Bedah arsitektur meliputi rumusan masalah, batasan keamanan (security guardrails), keputusan teknis, dan kode sumber.",
    wrt_tag: "// RISET KEAMANAN & RCA",
    wrt_title: "Analisis Akar Masalah (Root-Cause Analysis) & Catatan Teknis",
    wrt_subtitle: "Pembahasan teknis mendalam atas asesmen keamanan berizin, pola kode rentan, dan implementasi mitigasi.",
    wrt_read: "Baca Analisis & Patch",
    skills_tag: "// KOMPETENSI INTI",
    skills_title: "Fokus Teknologi Utama",
    skills_subtitle: "Teknologi inti yang aktif digunakan pada repositori produksi dan pengujian keamanan saya.",
    exp_tag: "// PENGALAMAN & RISET",
    exp_title: "Rekam Jejak Riset Keamanan & Rekayasa",
    exp_subtitle: "Asesmen keamanan aplikasi praktis dan pengembangan perangkat lunak open-source.",
    edu_tag: "// PENDIDIKAN & KREDENSIAL",
    edu_title: "Latar Belakang Akademik & Pelatihan Keamanan",
    edu_subtitle: "Memadukan studi kuantitatif formal dengan pelatihan ilmu komputer dan keamanan aplikasi berbasis proyek.",
    scan_tag: "// AUDITOR DNS PASIF & ANTI-SPOOFING",
    scan_title: "Penganalisis Postur Keamanan Domain (Client-Side)",
    scan_subtitle: "Menjalankan kueri telemetri publik Cloudflare DNS-over-HTTPS (DoH) langsung dari browser untuk mengevaluasi SPF, DMARC, CAA SSL, dan redundansi IP.",
    scan_btn: "Analisis Postur DNS",
    scan_try: "Contoh cepat:",
    contact_tag: "// HUBUNGI SAYA",
    contact_title: "Terhubung untuk Peran Engineering & Keamanan",
    contact_desc: "Tersedia untuk peluang karier Software Engineering, Backend Automation, dan Application Security. Hubungi langsung melalui email atau LinkedIn.",
    form_title: "Kirim Email Langsung",
    form_name: "Nama / Perusahaan Anda",
    form_topic: "Subjek Keperluan",
    form_msg: "Pesan",
    form_submit: "Susun Email"
  }
};

const langToggle = document.getElementById("langToggle");
const langLabel = document.getElementById("langLabel");

if (langToggle) {
  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "id" : "en";
    langLabel.innerHTML = currentLang === "en" ? "<strong>EN</strong> | ID" : "EN | <strong>ID</strong>";
    document.documentElement.lang = currentLang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (i18n[currentLang][key]) {
        el.innerHTML = i18n[currentLang][key];
      }
    });
  });
}
