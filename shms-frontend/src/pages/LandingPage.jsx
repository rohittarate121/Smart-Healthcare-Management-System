import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🤖",
      title: "AI Symptom Checker",
      desc: "Get instant health assessment powered by our MediSense AI engine",
    },
    {
      icon: "📅",
      title: "Easy Appointment Booking",
      desc: "Book with the right specialist in minutes — online or walk-in",
    },
    {
      icon: "📋",
      title: "Electronic Health Records",
      desc: "Your complete medical history in one secure place",
    },
    {
      icon: "🛡️",
      title: "Insurance Support",
      desc: "Seamless insurance claim processing at discharge",
    },
    {
      icon: "💊",
      title: "Digital Prescriptions",
      desc: "Receive and manage prescriptions digitally with allergy safety checks",
    },
    {
      icon: "🔬",
      title: "Lab Reports Online",
      desc: "View your lab results the moment they are ready",
    },
  ];

  const stats = [
    { value: "10+", label: "Specialties" },
    { value: "24/7", label: "AI Triage" },
    { value: "100%", label: "Digital Records" },
    { value: "5min", label: "Avg Booking Time" },
  ];

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Navbar */}
      <nav className="navbar px-4 py-3" style={{ backgroundColor: "#0d6efd" }}>
        <span className="fw-bold fs-4 text-white">🏥 SHMS</span>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="btn btn-light btn-sm fw-bold"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div
        className="text-white text-center py-5"
        style={{
          background: "linear-gradient(135deg, #0d6efd, #0a58ca)",
          minHeight: "420px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
        }}
      >
        <h1 className="fw-bold mb-3" style={{ fontSize: "2.8rem" }}>
          Smart Healthcare
          <br />
          Management System
        </h1>
        <p
          className="mb-4"
          style={{
            fontSize: "1.2rem",
            opacity: 0.9,
            maxWidth: "600px",
          }}
        >
          AI-powered symptom triage, seamless appointment booking, digital
          health records, and complete hospital management — all in one
          platform.
        </p>
        <div
          className="d-flex gap-3
          flex-wrap justify-content-center"
        >
          <button
            className="btn btn-light btn-lg fw-bold
              px-4"
            onClick={() => navigate("/register")}
          >
            Get Started — Register
          </button>
          <button
            className="btn btn-outline-light btn-lg
              px-4"
            onClick={() => navigate("/login")}
          >
            Already registered? Login
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ backgroundColor: "#1a1a2e" }} className="py-4">
        <div className="container">
          <div className="row text-center">
            {stats.map((s) => (
              <div key={s.label} className="col-3">
                <h3 className="fw-bold mb-0" style={{ color: "#0d6efd" }}>
                  {s.value}
                </h3>
                <p
                  className="text-white-50
                  small mb-0"
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-5" style={{ backgroundColor: "#f0f9ff" }}>
        <div className="container">
          <h2 className="text-center fw-bold mb-2">
            Everything your hospital needs
          </h2>
          <p className="text-center text-muted mb-5">
            Built for patients, doctors, and hospital staff
          </p>
          <div className="row g-4">
            {features.map((f) => (
              <div key={f.title} className="col-md-4">
                <div
                  className="card border-0
                  shadow-sm p-4 h-100 text-center"
                >
                  <div style={{ fontSize: "2.5rem" }} className="mb-3">
                    {f.icon}
                  </div>
                  <h5 className="fw-bold mb-2">{f.title}</h5>
                  <p className="text-muted mb-0">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center fw-bold mb-5">How it works</h2>
          <div className="row g-4 text-center">
            {[
              {
                step: "1",
                icon: "📝",
                title: "Register",
                desc: "Create your free patient account in 2 minutes",
              },
              {
                step: "2",
                icon: "🤖",
                title: "Check Symptoms",
                desc: "Use our AI to assess your symptoms and get specialist recommendation",
              },
              {
                step: "3",
                icon: "📅",
                title: "Book Appointment",
                desc: "Book instantly with the recommended specialist",
              },
              {
                step: "4",
                icon: "💊",
                title: "Get Treatment",
                desc: "Doctor reviews your history and provides digital prescription",
              },
            ].map((item) => (
              <div key={item.step} className="col-md-3">
                <div
                  className="rounded-circle
                    d-flex align-items-center
                    justify-content-center mx-auto mb-3"
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "#0d6efd",
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {item.step}
                </div>
                <div style={{ fontSize: "2rem" }}>{item.icon}</div>
                <h5 className="fw-bold mt-2 mb-1">{item.title}</h5>
                <p className="text-muted small">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="text-white text-center py-5"
        style={{ backgroundColor: "#0d6efd" }}
      >
        <h2 className="fw-bold mb-3">Ready to get started?</h2>
        <p className="mb-4 opacity-75">
          Join thousands of patients managing their health digitally
        </p>
        <button
          className="btn btn-light btn-lg fw-bold
            px-5"
          onClick={() => navigate("/register")}
        >
          Register Now — It's Free
        </button>
      </div>

      {/* Footer */}
      <footer
        className="text-center py-3 text-muted"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        <p className="mb-0 text-white-50 small">
          © 2025 SHMS — Smart Healthcare Management System | CDAC DAC Final Year
          Project
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
