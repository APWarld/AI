// Service Worker registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js")
      .then(() => console.log("Service Worker Registered"));
  });
}

// Request Notification Permission
if ("Notification" in window) {
  Notification.requestPermission();
}

// Elements
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const photoBtn = document.getElementById("photoBtn");
const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");

let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];

// Access Camera + Microphone
async function initCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = mediaStream;
  } catch (err) {
    alert("Camera or microphone access denied!");
    console.error(err);
  }
}
initCamera();

// Take Photo
photoBtn.addEventListener("click", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const image = canvas.toDataURL("image/png");

  // Trigger download
  const a = document.createElement("a");
  a.href = image;
  a.download = `photo_${Date.now()}.png`;
  a.click();

  // Notification
  if (Notification.permission === "granted") {
    new Notification("Photo Captured!", { body: "Your photo was saved successfully." });
  }
});

// Record Video
recordBtn.addEventListener("click", () => {
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(mediaStream);
  
  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `video_${Date.now()}.webm`;
    a.click();

    // Notification
    if (Notification.permission === "granted") {
      new Notification("Video Recorded!", { body: "Your video was saved successfully." });
    }
  };

  mediaRecorder.start();
  recordBtn.disabled = true;
  stopBtn.disabled = false;
});

// Stop Recording
stopBtn.addEventListener("click", () => {
  mediaRecorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
});
