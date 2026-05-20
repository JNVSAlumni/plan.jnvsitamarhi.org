/* =====================================================================
   PathFinder India — App logic
   ===================================================================== */

// ---------- Utilities ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) node.setAttribute(k, v);
  });
  children.flat().forEach((c) => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
};

// ---------- Nav toggle ---------- (consolidated into bottom block; see "Mobile nav toggle")

// ---------- Hero stats ----------
$("#statStreams").textContent = STREAMS.length;
$("#statCareers").textContent = CAREERS.length + "+";
$("#statExams").textContent = EXAMS.length + "+";

// ---------- Streams ----------
const streamGrid = $("#streamGrid");
STREAMS.forEach((s) => {
  const card = el(
    "div",
    { class: "stream-card", "data-id": s.id, onclick: () => openStreamModal(s.id) },
    el("div", { class: "icon", style: `background: ${s.color}14; color: ${s.color};` }, s.icon),
    el("h3", {}, s.name),
    el("p", { class: "tagline" }, s.tagline),
    el("div", { class: "label" }, "Top Pathways"),
    el("ul", {}, ...s.chips.slice(0, 5).map((c) => el("li", {}, c))),
    el("div", { class: "more" }, "Explore in depth", el("span", {}, "→"))
  );
  streamGrid.appendChild(card);
});

// ---------- Stream filter dropdown ----------
const filterStream = $("#filterStream");
STREAMS.forEach((s) => filterStream.appendChild(el("option", { value: s.id }, s.name)));

// ---------- Courses ----------
const courseGrid = $("#courseGrid");
const noResults = $("#noResults");

