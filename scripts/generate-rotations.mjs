/**
 * Focus Otter 5-1 — ConanLiuMD source of truth
 * https://youtu.be/LkpmYtogPdw
 *
 * Half-court, net at TOP. Normalized 0–1: x left→right, y net→endline.
 * Official rotational zones are the per-rotation VIDEO tables (not assumed
 * clockwise from a single START). Stack (legal at contact) keeps rotational
 * courtPos. Base (hitting-side defense after the ball is over) sets courtPos
 * to the defensive zone the player occupies — pins may switch (R1 OH1→4, OPP→2).
 *
 * PlayerId OPP = RS / opposite. Cues may say Opposite or RS.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

/** Physical hitting-side anchors: [x, y, courtPos]. Using SPOT[n] stamps that zone. */
const SPOT = {
  1: [0.82, 0.78, 1],
  2: [0.82, 0.2, 2],
  3: [0.5, 0.18, 3],
  4: [0.18, 0.2, 4],
  5: [0.2, 0.78, 5],
  6: [0.5, 0.8, 6],
};

/** Setter target after the ball is over — physical right-front / zone 2. */
const SET = [0.68, 0.16, 2];

/**
 * Video rotational zone lists (R1 ~4:06, R2 ~6:52, R3 ~9:19, then R4–R6).
 * Prefer these over blind clockwise from R1 when they conflict.
 */
const LINEUPS = {
  1: { 1: "S", 2: "OH1", 3: "MB2", 4: "OPP", 5: "OH2", 6: "MB1" },
  2: { 1: "OH1", 2: "MB2", 3: "OPP", 4: "OH2", 5: "MB1", 6: "S" },
  3: { 1: "MB2", 2: "OPP", 3: "MB1", 4: "OH2", 5: "OH1", 6: "S" },
  4: { 1: "OPP", 2: "MB1", 3: "OH2", 4: "S", 5: "OH1", 6: "MB2" },
  5: { 1: "OH2", 2: "MB1", 3: "S", 4: "OH1", 5: "MB2", 6: "OPP" },
  6: { 1: "MB1", 2: "S", 3: "OH1", 4: "MB2", 5: "OPP", 6: "OH2" },
};

/** L overlays this middle. R3: L serves for MB2. R6: L off on serve (MB1 serves). */
const BACK_ROW_MIDDLE = {
  1: "MB1",
  2: "MB1",
  3: "MB2",
  4: "MB2",
  5: "MB2",
  6: "MB1",
};

const TITLES = {
  1: "Rotation 1 — Setter serve",
  2: "Rotation 2 — Setter middle back",
  3: "Rotation 3 — Libero serve",
  4: "Rotation 4 — Setter left front",
  5: "Rotation 5 — Setter middle front",
  6: "Rotation 6 — Setter right front",
};

const SUMMARIES = {
  1: "S serves P1. Rotational: 1S 2OH1 3MB2 4OPP 5OH2 6MB1 (L overlays 6). Serve stack front OPP–MB2–OH1; after contact, base front OH1–MB2–OPP.",
  2: "OH1 serves. Rotational: 1OH1 2MB2 3OPP 4OH2 5MB1 6S. Stack front OH2–OPP–MB2; base front OH2–MB2–OPP, back OH1–L–S.",
  3: "L serves for MB2 (MB2 off). Rotational: 1MB2 2OPP 3MB1 4OH2 5OH1 6S. Front middle is MB1. Stack and base front OH2–MB1–RS; back OH1–L–S.",
  4: "RS/OPP serves. Rotational: 1OPP 2MB1 3OH2 4S 5OH1 6MB2. Stack S / MB1 / OH2 (legal S–OH2–MB1); base front OH2–MB1–S, back OH1–L–OPP.",
  5: "OH2 serves from the left endline. Rotational: 1OH2 2MB1 3S 4OH1 5MB2 6OPP. Front OH1–MB1–S; back OH2–L–OPP.",
  6: "MB1 serves (L off). Rotational: 1MB1 2S 3OH1 4MB2 5OPP 6OH2. Stack MB2–OH1–S; base OH1–MB2–S, back OPP–OH2–MB1. L re-enters on receive.",
};

