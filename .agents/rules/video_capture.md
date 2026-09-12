# Video Capture Guidelines

When recording videos via Playwright and processing them with FFmpeg for the frontend (especially high-tech UI demos):

## 1. Removing Loading Spinners
Playwright `record_video_dir` captures everything from `new_page()`. This includes the initial React loading spinner.
**Rule:** NEVER use `-c copy` with `-ss` to trim the video before concatenation, as keyframe snapping will cause inaccurate cuts and leave the spinner.
**Solution:** Use the FFmpeg `concat` demuxer's `inpoint` directive in the list file to trim exactly 2.5 seconds (or required time) from the first scene:
```txt
file '/path/to/demo_fast_0_landing.webm'
inpoint 00:00:02.500
file '/path/to/demo_fast_1_register.webm'
```

## 2. High Quality & Web Performance
Videos embedded in the platform (like the Presentation page) must have pristine text quality (no compression artifacts on UI elements) but load instantly without buffering.
**Rule:** Use VP9 for WebM and H.264 for MP4. NEVER use basic VP8 with a low fixed bitrate (like `1500k`).
**WebM Encoding:** Use `libvpx-vp9` with `-crf 32 -b:v 0` for optimal quality/size ratio.
**MP4 Encoding:** Use `libx264` with `-crf 22` or `24`.
**Fast Loading (CRITICAL):** ALWAYS add `-movflags +faststart` to MP4 outputs so the browser can play the video before the file fully downloads.

## 3. Playwright Viewport
Ensure the viewport matches typical modern laptops (e.g. 1440x900) to keep the UI text legible.

Adhere to these rules to ensure the DAIG platform delivers a fast, premium, and flawless visual experience.