function renderCourses() {
  const q = $("#searchInput").value.trim().toLowerCase();
  const stream = filterStream.value;
  const dur = $("#filterDuration").value;
  const entrance = $("#filterEntrance").value;

  courseGrid.innerHTML = "";
  const filtered = COURSES.filter((c) => {
    if (stream && c.stream !== stream) return false;
    if (dur && c.durBucket !== dur) return false;
    if (entrance && c.entrance !== entrance) return false;
    if (q) {
      const hay = [
        c.name, c.desc, ...(c.exams || []), ...(c.careers || []),
        ...(c.colleges || []), c.eligibility || "",
      ].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  noResults.hidden = filtered.length !== 0;

  filtered.forEach((c) => {
    const streamObj = STREAMS.find((s) => s.id === c.stream);
    const card = el(
      "div",
      { class: "course-card", onclick: () => openCourseModal(c.id) },
      el("span", { class: "badge" }, streamObj ? streamObj.name : "Course"),
      el("h3", {}, c.name),
      el(
        "div",
        { class: "meta" },
        el("span", {}, c.duration),
        el("span", {}, c.entrance === "yes" ? "Entrance required" : "Direct admission")
      ),
      el("p", { class: "desc" }, c.desc),
      el("div", { class: "careers-label" }, "Top Careers"),
      el("ul", { class: "careers-list" }, ...c.careers.slice(0, 3).map((x) => el("li", {}, x))),
      el("div", { class: "view-more" }, "View full details", el("span", {}, "→"))
    );
    courseGrid.appendChild(card);
  });
}
$("#searchInput").addEventListener("input", renderCourses);
filterStream.addEventListener("change", renderCourses);
$("#filterDuration").addEventListener("change", renderCourses);
$("#filterEntrance").addEventListener("change", renderCourses);
$("#resetFilters").addEventListener("click", () => {
  $("#searchInput").value = "";
  filterStream.value = "";
  $("#filterDuration").value = "";
  $("#filterEntrance").value = "";
  renderCourses();
});
renderCourses();

// ---------- Exams ----------
const examGrid = $("#examGrid");
const examSearch = $("#examSearch");
const examChips = $("#examChips");
const examNoResults = $("#examNoResults");

const EXAM_CATEGORIES = [
  { id: "", label: "All" },
  { id: "science", label: "Science" },
  { id: "commerce", label: "Commerce" },
  { id: "arts", label: "Arts / Law" },
  { id: "design", label: "Design" },
  { id: "defence", label: "Defence" },
  { id: "uni", label: "Universities" },
];
let activeExamCat = "";

function renderExamChips() {
  examChips.innerHTML = "";
  EXAM_CATEGORIES.forEach((c) => {
    const btn = el("button", {
      class: "exam-chip" + (activeExamCat === c.id ? " active" : ""),
      type: "button",
      onclick: () => { activeExamCat = c.id; renderExamChips(); renderExams(); },
    }, c.label);
    examChips.appendChild(btn);
  });
}

function renderExams() {
  const q = examSearch.value.trim().toLowerCase();
  examGrid.innerHTML = "";
  const filtered = EXAMS.filter((e) => {
    if (activeExamCat && e.category !== activeExamCat) return false;
    if (q) {
      const hay = [e.name, e.body, e.desc, e.for, e.when].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  examNoResults.hidden = filtered.length !== 0;

  filtered.forEach((e) => {
    const row = (k, v, extraCls = "") => el("div", { class: "row " + extraCls },
      el("div", { class: "k" }, k),
      el("div", { class: "v" }, v)
    );
    const card = el(
      "div",
      { class: `exam-card ${e.category}` },
      el("h3", {}, e.name),
      row("Conducted by", e.body),
      row("About", e.desc),
      row("When", e.when, "when"),
      row("For", e.for)
    );
    examGrid.appendChild(card);
  });
}
examSearch.addEventListener("input", renderExams);
renderExamChips();
renderExams();

// ---------- Careers ----------
const careerGalaxy = $("#careerGalaxy");
CAREERS.forEach((c) => {
  const row = (k, v, cls = "") => el("div", { class: "row " + cls },
    el("div", { class: "k" }, k),
    el("div", { class: "v" }, v)
  );
  const chip = el(
    "div",
    { class: "career-chip" },
    el("div", { class: "role" }, c.role),
    row("Qualification", c.qual),
    row("Stream", c.stream),
    row("Entry Salary", "₹" + c.salary, "salary")
  );
  careerGalaxy.appendChild(chip);
});

// ---------- FAQ ----------
const faqList = $("#faqList");
FAQ.forEach((f, i) => {
  const item = el(
    "div",
    { class: "faq-item" },
    el("button", { class: "faq-q", type: "button", onclick: (e) => e.currentTarget.parentElement.classList.toggle("open") }, f.q),
    el("div", { class: "faq-a" }, f.a)
  );
  faqList.appendChild(item);
});

// ---------- Modal ----------
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");
function openModal(title, html) {
  modalTitle.textContent = title;
  modalBody.innerHTML = "";
  if (typeof html === "string") modalBody.innerHTML = html;
  else modalBody.appendChild(html);
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}
modal.addEventListener("click", (e) => {
  if (e.target.matches("[data-close]")) closeModal();
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

function openStreamModal(id) {
  const s = STREAMS.find((x) => x.id === id);
  if (!s) return;
  const courses = COURSES.filter((c) => c.stream === id);
  const wrap = el("div", {},
    el("p", { class: "modal-sub" }, s.tagline),

    el("div", { class: "modal-grid" },
      el("div", { class: "modal-section" },
        el("h4", {}, "Core Subjects (Class 11–12)"),
        el("ul", { class: "row-list" }, ...s.subjects.map((x) => el("li", {}, x)))
      ),
      el("div", { class: "modal-section" },
        el("h4", {}, "Top Entrance Exams"),
        el("ul", { class: "row-list" }, ...s.topExams.map((x) => el("li", {}, x)))
      )
    ),

    el("div", { class: "modal-section" },
      el("h4", {}, "Best For"),
      el("p", {}, s.bestFor)
    ),

    el("div", { class: "modal-section" },
      el("h4", {}, "What Comes Next"),
      el("ul", { class: "row-list" }, ...s.leadsTo.map((x) => el("li", {}, x)))
    ),

    el("div", { class: "pros-cons" },
      el("div", { class: "pros" }, el("h5", {}, "Pros"), el("ul", {}, ...s.pros.map((x) => el("li", {}, x)))),
      el("div", { class: "cons" }, el("h5", {}, "Things to Consider"), el("ul", {}, ...s.cons.map((x) => el("li", {}, x))))
    ),

    el("div", { class: "modal-section" },
      el("h4", {}, "Typical Salary (Entry)"),
      el("p", {}, s.avgSalary)
    ),

    courses.length
      ? el("div", { class: "modal-section" },
          el("h4", {}, `Courses Under ${s.name} (${courses.length})`),
          el("ul", { class: "row-list" },
            ...courses.map((c) => {
              const li = el("li", { class: "clickable" }, c.name);
              li.addEventListener("click", () => openCourseModal(c.id));
              return li;
            })
          )
        )
      : null
  );
  openModal(`${s.icon} ${s.name}`, wrap);
}

function openCourseModal(id) {
  const c = COURSES.find((x) => x.id === id);
  if (!c) return;
  const stream = STREAMS.find((s) => s.id === c.stream);
  const wrap = el("div", {},
    el("p", { class: "modal-sub" }, (stream ? stream.name + " • " : "") + c.duration),
    el("p", {}, c.desc),

    el("div", { class: "modal-grid" },
      el("div", { class: "modal-section" }, el("h4", {}, "Eligibility"), el("p", {}, c.eligibility)),
      el("div", { class: "modal-section" }, el("h4", {}, "Typical Fees"), el("p", {}, c.fees))
    ),

    el("div", { class: "modal-section" },
      el("h4", {}, "Entrance Exams"),
      el("ul", { class: "row-list" }, ...c.exams.map((x) => el("li", {}, x)))
    ),

    el("div", { class: "modal-section" },
      el("h4", {}, "Top Colleges in India"),
      el("ul", { class: "row-list" }, ...c.colleges.map((x) => el("li", {}, x)))
    ),

    el("div", { class: "modal-section" },
      el("h4", {}, "Career Roles"),
      el("ul", { class: "row-list" }, ...c.careers.map((x) => el("li", {}, x)))
    ),

    el("div", { class: "modal-section" }, el("h4", {}, "Typical Salary (Entry)"), el("p", {}, c.salary)),

    el("div", { class: "pros-cons" },
      el("div", { class: "pros" }, el("h5", {}, "Pros"), el("ul", {}, ...c.pros.map((x) => el("li", {}, x)))),
      el("div", { class: "cons" }, el("h5", {}, "Watch-outs"), el("ul", {}, ...c.cons.map((x) => el("li", {}, x))))
    )
  );
  openModal(c.name, wrap);
}

// ---------- Quiz ----------
const quizCard = $("#quizCard");
let quizState = { idx: 0, scores: {}, answered: [] };

function startQuiz() {
  quizState = { idx: 0, scores: {}, answered: [] };
  renderQuiz();
}
function renderQuiz() {
  if (quizState.idx >= QUIZ.length) return showQuizResult();
  const q = QUIZ[quizState.idx];
  const progressPct = ((quizState.idx) / QUIZ.length) * 100;
  quizCard.innerHTML = "";
  quizCard.appendChild(
    el("div", {},
      el("div", { class: "quiz-progress" }, el("div", { class: "bar", style: `width:${progressPct}%` })),
      el("div", { class: "quiz-step-num" }, `Question ${quizState.idx + 1} of ${QUIZ.length}`),
      el("div", { class: "quiz-q" }, q.q),
      el("div", { class: "quiz-options" },
        ...q.opts.map((opt, i) =>
          el("button", {
            class: "quiz-opt", type: "button",
            onclick: () => selectOption(i),
          }, opt.text)
        )
      ),
      el("div", { class: "quiz-actions" },
        quizState.idx > 0
          ? el("button", { class: "btn btn-ghost btn-sm", onclick: () => { quizState.idx--; renderQuiz(); } }, "← Back")
          : el("span", {}),
        el("button", { class: "btn btn-ghost btn-sm", onclick: startQuiz }, "Restart")
      )
    )
  );
}
function selectOption(i) {
  const q = QUIZ[quizState.idx];
  const w = q.opts[i].w;
  Object.entries(w).forEach(([k, v]) => { quizState.scores[k] = (quizState.scores[k] || 0) + v; });
  quizState.answered[quizState.idx] = i;
  quizState.idx++;
  renderQuiz();
}
function showQuizResult() {
  const labels = {
    pcm: "Science (PCM)", pcb: "Science (PCB)", pcmb: "Science (PCMB)",
    commerce: "Commerce", arts: "Arts / Humanities",
    design: "Design", iti: "ITI / Vocational",
    diploma: "Diploma (Polytechnic)", paramedical: "Paramedical",
  };
  const map = {
    pcm: "science-pcm", pcb: "science-pcb", pcmb: "science-pcmb",
    commerce: "commerce", arts: "arts", design: "arts",
    iti: "iti", diploma: "diploma", paramedical: "paramedical",
  };
  const entries = Object.entries(quizState.scores).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return startQuiz();
  const max = entries[0][1];
  const top = entries[0];
  const topStreamId = map[top[0]];
  const topStream = STREAMS.find((s) => s.id === topStreamId);

  quizCard.innerHTML = "";
  quizCard.appendChild(
    el("div", { class: "quiz-result" },
      el("div", { class: "muted", style: "font-size:.85rem;" }, "Your result"),
      el("h3", {}, `Best fit: ${labels[top[0]] || top[0]}`),
      el("p", {}, topStream ? topStream.tagline : "Explore this stream to see if it matches your goals."),
      el("div", { class: "scores" },
        ...entries.map(([k, v]) =>
          el("div", { class: "score-row" },
            el("div", { class: "name" }, labels[k] || k),
            el("div", { class: "bar-bg" }, el("div", { class: "bar-fill", style: `width:${(v / max) * 100}%` })),
            el("div", { class: "pct" }, Math.round((v / max) * 100) + "%")
          )
        )
      ),
      el("div", { class: "quiz-actions" },
        topStream
          ? el("button", { class: "btn btn-primary", onclick: () => openStreamModal(topStream.id) }, `Explore ${topStream.name} →`)
          : null,
        el("button", { class: "btn btn-ghost", onclick: startQuiz }, "Retake Quiz")
      )
    )
  );
}
startQuiz();

// ---------- Sticky nav: active section + sliding indicator ----------
(() => {
  const nav = document.getElementById("navLinks");
  if (!nav) return;
  const links = $$("a[data-target]", nav);
  const indicator = $(".nav-indicator", nav);
  if (!links.length) return;

  const linkByTarget = new Map(links.map((a) => [a.dataset.target, a]));

  const moveIndicator = (link) => {
    if (!indicator || !link || !link.hasAttribute("data-primary")) {
      nav.classList.remove("has-active");
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    // Underline hugs the text: use a Range to measure the actual text node width.
    let textLeft = r.left;
    let textWidth = r.width;
    const textNode = link.firstChild;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const tr = range.getBoundingClientRect();
      if (tr.width > 0) {
        textLeft = tr.left;
        textWidth = tr.width;
      }
    }
    const pad = 4; // breathing room around text
    const gap = 4; // gap between text baseline and underline
    // Use the actual text rect bottom when available, else link bottom.
    let textBottom = r.bottom;
    const textNode2 = link.firstChild;
    if (textNode2 && textNode2.nodeType === Node.TEXT_NODE) {
      const range2 = document.createRange();
      range2.selectNodeContents(textNode2);
      const tr2 = range2.getBoundingClientRect();
      if (tr2.height > 0) textBottom = tr2.bottom;
    }
    indicator.style.left = (textLeft - navRect.left - pad) + "px";
    indicator.style.width = (textWidth + pad * 2) + "px";
    indicator.style.top = (textBottom - navRect.top + gap) + "px";
    nav.classList.add("has-active");
  };

  const setActive = (id) => {
    let activeLink = null;
    links.forEach((a) => {
      const on = a.dataset.target === id;
      a.classList.toggle("active", on);
      if (on) activeLink = a;
    });
    moveIndicator(activeLink);
  };

  if ("IntersectionObserver" in window) {
    const sections = links
      .map((a) => document.getElementById(a.dataset.target))
      .filter(Boolean);
    const visible = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        });
        if (!visible.size) return;
        const topId = [...visible.entries()].sort((a, b) => b[1] - a[1])[0][0];
        if (linkByTarget.has(topId)) setActive(topId);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.2, 0.5, 0.8, 1] }
    );
    sections.forEach((s) => io.observe(s));
  }

  // Initial indicator: highlight first primary link so the underline is visible from page load
  const firstPrimary = nav.querySelector("a[data-primary]");
  const initIndicator = () => {
    if (firstPrimary && !nav.querySelector("a.active")) {
      firstPrimary.classList.add("active");
      moveIndicator(firstPrimary);
    }
  };
  initIndicator();
  // Re-run after fonts/layout settle
  window.addEventListener("load", () => {
    const cur = nav.querySelector("a.active") || firstPrimary;
    if (cur) moveIndicator(cur);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      const cur = nav.querySelector("a.active") || firstPrimary;
      if (cur) moveIndicator(cur);
    });
  }

  window.addEventListener("resize", () => {
    const cur = nav.querySelector("a.active");
    if (cur) moveIndicator(cur);
  });
})();

// ---------- Mobile nav toggle ----------
(() => {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("navLinks");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") nav.classList.remove("open");
  });
})();
