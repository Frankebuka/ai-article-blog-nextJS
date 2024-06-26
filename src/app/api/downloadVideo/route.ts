import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { exec } from "child_process";

const downloadVideo = async (url: string, output: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // const pythonExecutable = path.join(process.cwd(), "venv", "bin", "python3");
    const pythonExecutable = "python3";
    const scriptPath = path.join(process.cwd(), "download_video.py");
    exec(
      `${pythonExecutable} ${scriptPath} ${url} ${output}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(output);
        }
      }
    );
  });
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const output = path.join(process.cwd(), "video.mp4");
    if (fs.existsSync(output)) {
      fs.unlinkSync(output); // Delete the previous file if it exists
    }
    await downloadVideo(url, output);

    const fileStream = fs.createReadStream(output);
    const stream = new Readable().wrap(fileStream);

    const headers = {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename=${path.basename(output)}`,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    };

    return new Response(stream as any, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error(error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}