const NOTES = {
  1: "ConanLiuMD R1 (~4:06–6:50): pins stack Opposite left / OH1 right so they can switch to hitting sides after contact. Default receive: OH1 drops deep with OH2+L; S hidden right. Alternate: RS/OPP drops, S pushes up.",
  2: "ConanLiuMD R2 (~6:52–9:18): front MB2+RS stack toward 3/2. Receive: S up/right out of the pass; OH2+L+OH1 pass.",
  3: "ConanLiuMD R3 (~9:19–10:23): video zone list 1L 2RS 3MB1 4OH2 5OH1 6S — L stands in for MB2. Receive: S push mid/front; OH2+OH1+L pass. Alternate: OH2+MB1 stack upper-left, RS drops.",
  4: "ConanLiuMD R4: stack the front three, then release to OH2@4 / MB1@3 / S@2. Receive: S+MB1 upper-left; OH2+OH1+L pass. Alternate: RS passes.",
  5: "ConanLiuMD R5: OH2 may toss left of a typical P1 endline (stay right of P6). Receive: OH1+L+OH2 pass. Alternate: RS passes.",
  6: "ConanLiuMD R6: L cannot serve this middle. After the serve, L re-enters on receive. Default OH1+OH2+L; alternate RS passes with MB2+OH1 stacked left.",
};

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

/**
 * Absolute placements. `coords` is PlayerId → [x, y] or [x, y, courtPos].
 * Third value overrides rotational courtPos (used on base after pin switch).
 * L may be omitted (R6 serve).
 */
function placements(lineup, coords, backId) {
  const byId = invertLineup(lineup);
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
      courtPos: pair[2] ?? byId[id],
    };
  }
  if (coords.L) {
    positions.L = {
      x: clamp(coords.L[0]),
      y: clamp(coords.L[1]),
      role: ROLES.L,
      courtPos: coords.L[2] ?? byId[backId],
    };
  }
  return positions;
}

function step(id, label, cue, lineup, coords, backId) {
  return { id, label, cue, positions: placements(lineup, coords, backId) };
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

function illegalContact(positions, backId) {
  const byPos = {};
  for (const [id, p] of Object.entries(positions)) {
    if (id === backId && positions.L) continue;
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

function frontLeftToRight(positions) {
  return Object.entries(positions)
    .filter(([id, p]) => id !== "L" && p.y < 0.42)
    .sort((a, b) => a[1].x - b[1].x)
    .map(([id]) => id);
}

function servePattern(lineup, backId, { stack, toss, release, base, cues }) {
  return [
    step("stack", "Stack", cues.stack, lineup, stack, backId),
    step("toss", "Toss", cues.toss, lineup, toss, backId),
    step("release", "Release", cues.release, lineup, release, backId),
    step("base", "Base", cues.base, lineup, base, backId),
  ];
}

function receivePair(lineup, backId, { platform, base, cues }) {
  return [
    step("platform", "Platform", cues.platform, lineup, platform, backId),
    step("base", "Base", cues.base, lineup, base, backId),
  ];
}

/* ---------- R1: S serves (P1) — video ~4:06–6:50 ---------- */

function r1Serve(lineup, backId) {
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
    OPP: [0.72, 0.21],
    MB2: [0.5, 0.16],
    OH1: [0.28, 0.21],
    OH2: [0.2, 0.78],
    MB1: [0.5, 0.8],
    S: [0.82, 0.84],
    L: [0.5, 0.8],
  };
  const base = {
    OH1: SPOT[4],
    MB2: SPOT[3],
    OPP: SPOT[2],
    OH2: SPOT[5],
    L: SPOT[6],
    MB1: SPOT[6],
    S: SPOT[1],
  };
  return servePattern(lineup, backId, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "Serve stack front L→R: Opposite (RS) – MB2 – OH1. Back OH2–L, S serving P1. Stay legal until contact.",
      toss: "S tosses from the P1 endline. Front holds the stack — RS still left, OH1 still right.",
      release:
        "After contact, pins switch to hitting sides: OH1 to left front (4), Opposite to right front (2). MB2 stays middle.",
      base: "Base defense front L→R: OH1 – MB2 – Opposite (OH left @4, Opp/RS right @2). Back OH2–L–S.",
    },
  });
}

