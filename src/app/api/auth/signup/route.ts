const apiUrl = (process.env.EXPENSE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ detail: "Invalid sign-up request." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ detail: "Username, email, and password are required." }, { status: 400 });
  }

  const { username, email, password } = body as Record<string, unknown>;
  if (
    typeof username !== "string" ||
    !username.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    return Response.json({ detail: "Username, email, and password are required." }, { status: 400 });
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${apiUrl}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { detail: "Could not reach the API. Make sure the backend is running." },
      { status: 502 },
    );
  }

  if (!backendResponse.ok) {
    const result = (await backendResponse.json().catch(() => null)) as { detail?: unknown } | null;
    const detail = typeof result?.detail === "string" ? result.detail : "Unable to create your account.";
    return Response.json({ detail }, { status: backendResponse.status });
  }

  return Response.json({ created: true });
}