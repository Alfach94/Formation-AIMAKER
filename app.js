const criteria = [
  {
    id: "conformite",
    name: "Conformité",
    detail: "Respect des exigences réglementaires et de sécurité applicables.",
    weight: 34,
    max: 2,
    scale: {
      2: "Conforme",
      1: "Non-conformités acceptables sous réserve de justification via analyse de risques",
      0: "Non conforme",
    },
  },
  {
    id: "securite",
    name: "Sécurité du SOC",
    detail: "Niveau de protection, de cloisonnement et de contrôle des accès du SOC.",
    weight: 31,
    max: 2,
    scale: {
      2: "Sécurité au niveau PDIS attesté par l’ANSSI pour l’ensemble du SOC",
      1: "Sécurité PDIS pour le SOC SIIV uniquement, niveau plus faible pour le SOC standard",
      0: "Niveau de sécurité plus faible pour l’ensemble du SOC",
    },
  },
  {
    id: "performance",
    name: "Performance opérationnelle du SOC",
    detail: "Capacité à détecter, corréler et traiter efficacement les alertes.",
    weight: 26,
    max: 2,
    scale: {
      2: "Performance non restreinte par les exigences PDIS, outils performants et corrélation croisée",
      1: "Performance restreinte par les exigences PDIS pour le SOC SIIV uniquement",
      0: "Performance restreinte par les exigences PDIS pour l’entièreté du SOC",
    },
  },
  {
    id: "complexite",
    name: "Complexité de mise en œuvre",
    detail: "Effort organisationnel, technique et humain nécessaire au déploiement.",
    weight: 25,
    max: 3,
    scale: {
      3: "Complexité minimale : mise en œuvre quasi immédiate",
      2: "Complexité faible : mise en œuvre standardisée, s’appuyant largement sur l’existant",
      1: "Complexité modérée : chantiers identifiés et maîtrisables",
      0: "Complexité très élevée : transformation profonde et forte dépendance externe",
    },
  },
  {
    id: "souverainete",
    name: "Maîtrise et souveraineté",
    detail: "Contrôle des données, des compétences, des outils et des dépendances externes.",
    weight: 19,
    max: 3,
    scale: {
      3: "SOC interne, données et compétences détenues en propre, aucune dépendance externe",
      2: "Hébergement et exploitation en France pour les SIIV, gouvernance partagée avec un PDIS",
      1: "Hébergement et exploitation en France, dépendance totale à un prestataire PDIS",
      0: "Hébergement et exploitation hors France, dépendance totale à un prestataire",
    },
  },
  {
    id: "couts",
    name: "Coûts",
    detail: "Coût total estimé de Build et de Run sur 5 ans.",
    weight: 20,
    max: 4,
    scale: { 4: "0-100k", 3: "100-500k", 2: "500-1M", 1: "+1M", 0: "+10M" },
  },
  {
    id: "delais",
    name: "Délais",
    detail: "Temps nécessaire à la mise en œuvre du scénario jusqu’à l’atteinte de la conformité PDIS.",
    weight: 13,
    max: 2,
    scale: { 2: "Immédiat", 1: "3-6 mois", 0: ">3 ans" },
  },
];

let scenarios = [
  { id: crypto.randomUUID(), name: "Scénario 1", scores: Object.fromEntries(criteria.map((c) => [c.id, c.max])) },
  { id: crypto.randomUUID(), name: "Scénario 2", scores: Object.fromEntries(criteria.map((c) => [c.id, Math.ceil(c.max / 2)])) },
];

const $ = (selector) => document.querySelector(selector);
const weightedScore = (scenario) => criteria.reduce((sum, c) => sum + (scenario.scores[c.id] / c.max) * c.weight, 0);
const totalWeight = () => criteria.reduce((sum, c) => sum + c.weight, 0);
const average = (scenario) => (weightedScore(scenario) / totalWeight()) * 100;

function renderCriteria() {
  $("#weightTotal").textContent = `Pondération totale : ${totalWeight()}`;
  $("#criteriaGrid").innerHTML = criteria.map((criterion) => `
    <article class="criterion">
      <div class="criterion-summary">
        <h3>${criterion.name}</h3>
        <p>${criterion.detail}</p>
      </div>
      <ul class="scale" aria-label="Échelle de notation ${criterion.name}">
        ${Object.entries(criterion.scale).sort((a,b) => b[0] - a[0]).map(([score, text]) => `<li><strong>${score}</strong> — ${text}</li>`).join("")}
      </ul>
      <label class="weight-field">Pondération
        <input type="number" min="0" value="${criterion.weight}" data-weight="${criterion.id}" />
      </label>
    </article>
  `).join("");
}

