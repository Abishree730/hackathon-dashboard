/* -----------------------------
   UTILS
----------------------------- */

async function loadJSON(path) {
  const res = await fetch(`${path}?ts=${Date.now()}`);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function formatTimeAMPM(utcTimestamp) {
  if (!utcTimestamp) return "-";

  const date = new Date(utcTimestamp);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });
}

/* -----------------------------
   LEADERBOARD (FROM JSON)
----------------------------- */

async function renderLeaderboard() {
  const data = await loadJSON("data/compliance.json");

  // Convert object → array
  const rows = Object.entries(data).map(([repo, stats]) => {
    const team = repo.split("-")[0].toUpperCase();

    return {
      team,
      compliance: stats.compliance_percent,
      commits: stats.total_valid_commits,
      missed: stats.missed_windows.length,
      lastCommit: stats.last_valid_commit_utc
    };
  });

  // Sort: compliance desc → commits desc
  rows.sort((a, b) => {
    if (b.compliance !== a.compliance) return b.compliance - a.compliance;
    return b.commits - a.commits;
  });

  let html = `
    <table>
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>Compliance %</th>
        <th>Valid Commits</th>
        <th>Last Commit</th>
        <th>Missed Windows</th>
      </tr>
  `;

  rows.forEach((r, i) => {
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${r.team}</td>
        <td>${r.compliance.toFixed(1)}</td>
        <td>${r.commits}</td>
        <td>${formatTimeAMPM(r.lastCommit)}</td>
        <td>${r.missed}</td>
      </tr>
    `;
  });

  html += "</table>";
  document.getElementById("leaderboard").innerHTML = html;
}

/* -----------------------------
   PENALTIES + SUMMARY
----------------------------- */

async function renderPenaltiesAndStats() {
  const penalties = await loadJSON("data/penalties.json");

  let html = `
    <table>
      <tr>
        <th>Team</th>
        <th>Status</th>
        <th>Missed Windows</th>
      </tr>
  `;

  let total = 0, ok = 0, warning = 0, review = 0;

  Object.entries(penalties).forEach(([repo, data]) => {
    const team = repo.split("-")[0].toUpperCase();
    const level = data.penalty_level.toLowerCase();

    total++;
    if (level === "ok") ok++;
    else if (level === "warning") warning++;
    else review++;

    html += `
      <tr>
        <td>${team}</td>
        <td><span class="badge ${level}">${data.penalty_level}</span></td>
        <td>${data.missed_windows}</td>
      </tr>
    `;
  });

  html += "</table>";
  document.getElementById("penalties").innerHTML = html;

  // Summary cards
  document.getElementById("totalTeams").textContent = total;
  document.getElementById("compliantTeams").textContent = ok;
  document.getElementById("warningTeams").textContent = warning;
  document.getElementById("reviewTeams").textContent = review;
}

/* -----------------------------
   INIT
----------------------------- */

renderLeaderboard();
renderPenaltiesAndStats();
