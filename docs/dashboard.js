async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

async function renderLeaderboard() {
  const res = await fetch("../leaderboard.md");
  const text = await res.text();

  const rows = text
    .split("\n")
    .filter(l => l.startsWith("|") && !l.includes("----"))
    .slice(1);

  let html = `
    <table>
      <tr>
        <th>Rank</th>
        <th>Team</th>
        <th>Compliance %</th>
        <th>Valid Commits</th>
        <th>Missed Windows</th>
      </tr>
  `;

  rows.forEach(r => {
    const c = r.split("|").map(x => x.trim());
    html += `
      <tr>
        <td>${c[1]}</td>
        <td>${c[2]}</td>
        <td>${c[3]}</td>
        <td>${c[4]}</td>
        <td>${c[5]}</td>
      </tr>
    `;
  });

  html += "</table>";
  document.getElementById("leaderboard").innerHTML = html;
}

async function renderPenalties() {
  const data = await loadJSON("../stats/penalties.json");

  let html = `
    <table>
      <tr>
        <th>Team</th>
        <th>Status</th>
        <th>Missed Windows</th>
      </tr>
  `;

  Object.entries(data).forEach(([repo, info]) => {
    const team = repo.split("-")[0].toUpperCase();
    const cls = info.penalty_level.toLowerCase();

    html += `
      <tr>
        <td>${team}</td>
        <td class="${cls}">${info.penalty_level}</td>
        <td>${info.missed_windows}</td>
      </tr>
    `;
  });

  html += "</table>";
  document.getElementById("penalties").innerHTML = html;
}

renderLeaderboard();
renderPenalties();
