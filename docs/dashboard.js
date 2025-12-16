/* -----------------------------
   CONFIG (EASY TO CHANGE)
----------------------------- */

const DATA_PATH = "data";
const TIMEZONE = "Asia/Kolkata";
const LOCALE = "en-IN";

/* -----------------------------
   UTILS
----------------------------- */

async function loadJSON(path) {
  const res = await fetch(`${path}?ts=${Date.now()}`);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function formatTime(value) {
  // Already formatted by backend or "-"
  return value && value !== "-" ? value : "-";
}

/* -----------------------------
   LEADERBOARD
----------------------------- */

async function renderLeaderboard() {
  const data = await loadJSON(`${DATA_PATH}/compliance.json`);

  // Object → Array
  const rows = Object.values(data);

  // Sort: compliance ↓, commits ↓, team name ↑
  rows.sort((a, b) => {
    if (b.compliance_percent !== a.compliance_percent)
      return b.compliance_percent - a.compliance_percent;

    if (b.total_valid_commits !== a.total_valid_commits)
      return b.total_valid_commits - a.total_valid_commits;

    return a.team_name.localeCompare(b.team_name);
  });

  let html = `
    <table>
      <tr>
        <th>Rank</th>
        <th>Team Name</th>
        <th>Compliance %</th>
        <th>Valid Commits</th>
        <th>Last Commit</th>
        <th>Missed Windows</th>
      </tr>
  `;

  rows.forEach((t, i) => {
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${t.team_name}</td>
        <td>${t.compliance_percent.toFixed(1)}</td>
        <td>${t.total_valid_commits}</td>
        <td>${formatTime(t.last_valid_commit_time)}</td>
        <td>${t.missed_windows.length}</td>
      </tr>
    `;
  });

  html += "</table>";

  document.getElementById("leaderboard").innerHTML = html;

  // Summary
  document.getElementById("totalTeams").textContent = rows.length;
}

/* -----------------------------
   PENALTIES + SUMMARY
----------------------------- */

async function renderPenaltiesAndStats() {
  const penalties = await loadJSON(`${DATA_PATH}/penalties.json`);
  const teams = await loadJSON(`${DATA_PATH}/teams.json`);

  let html = `
    <table>
      <tr>
        <th>Team Name</th>
        <th>Status</th>
        <th>Missed Windows</th>
      </tr>
  `;

  let total = 0, ok = 0, warning = 0, review = 0;

  Object.entries(penalties).forEach(([teamId, p]) => {
    const teamName = teams[teamId]?.team_name || teamId;
    const level = p.penalty_level.toLowerCase();

    total++;
    if (level === "ok") ok++;
    else if (level === "warning") warning++;
    else review++;

    html += `
      <tr>
        <td>${teamName}</td>
        <td><span class="badge ${level}">${p.penalty_level}</span></td>
        <td>${p.missed_windows}</td>
      </tr>
    `;
  });

  html += "</table>";
  document.getElementById("penalties").innerHTML = html;

  // Summary cards
  document.getElementById("compliantTeams").textContent = ok;
  document.getElementById("warningTeams").textContent = warning;
  document.getElementById("reviewTeams").textContent = review;
}

/* -----------------------------
   AUTO REFRESH (OPTIONAL)
----------------------------- */

// Refresh every 60 seconds (safe for Pages)
setInterval(() => {
  renderLeaderboard();
  renderPenaltiesAndStats();
}, 60_000);

/* -----------------------------
   INIT
----------------------------- */

renderLeaderboard();
renderPenaltiesAndStats();
