// Initialize Lucide Icons
if (window.lucide) {
  lucide.createIcons();
}

// Typing Effect in Hero
const roles = {
  id: [
    "Full-Stack Developer | Bug Bounty Hunter",
    "Application Security Researcher (OWASP Top 10)",
    "AI & MCP Automation Builder",
    "Build it right, break it better 🚀🔒"
  ],
  en: [
    "Full-Stack Developer | Bug Bounty Hunter",
    "Application Security Researcher (OWASP Top 10)",
    "AI & MCP Automation Engineer",
    "Build it right, break it better 🚀🔒"
  ]
};

let currentLang = "id";
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
      setTimeout(typeLoop, 2200);
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
  setTimeout(typeLoop, isDeleting ? 35 : 65);
}

typeLoop();

// Interactive Mini Terminal
const terminalOutput = document.getElementById("terminalOutput");
const termCommands = {
  skills: {
    cmd: "./show-stack.sh",
    resp: "[+] Frontend: Next.js, TypeScript, Tailwind CSS\n[+] Backend : Node.js, Python, NestJS, Go, PostgreSQL, Redis\n[+] Security: Burp Suite, Nuclei, Subfinder, Nmap, SQLMap, Kali/Arch"
  },
  bounty: {
    cmd: "./bug-bounty.sh",
    resp: "[*] Target Platform : HackerOne (@zeonmaltius)\n[*] Focus Vectors   : Broken Access Control, XSS, SQLi, SSRF, Recon\n[*] Status          : Ready for Security Assessment & Code Audit"
  },
  contact: {
    cmd: "./contact.sh",
    resp: "Portfolio: https://userfxxk.github.io\nLinkedIn : linkedin.com/in/fata-fatikhul-karim\nGitHub   : github.com/UserFxxk\nEmail    : fatafatikhul@gmail.com"
  }
};

document.querySelectorAll(".term-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-cmd");
    if (key === "clear") {
      terminalOutput.innerHTML = `<div class="term-line"><span class="term-prompt">fata@secdev:~$</span> <span class="term-cmd">clear</span></div>`;
      return;
    }
    const item = termCommands[key];
    if (!item) return;

    const line = document.createElement("div");
    line.className = "term-line";
    line.innerHTML = `<span class="term-prompt">fata@secdev:~$</span> <span class="term-cmd">${item.cmd}</span>`;

    const resp = document.createElement("div");
    resp.className = "term-resp";
    resp.style.whiteSpace = "pre-line";
    resp.textContent = item.resp;

    terminalOutput.appendChild(line);
    terminalOutput.appendChild(resp);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  });
});

// Skill Tabs Filter
const tabBtns = document.querySelectorAll(".tab-btn");
const skillCards = document.querySelectorAll(".skill-card");

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.getAttribute("data-filter");
    skillCards.forEach((card) => {
      if (filter === "all" || card.getAttribute("data-category") === filter) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// Service CTA Auto-Select Topic in Contact Form
const inquirySelect = document.getElementById("inquiryType");
document.querySelectorAll(".service-cta").forEach((link) => {
  link.addEventListener("click", () => {
    const serviceName = link.getAttribute("data-service");
    if (inquirySelect && serviceName) {
      inquirySelect.value = serviceName;
    }
  });
});

// Copy Email to Clipboard
const copyEmailBtn = document.getElementById("copyEmailBtn");
const copyStatus = document.getElementById("copyStatus");

if (copyEmailBtn) {
  copyEmailBtn.addEventListener("click", () => {
    navigator.clipboard.writeText("fatafatikhul@gmail.com").then(() => {
      copyStatus.textContent = "✓ Email Tersalin!";
      setTimeout(() => {
        copyStatus.textContent = "(Klik untuk salin)";
      }, 2500);
    });
  });
}

// Quick Contact Form Submit -> Opens Pre-filled Email
const quickForm = document.getElementById("quickContactForm");
if (quickForm) {
  quickForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("senderName").value.trim();
    const topic = document.getElementById("inquiryType").value;
    const msg = document.getElementById("senderMsg").value.trim();

    const subject = encodeURIComponent(`[Portfolio Inquiry] ${topic} — dari ${name}`);
    const body = encodeURIComponent(`Halo Fata,\n\nSaya ${name}.\nKeperluan: ${topic}\n\n${msg}\n\nSalam,\n${name}`);
    window.location.href = `mailto:fatafatikhul@gmail.com?subject=${subject}&body=${body}`;
  });
}

