import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface ScrapedCustomerData {
  nome: string;
  email: string;
  telefono: string;
  indirizzo: string;
  citta: string;
  cap: string;
  partita_iva: string;
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "URL mancante o non valido" },
        { status: 400 }
      );
    }

    if (!url.match(/^https:\/\/my\.dentalead\.ch\/customers\/\d+$/)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "URL non valido. Formato: https://my.dentalead.ch/customers/[ID]",
        },
        { status: 400 }
      );
    }

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

    const response = await fetch(url, {
      headers: {
        Cookie: cookieString,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://my.dentalead.ch/",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Errore nella richiesta: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const html = await response.text();

    if (html.includes('action="/users/sign_in"')) {
      return NextResponse.json(
        {
          success: false,
          error: "Sessione scaduta o non valida",
        },
        { status: 401 }
      );
    }

    const $ = cheerio.load(html);

    const data: Partial<ScrapedCustomerData> = {};

    const heroName = $(".hero-unit h1").first().text().trim();
    if (heroName) {
      data.nome = heroName;
    }

    $(".span5.well").each((_, element) => {
      const header = $(element).find("h2").text().trim();

      if (header === "Contatto") {
        const dl = $(element).find("dl.dl-horizontal");

        dl.find("dt").each((i, dt) => {
          const label = $(dt).text().trim();
          if (label === "Email") {
            const emailValue = $(dt)
              .next("dd")
              .text()
              .trim()
              .replace(/&nbsp;/g, "");
            if (emailValue) {
              data.email = emailValue;
            }
          }
          if (label === "Cellulare") {
            const phoneValue = $(dt)
              .next("dd")
              .text()
              .trim()
              .replace(/&nbsp;/g, "");
            if (phoneValue) {
              data.telefono = phoneValue;
            }
          }
        });
      }

      if (header === "Indirizzo") {
        const dl = $(element).find("dl.dl-horizontal");

        dl.find("dt").each((i, dt) => {
          const label = $(dt).text().trim();
          const value = $(dt)
            .next("dd")
            .text()
            .trim()
            .replace(/&nbsp;/g, "");

          if (label === "Indirizzo" && value) {
            data.indirizzo = value;
          }
          if (label === "Città" && value) {
            data.citta = value;
          }
          if (label === "CAP" && value) {
            data.cap = value;
          }

          if (label === "Email" && value && !data.email) {
            data.email = value;
          }
          if (label === "Telefono" && value && !data.telefono) {
            data.telefono = value;
          }
        });
      }

      if (header === "Dati amministrativi") {
        const dl = $(element).find("dl.dl-horizontal");

        dl.find("dt").each((i, dt) => {
          const label = $(dt).text().trim();
          if (label === "Partita IVA") {
            const pivaValue = $(dt)
              .next("dd")
              .find("strong")
              .text()
              .trim()
              .replace(/&nbsp;/g, "");
            if (pivaValue) {
              data.partita_iva = pivaValue;
            }
          }
        });
      }
    });

    if (!data.nome) {
      return NextResponse.json(
        {
          success: false,
          error: "Impossibile estrarre i dati del cliente dalla pagina",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        nome: data.nome || "",
        email: data.email || "",
        telefono: data.telefono || "",
        indirizzo: data.indirizzo || "",
        citta: data.citta || "",
        cap: data.cap || "",
        partita_iva: data.partita_iva || "",
      },
    });
  } catch (error) {
    console.error("Errore durante lo scraping:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
