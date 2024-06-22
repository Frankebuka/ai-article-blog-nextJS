import axios from "axios";
import FormData from "form-data";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const downloadAudio = async (url: string, output: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pythonExecutable = path.join(process.cwd(), "venv", "bin", "python3");
    // const pythonExecutable = "python3";
    const scriptPath = path.join(process.cwd(), "download_audio.py");
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

const uploadToAssemblyAI = async (filePath: string): Promise<string> => {
  const form = new FormData();
  form.append("audio", fs.createReadStream(filePath));

  const response = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    form,
    {
      headers: {
        ...form.getHeaders(),
        authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY as string,
      },
    }
  );

  return response.data.upload_url;
};

const getTranscription = async (audioUrl: string): Promise<string> => {
  const response = await axios.post(
    "https://api.assemblyai.com/v2/transcript",
    { audio_url: audioUrl },
    {
      headers: {
        authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY as string,
      },
    }
  );

  const { id } = response.data;

  let status = "processing";
  while (status === "processing" || status === "queued") {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const res = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${id}`,
      {
        headers: {
          authorization: process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY as string,
        },
      }
    );
    status = res.data.status;
    if (status === "completed") return res.data.text;
  }

  throw new Error("Transcription failed");
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
    const videoId = getVideoIdFromUrl(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    const videoMeta = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          id: videoId,
          key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY as string,
          part: "snippet",
        },
      }
    );

    const { title, thumbnails } = videoMeta.data.items[0].snippet;
    const thumbnailUrl = thumbnails.high.url;

    const output = path.join(process.cwd(), "audio.mp3");
    await downloadAudio(url, output);
    const audioUrl = await uploadToAssemblyAI(output);
    const transcription = await getTranscription(audioUrl);

    return NextResponse.json({
      title,
      thumbnailUrl,
      transcription,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unexpected error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}

const getVideoIdFromUrl = (url: string): string | null => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/[^/]+\/|(?:v|e(?:mbed)?)\/|[^?]*[?](?:.*&)?v=|[^/]+\/(?:[^/]+\/)*)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return match ? match[1] : null;
};