// Live Domain Recon & Anti-Spoofing Scanner (Cloudflare DoH JSON API)
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
  try {
    const res = await fetch(url, { headers: { Accept: "application/dns-json" } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.Answer || [];
  } catch (e) {
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
  scanSummaryText.textContent = "Memindai telemetri DNS & kebijakan anti-spoofing secara real-time...";
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

  // 1. Host Resolution & IPv4/IPv6
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
      desc: "Tidak ditemukan A record aktif pada domain utama."
    });
  }

  // 2. SPF Anti-Spoofing Audit
  if (spfRecord) {
    if (spfRecord.includes("-all")) {
      score += 25;
      checks.push({
        title: "SPF Anti-Spoofing Policy",
        status: "STRICT (-all)",
        pill: "pill-pass",
        desc: `Hardfail aktif: ${spfRecord.slice(0, 75)}`
      });
    } else if (spfRecord.includes("~all")) {
      score += 18;
      checks.push({
        title: "SPF Anti-Spoofing Policy",
        status: "SOFTFAIL (~all)",
        pill: "pill-warn",
        desc: `Softfail (~all) terdeteksi. Disarankan menggunakan -all.`
      });
    } else {
      score += 5;
      checks.push({
        title: "SPF Anti-Spoofing Policy",
        status: "WEAK",
        pill: "pill-fail",
        desc: `SPF ditemukan tanpa pembatasan ketat (-all/~all). Rentan email spoofing!`
      });
    }
  } else {
    checks.push({
      title: "SPF Anti-Spoofing Policy",
      status: "MISSING",
      pill: "pill-fail",
      desc: "Tidak ada TXT record v=spf1. Domain berisiko dipalsukan (Email Spoofing)."
    });
  }

  // 3. DMARC Policy Audit
  if (dmarcRecord) {
    const low = dmarcRecord.toLowerCase();
    if (low.includes("p=reject")) {
      score += 30;
      checks.push({
        title: "DMARC Enforcement (_dmarc)",
        status: "REJECT (Strong)",
        pill: "pill-pass",
        desc: `Proteksi penuh (p=reject): ${dmarcRecord.slice(0, 75)}`
      });
    } else if (low.includes("p=quarantine")) {
      score += 22;
      checks.push({
        title: "DMARC Enforcement (_dmarc)",
        status: "QUARANTINE",
        pill: "pill-pass",
        desc: `Proteksi aktif (p=quarantine): ${dmarcRecord.slice(0, 75)}`
      });
    } else {
      score += 10;
      checks.push({
        title: "DMARC Enforcement (_dmarc)",
        status: "MONITOR ONLY (p=none)",
        pill: "pill-warn",
        desc: `DMARC hanya memantau (p=none), belum memblokir email palsu.`
      });
    }
  } else {
    checks.push({
      title: "DMARC Enforcement (_dmarc)",
      status: "MISSING",
      pill: "pill-fail",
      desc: "Record _dmarc tidak ditemukan! Kombinasikan dengan SPF untuk mencegah phishing."
    });
  }

  // 4. SSL Certificate Authority Authorization (CAA)
  if (caaList.length > 0) {
    score += 15;
    checks.push({
      title: "SSL CAA Restriction",
      status: "ENFORCED",
      pill: "pill-pass",
      desc: `Membatasi penerbit sertifikat SSL: ${caaList.slice(0, 2).join(", ")}`
    });
  } else {
    checks.push({
      title: "SSL CAA Restriction",
      status: "NOT SET",
      pill: "pill-warn",
      desc: "CAA record belum dipasang (opsional untuk membatasi CA penerbit SSL)."
    });
  }

  // Compute Letter Grade
  let grade = "C";
  let badgeColor = "#fbbf24";
  if (score >= 85) { grade = "A+"; badgeColor = "#10b981"; }
  else if (score >= 70) { grade = "A"; badgeColor = "#10b981"; }
  else if (score >= 55) { grade = "B"; badgeColor = "#38bdf8"; }
  else if (score < 35) { grade = "D"; badgeColor = "#ef4444"; }

  scanGradeBadge.textContent = grade;
  scanGradeBadge.style.borderColor = badgeColor;
  scanGradeBadge.style.color = badgeColor;
  scanSummaryText.textContent = `Security Posture Score: ${score}/100 • Nameservers: ${nsList.slice(0, 2).join(", ") || "N/A"}`;

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
    `[+] Security Score: ${score}/100 (Grade ${grade})`,
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
    `# 🛡️ Live Domain Recon & Security Report: \`${domain}\``,
    `- **Generated via:** Fata Fatikhul Karim Interactive Portfolio (https://userfxxk.github.io)`,
    `- **Security Posture Score:** ${score}/100 (**Grade ${grade}**)`,
    ``,
    `## 1. Security Posture Checks`,
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
    a.download = `fata_recon_${lastScannedDomain.replace(/\./g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Article Reader Modal Logic
const articles = {
  idor: {
    tag: "REAL-WORLD SECURITY AUDIT • 8 VULNERABILITIES DISCLOSED",
    title: "Studi Kasus Audit Nyata: 8 Temuan Kerentanan pada Web App Kalkulator/Solver Ransum Ternak",
    body: `
      <p><strong>Konteks Audit (Redacted Target):</strong> Menggabungkan latar belakang saya di bidang <em>D3 Budidaya Ternak (Fakultas Peternakan UNSOED)</em> dan <em>Application Security</em>, saya melakukan pengujian menyeluruh terhadap sebuah aplikasi web formulasi ransum pakan ternak berbasis Express.js. Hasilnya: ditemukan <strong>8 celah keamanan & logika bisnis (3 High, 4 Medium, 1 Low)</strong> yang seluruhnya berhasil direproduksi dan dilaporkan secara bertanggung jawab (<em>Responsible Disclosure</em>).</p>
      <h4>1. Ringkasan 8 Temuan Kerentanan</h4>
      <pre>[HIGH #1] Client & Solver DoS (Unbounded Input)
  ↳ Input Berat Badan (BB) diisi 0 atau negatif membuat kalkulator solver hang total (infinite loop/freeze).

[HIGH #2] Unvalidated Backend Mutation & Database Corruption
  ↳ Endpoint POST /api/feeds menerima nilai Dry Matter (DM) -500% -> HTTP 200 OK.
  ↳ Memicu perhitungan rusak permanen di database publik (tercatat sapi 2.3e+289 kg!).

[HIGH #3] Broken Access Control / Unauthenticated Data Exposure
  ↳ Endpoint GET /api/history dapat diakses tanpa login, membocorkan 38 record riwayat milik pengguna lain.

[MEDIUM #4] Unauthenticated Database Pollution
  ↳ Database bahan pakan dapat ditulis siapa saja tanpa autentikasi (ditemukan entri "plastik" pada kategori Mineral).

[MEDIUM #5–#7] Misconfiguration (CORS, Cookie, & Headers)
  ↳ CORS Wildcard (*) global, Cookie SameSite=None + wildcard domain, serta absennya CSP, HSTS, & X-Frame-Options.

[LOW #8] Tech Stack Fingerprinting
  ↳ Header x-powered-by: Express terekspos secara default.</pre>
      <h4>2. Rekomendasi Mitigasi (Remediation) yang Diberikan</h4>
      <pre>// ✅ 1. Validasi Skema Input Ketat di Backend (Zod / Joi)
const FeedSchema = z.object({
  name: z.string().min(2).max(80),
  dryMatterPct: z.number().min(0.1).max(100), // Tolak angka negatif / >100%
  bodyWeightKg: z.number().positive().max(2500) // Cegah Solver DoS & Float Overflow
});

// ✅ 2. Proteksi Endpoint Riwayat dengan Auth + Ownership Filter
app.get('/api/history', requireAuth, async (req, res) => {
  const records = await db.history.findMany({ where: { userId: req.user.id } });
  return res.json(records);
});</pre>
      <p><strong>Pelajaran Penting:</strong> Validasi di sisi <em>frontend</em> saja tidak pernah cukup. Menggabungkan pemahaman domain bisnis (batas biologis berat ternak & persentase nutrisi) dengan pengujian keamanan <em>backend</em> mampu mengungkap celah fatal yang sering terlewat oleh <em>scanner</em> otomatis.</p>
    `
  },
  mcp: {
    tag: "AI ENGINEERING • MODEL CONTEXT PROTOCOL",
    title: "Arsitektur MCP Bridge: Menghubungkan AI Agent ke Perangkat Android Fisik & Stealth Browser",
    body: `
      <p><strong>Latar Belakang:</strong> Large Language Models (LLM) memiliki kemampuan penalaran tinggi, namun terisolasi dari perangkat fisik. Dengan membangun server <strong>Model Context Protocol (MCP)</strong> di Node.js, kita dapat mengekspos 40+ tool eksekusi kepada AI Agent seperti Claude Desktop, Cursor, atau OpenCode.</p>
      <h4>1. Alur Komunikasi Sistem</h4>
      <pre>[AI Agent / LLM] ⇄ (JSON-RPC stdio) ⇄ [Node.js MCP Server]
                                           ├──► Android Bridge (ADB Wireless :5555)
                                           └──► Browser Bridge (Chromium CDP :9223)</pre>
      <h4>2. Teknik Pembacaan Layar & Aksi Presisi</h4>
      <p>Alih-alih mengandalkan koordinat layar statis yang mudah meleset saat ukuran layar berubah, modul Android MCP memanggil <code>uiautomator dump</code> untuk mengekstrak pohon elemen XML (<em>Accessibility Tree</em>), menghitung titik tengah <code>bounds="[x1,y1][x2,y2]"</code>, lalu mengeksekusi <code>input tap</code> secara akurat berdasarkan teks tombol atau <code>resource-id</code>.</p>
      <p>👉 <strong>Source Code Lengkap:</strong> <a href="https://github.com/UserFxxk/android-browser-mcp" target="_blank" style="color:#34d399;">github.com/UserFxxk/android-browser-mcp</a></p>
    `
  },
  recon: {
    tag: "BUG BOUNTY WORKFLOW • RECONNAISSANCE",
    title: "Pipeline Reconnaissance Otomatis dengan Subfinder, Nuclei & Python Asyncio",
    body: `
      <p><strong>Strategi Bug Hunting:</strong> Kecepatan dan ketelitian memetakan permukaan serangan (<em>attack surface</em>) sangat menentukan keberhasilan menemukan celah sebelum peneliti lain.</p>
      <h4>1. Tahapan Pipeline Otomatis</h4>
      <pre># 1. Subdomain Enumeration pasif & cepat
subfinder -d target.com -all -silent | anew subdomains.txt

# 2. Probing host aktif & deteksi teknologi web
cat subdomains.txt | httpx -silent -tech-detect -status-code -o live_hosts.txt

# 3. Pemindaian terarah menggunakan template Nuclei
nuclei -l live_hosts.txt -tags cve,misconfig,exposure -severity medium,high,critical</pre>
      <h4>2. Pengujian Ketahanan & Custom Probing dengan Python Asyncio</h4>
      <p>Untuk menguji batas <em>rate-limiting</em> dan perilaku respons server di bawah beban konkurensi tinggi, saya membangun engine berbasis <code>asyncio</code> dan raw SSL socket di Python yang mampu memantau distribusi latensi serta kode status HTTP secara <em>real-time</em> dari lingkungan Linux/Termux.</p>
    `
  }
};

const articleModal = document.getElementById("articleModal");
const modalTag = document.getElementById("modalTag");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const closeModalBtn = document.getElementById("closeModalBtn");

document.querySelectorAll(".writeup-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-article");
    const data = articles[key];
    if (!data) return;
    modalTag.textContent = data.tag;
    modalTitle.textContent = data.title;
    modalBody.innerHTML = data.body;
    articleModal.classList.add("open");
  });
});

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    articleModal.classList.remove("open");
  });
}

if (articleModal) {
  articleModal.addEventListener("click", (e) => {
    if (e.target === articleModal) {
      articleModal.classList.remove("open");
    }
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

// Bilingual Dictionary (ID / EN)
const i18n = {
  id: {
    nav_about: "Tentang",
    nav_exp: "Pengalaman",
    nav_services: "Layanan",
    nav_skills: "Keahlian",
    nav_projects: "Proyek",
    nav_writeups: "Writeups",
    nav_contact: "Kontak",
    hero_status: "Available for Full-Time, Freelance & Security Audits",
    hero_desc:
      "Seorang <strong>Software Developer</strong> yang gemar membangun <em>daily tools & AI automation</em>, sekaligus <strong>Bug Bounty Hunter</strong> di waktu luang. Saya percaya bahwa memahami cara kerja serangan membuat kita menjadi developer yang jauh lebih tangguh.",
    btn_projects: "Lihat Karya Saya",
    btn_cv: "Lihat / Cetak CV (PDF)",
    stat_tools: "Tech & Sec Tools",
    stat_sec: "Top 10 Focused",
    stat_fuel: "MCP Automation Tools",
    term_hint: "Klik tombol di bawah untuk menjalankan perintah:",
    about_tag: "// TENTANG SAYA",
    about_title: "Menggabungkan Rekayasa Perangkat Lunak & Keamanan Siber",
    about_subtitle: "Siapa yang tahu cara melindungi sistem, harus memahami bagaimana sistem tersebut diuji.",
    pillar1_title: "Full-Stack Web Development",
    pillar1_desc: "Membangun aplikasi web modern yang cepat, skalabel, dan bersih menggunakan ekosistem Next.js, TypeScript, Tailwind CSS, Node.js, dan NestJS.",
    pillar2_title: "Application Security & Bug Bounty",
    pillar2_desc: "Aktif berburu kerentanan keamanan di HackerOne. Berfokus pada analisis OWASP Top 10, reconnaissance otomatis, dan penerapan Secure SDLC.",
    pillar3_title: "Daily Tools & AI Automation",
    pillar3_desc: "Menciptakan perkakas otomatisasi berbasis CLI, Model Context Protocol (MCP), integrasi LLM (Gemini/OpenAI), serta bot produktivitas cerdas.",
    exp_tag: "// REKAM JEJAK",
    exp_title: "Pengalaman Kerja & Riset Keamanan",
    exp_subtitle: "Perjalanan saya dalam membangun produk digital, otomasi AI, dan menguji keamanan aplikasi.",
    exp1_role: "Independent Security Researcher (Bug Bounty Hunter)",
    exp1_desc: "Melakukan pengujian penetrasi aplikasi web secara independen dan menganalisis celah keamanan berfokus pada <strong>OWASP Top 10</strong> serta logika bisnis. Berhasil menemukan & melaporkan secara bertanggung jawab <strong>8 kerentanan nyata (3 High, 4 Medium, 1 Low)</strong> pada aplikasi web solver formulasi pakan.",
    exp2_role: "Full-Stack & AI Automation Developer",
    exp2_desc: "Merancang aplikasi web modern menggunakan Next.js, TypeScript, dan Node.js/NestJS. Mengembangkan jembatan otomatisasi berbasis <strong>Model Context Protocol (MCP)</strong> dengan 40+ tools untuk mengendalikan Android via ADB & Chrome CDP, serta membangun bot WhatsApp berbasis Google Gemini AI.",
    exp3_role: "100% Self-Taught Engineer & Mahasiswa Aktif UNSOED",
    exp3_desc: "Mempelajari seluruh keahlian <strong>Software Engineering, Linux (Kali/Arch), AI Automation, dan Cybersecurity secara otodidak dari nol</strong> di sela-sela kuliah D3 Budidaya Ternak (Fakultas Peternakan) di Universitas Jenderal Soedirman (UNSOED). Kombinasi unik antara logika sains dan rekayasa keamanan siber ini terbukti menjadi keunggulan tersendiri saat membedah celah logika bisnis maupun arsitektur backend.",
    srv_tag: "// LAYANAN PROFESIONAL",
    srv_title: "Solusi yang Bisa Saya Bantu",
    srv_subtitle: "Tersedia untuk rekrutmen perusahaan (Full-Time/Remote) maupun proyek lepas (Freelance).",
    srv1_title: "Web Application Development",
    srv1_desc: "Pembuatan website profesional, dashboard bisnis, hingga aplikasi web full-stack kustom dengan performa tinggi, desain responsif, dan arsitektur kode yang bersih.",
    srv2_title: "AI Agent, MCP & Bot Automation",
    srv2_desc: "Otomatisasi alur kerja repetitif bisnis Anda menggunakan integrasi Large Language Model (Gemini/OpenAI), bot WhatsApp pintar, dan otomasi browser/Android.",
    srv3_title: "Web Security Audit & Pentesting",
    srv3_desc: "Pengujian keamanan menyeluruh terhadap website atau API Anda sebelum rilis publik untuk menemukan celah keamanan dan mencegah kebocoran data.",
    srv_cta: "Diskusikan Proyek",
    skills_tag: "// ARSENAL TEKNOLOGI",
    skills_title: "Tech Stack & Security Arsenal",
    skills_subtitle: "Teknologi yang saya gunakan sehari-hari untuk membangun aplikasi dan menguji keamanannya.",
    tab_all: "Semua",
    proj_tag: "// PORTOFOLIO KARYA",
    proj_title: "Proyek Pilihan & Eksperimen",
    proj_subtitle: "Kombinasi pengembangan perangkat lunak, integrasi AI, dan peralatan riset keamanan.",
    proj1_desc: "Server Model Context Protocol (MCP) berbasis Node.js yang memungkinkan AI Agent (Claude/Cursor/OpenCode) mengendalikan perangkat Android fisik via ADB wireless & Chrome CDP dengan 40+ tool otomatisasi.",
    proj2_desc: "Bot asisten cerdas WhatsApp berbasis multi-file auth state menggunakan library Baileys dan Google GenAI SDK untuk otomasi balasan kontekstual dan eksekusi tugas harian secara real-time.",
    proj3_desc: "Eksplorasi & kustomisasi agen biner Go berukuran ringkas yang menjembatani Large Language Models langsung ke sistem operasi — meliputi shell, manajemen file, jaringan, dan analisis kode.",
    proj4_desc: "Perkakas CLI Python zero-dependency untuk audit Security Headers (CSP/HSTS/XFO), inspeksi misconfiguration CORS & Cookie, enumerasi subdomain pasif via crt.sh CT Logs, dan pemindaian endpoint API konkuren lengkap dengan generator laporan Markdown otomatis.",
    sec_title: 'Pendekatan "Secure by Design"',
    sec_desc: 'Sebagai developer yang juga aktif di <strong>HackerOne (@zeonmaltius)</strong>, saya menerapkan siklus pengujian keamanan di setiap baris kode yang saya tulis:',
    sec_item1: "<strong>Reconnaissance & Surface Mapping:</strong> Pemetaan subdomain, endpoint API, dan konfigurasi server dengan Subfinder & Shodan.",
    sec_item2: "<strong>Vulnerability Discovery:</strong> Analisis celah Broken Access Control (IDOR), XSS, SQL Injection, dan SSRF menggunakan Burp Suite & Nuclei.",
    sec_item3: "<strong>Remediation & Hardening:</strong> Menulis patch yang aman, validasi input ketat, dan pembatasan rate-limit pada arsitektur backend.",
    contact_tag: "// MARI TERHUBUNG",
    contact_title: "Siap Berkolaborasi dalam Proyek Berikutnya?",
    contact_desc: "Tertarik merekrut saya, berdiskusi tentang pengembangan web, otomasi AI, atau pengujian keamanan aplikasi? Kirim pesan langsung atau hubungi lewat kanal di bawah ini.",
    form_title: "Kirim Pesan Cepat",
    form_name: "Nama / Perusahaan",
    form_topic: "Topik Keperluan",
    form_msg: "Pesan Singkat",
    form_submit: "Kirim via Email Sekarang"
  },
  en: {
    nav_about: "About",
    nav_exp: "Experience",
    nav_services: "Services",
    nav_skills: "Skills",
    nav_projects: "Projects",
    nav_writeups: "Writeups",
    nav_contact: "Contact",
    hero_status: "Available for Full-Time, Freelance & Security Audits",
    hero_desc:
      "A <strong>Software Developer</strong> passionate about building <em>daily tools & AI automation</em>, and a <strong>Bug Bounty Hunter</strong> in my spare time. I believe understanding how attacks work makes us far more resilient developers.",
    btn_projects: "View My Work",
    btn_cv: "View / Print CV (PDF)",
    stat_tools: "Tech & Sec Tools",
    stat_sec: "Top 10 Focused",
    stat_fuel: "MCP Automation Tools",
    term_hint: "Click a button below to execute a command:",
    about_tag: "// ABOUT ME",
    about_title: "Bridging Software Engineering & Cybersecurity",
    about_subtitle: "Those who know how to defend a system must understand how it can be broken.",
    pillar1_title: "Full-Stack Web Development",
    pillar1_desc: "Building fast, scalable, and clean web applications using Next.js, TypeScript, Tailwind CSS, Node.js, and NestJS.",
    pillar2_title: "Application Security & Bug Bounty",
    pillar2_desc: "Actively hunting security vulnerabilities on HackerOne. Focused on OWASP Top 10 analysis, automated reconnaissance, and Secure SDLC.",
    pillar3_title: "Daily Tools & AI Automation",
    pillar3_desc: "Creating CLI automation utilities, Model Context Protocol (MCP) bridges, LLM integrations (Gemini/OpenAI), and intelligent bots.",
    exp_tag: "// TRACK RECORD",
    exp_title: "Experience & Security Research",
    exp_subtitle: "My journey in building digital products, AI automation, and testing application security.",
    exp1_role: "Independent Security Researcher (Bug Bounty Hunter)",
    exp1_desc: "Conducting independent web application penetration testing focused on <strong>OWASP Top 10</strong> and business logic flaws. Discovered and responsibly disclosed <strong>8 real-world vulnerabilities (3 High, 4 Medium, 1 Low)</strong> in a livestock feed formulation solver web app.",
    exp2_role: "Full-Stack & AI Automation Developer",
    exp2_desc: "Engineering modern web apps with Next.js, TypeScript, and Node.js/NestJS. Created a 40+ tool <strong>Model Context Protocol (MCP)</strong> bridge for Android ADB & Chrome CDP automation, plus Gemini AI WhatsApp assistants.",
    exp3_role: "100% Self-Taught Engineer & UNSOED Student",
    exp3_desc: "Mastered <strong>Software Engineering, Linux (Kali/Arch), AI Automation, and Cybersecurity 100% self-taught from scratch</strong> while studying Animal Science at Universitas Jenderal Soedirman (UNSOED) — bridging domain logic with deep technical security analysis.",
    srv_tag: "// PROFESSIONAL SERVICES",
    srv_title: "How I Can Help You",
    srv_subtitle: "Available for full-time/remote engineering roles as well as freelance engagements.",
    srv1_title: "Web Application Development",
    srv1_desc: "Custom full-stack web apps, business dashboards, and high-converting landing pages engineered for speed, scalability, and clean code.",
    srv2_title: "AI Agent, MCP & Bot Automation",
    srv2_desc: "Automate repetitive business workflows using LLM integrations (Gemini/OpenAI), smart WhatsApp bots, and headless browser/Android automation.",
    srv3_title: "Web Security Audit & Pentesting",
    srv3_desc: "Comprehensive pre-release security testing for your web apps and APIs to uncover vulnerabilities and prevent data breaches.",
    srv_cta: "Discuss Project",
    skills_tag: "// TECH ARSENAL",
    skills_title: "Tech Stack & Security Arsenal",
    skills_subtitle: "Technologies I use daily to build applications and test their security posture.",
    tab_all: "All",
    proj_tag: "// FEATURED WORK",
    proj_title: "Selected Projects & Experiments",
    proj_subtitle: "A blend of software engineering, AI agent integration, and security research tools.",
    proj1_desc: "Node.js Model Context Protocol (MCP) server enabling AI Agents (Claude/Cursor/OpenCode) to control physical Android devices via wireless ADB & Chrome CDP with 40+ automation tools.",
    proj2_desc: "Intelligent WhatsApp assistant bot built with Baileys multi-file auth state and Google GenAI SDK for real-time contextual replies and task automation.",
    proj3_desc: "Exploration & customization of a tiny Go binary agent that connects Large Language Models directly to the OS — covering shell, filesystem, network, and code.",
    proj4_desc: "Zero-dependency Python CLI suite for Security Header auditing (CSP/HSTS/XFO), CORS & Cookie misconfiguration inspection, passive subdomain enumeration via crt.sh CT logs, concurrent API endpoint probing, and automated Markdown report generation.",
    sec_title: '"Secure by Design" Approach',
    sec_desc: 'As a developer active on <strong>HackerOne (@zeonmaltius)</strong>, I integrate security testing into every stage of development:',
    sec_item1: "<strong>Reconnaissance & Surface Mapping:</strong> Subdomain enumeration, API endpoint discovery, and asset analysis with Subfinder & Shodan.",
    sec_item2: "<strong>Vulnerability Discovery:</strong> Assessing Broken Access Control (IDOR), XSS, SQL Injection, and SSRF using Burp Suite & Nuclei.",
    sec_item3: "<strong>Remediation & Hardening:</strong> Writing secure patches, strict input validation, and backend rate-limiting architecture.",
    contact_tag: "// LET'S CONNECT",
    contact_title: "Ready to Collaborate on Your Next Project?",
    contact_desc: "Interested in hiring me, discussing web development, AI automation, or application security testing? Send a quick message or reach out via the channels below.",
    form_title: "Send a Quick Message",
    form_name: "Your Name / Company",
    form_topic: "Inquiry Topic",
    form_msg: "Short Message",
    form_submit: "Send via Email Now"
  }
};

const langToggle = document.getElementById("langToggle");
const langLabel = document.getElementById("langLabel");

langToggle.addEventListener("click", () => {
  currentLang = currentLang === "id" ? "en" : "id";
  langLabel.textContent = currentLang.toUpperCase();

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (i18n[currentLang][key]) {
      el.innerHTML = i18n[currentLang][key];
    }
  });
});
