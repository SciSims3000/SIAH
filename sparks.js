const sparksGrid = document.querySelector("#sparks-grid");
const sparksStatus = document.querySelector("#sparks-status");
const searchInput = document.querySelector("#spark-search");
const stageFilter = document.querySelector("#stage-filter");
const topicFilter = document.querySelector("#topic-filter");
const methodFilter = document.querySelector("#method-filter");
const triggerFilter = document.querySelector("#trigger-filter");
const clearButton = document.querySelector("#clear-spark-filters");

let sparks = [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function uniqueValues(key) {
  return [...new Set(sparks.flatMap((spark) => spark.tags[key] || []))].sort();
}

function populateSelect(select, values, label) {
  select.replaceChildren(new Option(label, ""));
  values.forEach((value) => select.add(new Option(value, value)));
}

function tagMarkup(values, className = "spark-tag") {
  return values.map((value) => `<span class="${className}">${escapeHtml(value)}</span>`).join("");
}

function sourceMarkup(sources) {
  return sources.map((source) => `
    <li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)} <span aria-hidden="true">↗</span></a></li>
  `).join("");
}

function createSparkCard(spark) {
  const article = document.createElement("article");
  article.className = "spark-card";
  article.innerHTML = `
    <div class="spark-card-topline">
      <span class="spark-trigger">${escapeHtml(spark.trigger)}</span>
      <span class="spark-date">${escapeHtml(spark.tags.sourceDate)}</span>
    </div>
    <h2>${escapeHtml(spark.title)}</h2>
    <div class="spark-tags" aria-label="Tags">
      ${tagMarkup(spark.tags.stage)}
      ${tagMarkup(spark.tags.topic)}
      ${tagMarkup(spark.tags.workingScientifically, "spark-tag spark-tag-method")}
    </div>
    <dl class="spark-details">
      <div><dt>Big idea</dt><dd>${escapeHtml(spark.bigIdea)}</dd></div>
      <div class="spark-prompt"><dt>Prompt</dt><dd>${escapeHtml(spark.prompt)}</dd></div>
      <div><dt>Evidence move</dt><dd>${escapeHtml(spark.evidenceMove)}</dd></div>
      <div><dt>Extension</dt><dd>${escapeHtml(spark.extension)}</dd></div>
    </dl>
    <details class="spark-sources">
      <summary>Sources and links</summary>
      <ul>${sourceMarkup(spark.sources)}</ul>
    </details>
  `;
  return article;
}

function matchesFilter(spark, value, key) {
  return !value || (spark.tags[key] || []).includes(value);
}

function visibleSparks() {
  const query = searchInput.value.trim().toLowerCase();
  return sparks.filter((spark) => {
    const searchable = [
      spark.title,
      spark.trigger,
      spark.bigIdea,
      spark.prompt,
      spark.evidenceMove,
      spark.extension,
      ...(spark.tags.stage || []),
      ...(spark.tags.topic || []),
      ...(spark.tags.workingScientifically || [])
    ].join(" ").toLowerCase();

    return (!query || searchable.includes(query))
      && matchesFilter(spark, stageFilter.value, "stage")
      && matchesFilter(spark, topicFilter.value, "topic")
      && matchesFilter(spark, methodFilter.value, "workingScientifically")
      && (!triggerFilter.value || spark.trigger === triggerFilter.value);
  });
}

function renderSparks() {
  const visible = visibleSparks();
  sparksGrid.replaceChildren(...visible.map(createSparkCard));
  sparksStatus.textContent = `${visible.length} of ${sparks.length} Spark${sparks.length === 1 ? "" : "s"} shown.`;
}

function clearFilters() {
  searchInput.value = "";
  [stageFilter, topicFilter, methodFilter, triggerFilter].forEach((select) => {
    select.value = "";
  });
  renderSparks();
  searchInput.focus();
}

async function loadSparks() {
  sparksStatus.textContent = "Loading the Sparks…";
  try {
    const response = await fetch("data/teaching-sparks.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load Sparks");
    sparks = await response.json();
    populateSelect(stageFilter, uniqueValues("stage"), "All stages");
    populateSelect(topicFilter, uniqueValues("topic"), "All topics");
    populateSelect(methodFilter, uniqueValues("workingScientifically"), "All Working Scientifically moves");
    populateSelect(triggerFilter, [...new Set(sparks.map((spark) => spark.trigger))].sort(), "All triggers");
    renderSparks();
  } catch (error) {
    console.error(error);
    sparksStatus.textContent = "The Sparks could not be loaded. Please try again later.";
  }
}

[searchInput, stageFilter, topicFilter, methodFilter, triggerFilter].forEach((control) => {
  control.addEventListener("input", renderSparks);
  control.addEventListener("change", renderSparks);
});
clearButton.addEventListener("click", clearFilters);
loadSparks();
