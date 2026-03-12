(function () {
  const printButton = document.getElementById("printAudit");
  const generatedAtNode = document.getElementById("generatedAt");
  const priorityButtons = Array.from(document.querySelectorAll("[data-priority-filter]"));
  const findingCards = Array.from(document.querySelectorAll(".finding-card"));
  const deviceButtons = Array.from(document.querySelectorAll(".device-chip"));
  const techScoreCards = Array.from(document.querySelectorAll(".ring-card[data-metric]"));
  const techAuditMetaNode = document.getElementById("techAuditMeta");
  const techAuditModeNode = document.getElementById("techAuditMode");
  const proofFcpNode = document.getElementById("proofFcp");
  const proofLcpNode = document.getElementById("proofLcp");
  const proofTbtNode = document.getElementById("proofTbt");
  const proofUnusedJsNode = document.getElementById("proofUnusedJs");
  const factsGridNode = document.querySelector(".facts-grid");

  const panelHintContent = {
    facts: [
      "Wysoka ocena i duża skala użycia pokazują, że produkt ma już zbudowane zaufanie użytkowników. To dobry punkt wyjścia do poprawek o najwyższym wpływie, bez potrzeby przebudowy wszystkiego.",
      "Dobra ocena w App Store potwierdza solidny fundament produktu. Nie wyklucza jednak problemów na najważniejszych ścieżkach, dlatego rating warto czytać razem z sygnałami dotyczącymi logowania i płatności.",
      "To sygnał niespójności między oficjalnymi kanałami. Dla użytkownika oznacza niepewność, a dla organizacji ryzyko dodatkowych pytań i spadku zaufania do komunikatów.",
      "To sygnał tarcia już na wejściu do ekosystemu. Im trudniej rozpocząć właściwą ścieżkę, tym większe ryzyko porzucenia procesu albo kontaktu z centrum obsługi klienta."
    ],
    summary: [
      "To priorytet wejściowy. Jeżeli użytkownik napotyka trudności przed wykonaniem pierwszej czynności, nawet dobra funkcjonalność nie przełoży się na wynik biznesowy.",
      "To sygnał, że ścieżki krytyczne warto objąć mocniejszą obserwowalnością. Kluczowe jest szybkie wykrycie problemu, zrozumienie miejsca odpływu i sprawna reakcja operacyjna.",
      "To obszar, który wykracza poza pojedynczy ekran. Wymaga spójnych standardów, jasnych zasad współpracy i wspólnej odpowiedzialności między zespołami."
    ],
    impact: [
      "Ten obszar zwykle najszybciej poprawia skuteczność samoobsługi, ponieważ usuwa tarcie jeszcze przed właściwym użyciem produktu.",
      "Tu największą wartość daje lepsza obserwowalność operacyjna. Szybsze wykrycie i usunięcie błędów ogranicza frustrację klientów i liczbę zgłoszeń.",
      "Spójne wzorce i komunikaty ułatwiają rozwój produktu w skali. Oznacza to niższy koszt zmian, krótszy czas wdrożeń i bardziej przewidywalną jakość."
    ]
  };
  const sectionHintContent = [
    "Ta sekcja streszcza trzy hipotezy o najwyższym potencjalnym wpływie. To punkt startowy do dalszej walidacji po uzyskaniu dostępu do danych wewnętrznych.",
    "Ta sekcja pokazuje granice audytu. Wnioski opierają się wyłącznie na śladach publicznych, bez dostępu do analytics, logów błędów i danych operacyjnych.",
    "Tutaj każda karta ma ten sam układ: problem, dowód, ryzyko, rekomendacja i poziom pewności. Dzięki temu łatwiej odróżnić obserwację od interpretacji i ustawić priorytety.",
    "Ta sekcja pokazuje, jak porównywane są obszary zmian. Priorytet wynika z połączenia wpływu, siły dowodu i przewidywanego nakładu, a nie z intuicji.",
    "Ta sekcja nie prognozuje sztucznie precyzyjnych wyników. Pokazuje kierunek wpływu i metryki, które pozwolą ocenić efekt po wejściu do danych wewnętrznych.",
    "To krótkie domknięcie sensu biznesowego. Prostsze wejście, stabilniejsze ścieżki krytyczne i spójniejsze standardy przekładają się na koszt obsługi, tempo zmian i jakość doświadczenia.",
    "Plan 90 dni porządkuje kolejność działań. Najpierw diagnoza funkcji i interesariuszy, potem zasady współpracy i priorytety, a na końcu pierwsze usprawnienia i skalowanie standardów.",
    "Ta sekcja pokazuje audyt z perspektywy zarządzania funkcją projektową. Chodzi nie tylko o produkt, ale też o Design System, współpracę między zespołami i rozwój kompetencji.",
    "KPI są tu pokazane jako wspólny język designu, produktu i biznesu. Mają pomóc ocenić, czy zmiany realnie poprawiają samoobsługę, stabilność i jakość doświadczenia.",
    "Aneks techniczny ma rolę pomocniczą. Dostarcza sygnałów jakościowych z publicznej warstwy web, ale nie zastępuje danych produktowych ani operacyjnych.",
    "To szeroki kontekst rynkowy, a nie dane o ruchu TAURON. Warto go traktować jako tło do myślenia o kanałach i priorytetach, nie jako główny dowód.",
    "Ta sekcja pokazuje, na jakich publicznych źródłach opiera się audyt. Jawność źródeł zwiększa wiarygodność materiału i ogranicza ryzyko nadinterpretacji."
  ];
  const techJsonPaths = {
    mobile: "./audit-data/tauron-mobile.json",
    desktop: "./audit-data/tauron-desktop.json"
  };

  const techFallbackData = {
    mobile: {
      label: "mobile",
      measuredAt: "11.03.2026 18:01 (CET)",
      url: "https://www.tauron.pl/",
      scores: {
        performance: 32,
        accessibility: 91,
        "best-practices": 73,
        seo: 100
      },
      proofs: {
        fcp: 4.6,
        lcp: 12.3,
        tbt: 954,
        unusedJsKiB: 930
      }
    },
    desktop: {
      label: "desktop",
      measuredAt: "11.03.2026 18:02 (CET)",
      url: "https://www.tauron.pl/",
      scores: {
        performance: 69,
        accessibility: 94,
        "best-practices": 77,
        seo: 100
      },
      proofs: {
        fcp: 1.0,
        lcp: 3.4,
        tbt: 0,
        unusedJsKiB: 906
      }
    }
  };

  const techAuditCache = {
    mobile: null,
    desktop: null
  };

  function setupPrint() {
    if (!printButton) {
      return;
    }
    printButton.addEventListener("click", () => window.print());
  }

  function setupGeneratedAt() {
    if (!generatedAtNode) {
      return;
    }
    const now = new Date();
    const date = now.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    const time = now.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit"
    });
    generatedAtNode.textContent = date + " " + time;
  }

  function setupPriorityFilter() {
    if (!priorityButtons.length || !findingCards.length) {
      return;
    }

    function applyFilter(priority) {
      findingCards.forEach((card) => {
        const cardPriority = card.dataset.priority || "";
        const visible = priority === "all" || cardPriority === priority;
        card.classList.toggle("is-hidden", !visible);
      });
    }

    priorityButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const priority = button.dataset.priorityFilter || "all";
        priorityButtons.forEach((btn) => btn.classList.remove("is-active"));
        button.classList.add("is-active");
        applyFilter(priority);
      });
    });
  }

  function addHintsToCards(cards, hints) {
    cards.forEach((card, index) => {
      const hintText = hints[index];
      if (!hintText) {
        return;
      }

      card.classList.add("has-hint");
      if (!card.hasAttribute("tabindex")) {
        card.setAttribute("tabindex", "0");
      }

      if (card.querySelector(".card-hint")) {
        return;
      }

      const hint = document.createElement("p");
      hint.className = "card-hint";
      hint.setAttribute("role", "tooltip");
      hint.textContent = hintText;
      card.appendChild(hint);
    });
  }

  function setupPanelHints() {
    const factCards = Array.from(document.querySelectorAll(".fact-card"));
    const summaryCards = Array.from(document.querySelectorAll(".summary-card"));
    const impactCards = Array.from(document.querySelectorAll(".impact-card"));

    addHintsToCards(factCards, panelHintContent.facts);
    addHintsToCards(summaryCards, panelHintContent.summary);
    addHintsToCards(impactCards, panelHintContent.impact);

    if (factsGridNode && !document.querySelector(".hint-guide")) {
      const guide = document.createElement("p");
      guide.className = "hint-guide";
      guide.textContent = "Najedź na kafel, aby zobaczyć krótkie wyjaśnienie.";
      factsGridNode.insertAdjacentElement("beforebegin", guide);
    }
  }

  function setupSectionHints() {
    const panels = Array.from(document.querySelectorAll("main .panel"));
    if (!panels.length) {
      return;
    }

    panels.forEach((panel, index) => {
      const hintText = sectionHintContent[index];
      if (!hintText) {
        return;
      }

      const panelHead = panel.querySelector(".panel-head");
      if (!panelHead || panelHead.querySelector(".section-hint-wrap")) {
        return;
      }

      const wrap = document.createElement("div");
      wrap.className = "section-hint-wrap";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "section-hint-trigger";
      trigger.setAttribute("aria-label", "Pokaż wyjaśnienie sekcji");
      trigger.textContent = "Co to znaczy?";

      const tooltip = document.createElement("p");
      tooltip.className = "section-hint-tooltip";
      tooltip.setAttribute("role", "tooltip");
      tooltip.textContent = hintText;

      wrap.appendChild(trigger);
      wrap.appendChild(tooltip);
      panelHead.appendChild(wrap);
    });
  }

  function getScoreStatus(score) {
    if (score < 60) {
      return "is-bad";
    }
    if (score < 90) {
      return "is-medium";
    }
    return "is-good";
  }

  function getScoreNote(score) {
    if (score < 60) {
      return "Wysoki priorytet poprawy";
    }
    if (score < 90) {
      return "Ĺšredni poziom jakoĹ›ci";
    }
    return "Docelowy poziom";
  }

  function getMetricImpactText(metric, score) {
    if (metric === "performance") {
      if (score < 60) {
        return "Wolne Ĺ‚adowanie zwiÄ™ksza porzucenia i obniĹĽa konwersjÄ™ w kluczowych Ĺ›cieĹĽkach.";
      }
      if (score < 90) {
        return "WydajnoĹ›Ä‡ Ĺ›rednia: warto ograniczyÄ‡ opĂłĹşnienia odczuwalne przez uĹĽytkownika mobilnego.";
      }
      return "Wysoka wydajnoĹ›Ä‡ wspiera pĹ‚ynnoĹ›Ä‡ procesu i satysfakcjÄ™ klienta.";
    }

    if (metric === "accessibility") {
      if (score < 60) {
        return "Niska dostÄ™pnoĹ›Ä‡ zwiÄ™ksza ryzyko wykluczenia czÄ™Ĺ›ci klientĂłw.";
      }
      if (score < 90) {
        return "DostÄ™pnoĹ›Ä‡ poprawna, ale sÄ… obszary do dalszego doskonalenia.";
      }
      return "Dobry poziom dostÄ™pnoĹ›ci zmniejsza ryzyko frustracji i bĹ‚Ä™dĂłw w obsĹ‚udze.";
    }

    if (metric === "best-practices") {
      if (score < 60) {
        return "Wysoki dĹ‚ug jakoĹ›ciowy i wiÄ™ksze ryzyko bĹ‚Ä™dĂłw runtime.";
      }
      if (score < 90) {
        return "SÄ… rezerwy jakoĹ›ciowe w obszarze skryptĂłw i integracji.";
      }
      return "Dobra jakoĹ›Ä‡ techniczna wspiera stabilnoĹ›Ä‡ wdroĹĽeĹ„.";
    }

    if (metric === "seo") {
      return "WidocznoĹ›Ä‡ organiczna jest mocnym punktem publicznej warstwy web.";
    }

    return "WpĹ‚yw na doĹ›wiadczenie klienta wymaga dalszej walidacji.";
  }

  function formatDateTime(isoDate) {
    if (!isoDate) {
      return "brak danych";
    }
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return "brak danych";
    }
    const formatted = date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    return formatted + " (lokalnie)";
  }

  function readScore(json, key) {
    const raw = json && json.categories && json.categories[key] ? json.categories[key].score : null;
    if (typeof raw !== "number") {
      return null;
    }
    return Math.round(raw * 100);
  }

  function readAuditMetric(json, key) {
    if (!json || !json.audits || !json.audits[key]) {
      return null;
    }
    const value = json.audits[key].numericValue;
    return typeof value === "number" ? value : null;
  }

  function readUnusedJsKiB(json) {
    if (!json || !json.audits || !json.audits["unused-javascript"]) {
      return null;
    }
    const audit = json.audits["unused-javascript"];
    const bytes = audit.details && typeof audit.details.overallSavingsBytes === "number"
      ? audit.details.overallSavingsBytes
      : null;
    if (bytes === null) {
      return null;
    }
    return Math.round(bytes / 1024);
  }

  function parseAuditJson(json, label) {
    const performance = readScore(json, "performance");
    const accessibility = readScore(json, "accessibility");
    const bestPractices = readScore(json, "best-practices");
    const seo = readScore(json, "seo");

    if (
      performance === null ||
      accessibility === null ||
      bestPractices === null ||
      seo === null
    ) {
      return null;
    }

    const fcpMs = readAuditMetric(json, "first-contentful-paint");
    const lcpMs = readAuditMetric(json, "largest-contentful-paint");
    const tbtMs = readAuditMetric(json, "total-blocking-time");
    const unusedJsKiB = readUnusedJsKiB(json);

    return {
      label: label,
      measuredAt: formatDateTime(json.fetchTime),
      url: json.finalDisplayedUrl || "https://www.tauron.pl/",
      scores: {
        performance: performance,
        accessibility: accessibility,
        "best-practices": bestPractices,
        seo: seo
      },
      proofs: {
        fcp: typeof fcpMs === "number" ? fcpMs / 1000 : null,
        lcp: typeof lcpMs === "number" ? lcpMs / 1000 : null,
        tbt: typeof tbtMs === "number" ? Math.round(tbtMs) : null,
        unusedJsKiB: unusedJsKiB
      }
    };
  }

  async function loadTechAuditData(deviceName) {
    if (techAuditCache[deviceName]) {
      return techAuditCache[deviceName];
    }

    const fallback = {
      data: techFallbackData[deviceName],
      mode: "fallback"
    };

    const path = techJsonPaths[deviceName];
    if (!path) {
      techAuditCache[deviceName] = fallback;
      return fallback;
    }

    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      const json = await response.json();
      const parsed = parseAuditJson(json, deviceName);
      if (!parsed) {
        throw new Error("BĹ‚Ä…d mapowania JSON");
      }
      const result = {
        data: parsed,
        mode: "json"
      };
      techAuditCache[deviceName] = result;
      return result;
    } catch (error) {
      techAuditCache[deviceName] = fallback;
      return fallback;
    }
  }

  function renderProofs(proofs) {
    if (proofFcpNode) {
      proofFcpNode.textContent = typeof proofs.fcp === "number" ? proofs.fcp.toFixed(1) + " s" : "brak";
    }
    if (proofLcpNode) {
      proofLcpNode.textContent = typeof proofs.lcp === "number" ? proofs.lcp.toFixed(1) + " s" : "brak";
    }
    if (proofTbtNode) {
      proofTbtNode.textContent = typeof proofs.tbt === "number" ? proofs.tbt + " ms" : "brak";
    }
    if (proofUnusedJsNode) {
      proofUnusedJsNode.textContent =
        typeof proofs.unusedJsKiB === "number" ? proofs.unusedJsKiB + " KiB" : "brak";
    }
  }

  function renderTechAudit(dataResult) {
    if (!dataResult || !dataResult.data || !techScoreCards.length) {
      return;
    }

    const selected = dataResult.data;

    techScoreCards.forEach((card) => {
      const key = card.dataset.metric || "";
      const score = selected.scores[key];
      if (typeof score !== "number") {
        return;
      }

      const ring = card.querySelector(".score-ring");
      const numberNode = card.querySelector("[data-tech-score]");
      const noteNode = card.querySelector("[data-tech-note]");
      const tooltipNode = card.querySelector("[data-tech-tooltip]");
      const status = getScoreStatus(score);

      card.classList.remove("is-bad", "is-medium", "is-good");
      card.classList.add(status);

      if (ring) {
        ring.style.setProperty("--score", score.toString());
      }
      if (numberNode) {
        numberNode.textContent = score.toString();
      }
      if (noteNode) {
        noteNode.textContent = getScoreNote(score);
      }
      if (tooltipNode) {
        tooltipNode.textContent = getMetricImpactText(key, score);
      }
    });

    if (techAuditMetaNode) {
      techAuditMetaNode.textContent =
        "Lighthouse (" +
        selected.label +
        "), URL: " +
        selected.url +
        ", pomiar: " +
        selected.measuredAt;
    }

    if (techAuditModeNode) {
      techAuditModeNode.textContent =
        dataResult.mode === "json"
          ? "Tryb danych: raport JSON"
          : "Tryb danych: fallback (wartoĹ›ci referencyjne)";
    }

    renderProofs(selected.proofs);
  }

  async function applyTechAuditDevice(deviceName) {
    const result = await loadTechAuditData(deviceName);
    renderTechAudit(result);
  }

  function setupTechAuditSwitch() {
    if (!deviceButtons.length || !techScoreCards.length) {
      return;
    }

    deviceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const device = button.dataset.device || "mobile";
        deviceButtons.forEach((btn) => btn.classList.remove("is-active"));
        button.classList.add("is-active");
        void applyTechAuditDevice(device);
      });
    });

    void applyTechAuditDevice("mobile");
  }

  setupPrint();
  setupGeneratedAt();
  setupPanelHints();
  setupSectionHints();
  setupPriorityFilter();
  setupTechAuditSwitch();
})();

