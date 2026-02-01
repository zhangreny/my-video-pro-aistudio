import os
import uuid
import sys
import requests
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from moviepy import VideoFileClip, concatenate_videoclips

app = Flask(__name__)
CORS(app)

# Configure paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULT_DIR = os.path.join(BASE_DIR, "resultvideos")
TEMP_DIR = os.path.join(BASE_DIR, "temp_uploads")

if not os.path.exists(RESULT_DIR):
    os.makedirs(RESULT_DIR)
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)


@app.route("/export", methods=["POST"])
def export_video():
    if "video" not in request.files:
        return jsonify({"error": "No video file provided"}), 400

    video_file = request.files["video"]
    mute = request.form.get("mute") == "true"

    # segments should be a JSON string or multiple fields
    # For simplicity, let's assume it's passed as a JSON string in a form field
    import json

    segments_raw = request.form.get("segments")
    if not segments_raw:
        return jsonify({"error": "No segments provided"}), 400

    try:
        segments = json.loads(segments_raw)
    except Exception as e:
        return jsonify({"error": "Invalid segments format"}), 400

    # Save uploaded file temporarily
    temp_filename = f"{uuid.uuid4()}_{video_file.filename}"
    temp_path = os.path.join(TEMP_DIR, temp_filename)
    video_file.save(temp_path)

    try:
        video = VideoFileClip(temp_path)
        clips = []

        for seg in segments:
            start = float(seg["start"])
            end = float(seg["end"])
            # MoviePy 2.x uses subclipped instead of subclip
            clip = video.subclipped(start, end)
            clips.append(clip)

        # Concatenate clips in the order they were provided
        final_clip = concatenate_videoclips(clips)

        if mute:
            final_clip = final_clip.without_audio()

        # Generate output filename
        output_filename = f"result_{uuid.uuid4().hex[:8]}.mp4"
        output_path = os.path.join(RESULT_DIR, output_filename)

        # Write the file
        final_clip.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac" if not mute else None,
            audio=not mute,
        )

        # Close clips to release resources
        video.close()
        for c in clips:
            c.close()
        final_clip.close()

        # Clean up temp file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

        return send_file(output_path, as_attachment=True, download_name=output_filename)

    except Exception as e:
        print(f"Error processing video: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    url = "http://127.0.0.1:5001/process"
    video_path = r"C:\Users\zhangrenyu\Downloads\exported_video_1769875161866.mp4"
    output_file = r"D:\my-video-pro-aistudio\api_test_result.wav"
    with open(video_path, "rb") as f:
        response = requests.post(url, files={"video": f})
    if response.status_code == 200:
        with open(output_file, "wb") as f:
            f.write(response.content)
    print(f"Audio saved to {output_file}")
    app.run(debug=True, port=5000)