function renderScenarios() {
  $("#scenarioList").innerHTML = scenarios.map((scenario) => `
    <article class="scenario-card">
      <div class="scenario-top">
        <label>Nom du scénario
          <input value="${scenario.name}" data-scenario-name="${scenario.id}" />
        </label>
        <button class="danger" data-delete="${scenario.id}" type="button">Supprimer</button>
      </div>
      <div class="score-grid">${criteria.map((criterion) => `
        <label>${criterion.name}
          <select data-score="${scenario.id}:${criterion.id}">
            ${Object.entries(criterion.scale).sort((a,b) => b[0] - a[0]).map(([score, text]) => `<option value="${score}" ${Number(score) === scenario.scores[criterion.id] ? "selected" : ""}>${score} — ${text}</option>`).join("")}
          </select>
        </label>
      `).join("")}</div>
    </article>
  `).join("");
}

function renderTable() {
  const rows = scenarios.map((scenario) => `
    <tr>
      <td><strong>${scenario.name}</strong></td>
      ${criteria.map((c) => `<td class="numeric">${scenario.scores[c.id]} / ${c.max}</td>`).join("")}
      <td class="numeric"><span class="badge">${average(scenario).toFixed(1)}%</span></td>
      <td class="numeric">${weightedScore(scenario).toFixed(1)} / ${totalWeight()}</td>
    </tr>
  `).join("");
  $("#comparisonTable").innerHTML = `<thead><tr><th>Scénario</th>${criteria.map((c) => `<th class="numeric">${c.name}<br><small>Poids ${c.weight}</small></th>`).join("")}<th class="numeric">Note moyenne pondérée</th><th class="numeric">Score pondéré</th></tr></thead><tbody>${rows}</tbody>`;
}

function drawKiviat() {
  const canvas = $("#kiviatChart");
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2 + 20, radius = Math.min(w, h) * 0.36;
  const colors = ["#1f6fb2", "#dc6803", "#039855", "#7a5af8", "#d92d20"];
  ctx.clearRect(0, 0, w, h);
  ctx.font = "14px Inter, Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let ring = 1; ring <= 4; ring++) {
    ctx.beginPath();
    criteria.forEach((_, i) => {
      const angle = (Math.PI * 2 * i) / criteria.length - Math.PI / 2;
      const r = (radius * ring) / 4;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath(); ctx.strokeStyle = "#d0d8e5"; ctx.stroke();
  }
  criteria.forEach((criterion, i) => {
    const angle = (Math.PI * 2 * i) / criteria.length - Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius); ctx.stroke();
    ctx.fillStyle = "#344054";
    const label = criterion.name.replace(" opérationnelle du SOC", "");
    ctx.fillText(label, cx + Math.cos(angle) * (radius + 56), cy + Math.sin(angle) * (radius + 36));
  });
  scenarios.forEach((scenario, index) => {
    ctx.beginPath();
    criteria.forEach((criterion, i) => {
      const angle = (Math.PI * 2 * i) / criteria.length - Math.PI / 2;
      const r = radius * (scenario.scores[criterion.id] / criterion.max);
      const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath(); ctx.fillStyle = `${colors[index % colors.length]}33`; ctx.strokeStyle = colors[index % colors.length]; ctx.lineWidth = 3; ctx.fill(); ctx.stroke();
    ctx.fillStyle = colors[index % colors.length]; ctx.fillRect(24, 22 + index * 24, 14, 14); ctx.fillStyle = "#172033"; ctx.textAlign = "left"; ctx.fillText(scenario.name, 46, 29 + index * 24); ctx.textAlign = "center";
  });
}


function switchTab(targetId) {
  document.querySelectorAll(".tab").forEach((tab) => {
    const isActive = tab.dataset.tabTarget === targetId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.hidden = panel.id !== targetId;
    panel.classList.toggle("active", panel.id === targetId);
  });
  if (targetId === "evaluationPanel") drawKiviat();
}

function render() { renderCriteria(); renderScenarios(); renderTable(); drawKiviat(); }

document.addEventListener("input", (event) => {
  const weightId = event.target.dataset.weight;
  const scenarioNameId = event.target.dataset.scenarioName;
  if (weightId) criteria.find((c) => c.id === weightId).weight = Number(event.target.value) || 0;
  if (scenarioNameId) scenarios.find((s) => s.id === scenarioNameId).name = event.target.value || "Scénario sans nom";
  renderTable(); drawKiviat(); $("#weightTotal").textContent = `Pondération totale : ${totalWeight()}`;
});

document.addEventListener("change", (event) => {
  const score = event.target.dataset.score;
  if (score) {
    const [scenarioId, criterionId] = score.split(":");
    scenarios.find((s) => s.id === scenarioId).scores[criterionId] = Number(event.target.value);
    renderTable(); drawKiviat();
  }
});

document.addEventListener("click", (event) => {
  const tabTarget = event.target.dataset.tabTarget;
  if (tabTarget) switchTab(tabTarget);
  if (event.target.id === "addScenario") {
    scenarios.push({ id: crypto.randomUUID(), name: `Scénario ${scenarios.length + 1}`, scores: Object.fromEntries(criteria.map((c) => [c.id, 0])) });
    render();
  }
  if (event.target.dataset.delete) {
    scenarios = scenarios.filter((s) => s.id !== event.target.dataset.delete);
    render();
  }
});

render();
