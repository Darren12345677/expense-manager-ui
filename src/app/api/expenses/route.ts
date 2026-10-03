import { cookies } from "next/headers";

const accessTokenCookie = "expense_access_token";
const apiUrl = (process.env.EXPENSE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function forwardRequest(path: string, token: string, body?: string) {
  try {
    const backendResponse = await fetch(`${apiUrl}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body,
      cache: "no-store",
    });
    const result = await backendResponse.json().catch(() => null);
    return Response.json(result ?? {}, { status: backendResponse.status });
  } catch {
    return Response.json(
      { detail: "Could not reach the API. Make sure the backend is running." },
      { status: 502 },
    );
  }
}

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(accessTokenCookie)?.value;
}

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ detail: "Sign in to view expenses." }, { status: 401 });
  }

  return forwardRequest("/me/expenses", token);
}

export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ detail: "Sign in to add expenses." }, { status: 401 });
  }

  let body: string;
  try {
    body = JSON.stringify(await request.json());
  } catch {
    return Response.json({ detail: "Invalid expense request." }, { status: 400 });
  }

  return forwardRequest("/me/expenses/new", token, body);
}