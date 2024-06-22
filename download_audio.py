import yt_dlp
import sys
import os

def download_audio(url, output):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

if __name__ == "__main__":
    url = sys.argv[1]
    output = sys.argv[2]

    # Specify the full path to the output file
    output_path = os.path.abspath(output)

    download_audio(url, output_path)
