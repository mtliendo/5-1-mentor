import { isAuth0Configured } from "@/lib/auth";
import { isNeonConfigured, queryStub } from "@/lib/neon";
import type { StudyProgress } from "@/lib/types";

const FALLBACK_PROGRESS: StudyProgress = {
  guidedLessonId: "intro",
  completedLessons: [],
  quizBest: 0,
  lastRotation: 1,
  lastMode: "serve-receive",
};

export async function GET() {
  if (isNeonConfigured()) {
    const rows = await queryStub<StudyProgress>(
      "select payload from study_progress limit 1",
    );
    return Response.json({
      source: "neon",
      progress: rows[0] ?? null,
    });
  }

  return Response.json({
    source: "local",
    configured: {
      auth0: isAuth0Configured(),
      neon: false,
    },
    progress: null,
    message: "Neon is not configured. The client keeps progress in localStorage.",
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as StudyProgress;

  if (isNeonConfigured()) {
    await queryStub("insert into study_progress (payload) values ($1)", [body]);
    return Response.json({ ok: true, source: "neon" });
  }

  return Response.json({
    ok: true,
    source: "local",
    echo: { ...FALLBACK_PROGRESS, ...body },
    message: "Accepted. Persist on the client until DATABASE_URL is set.",
  });
}
