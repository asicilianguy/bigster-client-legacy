import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "No access token provided" },
        { status: 400 }
      );
    }

    const companiesResponse = await fetch(
      "https://api-v2.fattureincloud.it/user/companies",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!companiesResponse.ok) {
      const errorText = await companiesResponse.text();
      return NextResponse.json(
        {
          error: `Companies request failed with status ${companiesResponse.status}`,
          details: errorText,
        },
        { status: companiesResponse.status }
      );
    }

    const companies = await companiesResponse.json();
    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
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
