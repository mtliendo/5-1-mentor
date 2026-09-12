/**
 * Builds Focus Otter 5-1 rotation JSON (R1–R6).
 *
 * Half-court, net at TOP. Normalized 0–1: x left→right, y net→endline.
 * Stack = cheat toward target base while staying legal at contact.
 * Libero L overlays back-row middle (backRowMiddleId) in every step.
 *
 * START lineup is the coach / user source of truth. Do not revert to the
 * old ConanLiuMD pin assignment {1:S, 2:OPP, 3:MB1, 4:OH1, 5:OH2, 6:MB2}.
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

/** Zone anchors (approx) — also used as defensive / attack base. */
const ZONE = {
  1: { x: 0.82, y: 0.78 },
  2: { x: 0.82, y: 0.2 },
  3: { x: 0.5, y: 0.18 },
  4: { x: 0.18, y: 0.2 },
  5: { x: 0.2, y: 0.78 },
  6: { x: 0.5, y: 0.8 },
};

/** Correct R1 start. Rotate clockwise for R2–R6. */
const START = { 1: "S", 2: "OH1", 3: "MB2", 4: "OPP", 5: "OH2", 6: "MB1" };

const TITLES = {
  1: "Rotation 1 — Setter serve",
  2: "Rotation 2 — Setter middle back",
  3: "Rotation 3 — Setter left back",
  4: "Rotation 4 — Setter left front",
  5: "Rotation 5 — Setter middle front",
  6: "Rotation 6 — Setter right front",
};

const SUMMARIES = {
  1: "S at P1 serving. Front-row attackers: RS/opposite (P4), MB2 (P3), OH1 (P2). L overlays MB1 in P6.",
  2: "S at P6. OH1 serves from P1, then enters left-back. Front base is OH2–MB2–RS.",
  3: "S at P5. L or MB2 serves; MB1 is the front middle. L comes back in for the back-row middle.",
  4: "S at P4 (left front). RS/opposite serves. Two front-row attackers after the stack: OH2 and MB1.",
  5: "S at P3 (middle front). OH2 serves — optionally from the left side of the endline.",
  6: "S at P2 (right front). MB1 serves (L cannot serve this middle if already serving for MB2).",
};