function r1Receive(lineup, backId) {
  const attackBase = {
    S: SET,
    OH1: SPOT[4],
    MB2: SPOT[3],
    OPP: SPOT[2],
    OH2: SPOT[5],
    MB1: SPOT[6],
    L: SPOT[6],
  };
  return [
    alternate(
      "oh-cover-setter",
      "OH cover S",
      "Default: OH1 drops deep to pass with OH2+L. S hides right. After the ball is over, pins go to hitting sides (OH left, Opp right).",
      receivePair(lineup, backId, {
        platform: {
          OPP: [0.18, 0.2],
          MB2: [0.5, 0.16],
          OH1: [0.66, 0.52],
          S: [0.8, 0.64],
          OH2: [0.22, 0.78],
          MB1: [0.5, 0.8],
          L: [0.5, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "OH1 drops deep to pass with OH2 and L. S is hidden right, behind OH1.",
          base: "Ball is over — OH1 to left pin, Opposite to right pin, S to the setting target.",
        },
      }),
    ),
    alternate(
      "rs-cover",
      "RS cover",
      "Alternate: RS/OPP drops back to pass so S can push up closer to the setting spot.",
      receivePair(lineup, backId, {
        platform: {
          OPP: [0.28, 0.5],
          MB2: [0.5, 0.16],
          OH1: [0.82, 0.22],
          S: [0.7, 0.36],
          OH2: [0.2, 0.78],
          MB1: [0.5, 0.8],
          L: [0.5, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "RS/Opposite drops back to pass. S pushes up toward the setting spot, still behind OH1.",
          base: "Ball is over — short moves to hitting-side base. S finishes at the target.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "Two platforms (L + OH2) so OH1 can stay on the right pin and RS stays off the seam.",
      receivePair(lineup, backId, {
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
          base: "Same hitting-side 5-1 shape — only the platform changed.",
        },
      }),
    ),
    alternate(
      "w-pass",
      "W-pass",
      "Four-player W (two short, two deep) against a tough floater or short serve.",
      receivePair(lineup, backId, {
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
          base: "W folds into hitting-side base: OH1 left, Opposite right.",
        },
      }),
    ),
  ];
}

/* ---------- R2: OH1 serves; S@6 ---------- */

function r2Serve(lineup, backId) {
  const stack = {
    OH2: [0.2, 0.2],
    OPP: [0.56, 0.2],
    MB2: [0.68, 0.14],
    OH1: [0.82, 0.88],
    MB1: [0.22, 0.78],
    S: [0.7, 0.78],
    L: [0.48, 0.8],
  };
  const toss = { ...stack, OH1: [0.82, 0.94] };
  const release = {
    OH2: [0.18, 0.2],
    MB2: [0.5, 0.18],
    OPP: [0.76, 0.2],
    OH1: [0.28, 0.8],
    MB1: [0.48, 0.8],
    S: [0.8, 0.78],
    L: [0.5, 0.8],
  };
  const base = {
    OH2: SPOT[4],
    MB2: SPOT[3],
    OPP: SPOT[2],
    OH1: SPOT[5],
    L: SPOT[6],
    MB1: SPOT[6],
    S: SPOT[1],
  };
  return servePattern(lineup, backId, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "Serve stack front L→R: OH2 – Opposite – MB2. OH1 serves P1. S is middle-back, L left of S.",
      toss: "OH1 tosses from the P1 endline. Front holds the stack until contact.",
      release:
        "After contact: MB2 to middle, Opposite to right front, OH1 enters left-back. S slides to 1, L to 6.",
      base: "Base front L→R: OH2 – MB2 – Opposite. Back OH1–L–S.",
    },
  });
}

function r2Receive(lineup, backId) {
  const attackBase = {
    S: SET,
    OH2: SPOT[4],
    MB2: SPOT[3],
    OPP: SPOT[2],
    OH1: SPOT[5],
    MB1: SPOT[6],
    L: SPOT[6],
  };
  return [
    alternate(
      "outsides-and-l",
      "Outsides + L",
      "S starts up/right out of the pass. OH2, L, and OH1 pass.",
      receivePair(lineup, backId, {
        platform: {
          OH2: [0.24, 0.48],
          OPP: [0.72, 0.18],
          MB2: [0.92, 0.2],
          OH1: [0.78, 0.78],
          MB1: [0.48, 0.8],
          S: [0.7, 0.42],
          L: [0.48, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "S is up and right, out of the pass. Passers: OH2, L, OH1. MB2 and RS shift right.",
          base: "Ball is over — front OH2–MB2–Opposite. S to the setting target.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "L and OH1 take the pass so OH2 can stay on the left pin.",
      receivePair(lineup, backId, {
        platform: {
          OH2: [0.18, 0.22],
          OPP: [0.74, 0.18],
          MB2: [0.9, 0.2],
          OH1: [0.72, 0.76],
          MB1: [0.46, 0.8],
          S: [0.68, 0.4],
          L: [0.42, 0.68],
        },
        base: attackBase,
        cues: {
          platform:
            "Two-person: L and OH1 pass. OH2 stays left front. S still up/right.",
          base: "Same base as outsides + L.",
        },
      }),
    ),
    alternate(
      "w-pass",
      "W-pass",
      "Add a short passer (OH2) for a floater that drops in front of the 10-foot line.",
      receivePair(lineup, backId, {
        platform: {
          OH2: [0.26, 0.4],
          OPP: [0.7, 0.18],
          MB2: [0.9, 0.2],
          OH1: [0.76, 0.8],
          MB1: [0.5, 0.8],
          S: [0.68, 0.4],
          L: [0.5, 0.74],
        },
        base: attackBase,
        cues: {
          platform:
            "W: OH2 short left, L mid, OH1 deep right. S stays up/right out of the pass.",
          base: "W folds into OH2–MB2–Opposite front and S at the target.",
        },
      }),
    ),
  ];
}

/* ---------- R3: L serves for MB2; S@6; MB1 front middle ---------- */

function r3Serve(lineup, backId) {
  const stack = {
    OH2: [0.22, 0.2],
    MB1: [0.5, 0.14],
    OPP: [0.82, 0.2],
    OH1: [0.22, 0.78],
    S: [0.5, 0.8],
    MB2: [0.82, 0.88],
    L: [0.86, 0.92],
  };
  const toss = { ...stack, MB2: [0.82, 0.94], L: [0.86, 0.94] };
  const release = {
    OH2: [0.2, 0.2],
    MB1: [0.5, 0.18],
    OPP: [0.82, 0.2],
    OH1: [0.2, 0.78],
    S: [0.78, 0.78],
    MB2: [0.82, 0.78],
    L: [0.5, 0.8],
  };
  const base = {
    OH2: SPOT[4],
    MB1: SPOT[3],
    OPP: SPOT[2],
    OH1: SPOT[5],
    L: SPOT[6],
    MB2: SPOT[6],
    S: SPOT[1],
  };
  return servePattern(lineup, backId, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "L serves for MB2 (zone 1). Serve stack front L→R: OH2 – MB1 – Opposite (RS). S middle-back, OH1 left-back.",
      toss: "L tosses from the P1 endline (standing in for MB2). Front holds OH2–MB1–RS.",
      release:
        "After contact, front stays OH2–MB1–RS. L comes in at 6; S slides to right-back.",
      base: "Base front L→R: OH2 – MB1 – Opposite. Back OH1–L–S.",
    },
  });
}

function r3Receive(lineup, backId) {
  const attackBase = {
    S: SET,
    OH2: SPOT[4],
    MB1: SPOT[3],
    OPP: SPOT[2],
    OH1: SPOT[5],
    MB2: SPOT[6],
    L: SPOT[6],
  };
  return [
    alternate(
      "s-push-up",
      "S push-up",
      "S pushes mid/front from zone 6. OH2, OH1, and L pass.",
      receivePair(lineup, backId, {
        platform: {
          OH2: [0.3, 0.46],
          MB1: [0.5, 0.16],
          OPP: [0.82, 0.2],
          S: [0.56, 0.34],
          OH1: [0.36, 0.72],
          MB2: [0.82, 0.78],
          L: [0.72, 0.7],
        },
        base: attackBase,
        cues: {
          platform:
            "S pushes mid/front (still behind MB1). Passers: OH2, OH1, L.",
          base: "Ball is over — front OH2–MB1–Opposite. S finishes at the setting target.",
        },
      }),
    ),
    alternate(
      "rs-pass",
      "RS pass",
      "OH2 and MB1 stack upper-left. RS/OPP drops back to pass.",
      receivePair(lineup, backId, {
        platform: {
          OH2: [0.16, 0.18],
          MB1: [0.32, 0.14],
          OPP: [0.7, 0.5],
          S: [0.5, 0.32],
          OH1: [0.28, 0.74],
          MB2: [0.82, 0.78],
          L: [0.74, 0.7],
        },
        base: attackBase,
        cues: {
          platform:
            "OH2 + MB1 stack upper-left. RS/Opposite drops to pass with OH1 and L. S still pushed up.",
          base: "Short moves to base after the ball is over.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "OH2 stays front to hit. OH1 and L take the pass while S still pushes up.",
      receivePair(lineup, backId, {
        platform: {
          OH2: [0.22, 0.2],
          MB1: [0.5, 0.16],
          OPP: [0.82, 0.2],
          S: [0.56, 0.34],
          OH1: [0.4, 0.72],
          MB2: [0.82, 0.78],
          L: [0.7, 0.7],
        },
        base: attackBase,
        cues: {
          platform:
            "Two-person: OH1 and L pass. OH2 stays left front. S still pushed mid/front.",
          base: "Same R3 attack base.",
        },
      }),
    ),
  ];
}

/* ---------- R4: RS/OPP serves; S@4 ---------- */

function r4Serve(lineup, backId) {
  // Video stack names S–MB1–OH2; rotational 4S / 3OH2 / 2MB1 must stay S left of OH2 left of MB1.
  const stack = {
    S: [0.36, 0.22],
    OH2: [0.5, 0.14],
    MB1: [0.66, 0.22],
    OPP: [0.82, 0.88],
    OH1: [0.22, 0.78],
    MB2: [0.5, 0.8],
    L: [0.5, 0.8],
  };
  const toss = { ...stack, OPP: [0.82, 0.94] };
  const release = {
    OH2: [0.26, 0.2],
    MB1: [0.5, 0.18],
    S: [0.72, 0.2],
    OPP: [0.82, 0.8],
    OH1: [0.2, 0.78],
    MB2: [0.5, 0.8],
    L: [0.5, 0.8],
  };
  const base = {
    OH2: SPOT[4],
    MB1: SPOT[3],
    S: SPOT[2],
    OH1: SPOT[5],
    L: SPOT[6],
    MB2: SPOT[6],
    OPP: SPOT[1],
  };
  return servePattern(lineup, backId, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "Front stacks S, MB1, and OH2 near mid-net (legal: S left of OH2 left of MB1). RS/Opposite serving P1.",
      toss: "RS/Opposite tosses from the P1 endline. Front holds the stack.",
      release:
        "After contact: OH2 to left front, MB1 to middle, S to right front — stack spots are not base spots.",
      base: "Base front L→R: OH2 – MB1 – S. Back OH1–L–Opposite.",
    },
  });
}

function r4Receive(lineup, backId) {
  const attackBase = {
    S: SET,
    OH2: SPOT[4],
    MB1: SPOT[3],
    OPP: SPOT[1],
    OH1: SPOT[5],
    MB2: SPOT[6],
    L: SPOT[6],
  };
  return [
    alternate(
      "oh2-drop",
      "OH2 drop",
      "S and MB1 shade upper-left. OH2 drops to pass with OH1 and L.",
      receivePair(lineup, backId, {
        platform: {
          S: [0.1, 0.2],
          OH2: [0.36, 0.48],
          MB1: [0.58, 0.16],
          OPP: [0.88, 0.8],
          OH1: [0.22, 0.76],
          MB2: [0.5, 0.8],
          L: [0.5, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "S + MB1 upper-left. OH2 drops to pass with OH1 and L. RS stays back-right.",
          base: "Ball is over — OH2 to 4, MB1 to 3, S to the setting target.",
        },
      }),
    ),
    alternate(
      "rs-pass",
      "RS pass",
      "Front stays stacked left and RS/Opposite passes so OH2 can stay on the left pin.",
      receivePair(lineup, backId, {
        platform: {
          S: [0.1, 0.2],
          OH2: [0.28, 0.2],
          MB1: [0.46, 0.16],
          OPP: [0.78, 0.76],
          OH1: [0.24, 0.78],
          MB2: [0.5, 0.8],
          L: [0.5, 0.72],
        },
        base: attackBase,
        cues: {
          platform:
            "Front stacked left. RS/Opposite passes with OH1 and L. OH2 stays left front.",
          base: "Same front base — S hunts the second ball from the right front.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "OH1 and L only. Front stays stacked left; RS stays off the seam.",
      receivePair(lineup, backId, {
        platform: {
          S: [0.1, 0.2],
          OH2: [0.28, 0.2],
          MB1: [0.46, 0.16],
          OPP: [0.88, 0.78],
          OH1: [0.28, 0.74],
          MB2: [0.52, 0.8],
          L: [0.54, 0.68],
        },
        base: attackBase,
        cues: {
          platform: "Two-person: OH1 and L. Front stacked left, RS pulled off.",
          base: "Same R4 attack base.",
        },
      }),
    ),
  ];
}

/* ---------- R5: OH2 serves (left endline); S@3 ---------- */

function r5Serve(lineup, backId) {
  const stack = {
    OH1: [0.18, 0.2],
    S: [0.48, 0.16],
    MB1: [0.66, 0.16],
    OH2: [0.42, 0.9],
    MB2: [0.18, 0.78],
    OPP: [0.28, 0.8],
    L: [0.22, 0.8],
  };
  const toss = { ...stack, OH2: [0.42, 0.94] };
  const release = {
    OH1: [0.18, 0.2],
    MB1: [0.5, 0.18],
    S: [0.76, 0.2],
    OH2: [0.24, 0.8],
    MB2: [0.48, 0.8],
    OPP: [0.8, 0.78],
    L: [0.5, 0.8],
  };
  const base = {
    OH1: SPOT[4],
    MB1: SPOT[3],
    S: SPOT[2],
    OH2: SPOT[5],
    L: SPOT[6],
    MB2: SPOT[6],
    OPP: SPOT[1],
  };
  return servePattern(lineup, backId, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "OH2 serves from the left endline (stay right of P6/Opposite). Front OH1 with S+MB1 stacked. Back already near OH2–L–OPP.",
      toss: "OH2 tosses left-of-typical P1. Front holds; stay legal vs Opposite in P6.",
      release:
        "Front finishes OH1–MB1–S (S and MB1 may switch after contact). OH2 enters left-back; L to 6; Opposite to right-back.",
      base: "Base front L→R: OH1 – MB1 – S. Back OH2–L–Opposite.",
    },
  });
}

function r5Receive(lineup, backId) {
  const attackBase = {
    S: SET,
    OH1: SPOT[4],
    MB1: SPOT[3],
    OH2: SPOT[5],
    OPP: SPOT[1],
    MB2: SPOT[6],
    L: SPOT[6],
  };
  return [
    alternate(
      "oh1-drop",
      "OH1 drop",
      "OH1, L, and OH2 pass. L covers so the opposite does not have to take the serve.",
      receivePair(lineup, backId, {
        platform: {
          OH1: [0.26, 0.48],
          S: [0.48, 0.16],
          MB1: [0.7, 0.16],
          OH2: [0.82, 0.78],
          MB2: [0.2, 0.78],
          OPP: [0.64, 0.62],
          L: [0.5, 0.7],
        },
        base: attackBase,
        cues: {
          platform: "Passers: OH1, L, OH2. S and MB1 stay off the platform.",
          base: "Ball is over — front OH1–MB1–S. Back OH2–L–Opposite.",
        },
      }),
    ),
    alternate(
      "rs-pass",
      "RS pass",
      "Let the opposite pass so OH1 can stay on the left pin.",
      receivePair(lineup, backId, {
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
            "RS/Opposite passes with L (and OH2 if needed). OH1 stays left front to hit.",
          base: "Same R5 base — S and MB1 finish at 2 and 3.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "L and OH1 only. RS stays off the platform.",
      receivePair(lineup, backId, {
        platform: {
          OH1: [0.28, 0.5],
          S: [0.48, 0.16],
          MB1: [0.7, 0.16],
          OH2: [0.86, 0.78],
          MB2: [0.2, 0.78],
          OPP: [0.78, 0.58],
          L: [0.5, 0.68],
        },
        base: attackBase,
        cues: {
          platform: "Two-person: OH1 and L. Opposite stays off.",
          base: "Same R5 attack base.",
        },
      }),
    ),
  ];
}

/* ---------- R6: MB1 serves; L off; S@2 ---------- */

function r6Serve(lineup, backId) {
  const stack = {
    MB2: [0.36, 0.18],
    OH1: [0.5, 0.16],
    S: [0.82, 0.2],
    MB1: [0.82, 0.88],
    OPP: [0.22, 0.78],
    OH2: [0.5, 0.8],
  };
  const toss = { ...stack, MB1: [0.82, 0.94] };
  const release = {
    OH1: [0.26, 0.2],
    MB2: [0.5, 0.18],
    S: [0.82, 0.2],
    OPP: [0.2, 0.78],
    OH2: [0.5, 0.8],
    MB1: [0.82, 0.78],
  };
  const base = {
    OH1: SPOT[4],
    MB2: SPOT[3],
    S: SPOT[2],
    OPP: SPOT[5],
    OH2: SPOT[6],
    MB1: SPOT[1],
  };
  return servePattern(lineup, backId, {
    stack,
    toss,
    release,
    base,
    cues: {
      stack:
        "MB1 serves (L off — L cannot serve this middle). Serve stack front L→R: MB2 – OH1 – S.",
      toss: "MB1 tosses from the P1 endline. Front holds MB2–OH1–S.",
      release:
        "After contact: OH1 to left, MB2 to middle, S stays right. Back becomes OPP–OH2–MB1.",
      base: "Base front L→R: OH1 – MB2 – S. Back OPP–OH2–MB1.",
    },
  });
}

function r6Receive(lineup, backId) {
  const attackBase = {
    S: SET,
    OH1: SPOT[4],
    MB2: SPOT[3],
    OPP: SPOT[5],
    OH2: [0.5, 0.62, 6],
    MB1: SPOT[1],
    L: [0.5, 0.78, 6],
  };
  return [
    alternate(
      "l-in-middle",
      "L in",
      "L re-enters for the serving middle. OH1, OH2, and L pass.",
      receivePair(lineup, backId, {
        platform: {
          S: [0.82, 0.2],
          OH1: [0.36, 0.42],
          MB2: [0.18, 0.18],
          OPP: [0.2, 0.56],
          OH2: [0.5, 0.76],
          MB1: [0.82, 0.78],
          L: [0.68, 0.7],
        },
        base: attackBase,
        cues: {
          platform:
            "L re-enters. Passers: OH1, OH2, L. MB2 ready left; S already at right front.",
          base: "After contact: OH1 and MB2 on their approaches. Back-row OH can pipe, then base.",
        },
      }),
    ),
    alternate(
      "rs-pass",
      "RS pass",
      "RS/Opposite passes. MB2 and OH1 stack left.",
      receivePair(lineup, backId, {
        platform: {
          S: [0.82, 0.2],
          OH1: [0.32, 0.2],
          MB2: [0.16, 0.16],
          OPP: [0.3, 0.72],
          OH2: [0.52, 0.76],
          MB1: [0.82, 0.78],
          L: [0.7, 0.7],
        },
        base: attackBase,
        cues: {
          platform:
            "MB2 + OH1 stack left. RS/Opposite drops to pass with OH2 and L.",
          base: "Same R6 attack shape — back-row OH can still pipe.",
        },
      }),
    ),
    alternate(
      "2-person",
      "2-person",
      "L and OH2 only, so both front pins stay clean and RS stays off.",
      receivePair(lineup, backId, {
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
  const lineup = LINEUPS[n];
  const backId = BACK_ROW_MIDDLE[n];
  const serveSteps = BUILDERS[n].serve(lineup, backId);
  const passingAlternates = BUILDERS[n].receive(lineup, backId);

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
  const stack = rotation.modes.serve.steps.find((s) => s.id === "stack");
  const base = rotation.modes.serve.steps.find((s) => s.id === "base");
  const sPos = Object.entries(rotation.lineup).find(([, id]) => id === "S")[0];
  console.log(
    "wrote",
    `r${n}.json`,
    `S@${sPos}`,
    `back=${rotation.backRowMiddleId}`,
    `stackFront=${frontLeftToRight(stack.positions).join("-")}`,
    `baseFront=${frontLeftToRight(base.positions).join("-")}`,
    `alts=${rotation.modes["serve-receive"].passingAlternates.map((a) => a.id).join(",")}`,
  );
}

const r1 = JSON.parse(readFileSync(join(OUT, "r1.json"), "utf8"));
const r1Stack = r1.modes.serve.steps.find((s) => s.id === "stack").positions;
const r1Base = r1.modes.serve.steps.find((s) => s.id === "base").positions;
console.log("R1 stack vs base OH1/OPP:");
for (const id of ["OH1", "OPP"]) {
  const s = r1Stack[id];
  const b = r1Base[id];
  console.log(
    `  ${id}  stack courtPos=${s.courtPos} x=${s.x}  |  base courtPos=${b.courtPos} x=${b.x}`,
  );
}
