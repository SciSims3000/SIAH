const githubSources = [
  {
    source: "SciSims",
    repository: "SciSims3000/SciSims",
    siteUrl: "https://scisims3000.github.io/SciSims/"
  },
  {
    source: "StudyBuddy 3000",
    repository: "SciSims3000/SB3K",
    siteUrl: "https://github.com/SciSims3000/SB3K"
  }
];

const updatesGrid = document.querySelector("#updates-grid");
const statusMessage = document.querySelector("#updates-status");
const refreshButton = document.querySelector("#refresh-updates");
const yearElement = document.querySelector("#year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(dateString));
}

function cleanCommitMessage(message) {
  const firstLine = message.split("\n")[0].trim();
  return firstLine || "Repository update";
}

function getSydneyCalendarDay(dateString) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(dateString));

  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function describeDigest(commits) {
  const multipleSources = new Set(commits.map((commit) => commit.source)).size > 1;
  const highlights = commits.slice(0, 3).map((commit) =>
    multipleSources ? `${commit.source}: ${commit.title}` : commit.title
  );
  const remaining = commits.length - highlights.length;

  return `${highlights.join(" • ")}${remaining > 0 ? ` • Plus ${remaining} more.` : ""}`;
}

function groupCommitsByDay(commits) {
  const days = new Map();

  commits
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((commit) => {
      const day = getSydneyCalendarDay(commit.date);
      const group = days.get(day) || [];
      group.push(commit);
      days.set(day, group);
    });

  return [...days.values()].map((dayCommits) => {
    const sources = [...new Set(dayCommits.map((commit) => commit.source))];
    return {
      source: sources.join(" + "),
      title: `Daily development digest — ${dayCommits.length} update${dayCommits.length === 1 ? "" : "s"}`,
      description: describeDigest(dayCommits),
      date: dayCommits[0].date,
      url: sources.length === 1
        ? dayCommits[0].siteUrl
        : "https://github.com/SciSims3000"
    };
  });
}

function createUpdateCard(update) {
  const article = document.createElement("article");
  article.className = "update-card";

  const source = document.createElement("p");
  source.className = "update-source";
  source.textContent = update.source;

  const heading = document.createElement("h3");
  const link = document.createElement("a");
  link.href = update.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = update.title;
  heading.appendChild(link);

  const description = document.createElement("p");
  description.textContent = update.description;

  const date = document.createElement("div");
  date.className = "update-date";
  date.textContent = formatDate(update.date);

  article.append(source, heading, description, date);
  return article;
}

async function loadGithubUpdates() {
  const requests = githubSources.map(async (project) => {
    const endpoint =
      `https://api.github.com/repos/${project.repository}/commits?per_page=100`;

    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/vnd.github+json"
      }
    });

    if (!response.ok) {
      throw new Error(`Could not load ${project.source}`);
    }

    const commits = await response.json();

    return commits.map((item) => ({
      source: project.source,
      title: cleanCommitMessage(item.commit.message),
      description: `Development update by ${item.commit.author.name}.`,
      date: item.commit.author.date,
      url: item.html_url,
      siteUrl: project.siteUrl
    }));
  });

  const results = await Promise.allSettled(requests);
  const commits = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );
  return groupCommitsByDay(commits);
}

async function loadManualUpdates() {
  try {
    const response = await fetch("data/updates.json", {
      cache: "no-store"
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch {
    return [];
  }
}

async function loadUpdates() {
  statusMessage.textContent = "Loading the latest updates…";
  refreshButton.disabled = true;

  try {
    const [githubUpdates, manualUpdates] = await Promise.all([
      loadGithubUpdates(),
      loadManualUpdates()
    ]);

    const combined = [...githubUpdates, ...manualUpdates]
      .filter((item) => item.date && item.title && item.url)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 9);

    updatesGrid.replaceChildren();

    if (combined.length === 0) {
      statusMessage.textContent =
        "Updates could not be loaded. Use the project links above.";
      return;
    }

    combined.forEach((update) => {
      updatesGrid.appendChild(createUpdateCard(update));
    });

    statusMessage.textContent =
      `Showing ${combined.length} recent update${combined.length === 1 ? "" : "s"}.`;
  } catch (error) {
    console.error(error);
    statusMessage.textContent =
      "Updates could not be loaded. Use the project links above.";
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener("click", loadUpdates);
loadUpdates();