const NOTES = {
  1: "OH cover setter is the everyday receive: OH1 drops back so S can hide, then RS swings left on first ball. RS-cover tucks S closer to the setting spot.",
  2: "Front MB2 + RS stack so they can step to 3 and 2 after contact. Receive: shift MB2, S, and RS right; L and both outsides pass.",
  3: "Tricky receive — S is back-left, far from the setting spot. Push S up toward the net, still behind MB1 and left of OH1. OH2 can drop to pass.",
  4: "Serve stack is S / MB1 / OH2, then release to OH2@4, MB1@3, S@2. Primary receive: S+MB1 shade left, RS stays back-right, OH2 drops to pass.",
  5: "Easy serve: OH1 and the back row are already near base; only MB1 and S need a stack. Receive: OH1 drops and L covers RS, or let RS pass.",
  6: "If L would be front, MB2 stays in. After the serve, L is back in for the middle. OH1 + MB2 ready to hit; back-row OH can pipe.",
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

function invertLineup(lineup) {
  const byId = {};
  for (const [pos, id] of Object.entries(lineup)) {
    byId[id] = Number(pos);
  }
  return byId;
}

function clamp(n) {
  return Math.round(Math.min(0.96, Math.max(0.06, n)) * 100) / 100;
}

function zone(pos) {
  return [ZONE[pos].x, ZONE[pos].y];
}

/** Absolute placements. `coords` is PlayerId → [x, y]. L is required. */
function placements(lineup, coords) {
  const byId = invertLineup(lineup);
  const backId = backRowMiddle(lineup);
  const positions = {};
  for (const id of ["S", "OPP", "OH1", "OH2", "MB1", "MB2"]) {
    const pair = coords[id];
    if (!pair) {
      throw new Error(`Missing coords for ${id}`);
    }
    positions[id] = {
      x: clamp(pair[0]),
      y: clamp(pair[1]),
      role: ROLES[id],
      courtPos: byId[id],
    };
  }
  if (!coords.L) {
    throw new Error("Missing L coords");
  }
  positions.L = {
    x: clamp(coords.L[0]),
    y: clamp(coords.L[1]),
    role: ROLES.L,
    courtPos: byId[backId],
  };
  return positions;
}

function step(id, label, cue, lineup, coords) {
  return { id, label, cue, positions: placements(lineup, coords) };
}

function alternate(id, name, description, steps) {
  return { id, name, description, steps };
}

const CONTACT_PAIRS = [
  [4, 3, "x"],
  [3, 2, "x"],
  [5, 6, "x"],
  [6, 1, "x"],
  [4, 5, "y"],
  [3, 6, "y"],
  [2, 1, "y"],
];

/** Libero-on view: hide back-row middle, L keeps that courtPos. */
function illegalContact(positions, backId) {
  const byPos = {};
  for (const [id, p] of Object.entries(positions)) {
    if (id === backId) continue;
    byPos[p.courtPos] = p;
  }
  const bad = [];
  for (const [a, b, axis] of CONTACT_PAIRS) {
    const leftOrFront = byPos[a];
    const rightOrBack = byPos[b];
    if (!leftOrFront || !rightOrBack) continue;
    const legal =
      axis === "x"
        ? leftOrFront.x < rightOrBack.x
        : leftOrFront.y < rightOrBack.y;
    if (!legal) bad.push(`${a}/${b} (${axis})`);
  }
  return bad;
}

function assertContact(tag, positions, backId) {
  const bad = illegalContact(positions, backId);
  if (bad.length) {
    console.warn(`overlap at ${tag}: ${bad.join(", ")}`);
  }
}

function servePattern(lineup, { stack, toss, release, base, cues }) {
  return [
    step("stack", "Stack", cues.stack, lineup, stack),
    step("toss", "Toss", cues.toss, lineup, toss),
    step("release", "Release", cues.release, lineup, release),
    step("base", "Base", cues.base, lineup, base),
  ];
}

function receivePair(lineup, { platform, base, cues }) {
  return [
    step("platform", "Platform", cues.platform, lineup, platform),
    step("base", "Base", cues.base, lineup, base),
  ];
}

/* ---------- R1: S serves (P1) ---------- */

function r1Serve(lineup) {
  const stack = {
    OPP: [0.36, 0.24],
    MB2: [0.5, 0.12],
    OH1: [0.64, 0.24],
    OH2: [0.22, 0.78],
    MB1: [0.5, 0.8],
    S: [0.82, 0.86],
    L: [0.5, 0.8],
  };
  const toss = { ...stack, S: [0.82, 0.94] };
  const release = {
    OPP: [0.24, 0.21],
    MB2: [0.5, 0.16],
    OH1: [0.76, 0.21],
    OH2: [0.2, 0.78],
    MB1: [0.5, 0.8],
    S: [0.82, 0.84],
    L: [0.5, 0.8],
  };
  const base = {
    S: zone(1),
    OH1: zone(2),
    MB2: zone(3),
    OPP: zone(4),
    OH2: zone(5),
    MB1: zone(6),
    L: zone(6),
  };
  return servePattern(lineup, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "Front near mid-net: MB2 closest to the tape, RS and OH1 tucked beside. Stay legal until contact.",
      toss: "S tosses from the endline at P1. Front row holds the mid-net stack.",
      release:
        "Ball is served — release to base. RS to left front, OH1 to right front, MB2 stays middle.",
      base: "Base defense: S@1, OH1@2, MB2@3, RS@4, OH2@5, L/MB1@6.",
    },
  });
}

