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
      return "Średni poziom jakości";
    }
    return "Docelowy poziom";
  }

  function getMetricImpactText(metric, score) {
    if (metric === "performance") {
      if (score < 60) {
        return "Wolne ładowanie zwiększa porzucenia i obniża konwersję w kluczowych ścieżkach.";
      }
      if (score < 90) {
        return "Wydajność średnia: warto ograniczyć opóźnienia odczuwalne przez użytkownika mobilnego.";
      }
      return "Wysoka wydajność wspiera płynność procesu i satysfakcję klienta.";
    }

    if (metric === "accessibility") {
      if (score < 60) {
        return "Niska dostępność zwiększa ryzyko wykluczenia części klientów.";
      }
      if (score < 90) {
        return "Dostępność poprawna, ale są obszary do dalszego doskonalenia.";
      }
      return "Dobry poziom dostępności zmniejsza ryzyko frustracji i błędów w obsłudze.";
    }

    if (metric === "best-practices") {
      if (score < 60) {
        return "Wysoki dług jakościowy i większe ryzyko błędów runtime.";
      }
      if (score < 90) {
        return "Są rezerwy jakościowe w obszarze skryptów i integracji.";
      }
      return "Dobra jakość techniczna wspiera stabilność wdrożeń.";
    }

    if (metric === "seo") {
      return "Widoczność organiczna jest mocnym punktem publicznej warstwy web.";
    }

    return "Wpływ na doświadczenie klienta wymaga dalszej walidacji.";
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
        throw new Error("Błąd mapowania JSON");
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
          : "Tryb danych: fallback (wartości referencyjne)";
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
  setupPriorityFilter();
  setupTechAuditSwitch();
})();
