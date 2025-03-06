// Issue last : how to put link email at alert box
import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import "./App.css";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};


initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

function App() {
  const [user, setUser] = useState(null);
  const [ocrCount, setOcrCount] = useState(0);
  const [previewImage, setPreviewImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [text, setText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraStream, setCameraStream] = useState(null); // Store camera stream
  const [showLimitModal, setShowLimitModal] = useState(false);

 const videoRef = useRef(null);
  const canvasRef = useRef(null);

const checkUserOcrCount = useCallback(async (userId) => {
    try {
      const userDoc = doc(db, "users", userId);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        setOcrCount(docSnap.data().ocrCount);
      } else {
        await setDoc(userDoc, { ocrCount: 0 });
        setOcrCount(0);
      }
    } catch (error) {
      console.error("Error checking OCR count:", error);
    }
  }, []);
  const signInWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      checkUserOcrCount(result.user.uid);
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Failed to sign in. Please try again.");
    }
  }, [checkUserOcrCount]);


  const incrementOcrCount = useCallback(async () => {
    if (!user) return;
    try {
      const userDoc = doc(db, "users", user.uid);
      await updateDoc(userDoc, { ocrCount: ocrCount + 1 });
      setOcrCount(prev => prev + 1);
    } catch (error) {
      console.error("Error updating OCR count:", error);
    }
  }, [user, ocrCount]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Camera access required. Please enable permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageURL = canvas.toDataURL("image/png");
      setPreviewImage(imageURL);
      stopCamera();

      fetch(imageURL)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "captured_image.png", { type: "image/png" });
          setImageFile(file);
        });
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 400;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const resizedDataURL = canvas.toDataURL("image/png");
          setPreviewImage(resizedDataURL);

          canvas.toBlob((blob) => {
            const resizedFile = new File([blob], file.name, { type: "image/png" });
            setImageFile(resizedFile);
          }, "image/png");
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      alert("Please sign in first.");
      return;
    }
    if (ocrCount >= 3) {
      setShowLimitModal(true);
      return;
    }
    if (!imageFile) {
      alert("Please select or capture an image first.");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append("Session", "string");
    formData.append("image", imageFile);


    const options = {
      method: "POST",
      //url: "http://localhost:5000/api/ocr",
      url:"https://render-backend-18fh.onrender.com/api/ocr",
      data: formData,
    };
 try {
      const response = await axios.request(options);
      console.log("🟢 API Response:", response.data); // 👈 Add this
      setCorrectedText(response.data.text || "issue with display");
      await incrementOcrCount();
    } catch (error) {
      console.error("Error extracting text:", error);
      alert("Failed to extract text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadAsDocx = () => {
    const doc = new Document({
      sections: [{
        children: [new Paragraph(correctedText)]
      }]
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "extracted_text.docx");
    });
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-left">
          <h1 className="logo">AiViScan</h1>
          {user && (
            <div className="camera-controls">
              <button title="Comming soon" onClick={startCamera} disabled={!cameraStream}>
                📷 Start Camera
              </button>
              <button title="Comming soon" onClick={captureImage} disabled={!cameraStream}>
                🖼️ Capture
              </button>
            </div>
          )}
        </div>
        <div className="navbar-right">
          {user ? (
            <div className="user-info">
              <span>Credits: {ocrCount}/3</span>
              <button className="signout-btn" onClick={() => auth.signOut()}>
                Sign Out
              </button>
            </div>
          ) : (
            <button className="signin-btn" onClick={signInWithGoogle}>
              Sign In with Google
            </button>
          )}
        </div>
      </nav>

      <div className="main-container">
        <div className="left-pane">
          {!previewImage ? (
            <div className="camera-section">
              <video ref={videoRef} autoPlay className="camera-preview" />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          ) : (
            <div className="image-preview">
              <img src={previewImage} alt="Captured" />
              <button className="clear-btn" onClick={() => setPreviewImage("")}>
                Clear Image
              </button>
            </div>
          )}
          
          <div className="upload-section">
            <label className="file-upload-btn">
              📁 Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
            </label>
          </div>
        </div>

        <div className="right-pane">
          <div className="text-header">
            <h2>Extracted Text</h2>
            <button 
              onClick={downloadAsDocx}
              className="download-btn"
              disabled={!correctedText}
            >
              ⬇️ Download DOCX
            </button>
          </div>
          
          <textarea
            value={correctedText}
            onChange={(e) => setCorrectedText(e.target.value)}
            placeholder="Extracted text will appear here..."
            className="text-editor"
          />
          
          <button 
            onClick={handleFormSubmit}
            disabled={loading || !previewImage}
            className="process-btn"
          >
            {loading ? "⚡ Processing..." : "✨ Extract Text"}
          </button>
        </div>
      </div>

      {showLimitModal && (
        <div className="limit-modal">
          <div className="modal-content">
            <h3>✨ Upgrade Required</h3>
            <p>You've reached your free limit. Contact us to upgrade:</p>
            <a href="mailto:lahmerimohamedamine29@gmail.com" className="email-link">
              📧 lahmerimohamedamine29@gmail.com
            </a>
            <button 
              onClick={() => setShowLimitModal(false)}
              className="close-btn"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
