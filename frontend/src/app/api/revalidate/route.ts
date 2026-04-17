import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

type RevalidateBody = {
  secret?: string;
  paths?: string[];
  tags?: string[];
};

function isAuthorized(request: NextRequest, bodySecret?: string): boolean {
  const expected = process.env.REVALIDATE_WEBHOOK_SECRET;
  if (!expected) {
    return false;
  }
  const bearer = request.headers.get("authorization");
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7).trim() : null;
  return token === expected || bodySecret === expected;
}

export async function POST(request: NextRequest) {
  let payload: RevalidateBody;
  try {
    payload = (await request.json()) as RevalidateBody;
  } catch {
    return NextResponse.json(
      { revalidated: false, message: "JSON inválido" },
      { status: 400 },
    );
  }

  if (!isAuthorized(request, payload.secret)) {
    return NextResponse.json(
      { revalidated: false, message: "No autorizado" },
      { status: 401 },
    );
  }

  const paths = Array.isArray(payload.paths)
    ? payload.paths.filter((path) => typeof path === "string" && path.startsWith("/"))
    : [];
  const tags = Array.isArray(payload.tags)
    ? payload.tags.filter((tag) => typeof tag === "string" && tag.length > 0)
    : [];

  for (const path of paths) {
    revalidatePath(path);
  }
  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({
    revalidated: true,
    paths,
    tags,
    now: Date.now(),
  });
}
