document.documentElement.classList.add("js");

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// Count-up metrics
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const decimals = +(el.dataset.decimals || 0);
  const fmt = (v) => v.toLocaleString("en-US", { useGrouping: target >= 10000, minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  if (reduceMotion) { el.textContent = fmt(target); return; }
  const start = performance.now(), dur = 1400;
  const tick = (t) => {
    const p = Math.min((t - start) / dur, 1);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
document.querySelectorAll("[data-count]").forEach(countUp);

// BFS over a small graph
(function bfsFigure() {
  const svg = document.getElementById("bfs");
  const label = document.getElementById("bfs-step");
  if (!svg) return;
  const NS = "http://www.w3.org/2000/svg";
  const nodes = [
    [160, 50], [70, 115], [250, 110], [40, 215], [140, 190],
    [215, 225], [290, 200], [95, 285], [185, 290], [270, 285],
  ];
  const edges = [[0,1],[0,2],[1,3],[1,4],[2,4],[2,6],[4,5],[3,7],[4,8],[5,8],[6,9],[5,9],[7,8]];
  const adj = nodes.map(() => []);
  const edgeEls = {};
  for (const [a, b] of edges) {
    adj[a].push(b); adj[b].push(a);
    const l = document.createElementNS(NS, "line");
    l.setAttribute("class", "edge");
    l.setAttribute("x1", nodes[a][0]); l.setAttribute("y1", nodes[a][1]);
    l.setAttribute("x2", nodes[b][0]); l.setAttribute("y2", nodes[b][1]);
    svg.appendChild(l);
    edgeEls[a + "-" + b] = edgeEls[b + "-" + a] = l;
  }
  const nodeEls = nodes.map(([x, y], i) => {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "node");
    g.innerHTML = `<circle cx="${x}" cy="${y}" r="16"/><text x="${x}" y="${y}">${i}</text><text class="dist" x="${x}" y="${y - 24}"></text>`;
    svg.appendChild(g);
    return g;
  });

  // Precompute BFS event sequence
  const steps = [];
  const dist = Array(nodes.length).fill(-1);
  dist[0] = 0; steps.push({ seen: 0, d: 0 });
  const q = [0];
  while (q.length) {
    const u = q.shift();
    steps.push({ done: u });
    for (const v of adj[u]) if (dist[v] < 0) {
      dist[v] = dist[u] + 1; q.push(v);
      steps.push({ seen: v, from: u, d: dist[v] });
    }
  }

  function reset() {
    nodeEls.forEach((g) => { g.setAttribute("class", "node"); g.querySelector(".dist").textContent = ""; });
    Object.values(edgeEls).forEach((l) => l.setAttribute("class", "edge"));
  }
  function apply(s) {
    if (s.done !== undefined) nodeEls[s.done].setAttribute("class", "node done");
    else {
      nodeEls[s.seen].setAttribute("class", "node seen");
      nodeEls[s.seen].querySelector(".dist").textContent = "d=" + s.d;
      if (s.from !== undefined) edgeEls[s.from + "-" + s.seen].setAttribute("class", "edge on");
    }
  }

  if (reduceMotion) { steps.forEach(apply); label.textContent = "done"; return; }
  let i = 0;
  setInterval(() => {
    if (i === steps.length + 4) { reset(); i = 0; }
    if (i < steps.length) apply(steps[i]);
    label.textContent = i < steps.length ? "step " + (i + 1) : "done";
    i++;
  }, 550);
})();
