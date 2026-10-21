import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "./DashboardLayout";
import DashboardHome from "./DashboardHome";
import Audience from "./pages/Audience";
import Segments from "./pages/Segments";
import Campaigns from "./pages/Campaigns";
import UserManagement from "./UserManagement";
import Templates from "./pages/Templates";
import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import api from "./services/api";
import "./App.css";
import Register from "./Register";
import Login from "./Login";
function Navbar() {
  return (
    <nav className="navbar">
      <Link className="brand" to="/">
        AwareAI
      </Link>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#how-it-works">How it works</a>
        <Link to="/login">Login</Link>
        <Link className="nav-button" to="/register">
          Register
        </Link>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      AI-Powered Multilingual Public Awareness Platform
    </footer>
  );
}

function LandingPage() {
  useEffect(() => {
    api.get("/health")
      .then((response) => {
        console.log("Backend health:", response.data);
      })
      .catch((error) => {
        console.error("Backend connection failed:", error.message);
      });
  }, []);

 
const features = [
  {
    title: "Multilingual Communication",
    description:
      "Break language barriers by delivering public awareness messages in multiple Indian languages, making essential information accessible to every community.",
  },
  {
    title: "AI-Powered Content Creation",
    description:
      "Create clear, engaging, and audience-friendly awareness content with AI assistance to communicate important information effectively.",
  },
  {
    title: "Multi-Channel Campaigns",
    description:
      "Manage awareness campaigns across supported communication channels through one unified platform.",
  },
  {
    title: "Audience Segmentation",
    description:
      "Organize audiences by language, location, occupation, and other attributes to deliver more relevant awareness messages.",
  },
  {
    title: "Smart Campaign Management",
    description:
      "Create, organize, prioritize, and manage awareness campaigns, including high-priority emergency communications.",
  },
  {
    title: "Insights & Feedback",
    description:
      "Use campaign statistics and audience feedback to understand communication outcomes and improve future awareness initiatives.",
  },
];


  const steps = [
    "Create an awareness campaign",
    "Prepare content with AI assistance",
    "Select languages and audience segments",
    "Choose communication channels",
    "Monitor delivery and feedback",
  ];

  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <p className="eyebrow">SMARTER PUBLIC COMMUNICATION</p>
          <h1>
            Awareness for Everyone,
            <span> in Every Language.</span>
          </h1>
          <p className="hero-description">
            An AI-powered platform to create, manage, and
            distribute multilingual public awareness messages.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" to="/register">
              Get Started
            </Link>
            <a className="secondary-button" href="#features">
              Explore Features
            </a>
          </div>
        </section>

        <section id="features" className="section">
          <p className="eyebrow">WHAT THE PLATFORM OFFERS</p>
          <h2>Features</h2>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="section workflow">
          <p className="eyebrow">A SIMPLE WORKFLOW</p>
          <h2>How It Works</h2>
          <ol>
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </main>

      <Footer />
    </>
  );
}

function LoginPage() {
  return (
    <div className="placeholder-page">
      <h1>Login</h1>
      <p>Login functionality will be implemented in a later task.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}

function RegisterPage() {
  return (
    <div className="placeholder-page">
      <h1>Register</h1>
      <p>Registration functionality will be implemented in a later task.</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="audience" element={<Audience />} />
            <Route path="segments" element={<Segments />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="templates" element={<Templates />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

