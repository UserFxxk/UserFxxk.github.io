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
    resp: "LinkedIn : linkedin.com/in/fata-fatikhul-karim-587567357\nGitHub   : github.com/UserFxxk\nEmail    : fatafatikhul@gmail.com"
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
    exp1_desc: "Melakukan pengujian penetrasi aplikasi web secara independen dan menganalisis celah keamanan berfokus pada standar <strong>OWASP Top 10</strong> (Broken Access Control/IDOR, XSS, SQLi, SSRF). Membangun workflow <em>reconnaissance</em> otomatis menggunakan Subfinder, Nuclei, dan Burp Suite.",
    exp2_role: "Full-Stack & AI Automation Developer",
    exp2_desc: "Merancang aplikasi web modern menggunakan Next.js, TypeScript, dan Node.js/NestJS. Mengembangkan jembatan otomatisasi berbasis <strong>Model Context Protocol (MCP)</strong> dengan 40+ tools untuk mengendalikan Android via ADB & Chrome CDP, serta membangun bot WhatsApp berbasis Google Gemini AI.",
    exp3_role: "Open Source Builder & Linux Security Tooling",
    exp3_desc: "Bereksperimen dengan sistem operasi Kali Linux & Arch Linux, kustomisasi agen LLM berbasis Go (Scorp), serta pembuatan perkakas jaringan asinkron menggunakan Python.",
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
    proj4_desc: "Rangkaian skrip Python asinkron dan pipeline Nuclei/Subfinder untuk memetakan permukaan serangan (attack surface), menguji ketahanan server, serta mengidentifikasi celah OWASP Top 10 secara efisien.",
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
    exp1_desc: "Conducting independent web application penetration testing and vulnerability research focused on <strong>OWASP Top 10</strong> (IDOR, XSS, SQLi, SSRF). Building automated reconnaissance pipelines with Subfinder, Nuclei, and Burp Suite.",
    exp2_role: "Full-Stack & AI Automation Developer",
    exp2_desc: "Engineering modern web apps with Next.js, TypeScript, and Node.js/NestJS. Created a 40+ tool <strong>Model Context Protocol (MCP)</strong> bridge for Android ADB & Chrome CDP automation, plus Gemini AI WhatsApp assistants.",
    exp3_role: "Open Source Builder & Linux Security Tooling",
    exp3_desc: "Experimenting with Kali & Arch Linux environments, Go-based LLM system agents (Scorp), and asynchronous Python network benchmarking utilities.",
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
    proj4_desc: "Asynchronous Python scripts and Nuclei/Subfinder pipelines to map attack surfaces, benchmark server resilience, and detect OWASP Top 10 flaws.",
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
