import { isAuth0Configured } from "@/lib/auth";
import { isNeonConfigured } from "@/lib/neon";
import type { StudyProgress } from "@/lib/types";

const FALLBACK_PROGRESS: StudyProgress = {
  guidedLessonId: "intro",
  completedLessons: [],
  quizBest: 0,
  lastRotation: 1,
  lastMode: "serve-receive",
  lastAlternate: null,
  lastStep: 0,
};

/**
 * @deprecated Thin compatibility hook. The client now uses
 * GET/PUT /api/me/preferences and /api/me/progress (Auth0 session)
 * or localStorage for guests. Do not add new callers.
 */
export async function GET() {
  return Response.json({
    source: "local",
    configured: {
      auth0: isAuth0Configured(),
      neon: isNeonConfigured(),
    },
    progress: null,
    message:
      "Client progress stays in localStorage. Signed-in progress is at /api/me/progress.",
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as StudyProgress;

  return Response.json({
    ok: true,
    source: "local",
    echo: { ...FALLBACK_PROGRESS, ...body },
    message:
      "Accepted locally. Persist signed-in progress with PUT /api/me/progress.",
  });
}
