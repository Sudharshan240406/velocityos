import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const response = NextResponse.json({ ok: true, redirectTo: `${origin}/workspace` });
  response.cookies.set("velocityos-demo", "1", {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("velocityos-demo", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return response;
}