function r1Receive(lineup) {
  const attackBase = {
    S: [0.68, 0.16],
    OPP: [0.16, 0.16],
    MB2: [0.5, 0.16],
    OH1: [0.82, 0.2],
    OH2: zone(5),
    MB1: zone(6),
    L: zone(6),
  };
  return [
    alternate(
      "oh-cover-setter",
      "OH cover S",
      "Everyday look: OH1 drops back to hide and cover S. Passers include OH1. RS swings left/outside on first ball; OH1 can hit the right side after.",
      receivePair(lineup, {
        platform: {
          OPP: [0.18, 0.2],
          MB2: [0.5, 0.16],
          OH1: [0.66, 0.46],
          S: [0.78, 0.62],
          OH2: [0.22, 0.78],
          MB1: [0.5, 0.8],
          L: [0.5, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "OH1 drops back to cover S. S tucks behind OH1. Passers: OH1, OH2, L.",
          base: "Ball is over — RS hits left/outside on first ball. OH1 can swing right after. Everyone else to base.",
        },
      }),
    ),
    alternate(
      "rs-cover",
      "RS cover",
      "RS drops back so S can start closer to the setting spot instead of hiding deep behind OH1.",
      receivePair(lineup, {
        platform: {
          OPP: [0.28, 0.48],
          MB2: [0.5, 0.16],
          OH1: [0.82, 0.22],
          S: [0.72, 0.38],
          OH2: [0.2, 0.78],
          MB1: [0.5, 0.8],
          L: [0.5, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "RS drops back to cover. S starts closer to the setting spot, still behind OH1.",
          base: "Ball is over — short moves to base. S finishes at the setting target.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "Two platforms (L + OH2) so OH1 can stay on the right pin and RS stays on the left swing.",
      receivePair(lineup, {
        platform: {
          OPP: [0.16, 0.2],
          MB2: [0.48, 0.16],
          OH1: [0.8, 0.24],
          S: [0.8, 0.52],
          OH2: [0.28, 0.72],
          MB1: [0.52, 0.8],
          L: [0.56, 0.68],
        },
        base: attackBase,
        cues: {
          platform:
            "Two-person: L and OH2 take the pass. Everyone else pulls off the seam.",
          base: "Same 5-1 attack shape — only the platform changed.",
        },
      }),
    ),
    alternate(
      "w-pass",
      "W-pass",
      "Four-player W (two short, two deep) against a tough floater or short serve in this rotation.",
      receivePair(lineup, {
        platform: {
          OPP: [0.28, 0.4],
          MB2: [0.5, 0.16],
          OH1: [0.7, 0.42],
          S: [0.82, 0.62],
          OH2: [0.22, 0.82],
          MB1: [0.5, 0.8],
          L: [0.54, 0.76],
        },
        base: attackBase,
        cues: {
          platform:
            "W-pass: RS and OH1 short, OH2 and L deep. S stays hidden behind the right short passer.",
          base: "W folds into the standard 5-1 attack shape.",
        },
      }),
    ),
  ];
}

/* ---------- R2: OH1 serves; S@6 ---------- */

function r2Serve(lineup) {
  const stack = {
    OH2: [0.2, 0.2],
    OPP: [0.56, 0.2],
    MB2: [0.66, 0.14],
    OH1: [0.82, 0.88],
    MB1: [0.22, 0.78],
    S: [0.7, 0.78],
    L: [0.48, 0.8],
  };
  const toss = { ...stack, OH1: [0.82, 0.94] };
  const release = {
    OH2: [0.18, 0.2],
    MB2: [0.52, 0.18],
    OPP: [0.76, 0.2],
    OH1: [0.32, 0.8],
    MB1: [0.48, 0.8],
    S: [0.8, 0.78],
    L: [0.5, 0.8],
  };
  const base = {
    OH2: zone(4),
    MB2: zone(3),
    OPP: zone(2),
    OH1: zone(5),
    MB1: zone(6),
    S: zone(1),
    L: zone(6),
  };
  return servePattern(lineup, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "Front MB2 + RS stack to reach base sooner (MB2→3, RS→2). OH2 is already near left front.",
      toss: "OH1 tosses from the P1 endline. Front holds the stack until contact.",
      release:
        "After contact: MB2 to 3, RS to 2, OH1 enters left-back (5). S slides to 1, L to 6.",
      base: "Base: front OH2@4, MB2@3, RS@2. Back OH1@5, L@6, S@1.",
    },
  });
}

function r2Receive(lineup) {
  const attackBase = {
    S: [0.68, 0.16],
    OH2: zone(4),
    MB2: zone(3),
    OPP: zone(2),
    OH1: zone(5),
    MB1: zone(6),
    L: zone(6),
  };
  return [
    alternate(
      "outsides-and-l",
      "Outsides + L",
      "Shift MB2, S, and RS right (MB2 to the right sideline) so L and both outsides can pass.",
      receivePair(lineup, {
        platform: {
          OH2: [0.24, 0.48],
          OPP: [0.72, 0.18],
          MB2: [0.92, 0.2],
          OH1: [0.78, 0.78],
          MB1: [0.48, 0.8],
          S: [0.68, 0.52],
          L: [0.48, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "MB2, S, and RS shift right — MB2 to the right sideline. Passers: L, OH1, OH2.",
          base: "Ball is over — front to OH2@4, MB2@3, RS@2. S to the setting target.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "L and OH1 take the pass so OH2 can stay on the left pin against a tough jump-float.",
      receivePair(lineup, {
        platform: {
          OH2: [0.18, 0.22],
          OPP: [0.74, 0.18],
          MB2: [0.9, 0.2],
          OH1: [0.72, 0.76],
          MB1: [0.46, 0.8],
          S: [0.66, 0.5],
          L: [0.42, 0.68],
        },
        base: attackBase,
        cues: {
          platform:
            "Two-person: L and OH1 pass. OH2 stays left front. Front still shaded right to stay legal.",
          base: "Same base as the outsides + L look.",
        },
      }),
    ),
    alternate(
      "w-pass",
      "W-pass",
      "Add a short passer (OH2) for a floater that drops in front of the 10-foot line.",
      receivePair(lineup, {
        platform: {
          OH2: [0.26, 0.4],
          OPP: [0.7, 0.18],
          MB2: [0.9, 0.2],
          OH1: [0.76, 0.8],
          MB1: [0.5, 0.8],
          S: [0.66, 0.5],
          L: [0.5, 0.74],
        },
        base: attackBase,
        cues: {
          platform:
            "W: OH2 short left, L mid, OH1 deep right. MB2 / RS / S stay shifted right.",
          base: "W folds into OH2–MB2–RS front and S at the target.",
        },
      }),
    ),
  ];
}

/* ---------- R3: L or MB2 serves; S@5; MB1 front ---------- */

function r3Serve(lineup) {
  const stack = {
    MB1: [0.28, 0.18],
    OH2: [0.42, 0.16],
    OPP: [0.82, 0.2],
    MB2: [0.82, 0.88],
    S: [0.58, 0.78],
    OH1: [0.7, 0.8],
    L: [0.88, 0.92],
  };
  const toss = { ...stack, MB2: [0.82, 0.94], L: [0.88, 0.94] };
  const release = {
    MB1: [0.5, 0.18],
    OH2: [0.22, 0.2],
    OPP: [0.82, 0.2],
    MB2: [0.82, 0.78],
    S: [0.78, 0.76],
    OH1: [0.24, 0.78],
    L: [0.5, 0.8],
  };
  const base = {
    OH2: zone(4),
    MB1: zone(3),
    OPP: zone(2),
    S: zone(1),
    OH1: zone(5),
    MB2: zone(6),
    L: zone(6),
  };
  return servePattern(lineup, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "MB1 is the front middle — L cannot be front. Stack to base ASAP. L is ready to serve or to step in for the back-row middle.",
      toss: "L or MB2 tosses from the P1 endline. Front holds until contact.",
      release:
        "L immediately back in for the back-row middle. Front releases to OH2@4, MB1@3, RS@2.",
      base: "Base defense: S@1, RS@2, MB1@3, OH2@4, OH1@5, L@6.",
    },
  });
}

function r3Receive(lineup) {
  const attackBase = {
    S: [0.68, 0.16],
    OH2: zone(4),
    MB1: zone(3),
    OPP: zone(2),
    OH1: zone(5),
    MB2: zone(6),
    L: zone(6),
  };
  return [
    alternate(
      "s-push-up",
      "S push-up",
      "S is back-left, far from the setting spot. Push S up toward the net — still behind MB1 and left of OH1 — and let OH2 drop to pass.",
      receivePair(lineup, {
        platform: {
          MB1: [0.18, 0.2],
          OH2: [0.48, 0.42],
          OPP: [0.82, 0.2],
          S: [0.3, 0.36],
          OH1: [0.5, 0.7],
          MB2: [0.82, 0.78],
          L: [0.72, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "Push S up toward the net, behind MB1 and left of OH1. OH2 drops back to pass (legal vs MB1, RS, OH1). Passers: OH2, OH1, L.",
          base: "Ball is over — short moves to base. S finishes the run to the setting target.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "OH2 stays front to hit. OH1 and L take the pass while S still pushes up toward the net.",
      receivePair(lineup, {
        platform: {
          MB1: [0.18, 0.2],
          OH2: [0.42, 0.18],
          OPP: [0.82, 0.2],
          S: [0.3, 0.36],
          OH1: [0.48, 0.72],
          MB2: [0.82, 0.78],
          L: [0.7, 0.7],
        },
        base: attackBase,
        cues: {
          platform:
            "Two-person: OH1 and L pass. OH2 stays middle-front to hit. S still pushed up, legal behind MB1.",
          base: "Short moves to base after the ball is over.",
        },
      }),
    ),
    alternate(
      "w-pass",
      "W-pass",
      "Add OH2 as a short passer for a floater while S stays pushed up.",
      receivePair(lineup, {
        platform: {
          MB1: [0.18, 0.2],
          OH2: [0.46, 0.38],
          OPP: [0.82, 0.2],
          S: [0.3, 0.34],
          OH1: [0.52, 0.78],
          MB2: [0.82, 0.78],
          L: [0.7, 0.68],
        },
        base: attackBase,
        cues: {
          platform:
            "W: OH2 short, OH1 and L deep. S stays pushed up behind MB1, left of OH1.",
          base: "W folds into the R3 attack base.",
        },
      }),
    ),
  ];
}

/* ---------- R4: RS/OPP serves; S@4 ---------- */

function r4Serve(lineup) {
  const stack = {
    S: [0.36, 0.22],
    MB1: [0.5, 0.14],
    OH2: [0.64, 0.22],
    OPP: [0.82, 0.88],
    OH1: [0.22, 0.78],
    MB2: [0.5, 0.8],
    L: [0.5, 0.8],
  };
  const toss = { ...stack, OPP: [0.82, 0.94] };
  const release = {
    S: [0.72, 0.2],
    MB1: [0.5, 0.18],
    OH2: [0.26, 0.2],
    OPP: [0.82, 0.8],
    OH1: [0.2, 0.78],
    MB2: [0.5, 0.8],
    L: [0.5, 0.8],
  };
  const base = {
    OH2: zone(4),
    MB1: zone(3),
    S: zone(2),
    OPP: zone(1),
    OH1: zone(5),
    MB2: zone(6),
    L: zone(6),
  };
  return servePattern(lineup, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "Front S, MB1, and OH2 stack near mid-net so they can release to OH2@4, MB1@3, S@2.",
      toss: "RS/opposite tosses from the P1 endline. Front holds the stack.",
      release: "Release: OH2 to left front, MB1 stays middle, S to right front.",
      base: "Base: OH2@4, MB1@3, S@2. Back RS@1, OH1@5, L@6.",
    },
  });
}

function r4Receive(lineup) {
  const attackBase = {
    S: [0.68, 0.16],
    OH2: zone(4),
    MB1: zone(3),
    OPP: zone(1),
    OH1: zone(5),
    MB2: zone(6),
    L: zone(6),
  };
  return [
    alternate(
      "oh2-drop",
      "OH2 drop",
      "S and MB1 shift left. RS stays back-right so OH2 can drop back to pass — keeps the opposite off the platform.",
      receivePair(lineup, {
        platform: {
          S: [0.1, 0.2],
          MB1: [0.28, 0.16],
          OH2: [0.62, 0.46],
          OPP: [0.88, 0.8],
          OH1: [0.22, 0.76],
          MB2: [0.5, 0.8],
          L: [0.5, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "S + MB1 shift left. RS goes back-right. OH2 drops back to pass. Passers: OH2, OH1, L.",
          base: "Ball is over — OH2 back to 4, MB1 to 3, S to the setting target.",
        },
      }),
    ),
    alternate(
      "rs-pass",
      "RS pass",
      "Front stacks left and RS/opposite passes, so OH2 can stay on the left pin.",
      receivePair(lineup, {
        platform: {
          S: [0.1, 0.2],
          MB1: [0.26, 0.16],
          OH2: [0.42, 0.2],
          OPP: [0.78, 0.76],
          OH1: [0.24, 0.78],
          MB2: [0.5, 0.8],
          L: [0.5, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "Front stacks left. RS passes with OH1 and L. OH2 stays left front.",
          base: "After contact, same front base — S hunts the second ball from P2.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "OH1 and L only. Front stays stacked left; RS stays off the seam.",
      receivePair(lineup, {
        platform: {
          S: [0.1, 0.2],
          MB1: [0.26, 0.16],
          OH2: [0.42, 0.2],
          OPP: [0.88, 0.78],
          OH1: [0.28, 0.74],
          MB2: [0.52, 0.8],
          L: [0.54, 0.68],
        },
        base: attackBase,
        cues: {
          platform:
            "Two-person: OH1 and L. Front stacked left, RS pulled off.",
          base: "Same R4 attack base.",
        },
      }),
    ),
  ];
}

/* ---------- R5: OH2 serves; S@3 ---------- */

function r5Serve(lineup) {
  const stack = {
    OH1: [0.18, 0.2],
    S: [0.58, 0.16],
    MB1: [0.7, 0.16],
    OH2: [0.52, 0.9],
    MB2: [0.22, 0.78],
    OPP: [0.42, 0.8],
    L: [0.28, 0.8],
  };
  const toss = { ...stack, OH2: [0.52, 0.94] };
  const release = {
    OH1: [0.18, 0.2],
    S: [0.76, 0.2],
    MB1: [0.5, 0.18],
    OH2: [0.8, 0.8],
    MB2: [0.48, 0.8],
    OPP: [0.22, 0.78],
    L: [0.5, 0.8],
  };
  const base = {
    OH1: zone(4),
    MB1: zone(3),
    S: zone(2),
    OH2: zone(1),
    OPP: zone(5),
    MB2: zone(6),
    L: zone(6),
  };
  return servePattern(lineup, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "Front MB1 + S stack. OH1 and the back row (RS + L/middle) are already near base — easy walk to defense.",
      toss: "OH2 tosses — optionally from the left side of the endline. Stay right of RS/P6 until contact.",
      release:
        "MB1 and S switch: S to 2, MB1 to 3. OH2 comes in at 1. L takes 6, RS to 5.",
      base: "Base: OH1@4, MB1@3, S@2. Back OH2@1, RS@5, L@6.",
    },
  });
}

function r5Receive(lineup) {
  const attackBase = {
    S: [0.68, 0.16],
    OH1: zone(4),
    MB1: zone(3),
    OH2: zone(1),
    OPP: zone(5),
    MB2: zone(6),
    L: zone(6),
  };
  return [
    alternate(
      "oh1-drop",
      "OH1 drop",
      "OH1 drops back to pass. L covers RS so the opposite does not pass. Front is mostly an MB1/S switch.",
      receivePair(lineup, {
        platform: {
          OH1: [0.26, 0.48],
          S: [0.48, 0.16],
          MB1: [0.7, 0.16],
          OH2: [0.8, 0.78],
          MB2: [0.2, 0.78],
          OPP: [0.68, 0.58],
          L: [0.5, 0.7],
        },
        base: attackBase,
        cues: {
          platform:
            "OH1 drops back to pass. L covers RS so the opposite doesn’t take the ball. Passers: OH1, L, OH2.",
          base: "Ball is over — front is mostly an MB1/S switch. Back is busier: OH2, RS, L to base.",
        },
      }),
    ),
    alternate(
      "rs-pass",
      "RS pass",
      "Let the opposite pass so OH1 can stay on the left pin.",
      receivePair(lineup, {
        platform: {
          OH1: [0.18, 0.2],
          S: [0.48, 0.16],
          MB1: [0.7, 0.16],
          OH2: [0.8, 0.78],
          MB2: [0.2, 0.78],
          OPP: [0.52, 0.74],
          L: [0.3, 0.7],
        },
        base: attackBase,
        cues: {
          platform:
            "RS passes with L (and OH2 if needed). OH1 stays left front to hit.",
          base: "Same R5 base — S and MB1 finish their switch.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "L and OH1 only. RS stays off the platform; OH2 can stay deeper.",
      receivePair(lineup, {
        platform: {
          OH1: [0.28, 0.5],
          S: [0.48, 0.16],
          MB1: [0.7, 0.16],
          OH2: [0.86, 0.78],
          MB2: [0.2, 0.78],
          OPP: [0.7, 0.56],
          L: [0.5, 0.68],
        },
        base: attackBase,
        cues: {
          platform: "Two-person: OH1 and L. L still covers RS.",
          base: "Same R5 attack base.",
        },
      }),
    ),
  ];
}

/* ---------- R6: MB1 serves; S@2 ---------- */

function r6Serve(lineup) {
  const stack = {
    MB2: [0.36, 0.18],
    OH1: [0.5, 0.16],
    S: [0.82, 0.2],
    MB1: [0.82, 0.88],
    OPP: [0.22, 0.78],
    OH2: [0.5, 0.8],
    L: [0.88, 0.72],
  };
  const toss = { ...stack, MB1: [0.82, 0.94] };
  const release = {
    MB2: [0.5, 0.18],
    OH1: [0.22, 0.2],
    S: [0.82, 0.2],
    MB1: [0.82, 0.78],
    OPP: [0.2, 0.78],
    OH2: [0.72, 0.78],
    L: [0.5, 0.8],
  };
  const base = {
    OH1: zone(4),
    MB2: zone(3),
    S: zone(2),
    OPP: zone(5),
    OH2: zone(1),
    MB1: zone(6),
    L: zone(6),
  };
  return servePattern(lineup, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "If L would be front, MB2 stays in. Front stacks so the middle/outside switch is easy (OH1→4, MB2→3). S already at 2.",
      toss: "MB1 tosses from the P1 endline. L cannot serve this middle if already serving for MB2.",
      release:
        "L back in for the middle. OH1 and MB2 finish the switch. Back-row OH can prepare to pipe.",
      base: "Base: OH1@4, MB2@3, S@2. Back RS@5, L@6, OH2@1.",
    },
  });
}

function r6Receive(lineup) {
  const attackBase = {
    S: [0.68, 0.16],
    OH1: zone(4),
    MB2: zone(3),
    OPP: zone(5),
    OH2: [0.5, 0.62],
    MB1: zone(6),
    L: zone(6),
  };
  return [
    alternate(
      "l-in-middle",
      "L in",
      "L is back in for the middle. OH1 and MB2 stay ready to hit; back-row OH can pipe. RS stays off the pass.",
      receivePair(lineup, {
        platform: {
          S: [0.82, 0.2],
          OH1: [0.5, 0.18],
          MB2: [0.18, 0.2],
          OPP: [0.22, 0.56],
          OH2: [0.42, 0.74],
          MB1: [0.82, 0.78],
          L: [0.7, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "L back in for the middle. Passers: L and OH2. OH1 + MB2 ready to hit; RS pulled off.",
          base: "After contact: OH1 and MB2 on their approaches. Back-row OH can pipe, then everyone to base.",
        },
      }),
    ),
    alternate(
      "rs-pass",
      "RS pass",
      "RS/opposite joins the platform when the serve hunts the left-back seam.",
      receivePair(lineup, {
        platform: {
          S: [0.82, 0.2],
          OH1: [0.5, 0.18],
          MB2: [0.18, 0.2],
          OPP: [0.28, 0.72],
          OH2: [0.5, 0.76],
          MB1: [0.82, 0.78],
          L: [0.72, 0.7],
        },
        base: attackBase,
        cues: {
          platform:
            "RS passes with L and OH2. Front OH1 + MB2 stay ready to hit.",
          base: "Same R6 attack shape — back-row OH can still pipe.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "L and OH2 only, so both front pins stay clean and RS stays off.",
      receivePair(lineup, {
        platform: {
          S: [0.82, 0.2],
          OH1: [0.5, 0.18],
          MB2: [0.18, 0.2],
          OPP: [0.2, 0.52],
          OH2: [0.4, 0.72],
          MB1: [0.82, 0.78],
          L: [0.68, 0.68],
        },
        base: attackBase,
        cues: {
          platform: "Two-person: L and OH2. RS stays off. Front ready to hit.",
          base: "OH1 + MB2 attack; back-row OH pipes, then base.",
        },
      }),
    ),
  ];
}

const BUILDERS = {
  1: { serve: r1Serve, receive: r1Receive },
  2: { serve: r2Serve, receive: r2Receive },
  3: { serve: r3Serve, receive: r3Receive },
  4: { serve: r4Serve, receive: r4Receive },
  5: { serve: r5Serve, receive: r5Receive },
  6: { serve: r6Serve, receive: r6Receive },
};

function buildRotation(n) {
  const lineup = rotateLineup(n - 1);
  const backId = backRowMiddle(lineup);
  const serveSteps = BUILDERS[n].serve(lineup);
  const passingAlternates = BUILDERS[n].receive(lineup);

  for (const s of serveSteps) {
    if (s.id === "stack" || s.id === "toss") {
      assertContact(`R${n} serve ${s.id}`, s.positions, backId);
    }
  }
  for (const alt of passingAlternates) {
    const platform = alt.steps.find((s) => s.id === "platform");
    if (platform) {
      assertContact(`R${n} ${alt.id} platform`, platform.positions, backId);
    }
  }

  return {
    id: `r${n}`,
    rotation: n,
    title: TITLES[n],
    summary: SUMMARIES[n],
    notes: NOTES[n],
    lineup,
    backRowMiddleId: backId,
    modes: {
      serve: { steps: serveSteps },
      "serve-receive": { passingAlternates },
    },
  };
}

mkdirSync(OUT, { recursive: true });
for (let n = 1; n <= 6; n += 1) {
  const rotation = buildRotation(n);
  writeFileSync(join(OUT, `r${n}.json`), JSON.stringify(rotation, null, 2) + "\n");
  const sPos = Object.entries(rotation.lineup).find(([, id]) => id === "S")[0];
  console.log(
    "wrote",
    `r${n}.json`,
    `S@${sPos}`,
    `back=${rotation.backRowMiddleId}`,
    `alts=${rotation.modes["serve-receive"].passingAlternates.map((a) => a.id).join(",")}`,
  );
}
