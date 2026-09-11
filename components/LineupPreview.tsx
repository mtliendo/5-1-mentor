import { chipLabel, displayRoleName, ROSTER } from "@/lib/roster";
import type { Role, SharedLineup } from "@/lib/types";

const ROLE_DOT: Record<Role, string> = {
  Setter: "bg-accent",
  Opposite: "bg-amber-400",
  Outside: "bg-sky-400",
  Middle: "bg-line",
  Libero: "bg-libero",
  "Back-row Middle": "bg-emerald-700",
};

export function LineupPreview({
  roleNames,
  liberoEnabled,
}: Pick<SharedLineup, "roleNames" | "liberoEnabled">) {
  return (
    <div className="space-y-3">
      <p
        className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-extrabold uppercase tracking-wide ${
          liberoEnabled
            ? "bg-libero text-white"
            : "bg-on-panel/10 text-on-panel"
        }`}
      >
        Libero {liberoEnabled ? "on" : "off"}
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ROSTER.map((player) => {
          const name = displayRoleName(player, roleNames);
          return (
            <li
              key={player.id}
              className="flex min-h-11 items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
            >
              <span
                aria-hidden
                className={`inline-block size-2.5 shrink-0 rounded-full ${ROLE_DOT[player.defaultRole]}`}
              />
              <span className="text-sm font-extrabold text-on-panel">
                {chipLabel(name, player.defaultRole)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
