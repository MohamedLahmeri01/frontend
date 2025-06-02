<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AiViScan - Convert Document Images to DOCX with AI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #6366f1;
            --primary-hover: #5855eb;
            --secondary: #06b6d4;
            --accent: #10b981;
            --dark: #1e293b;
            --gray: #64748b;
            --light-gray: #f8fafc;
            --white: #ffffff;
            --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--dark);
            overflow-x: hidden;
        }

        /* Animated Background */
        .bg-animated {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--gradient);
            z-index: -2;
        }

        .bg-animated::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
            animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(180deg); }
        }

        /* Header */
        header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            z-index: 1000;
            transition: all 0.3s ease;
        }

        nav {
            max-width: 1200px;
            margin: 0 auto;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 2rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }

        .nav-links a {
            text-decoration: none;
            color: var(--dark);
            font-weight: 500;
            transition: color 0.3s ease;
        }

        .nav-links a:hover {
            color: var(--primary);
        }

        .cta-btn {
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: var(--shadow);
        }

        .cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 6rem 2rem 2rem;
            position: relative;
        }

        .hero-container {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }

        .hero-content h1 {
            font-size: 3.5rem;
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, var(--dark), var(--primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero-content p {
            font-size: 1.25rem;
            color: var(--gray);
            margin-bottom: 2rem;
            line-height: 1.6;
        }

        .hero-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-hover));
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1.1rem;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: var(--shadow);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.9);
            color: var(--dark);
            padding: 1rem 2rem;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 12px;
            font-weight: 600;
            font-size: 1.1rem;
            text-decoration: none;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .btn-primary:hover, .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .hero-visual {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .phone-mockup {
            width: 300px;
            height: 600px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 30px;
            padding: 20px;
            box-shadow: var(--shadow-lg);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            position: relative;
            overflow: hidden;
        }

        .phone-screen {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            position: relative;
        }

        .demo-icon {
            font-size: 4rem;
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        .floating-elements {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        .floating-element {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: floatAround 20s infinite linear;
        }

        .floating-element:nth-child(1) {
            width: 80px;
            height: 80px;
            top: 20%;
            left: 10%;
            animation-delay: 0s;
        }

        .floating-element:nth-child(2) {
            width: 60px;
            height: 60px;
            top: 60%;
            right: 10%;
            animation-delay: -7s;
        }

        .floating-element:nth-child(3) {
            width: 40px;
            height: 40px;
            top: 80%;
            left: 20%;
            animation-delay: -14s;
        }

        @keyframes floatAround {
            0% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -30px) rotate(120deg); }
            66% { transform: translate(-20px, 20px) rotate(240deg); }
            100% { transform: translate(0, 0) rotate(360deg); }
        }

        /* Features Section */
        .features {
            padding: 6rem 2rem;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            position: relative;
            z-index: 1;
        }

        .features-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .section-header {
            text-align: center;
            margin-bottom: 4rem;
        }

        .section-header h2 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--dark), var(--primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .section-header p {
            font-size: 1.1rem;
            color: var(--gray);
            max-width: 600px;
            margin: 0 auto;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }

        .feature-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-lg);
        }

        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            display: block;
        }

        .feature-card h3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--dark);
        }

        .feature-card p {
            color: var(--gray);
            line-height: 1.6;
        }

        /* How It Works */
        .how-it-works {
            padding: 6rem 2rem;
            position: relative;
            z-index: 1;
        }

        .steps-container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .steps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }

        .step-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            position: relative;
            transition: all 0.3s ease;
        }

        .step-card:hover {
            transform: translateY(-5px);
        }

        .step-number {
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            height: 30px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
        }

        .step-icon {
            font-size: 2.5rem;
            margin: 1rem 0;
            display: block;
        }

        /* CTA Section */
        .cta-section {
            padding: 6rem 2rem;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            text-align: center;
            position: relative;
            z-index: 1;
        }

        .cta-container {
            max-width: 800px;
            margin: 0 auto;
        }

        .cta-section h2 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--dark), var(--primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .cta-section p {
            font-size: 1.1rem;
            color: var(--gray);
            margin-bottom: 2rem;
        }

        .features-list {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 2rem;
            margin: 2rem 0;
        }

        .feature-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--accent);
            font-weight: 500;
        }

        /* Footer */
        footer {
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(20px);
            color: white;
            padding: 3rem 2rem 1rem;
            text-align: center;
            position: relative;
            z-index: 1;
        }

        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }

        .footer-links a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .footer-links a:hover {
            color: var(--primary);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .hero-container {
                grid-template-columns: 1fr;
                text-align: center;
                gap: 2rem;
            }

            .hero-content h1 {
                font-size: 2.5rem;
            }

            .nav-links {
                display: none;
            }

            .phone-mockup {
                width: 250px;
                height: 500px;
            }

            .hero-buttons {
                justify-content: center;
            }

            .features-grid {
                grid-template-columns: 1fr;
            }

            .steps-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 480px) {
            .hero {
                padding: 5rem 1rem 1rem;
            }

            .hero-content h1 {
                font-size: 2rem;
            }

            .btn-primary, .btn-secondary {
                padding: 0.75rem 1.5rem;
                font-size: 1rem;
            }

            .section-header h2 {
                font-size: 2rem;
            }

            .cta-section h2 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="bg-animated"></div>
    <div class="floating-elements">
        <div class="floating-element"></div>
        <div class="floating-element"></div>
        <div class="floating-element"></div>
    </div>

    <header>
        <nav>
            <div class="logo">✨ AiViScan</div>
            <ul class="nav-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#pricing">Pricing</a></li>
            </ul>
            <a href="#" class="cta-btn" onclick="scrollToApp()">🚀 Try Now</a>
        </nav>
    </header>

    <section class="hero">
        <div class="hero-container">
            <div class="hero-content">
                <h1>Transform Documents with AI-Powered OCR</h1>
                <p>Convert any document image to editable DOCX files in seconds. Our advanced OCR technology ensures 99% accuracy with support for multiple languages and formats.</p>
                <div class="hero-buttons">
                    <a href="#" class="btn-primary" onclick="scrollToApp()">
                        <span>✨</span> Start Converting
                    </a>
                    <a href="#how-it-works" class="btn-secondary">
                        <span>📖</span> Learn More
                    </a>
                </div>
            </div>
            <div class="hero-visual">
                <div class="phone-mockup">
                    <div class="phone-screen">
                        <div class="demo-icon">📄</div>
                        <p style="color: #64748b; font-size: 0.9rem; text-align: center;">Upload → AI Process → Download DOCX</p>
                        <div style="display: flex; gap: 0.5rem;">
                            <div style="width: 8px; height: 8px; background: var(--accent); border-radius: 50%; animation: pulse 1s infinite;"></div>
                            <div style="width: 8px; height: 8px; background: var(--primary); border-radius: 50%; animation: pulse 1s infinite 0.2s;"></div>
                            <div style="width: 8px; height: 8px; background: var(--secondary); border-radius: 50%; animation: pulse 1s infinite 0.4s;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="features" id="features">
        <div class="features-container">
            <div class="section-header">
                <h2>Why Choose AiViScan?</h2>
                <p>Experience the power of cutting-edge OCR technology designed for professionals and businesses who demand accuracy and efficiency.</p>
            </div>
            <div class="features-grid">
                <div class="feature-card">
                    <span class="feature-icon">🤖</span>
                    <h3>AI-Powered Recognition</h3>
                    <p>Advanced machine learning algorithms ensure 99%+ accuracy in text recognition, even with complex layouts and fonts.</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">⚡</span>
                    <h3>Lightning Fast</h3>
                    <p>Convert documents in seconds, not minutes. Our optimized processing pipeline handles large files with ease.</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">🌍</span>
                    <h3>Multi-Language Support</h3>
                    <p>Supports 50+ languages including English, Arabic, French, Spanish, Chinese, and many more.</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">📱</span>
                    <h3>Camera Integration</h3>
                    <p>Capture documents directly with your device camera or upload existing images - both work perfectly.</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">🔒</span>
                    <h3>Secure & Private</h3>
                    <p>Your documents are processed securely with Google authentication and automatic cleanup of processed files.</p>
                </div>
                <div class="feature-card">
                    <span class="feature-icon">📝</span>
                    <h3>Editable Output</h3>
                    <p>Get perfectly formatted DOCX files that you can edit, format, and share immediately after conversion.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="how-it-works" id="how-it-works">
        <div class="steps-container">
            <div class="section-header">
                <h2>How It Works</h2>
                <p>Transform your documents in just three simple steps. No technical knowledge required.</p>
            </div>
            <div class="steps-grid">
                <div class="step-card">
                    <div class="step-number">1</div>
                    <span class="step-icon">📷</span>
                    <h3>Capture or Upload</h3>
                    <p>Take a photo with your camera or upload an existing image of your document. We support JPG, PNG, and other common formats.</p>
                </div>
                <div class="step-card">
                    <div class="step-number">2</div>
                    <span class="step-icon">🔄</span>
                    <h3>AI Processing</h3>
                    <p>Our advanced OCR engine analyzes your document, recognizes text with high accuracy, and maintains formatting structure.</p>
                </div>
                <div class="step-card">
                    <div class="step-number">3</div>
                    <span class="step-icon">⬇️</span>
                    <h3>Download DOCX</h3>
                    <p>Review and edit the extracted text, then download your perfectly formatted DOCX file ready for use in any word processor.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="cta-section" id="pricing">
        <div class="cta-container">
            <h2>Ready to Transform Your Workflow?</h2>
            <p>Join thousands of professionals who trust AiViScan for their document conversion needs.</p>
            
            <div class="features-list">
                <div class="feature-item">
                    <span>✅</span> 3 Free Conversions
                </div>
                <div class="feature-item">
                    <span>✅</span> No Credit Card Required
                </div>
                <div class="feature-item">
                    <span>✅</span> Instant Results
                </div>
                <div class="feature-item">
                    <span>✅</span> Premium Accuracy
                </div>
            </div>

            <div style="margin-top: 2rem;">
                <a href="#" class="btn-primary" onclick="scrollToApp()" style="font-size: 1.2rem; padding: 1.25rem 2.5rem;">
                    <span>🚀</span> Start Converting Documents Now
                </a>
            </div>
            
            <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--gray);">
                Need more conversions? <a href="mailto:lahmerimohamedamine29@gmail.com?subject=AiViScan%20Upgrade%20Request" style="color: var(--primary); text-decoration: none;">Contact us for unlimited access</a>
            </p>
        </div>
    </section>

    <footer>
        <div class="footer-content">
            <div class="footer-links">
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="mailto:lahmerimohamedamine29@gmail.com">Support</a>
                <a href="#">Privacy Policy</a>
            </div>
            <p>&copy; 2024 AiViScan. Transforming documents with AI technology.</p>
        </div>
    </footer>

    <style>
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    </style>

    <script>
        function scrollToApp() {
            // This function will scroll to your main app section
            // You can modify this to redirect to your app page or show the app
            alert('Redirecting to the AiViScan app...');
            // Example: window.location.href = '/app';
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Header background change on scroll
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
            }
        });
    </script>
</body>
</html>
