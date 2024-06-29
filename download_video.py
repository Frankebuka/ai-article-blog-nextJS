import sys
import yt_dlp

def download_video(url, output):
    ydl_opts = {
        'outtmpl': output,
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',  # Ensure the format is MP4
        'postprocessors': [{
            'key': 'FFmpegVideoConvertor',
            'preferedformat': 'mp4',  # Convert to MP4
        }],
        'overwrite': True,  # Overwrite existing files
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

if __name__ == "__main__":
    url = sys.argv[1]
    output = sys.argv[2]
    download_video(url, output)










