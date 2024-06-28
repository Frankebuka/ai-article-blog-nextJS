import yt_dlp
import sys
import os

def download_audio(url, output):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output,  # Keep the extension out of the template
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': {
            'default': output.replace('.mp3', ''),  # Ensure .mp3 is not included in the template
        },
        'overwrite': True,  # Overwrite existing files
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
        print(f"Downloaded audio to {output}")

if __name__ == "__main__":
    url = sys.argv[1]
    output = sys.argv[2]

    # Specify the full path to the output file
    output_path = os.path.abspath(output)
    print(f"Output path: {output_path}")

    download_audio(url, output_path)

