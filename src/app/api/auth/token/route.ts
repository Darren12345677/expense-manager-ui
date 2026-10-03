import { cookies } from "next/headers";

const accessTokenCookie = "expense_access_token";
const sessionMaxAge = 30 * 60;
const apiUrl = (process.env.EXPENSE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

type TokenResponse = {
  access_token?: string;
  detail?: string;
};

export async function GET() {
  const cookieStore = await cookies();
  return Response.json({ authenticated: cookieStore.has(accessTokenCookie) });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return Response.json({ detail: "Username and password are required." }, { status: 400 });
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${apiUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
      cache: "no-store",
    });
  } catch {
    return Response.json(
      { detail: "Could not reach the API. Make sure the backend is running." },
      { status: 502 },
    );
  }

  const tokenResult = (await backendResponse.json().catch(() => null)) as TokenResponse | null;

  if (!backendResponse.ok) {
    return Response.json(
      { detail: tokenResult?.detail ?? "Sign in failed. Check your details and try again." },
      { status: backendResponse.status },
    );
  }

  if (!tokenResult?.access_token) {
    return Response.json({ detail: "The API returned an invalid sign-in response." }, { status: 502 });
  }

  const response = Response.json({ authenticated: true });
  response.headers.append(
    "Set-Cookie",
    `${accessTokenCookie}=${tokenResult.access_token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sessionMaxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return response;
}

export async function DELETE() {
  const response = Response.json({ authenticated: false });
  response.headers.append(
    "Set-Cookie",
    `${accessTokenCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  );
  return response;
}