/**
 * Builds stub R1–R6 JSON. Coordinates are educational placeholders.
 * TODO: replace with film-traced / coach-approved spots.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "content", "rotations");

const ROLES = {
  S: "Setter",
  OPP: "Opposite",
  OH1: "Outside",
  OH2: "Outside",
  MB1: "Middle",
  MB2: "Middle",
  L: "Libero",
};

const BASE = {
  1: { x: 0.82, y: 0.76 },
  2: { x: 0.82, y: 0.22 },
  3: { x: 0.5, y: 0.18 },
  4: { x: 0.18, y: 0.22 },
  5: { x: 0.2, y: 0.76 },
  6: { x: 0.5, y: 0.8 },
};

const START = { 1: "S", 2: "OPP", 3: "MB1", 4: "OH1", 5: "OH2", 6: "MB2" };

const TITLES = {
  1: "Rotation 1 — Setter serve",
  2: "Rotation 2 — Setter right front",
  3: "Rotation 3 — Setter middle front",
  4: "Rotation 4 — Setter left front",
  5: "Rotation 5 — Setter left back",
  6: "Rotation 6 — Setter middle back",
};

const SUMMARIES = {
  1: "Setter in P1. Three front-row attackers: opposite, middle, outside.",
  2: "Setter in P2. Front row is setter, opposite, middle.",
  3: "Setter in P3. Front row is setter, opposite, and the available pin.",
  4: "Setter in P4. Two pin attackers plus the setter at the left front.",
  5: "Setter in P5. Three front-row attackers; setter takes left-back channel.",
  6: "Setter in P6. Three front-row attackers; setter starts middle back.",
};

function rotateLineup(times) {
  let lineup = { ...START };
  for (let i = 0; i < times; i += 1) {
    lineup = {
      1: lineup[2],
      2: lineup[3],
      3: lineup[4],
      4: lineup[5],
      5: lineup[6],
      6: lineup[1],
    };
  }
  return lineup;
}

function backRowMiddle(lineup) {
  for (const pos of [1, 5, 6]) {
    const id = lineup[pos];
    if (id === "MB1" || id === "MB2") return id;
  }
  return "MB2";
}

function place(id, courtPos, dx = 0, dy = 0) {
  const base = BASE[courtPos];
  return {
    x: clamp(base.x + dx),
    y: clamp(base.y + dy),
    role: ROLES[id],
    courtPos,
  };
}

function clamp(n) {
  return Math.round(Math.min(0.96, Math.max(0.06, n)) * 100) / 100;
}

function invertLineup(lineup) {
  const byId = {};
  for (const [pos, id] of Object.entries(lineup)) {
    byId[id] = Number(pos);
  }
  return byId;
}

function allPositions(lineup, mutators = {}) {
  const byId = invertLineup(lineup);
  const backId = backRowMiddle(lineup);
  const positions = {};
  for (const id of ["S", "OPP", "OH1", "OH2", "MB1", "MB2"]) {
    const courtPos = byId[id];
    const extra = mutators[id] ?? [0, 0];
    positions[id] = place(id, courtPos, extra[0], extra[1]);
  }
  const mbPos = byId[backId];
  const lExtra = mutators.L ?? [-0.02, -0.08];
  positions.L = {
    ...place("L", mbPos, lExtra[0], lExtra[1]),
    courtPos: mbPos,
  };
  return positions;
}

function serveSteps(lineup) {
  return [
    {
      id: "base",
      label: "Base lineup",
      cue: "Hold rotational order until contact. TODO: confirm serve-foot spots.",
      positions: allPositions(lineup),
    },
    {
      id: "toss",
      label: "Serve toss",
      cue: "Server steps to the endline. Front row stays legal.",
      positions: allPositions(lineup, {
        [lineup[1]]: [0.02, 0.14],
      }),
    },
    {
      id: "release",
      label: "Release",
      cue: "Pins and middle start their approach once the ball is contacted.",
      positions: allPositions(lineup, {
        [lineup[4]]: [-0.04, -0.06],
        [lineup[3]]: [0, -0.04],
        [lineup[2]]: [0.04, -0.06],
        [lineup[1]]: [0.04, 0.06],
      }),
    },
    {
      id: "cover",
      label: "Cover / transition",
      cue: "Collapse to cover, then the setter hunts the second ball.",
      positions: allPositions(lineup, {
        S: lineup[1] === "S" || lineup[6] === "S" || lineup[5] === "S"
          ? [lineup[2] === "S" ? 0 : 0.16, -0.28]
          : [0.08, -0.04],
        [lineup[4]]: [-0.02, -0.1],
        [lineup[2]]: [0.02, -0.1],
      }),
    },
  ];
}

function receiveSteps(lineup, look) {
  const byId = invertLineup(lineup);
  const setterFront = [2, 3, 4].includes(byId.S);

  if (look === "3-person") {
    return [
      {
        id: "platform",
        label: "3-person platform",
        cue: "Three passers across the back. Setter hides on the right.",
        positions: allPositions(lineup, {
          S: setterFront ? [0.06, 0.04] : [0.08, -0.04],
          L: [0, -0.12],
          OH1: byId.OH1 >= 4 ? [-0.02, 0.16] : [0, 0],
          OH2: byId.OH2 >= 4 ? [0.02, 0.12] : [0, 0],
          OPP: byId.OPP === 1 || byId.OPP === 2 ? [0.04, 0.08] : [0, 0],
        }),
      },
      {
        id: "pass",
        label: "Pass",
        cue: "Target the setter. Non-passers freeze until the platform.",
        positions: allPositions(lineup, {
          L: [0.04, -0.16],
          S: setterFront ? [0.02, -0.02] : [0.12, -0.18],
        }),
      },
      {
        id: "set",
        label: "Set",
        cue: "Setter at the net, hitters on their approach lanes.",
        positions: allPositions(lineup, {
          S: [0.12 - (BASE[byId.S].x - 0.62), 0.08 - BASE[byId.S].y],
          [lineup[4]]: [-0.04, -0.08],
          [lineup[2]]: [0.04, -0.08],
          [lineup[3]]: [0, -0.06],
        }),
      },
      {
        id: "attack",
        label: "Attack",
        cue: "Pins at the antenna, middle closing. Cover behind the hitter.",
        positions: allPositions(lineup, {
          S: [0.1 - (BASE[byId.S].x - 0.58), 0.1 - BASE[byId.S].y],
          [lineup[4]]: [-0.06, -0.12],
          [lineup[2]]: [0.06, -0.12],
        }),
      },
    ];
  }

  if (look === "2-person") {
    return [
      {
        id: "platform",
        label: "2-person platform",
        cue: "Two primary passers; others pull off the seam.",
        positions: allPositions(lineup, {
          L: [-0.12, -0.1],
          OH1: byId.OH1 >= 5 ? [0.16, 0.02] : [0.08, 0.18],
          OH2: byId.OH2 >= 5 ? [0.1, 0] : [-0.08, 0.16],
          S: setterFront ? [0.04, 0.02] : [0.1, -0.02],
        }),
      },
      {
        id: "pass",
        label: "Pass",
        cue: "The two-person look gives a wider swing hitter.",
        positions: allPositions(lineup, {
          L: [-0.08, -0.14],
          S: setterFront ? [0.02, 0] : [0.12, -0.16],
        }),
      },
      {
        id: "set",
        label: "Set",
        cue: "Setter still hunts the same target — only the platform changed.",
        positions: allPositions(lineup, {
          S: [0.1 - (BASE[byId.S].x - 0.62), 0.08 - BASE[byId.S].y],
        }),
      },
    ];
  }

  return [
    {
      id: "platform",
      label: "W-pass",
      cue: "Four-player W: two short, two deep. Use vs a tough floater.",
      positions: allPositions(lineup, {
        L: [0, -0.06],
        OH1: [0.02, 0.08],
        OH2: [-0.02, 0.08],
        OPP: [0.06, 0.04],
        S: setterFront ? [0.05, 0.03] : [0.1, 0],
      }),
    },
    {
      id: "pass",
      label: "Pass",
      cue: "Short passers take the first third; deep passers own the endline.",
      positions: allPositions(lineup, {
        L: [0.03, -0.1],
        S: setterFront ? [0.02, 0] : [0.12, -0.14],
      }),
    },
    {
      id: "set",
      label: "Set",
      cue: "W folds back into a standard 5-1 attack shape.",
      positions: allPositions(lineup, {
        S: [0.1 - (BASE[byId.S].x - 0.62), 0.08 - BASE[byId.S].y],
        [lineup[4]]: [-0.04, -0.08],
        [lineup[2]]: [0.04, -0.08],
      }),
    },
  ];
}

function buildRotation(n) {
  const lineup = rotateLineup(n - 1);
  return {
    id: `r${n}`,
    rotation: n,
    title: TITLES[n],
    summary: SUMMARIES[n],
    notes:
      "TODO: refine coordinates against film / coach diagrams. Values are normalized 0–1 stubs (x left→right, y net→endline).",
    lineup,
    backRowMiddleId: backRowMiddle(lineup),
    modes: {
      serve: { steps: serveSteps(lineup) },
      "serve-receive": {
        passingAlternates: [
          {
            id: "3-person",
            name: "3-person",
            description: "Standard three-passer serve-receive.",
            steps: receiveSteps(lineup, "3-person"),
          },
          {
            id: "2-person",
            name: "2-person",
            description: "Two primary passers, everyone else pulled off.",
            steps: receiveSteps(lineup, "2-person"),
          },
          {
            id: "w-pass",
            name: "W-pass",
            description: "Four-player W against a tough floater.",
            steps: receiveSteps(lineup, "w-pass"),
          },
        ],
      },
    },
  };
}

mkdirSync(OUT, { recursive: true });
for (let n = 1; n <= 6; n += 1) {
  const json = JSON.stringify(buildRotation(n), null, 2) + "\n";
  writeFileSync(join(OUT, `r${n}.json`), json);
  console.log("wrote", `r${n}.json`);
}
