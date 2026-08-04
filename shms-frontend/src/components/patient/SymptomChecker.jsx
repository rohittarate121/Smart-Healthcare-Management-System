import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientAPI from '../../api/patientAPI';

const BODY_AREAS = [
  'Chest', 'Head', 'Stomach', 'Skin',
  'Joints', 'Throat', 'General',
];

const SYMPTOMS_BY_AREA = {
  Chest: [
    'chest pain', 'shortness of breath',
    'palpitations', 'chest tightness', 'wheezing',
  ],
  Head: [
    'headache', 'migraine', 'dizziness',
    'severe headache', 'memory loss',
  ],
  Stomach: [
    'abdominal pain', 'vomiting', 'nausea',
    'diarrhea', 'constipation', 'bloating',
  ],
  Skin: [
    'rash', 'itching', 'acne', 'eczema', 'hair loss',
  ],
  Joints: [
    'back pain', 'joint pain', 'knee pain',
    'stiffness', 'muscle pain',
  ],
  Throat: [
    'sore throat', 'ear pain', 'nasal congestion',
    'sneezing', 'hoarseness',
  ],
  General: [
    'fever', 'high fever', 'fatigue', 'body ache',
    'cold', 'weakness', 'runny nose',
  ],
};

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [bodyArea, setBodyArea] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] =
    useState([]);
  const [followUp, setFollowUp] = useState({
    worsening: '',
    ageGroup: '',
    condition: '',
  });
  const [durationDays, setDurationDays] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleAnalyse = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await PatientAPI.analyseSymptoms({
        bodyArea,
        symptoms: selectedSymptoms,
        durationDays: parseInt(durationDays),
        language: 'EN',
        followUpAnswers: followUp,
      });
      setResult(res.data);
      setStep(4);
    } catch (err) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = {
    LOW: '#198754',
    MEDIUM: '#fd7e14',
    HIGH: '#dc3545',
    CRITICAL: '#7b0000',
  };

  return (
    <div>
      <h4 className="fw-bold mb-1">
        🤖 AI Symptom Checker
      </h4>
      <p className="text-muted mb-4">
        Answer a few questions to get a health assessment
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="progress" style={{ height: '8px' }}>
          <div
            className="progress-bar bg-primary"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
        <small className="text-muted">
          Step {Math.min(step, 3)} of 3
        </small>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Step 1 — Select body area */}
      {step === 1 && (
        <div className="card border-0 shadow-sm p-4">
          <h5 className="mb-3">
            Step 1: Which area is affected?
          </h5>
          <div className="d-flex flex-wrap gap-2">
            {BODY_AREAS.map((area) => (
              <button
                key={area}
                className={`btn ${
                  bodyArea === area
                    ? 'btn-primary'
                    : 'btn-outline-primary'
                }`}
                onClick={() => {
                  setBodyArea(area);
                  setSelectedSymptoms([]);
                }}
              >
                {area}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary mt-4"
            disabled={!bodyArea}
            onClick={() => setStep(2)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 2 — Select symptoms */}
      {step === 2 && (
        <div className="card border-0 shadow-sm p-4">
          <h5 className="mb-3">
            Step 2: Select your symptoms ({bodyArea})
          </h5>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {(SYMPTOMS_BY_AREA[bodyArea] || []).map(
              (symptom) => (
                <button
                  key={symptom}
                  className={`btn btn-sm ${
                    selectedSymptoms.includes(symptom)
                      ? 'btn-danger'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() => toggleSymptom(symptom)}
                >
                  {selectedSymptoms.includes(symptom)
                    ? '✓ '
                    : ''}
                  {symptom}
                </button>
              )
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">
              Duration (days)
            </label>
            <input
              type="number"
              className="form-control"
              style={{ maxWidth: '120px' }}
              min={1}
              max={365}
              value={durationDays}
              onChange={(e) =>
                setDurationDays(e.target.value)
              }
            />
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <button
              className="btn btn-primary"
              disabled={selectedSymptoms.length === 0}
              onClick={() => setStep(3)}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Follow-up questions */}
      {step === 3 && (
        <div className="card border-0 shadow-sm p-4">
          <h5 className="mb-3">
            Step 3: A few more questions
          </h5>

          <div className="mb-3">
            <label className="form-label">
              Are symptoms getting worse?
            </label>
            <div className="d-flex gap-2">
              {['rapidly', 'slightly', 'stable'].map(
                (opt) => (
                  <button
                    key={opt}
                    className={`btn btn-sm ${
                      followUp.worsening === opt
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    onClick={() =>
                      setFollowUp({
                        ...followUp,
                        worsening: opt,
                      })
                    }
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Age group</label>
            <div className="d-flex gap-2">
              {['child', 'adult', 'elderly'].map((opt) => (
                <button
                  key={opt}
                  className={`btn btn-sm ${
                    followUp.ageGroup === opt
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() =>
                    setFollowUp({
                      ...followUp,
                      ageGroup: opt,
                    })
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">
              Existing conditions
            </label>
            <div className="d-flex flex-wrap gap-2">
              {[
                'none',
                'diabetic',
                'hypertension',
                'cardiac',
              ].map((opt) => (
                <button
                  key={opt}
                  className={`btn btn-sm ${
                    followUp.condition === opt
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() =>
                    setFollowUp({
                      ...followUp,
                      condition: opt,
                    })
                  }
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setStep(2)}
            >
              ← Back
            </button>
            <button
              className="btn btn-success"
              onClick={handleAnalyse}
              disabled={loading}
            >
              {loading
                ? 'Analysing...'
                : '🔍 Analyse Symptoms'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Result */}
      {step === 4 && result && (
        <div className="card border-0 shadow-sm p-4">
          <h5 className="mb-3">Your Triage Result</h5>

          {/* Severity Score */}
          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <span className="fw-bold">
                Severity Score
              </span>
              <span
                className="fw-bold"
                style={{
                  color:
                    urgencyColor[result.urgencyLevel],
                }}
              >
                {result.severityScore}/100
              </span>
            </div>
            <div
              className="progress mt-1"
              style={{ height: '12px' }}
            >
              <div
                className="progress-bar"
                style={{
                  width: `${result.severityScore}%`,
                  backgroundColor:
                    urgencyColor[result.urgencyLevel],
                }}
              />
            </div>
          </div>

          {/* Urgency Badge */}
          <div className="mb-3">
            <span
              className="badge fs-6 px-3 py-2"
              style={{
                backgroundColor:
                  urgencyColor[result.urgencyLevel],
              }}
            >
              {result.urgencyLevel} URGENCY
            </span>
          </div>

          {/* Details */}
          <div
            className="p-3 rounded mb-3"
            style={{ backgroundColor: '#f8f9fa' }}
          >
            <p className="mb-1">
              <strong>Probable condition:</strong>{' '}
              {result.probableCondition}
            </p>
            <p className="mb-1">
              <strong>Recommended specialist:</strong>{' '}
              {result.recommendedSpecialty}
            </p>
            <p className="mb-0 text-muted small">
              {result.triageSummary}
            </p>
          </div>

          {/* Emergency Action */}
          {result.isEmergency ? (
            <div className="alert alert-danger">
              <h6 className="fw-bold">
                🚨 Emergency Detected
              </h6>
              <p className="mb-2">
                Please go to the nearest Emergency Room
                immediately. Do not delay.
              </p>
              <a
                href={`https://www.google.com/maps/search/emergency+hospital+near+me`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-danger"
              >
                📍 Find Nearest ER on Google Maps
              </a>
            </div>
          ) : (
            <div className="alert alert-info">
              <p className="mb-2">
                Book an appointment with a{' '}
                <strong>
                  {result.recommendedSpecialty}
                </strong>
              </p>
              <button
                className="btn btn-primary"
                onClick={() =>
                  navigate('/patient/book', {
                    state: {
                      specialty:
                        result.recommendedSpecialty,
                      reportId: result.reportId,
                    },
                  })
                }
              >
                Book Appointment →
              </button>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-muted small mt-3 mb-2">
            ⚠️ This is not a medical diagnosis.
            Always consult a qualified doctor.
          </p>

          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              setStep(1);
              setBodyArea('');
              setSelectedSymptoms([]);
              setResult(null);
              setFollowUp({
                worsening: '',
                ageGroup: '',
                condition: '',
              });
            }}
          >
            Start Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;