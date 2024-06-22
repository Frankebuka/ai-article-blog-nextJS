import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const headers = new Headers();
    headers.append("Content-Type", response.headers["content-type"]);

    return new NextResponse(response.data, { headers });
  } catch (error) {
    console.error("Error fetching image:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
