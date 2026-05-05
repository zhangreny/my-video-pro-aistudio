import os
import uuid
import sys
import requests
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from moviepy import VideoFileClip, concatenate_videoclips, AudioFileClip

app = Flask(__name__)
CORS(app)

# Configure paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULT_DIR = os.path.join(BASE_DIR, "resultvideos")
TEMP_DIR = os.path.join(BASE_DIR, "temp_uploads")
MALE_VOICE_CANCEL_URL = "http://127.0.0.1:5001/process"

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
    cancel_male_voice = request.form.get("cancelMaleVoice") == "true"

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

    processed_audio_path = None

    try:
        # if not mute and cancelMaleVoice is true, then use api to cancel male voice
        if not mute and cancel_male_voice:
            try:
                print(f"Calling male voice cancellation API for {temp_path}...")
                with open(temp_path, "rb") as f:
                    response = requests.post(
                        MALE_VOICE_CANCEL_URL, files={"video": f}, timeout=300
                    )
                    if response.status_code == 200:
                        # API returns a wav file
                        processed_audio_path = temp_path + "_processed.wav"
                        with open(processed_audio_path, "wb") as out:
                            out.write(response.content)
                        print("Male voice cancellation audio received.")
                    else:
                        print(
                            f"Male voice cancel API failed with status {response.status_code}: {response.text}"
                        )
            except Exception as api_err:
                print(f"Error calling male voice cancel API: {str(api_err)}")

        video = VideoFileClip(temp_path)
        
        # If we have processed audio, replace the video's audio before clipping
        if processed_audio_path:
            try:
                new_audio = AudioFileClip(processed_audio_path)
                video = video.with_audio(new_audio)
            except Exception as audio_err:
                print(f"Error applying processed audio: {str(audio_err)}")

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

        # Clean up temp files
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass
        if processed_audio_path and os.path.exists(processed_audio_path):
            try:
                os.remove(processed_audio_path)
            except:
                pass

        return send_file(output_path, as_attachment=True, download_name=output_filename)

    except Exception as e:
        print(f"Error processing video: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
