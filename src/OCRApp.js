import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
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
  const [cameraStream, setCameraStream] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        checkUserOcrCount(user.uid);
      } else {
        setUser(null);
        setOcrCount(0);
        // Clean up when user signs out
        stopCamera();
        setPreviewImage("");
        setImageFile(null);
        setCorrectedText("");
      }
    });

    return () => unsubscribe();
  }, []);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const checkUserOcrCount = useCallback(async (userId) => {
    try {
      const userDoc = doc(db, "users", userId);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        setOcrCount(docSnap.data().ocrCount || 0);
      } else {
        await setDoc(userDoc, { ocrCount: 0, createdAt: new Date() });
        setOcrCount(0);
      }
    } catch (error) {
      console.error("Error checking OCR count:", error);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      // Auth state change will be handled by the useEffect listener
    } catch (error) {
      console.error("Error signing in:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
      // Auth state change will be handled by the useEffect listener
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const incrementOcrCount = useCallback(async () => {
    if (!user) return;
    try {
      const userDoc = doc(db, "users", user.uid);
      const newCount = ocrCount + 1;
      await updateDoc(userDoc, { 
        ocrCount: newCount,
        lastUsed: new Date()
      });
      setOcrCount(newCount);
    } catch (error) {
      console.error("Error updating OCR count:", error);
    }
  }, [user, ocrCount]);

  const startCamera = async () => {
    try {
      setCameraError("");
      // Stop existing stream first
      if (cameraStream) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      let errorMessage = "Camera access failed. ";
      
      if (error.name === 'NotAllowedError') {
        errorMessage += "Please allow camera permissions and try again.";
      } else if (error.name === 'NotFoundError') {
        errorMessage += "No camera found on this device.";
      } else if (error.name === 'NotSupportedError') {
        errorMessage += "Camera is not supported in this browser.";
      } else {
        errorMessage += "Please check your camera and try again.";
      }
      
      setCameraError(errorMessage);
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraError("");
  }, [cameraStream]);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video || !cameraStream) {
      alert("Camera not ready. Please start the camera first.");
      return;
    }

    try {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageURL = canvas.toDataURL("image/jpeg", 0.8); // Use JPEG for smaller file size
      setPreviewImage(imageURL);
      stopCamera();

      // Convert to file
      fetch(imageURL)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `captured_${Date.now()}.jpg`, { type: "image/jpeg" });
          setImageFile(file);
        })
        .catch(error => {
          console.error("Error creating file from capture:", error);
          alert("Failed to capture image. Please try again.");
        });
    } catch (error) {
      console.error("Error capturing image:", error);
      alert("Failed to capture image. Please try again.");
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size too large. Please select an image smaller than 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        // Optimize image size
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;

        let { width, height } = img;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const resizedDataURL = canvas.toDataURL("image/jpeg", 0.8);
        setPreviewImage(resizedDataURL);

        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
          setImageFile(resizedFile);
        }, "image/jpeg", 0.8);
      };
      img.onerror = () => {
        alert("Failed to load image. Please try a different file.");
      };
    };
    reader.onerror = () => {
      alert("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    
    if (!user) {
      alert("Please sign in first to extract text.");
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
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append("Session", "string");
      formData.append("image", imageFile);

      const options = {
        method: "POST",
        url: "https://render-backend-18fh.onrender.com/api/ocr",
        // url: "http://localhost:5000/api/ocr", // Uncomment for local development
        data: formData,
        timeout: 60000, // 60 second timeout
      };

      const response = await axios.request(options);
      console.log("🟢 API Response:", response.data);
      
      const extractedText = response.data.text || response.data.extractedText || "";
      if (extractedText.trim()) {
        setCorrectedText(extractedText);
        await incrementOcrCount();
      } else {
        setCorrectedText("No text found in the image. Please try with a clearer image.");
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      let errorMessage = "Failed to extract text. ";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage += "Request timed out. Please try again.";
      } else if (error.response?.status === 413) {
        errorMessage += "Image file too large. Please use a smaller image.";
      } else if (error.response?.status >= 500) {
        errorMessage += "Server error. Please try again later.";
      } else {
        errorMessage += "Please check your connection and try again.";
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  const downloadAsDocx = async () => {
    if (!correctedText.trim()) {
      alert("No text to download. Please extract text first.");
      return;
    }

    try {
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: correctedText,
              spacing: { line: 360 } // 1.5 line spacing
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `extracted_text_${new Date().toISOString().split('T')[0]}.docx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error("Error creating document:", error);
      alert("Failed to create document. Please try again.");
    }
  };

  const clearImage = () => {
    setPreviewImage("");
    setImageFile(null);
    setCorrectedText("");
    stopCamera();
  };

  const getRemainingCredits = () => 3 - ocrCount;

  const getCreditStatus = () => {
    const remaining = getRemainingCredits();
    if (remaining <= 0) return 'danger';
    if (remaining === 1) return 'warning';
    return 'success';
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-left">
          <h1 className="logo">✨ AiViScan</h1>
          {user && (
            <div className="camera-controls">
              {!cameraStream ? (
                <button 
                  onClick={startCamera} 
                  className="btn-primary"
                  disabled={loading}
                >
                  📷 Start Camera
                </button>
              ) : (
                <>
                  <button 
                    onClick={captureImage} 
                    className="btn-success"
                    disabled={loading}
                  >
                    📸 Capture
                  </button>
                  <button 
                    onClick={stopCamera} 
                    className="btn-danger"
                    disabled={loading}
                  >
                    ⏹️ Stop
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="navbar-right">
          {user ? (
            <div className="user-info">
              <div className={`status-indicator status-${getCreditStatus()}`}>
                ⚡ Credits: {getRemainingCredits()}/3
              </div>
              <button 
                className="signout-btn" 
                onClick={signOut}
                disabled={loading}
              >
                👋 Sign Out
              </button>
            </div>
          ) : (
            <button 
              className="signin-btn" 
              onClick={signInWithGoogle}
              disabled={loading}
            >
              {loading ? "Signing in..." : "🚀 Sign In with Google"}
            </button>
          )}
        </div>
      </nav>

      <div className="main-container">
        <div className="left-pane">
          {!previewImage ? (
            <div className={`camera-section ${cameraStream ? 'active' : ''}`}>
              {cameraStream ? (
                <>
                  <video ref={videoRef} autoPlay className="camera-preview" />
                  <canvas ref={canvasRef} className="hidden" />
                </>
              ) : (
                <div className="camera-placeholder">
                  <div className="icon">📷</div>
                  <p>Click "Start Camera" to begin</p>
                  <p>or upload an image below</p>
                  {cameraError && (
                    <div style={{ color: 'var(--danger-color)', marginTop: '1rem', fontSize: '0.875rem' }}>
                      {cameraError}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="image-preview">
              <img src={previewImage} alt="Selected for OCR" />
              <button className="clear-btn" onClick={clearImage} title="Clear image">
                ✕
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
                disabled={loading}
              />
            </label>
          </div>
        </div>

        <div className="right-pane">
          <div className="text-header">
            <h2>🔍 Extracted Text</h2>
            <button 
              onClick={downloadAsDocx}
              className="download-btn"
              disabled={!correctedText.trim() || loading}
            >
              ⬇️ Download DOCX
            </button>
          </div>
          
          <textarea
            value={correctedText}
            onChange={(e) => setCorrectedText(e.target.value)}
            placeholder="Extracted text will appear here... You can edit it before downloading."
            className="text-editor"
            disabled={loading}
          />
          
          <button 
            onClick={handleFormSubmit}
            disabled={loading || !imageFile || !user}
            className={`process-btn ${isProcessing ? 'loading' : ''}`}
          >
            {isProcessing ? "🔄 Processing..." : "✨ Extract Text"}
          </button>
          
          {!user && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(99, 102, 241, 0.1)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid rgba(99, 102, 241, 0.2)',
              textAlign: 'center',
              color: 'var(--primary-color)',
              fontSize: '0.875rem'
            }}>
              👆 Please sign in to extract text from images
            </div>
          )}
        </div>
      </div>

      {showLimitModal && (
        <div className="limit-modal">
          <div className="modal-content">
            <h3>🎯 Upgrade Required</h3>
            <p>You've reached your free limit of 3 extractions. Contact us to upgrade your account and get unlimited access!</p>
            <a 
              href="mailto:lahmerimohamedamine29@gmail.com?subject=AiViScan%20Upgrade%20Request&body=Hi,%0D%0A%0D%0AI%20would%20like%20to%20upgrade%20my%20AiViScan%20account%20for%20unlimited%20text%20extraction.%0D%0A%0D%0AMy%20account%20email:%20[YOUR_EMAIL]%0D%0A%0D%0AThank%20you!" 
              className="email-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              📧 Contact Support
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
