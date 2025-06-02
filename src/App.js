import { useState } from 'react';
import LandingPage from './LandingPage';
import OCRApp from './OCRApp'; // Your current app logic

function App() {
  const [showApp, setShowApp] = useState(false);

  return (
    <div>
      {showApp ? (
        <OCRApp onBackToLanding={() => setShowApp(false)} />
      ) : (
        <LandingPage onStartApp={() => setShowApp(true)} />
      )}
    </div>
  );
}
