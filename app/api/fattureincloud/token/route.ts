import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, clientId, clientSecret, redirectUri } = body;

    if (!code || !clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const formData = new URLSearchParams();
    formData.append("grant_type", "authorization_code");
    formData.append("client_id", clientId);
    formData.append("client_secret", clientSecret);
    formData.append("code", code);
    formData.append("redirect_uri", redirectUri);

    const tokenResponse = await fetch(
      "https://api-v2.fattureincloud.it/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    const responseText = await tokenResponse.text();

    if (!tokenResponse.ok) {
      return NextResponse.json(
        {
          error: `Token request failed with status ${tokenResponse.status}`,
          details: responseText,
        },
        { status: tokenResponse.status }
      );
    }

    const tokenData = JSON.parse(responseText);

    return NextResponse.json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });
  } catch (error) {
    console.error("Error fetching token:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
