// import fs from "fs";
// import path from "path";
// import { NextRequest, NextResponse } from "next/server";
// import { Readable } from "stream";

// export async function GET(req: NextRequest) {
//   try {
//     const output = path.join(process.cwd(), "audio.mp3");

//     if (!fs.existsSync(output)) {
//       return NextResponse.json(
//         { error: "Audio file not found" },
//         { status: 404 }
//       );
//     }

//     const fileStream = fs.createReadStream(output);
//     const stream = new Readable().wrap(fileStream);

//     const headers = {
//       "Content-Type": "audio/mpeg",
//       "Content-Disposition": `attachment; filename=${path.basename(output)}`,
//     };

//     return new Response(stream as any, { headers });
//   } catch (error) {
//     if (error instanceof Error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     } else {
//       return NextResponse.json(
//         { error: "An unexpected error occurred" },
//         { status: 500 }
//       );
//     }
//   }
// }

import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

export async function GET(req: NextRequest) {
  try {
    const output = path.join(process.cwd(), "audio.mp3");
    console.log(output);

    if (!fs.existsSync(output)) {
      return NextResponse.json(
        { error: "Audio file not found" },
        { status: 404 }
      );
    }

    const fileStream = fs.createReadStream(output);
    const stream = new Readable().wrap(fileStream);

    const headers = {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `attachment; filename=${path.basename(output)}`,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    };

    return new Response(stream as any, { headers });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}
