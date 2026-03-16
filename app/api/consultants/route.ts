import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface Consultant {
  id: number;
  fullName: string;
  email: string;
  role: string;
  area: string;
  areaColor: string;
  companies: number;
  profileUrl: string;
}

export async function GET() {

  const customCookies = {
    _myOSM_2013_session:
      "BAh7CEkiD3Nlc3Npb25faWQGOgZFVEkiJWZiNWE5MmEwNGRlY2VhNzQ3M2FmNjhmYzljMTdlMmJhBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMW9SNTVBczBzQjl6N1FWYTlORjN4anR1OXB5YjRCK2I2bVNNT3NhYmtleHM9BjsARkkiGXdhcmRlbi51c2VyLnVzZXIua2V5BjsAVFsISSIJVXNlcgY7AEZbBmkB8UkiIiQyYSQxMCR0UEpkSzZ3Q2xGQnNwaC5pMjB4UDR1BjsAVA%3D%3D--0ffb5bc289be8349f1ef80f6c006776a9b7ad168",
    company: "13",
    AMP_fe4beb374f:
      "JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjJjMTczNzU3Ny0zYTUzLTQwMTQtYTJjMS05MWMxM2VlMDNlMWElMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjJhODJkNjcwNy02MTIwLTRkMzAtYjZhMC1kNGFjMTEwMTRhOGYlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzQwNjAwNzU3MDgxJTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTc0MDYwMDc1NzA4MyUyQyUyMmxhc3RFdmVudElkJTIyJTNBMSU3RA==",
    AMP_MKTG_fe4beb374f: "JTdCJTdE",
  };

  const cookieString = Object.entries(customCookies)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");

  try {

    const result = await fetchConsultants(cookieString);

    if (!result.success) {
      return NextResponse.json(result, {
        status: result.status || 500,
      });
    }

    let filteredConsultants = result.consultants;
    if (Array.isArray(filteredConsultants)) {
      filteredConsultants = filteredConsultants.filter(
        (consultant) => consultant.fullName !== "Dentalead Staff"
      );
    }

    return NextResponse.json({
      success: true,
      totalConsultants: filteredConsultants?.length || 0,
      consultants: filteredConsultants,
    });
  } catch (error) {
    console.error("Error fetching consultants:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

async function fetchConsultants(cookieString: string) {
  const url = "https://my.dentalead.ch/admin/users";

  const response = await fetch(url, {
    headers: {
      Cookie: cookieString,
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://my.dentalead.ch/",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    },
  });

  if (!response.ok) {
    return {
      success: false,
      error: `Error requesting consultants: ${response.status}`,
      status: response.status,
    };
  }

  const html = await response.text();

  if (html.includes('action="/users/sign_in"')) {
    return {
      success: false,
      error: "Session expired or invalid",
      isLoginPage: true,
      status: 401,
    };
  }

  const $ = cheerio.load(html);
  const consultants: Consultant[] = [];

  $('tbody tr[id^="user-"]').each((index, element) => {
    const userId = $(element).attr("id")?.replace("user-", "");
    if (!userId) return;

    const fullName = $(element).find("td strong a").text().trim();
    const profileUrl = $(element).find("td strong a").attr("href") || "";
    const role = $(element).find("td small").first().text().trim();
    const email = $(element).find("td small").eq(1).text().trim();

    const areaElement = $(element).find("td a.btn.btn-flat.noprint");
    const area = areaElement.text().trim();
    const areaColor =
      areaElement
        .attr("style")
        ?.match(/background-color: (#[a-fA-F0-9]{6});/)?.[1] || "";

    const companies =
      parseInt($(element).find("td strong").eq(1).text().trim()) || 0;

    consultants.push({
      id: parseInt(userId),
      fullName,
      email,
      role,
      area,
      areaColor,
      companies,
      profileUrl,
    });
  });

  const pagination = $("ul.pagination");
  const totalPages = pagination.find("li:not(.prev):not(.next)").length;

  if (totalPages > 1) {
    const additionalPagesPromises: Promise<{
      success: boolean;
      consultants: Consultant[];
    }>[] = [];

    for (let page = 2; page <= totalPages; page++) {
      const pageUrl = `https://my.dentalead.ch/admin/users?show_all=0&user_page=${page}`;
      additionalPagesPromises.push(fetchConsultantPage(pageUrl, cookieString));
    }

    const additionalPagesResults = await Promise.all(additionalPagesPromises);
    for (const pageResult of additionalPagesResults) {
      if (pageResult.success) {
        consultants.push(...pageResult.consultants);
      }
    }
  }

  return {
    success: true,
    pageTitle: $("title").text(),
    consultants,
    totalConsultants: consultants.length,
  };
}

async function fetchConsultantPage(url: string, cookieString: string) {
  try {
    const response = await fetch(url, {
      headers: {
        Cookie: cookieString,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://my.dentalead.ch/admin/users",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        consultants: [],
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const consultants: Consultant[] = [];

    $('tbody tr[id^="user-"]').each((index, element) => {
      const userId = $(element).attr("id")?.replace("user-", "");
      if (!userId) return;

      const fullName = $(element).find("td strong a").text().trim();
      const profileUrl = $(element).find("td strong a").attr("href") || "";
      const role = $(element).find("td small").first().text().trim();
      const email = $(element).find("td small").eq(1).text().trim();

      const areaElement = $(element).find("td a.btn.btn-flat.noprint");
      const area = areaElement.text().trim();
      const areaColor =
        areaElement
          .attr("style")
          ?.match(/background-color: (#[a-fA-F0-9]{6});/)?.[1] || "";

      const companies =
        parseInt($(element).find("td strong").eq(1).text().trim()) || 0;

      consultants.push({
        id: parseInt(userId),
        fullName,
        email,
        role,
        area,
        areaColor,
        companies,
        profileUrl,
      });
    });

    return {
      success: true,
      consultants,
    };
  } catch (error) {
    console.error(`Error fetching consultant page ${url}:`, error);
    return {
      success: false,
      consultants: [],
    };
  }
}

export const dynamic = "force-dynamic";
