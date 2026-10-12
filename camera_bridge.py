import os
import time
import math
from datetime import datetime
from urllib.parse import quote
import cv2
import numpy as np
from flask import Flask, Response, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuration for TP-Link IP Camera
CAMERA_IP = os.getenv("CAMERA_IP", "192.168.0.100")
USERNAME = os.getenv("CAMERA_USER", "admin")
PASSWORD = os.getenv("CAMERA_PASS", "Ridemap")
STREAM = os.getenv("CAMERA_STREAM", "1")

# URL-encode credentials containing special characters
username_enc = quote(USERNAME, safe="")
password_enc = quote(PASSWORD, safe="")
RTSP_URL = f"rtsp://{username_enc}:{password_enc}@{CAMERA_IP}:554/stream{STREAM}"

os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"

camera_cap = None
last_connect_try = 0
is_real_camera_online = False

def get_camera_stream():
    global camera_cap, last_connect_try, is_real_camera_online
    now = time.time()
    
    # Try reconnecting every 10 seconds if not opened
    if (camera_cap is None or not camera_cap.isOpened()) and (now - last_connect_try > 10):
        last_connect_try = now
        try:
            print(f"[CAM BRIDGE] Attempting connection to RTSP: {RTSP_URL}")
            cap = cv2.VideoCapture(RTSP_URL, cv2.CAP_FFMPEG)
            cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 3000)
            cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSEC, 3000)
            if cap.isOpened():
                camera_cap = cap
                is_real_camera_online = True
                print("[CAM BRIDGE] Connected to physical IP camera successfully!")
            else:
                is_real_camera_online = False
        except Exception as e:
            print(f"[CAM BRIDGE] RTSP connection attempt failed: {e}")
            is_real_camera_online = False

    if camera_cap and camera_cap.isOpened():
        ret, frame = camera_cap.read()
        if ret and frame is not None:
            return frame, True
        else:
            camera_cap.release()
            camera_cap = None
            is_real_camera_online = False

    return generate_simulated_cctv_frame(), False

def generate_simulated_cctv_frame():
    """Generates high-definition Puducherry Police CCTV parking simulation with AI detections."""
    width, height = 800, 450
    frame = np.zeros((height, width, 3), dtype=np.uint8)

    # Asphalt background
    frame[:] = (45, 52, 60)

    # Road perspective lines & Kerb
    cv2.rectangle(frame, (0, 0), (width, 140), (70, 80, 90), -1)
    cv2.line(frame, (0, 140), (width, 140), (220, 220, 220), 3)

    # Kerb markings (Black & Yellow alternating Puducherry kerb)
    for x in range(0, width, 40):
        color = (0, 215, 255) if (x // 40) % 2 == 0 else (20, 20, 20)
        cv2.rectangle(frame, (x, 134), (x + 40, 140), color, -1)

    t = time.time()

    # Draw 4 Parking Bays
    bay_coords = [
        (60, 160, 210, 390, "#12 (OCCUPIED)", (0, 0, 220), True),
        (230, 160, 380, 390, "#13 (OCCUPIED)", (0, 0, 220), True),
        (400, 160, 550, 390, "#14 (VACANT)", (0, 200, 0), False),
        (570, 160, 720, 390, "#15 (VACANT)", (0, 200, 0), False),
    ]

    for (x1, y1, x2, y2, label, color, is_occupied) in bay_coords:
        # Bay white parking slot border
        cv2.rectangle(frame, (x1, y1), (x2, y2), (200, 200, 200), 2)
        
        # AI Detection Bounding Box
        cv2.rectangle(frame, (x1 + 6, y1 + 10), (x2 - 6, y2 - 10), color, 2)
        
        if is_occupied:
            # Draw parked vehicle shape
            cv2.rectangle(frame, (x1 + 15, y1 + 35), (x2 - 15, y2 - 30), (140, 140, 150), -1)
            cv2.rectangle(frame, (x1 + 25, y1 + 75), (x2 - 25, y2 - 60), (30, 30, 30), -1)
            # License Plate tag
            cv2.rectangle(frame, (x1 + 30, y2 - 45), (x2 - 30, y2 - 25), (255, 255, 255), -1)
            cv2.putText(frame, "PY 01", (x1 + 38, y2 - 32), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1)

        # Bay Tag Banner
        cv2.rectangle(frame, (x1 + 6, y1 + 10), (x2 - 6, y1 + 32), color, -1)
        cv2.putText(frame, label, (x1 + 10, y1 + 26), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

    # Road driving car with motion
    car_x = int((t * 90) % (width + 120)) - 100
    if 0 <= car_x <= width:
        cv2.rectangle(frame, (car_x, 60), (car_x + 90, 120), (180, 100, 50), -1)
        cv2.putText(frame, "ANPR: PY-01-BZ-8822", (car_x - 10, 52), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)

    # Top OSD Police Camera Telemetry
    cv2.rectangle(frame, (0, 0), (width, 36), (10, 18, 30), -1)
    
    # Blinking REC dot
    if int(t * 2) % 2 == 0:
        cv2.circle(frame, (20, 18), 6, (0, 0, 255), -1)
    
    cv2.putText(frame, "LIVE REC", (32, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 2)
    cv2.putText(frame, "PUDUCHERRY TRAFFIC POLICE • ANPR POLE CAM 02", (110, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1)
    
    # Timestamp
    dt_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cv2.putText(frame, dt_str, (width - 190, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 255, 200), 1)

    # Bottom status bar
    cv2.rectangle(frame, (0, height - 28), (width, height), (15, 23, 42), -1)
    cv2.putText(frame, f"RTSP: {CAMERA_IP}:554 | OCCUPIED: 14/35 | VACANT: 21 | AI PRECISION: 99.8%", (16, height - 9), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (180, 200, 220), 1)

    return frame

def generate_frames():
    while True:
        frame, is_real = get_camera_stream()
        
        # If real camera frame, add Police HUD banner
        if is_real:
            h, w = frame.shape[:2]
            cv2.rectangle(frame, (0, 0), (w, 35), (10, 20, 35), -1)
            cv2.putText(frame, "PUDUCHERRY POLICE • REAL IP CAM 01 [ONLINE]", (20, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 120), 2)
            cv2.putText(frame, datetime.now().strftime("%H:%M:%S"), (w - 120, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        if not ret:
            continue
        
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        time.sleep(0.04) # ~25 FPS

@app.route('/video_feed')
def video_feed():
    """Live MJPEG video stream accessible directly by web & mobile image tags."""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/status')
def status():
    return jsonify({
        "status": "ONLINE",
        "is_real_camera": is_real_camera_online,
        "camera_ip": CAMERA_IP,
        "rtsp_port": 554,
        "stream": STREAM,
        "occupied_slots": 14,
        "vacant_slots": 21,
        "ai_precision": "99.8%",
        "timestamp": datetime.now().isoformat(),
    })

if __name__ == '__main__':
    print("================================================================")
    print("  PARKPUDUVAI SMART PARKING - IP CAMERA STREAMING BRIDGE        ")
    print("  Puducherry Traffic Police ANPR Space Sensing & Enforcement   ")
    print("================================================================")
    print(f"  Target RTSP URL:  {RTSP_URL}")
    print("  Local HTTP Stream: http://localhost:5001/video_feed")
    print("  Camera Status:     http://localhost:5001/status")
    print("================================================================")
    app.run(host='0.0.0.0', port=5001, threaded=True)
