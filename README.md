# BLUTRACE AI

## AI-Powered Underwater Marine Debris & Anomaly Detection

BLUTRACE AI is a Smart India Hackathon frontend prototype for **SIH26057** under **MoES / NIOT**.

The project demonstrates an automated workflow for detecting possible underwater man-made objects from **Side-Scan Sonar (SSS)** imagery, validating their acoustic evidence, calculating their geographic position using survey navigation metadata, and generating anomaly reports.

> This repository currently contains a frontend demonstration using mock analysis results. It is designed to be connected later to the Python/ML inference backend.

---

## Problem Workflow

BLUTRACE AI uses two independent funnels:

### Funnel 1 — What is the object?

```text
SSS Sonar Image
        ↓
Preprocessing
        ↓
AI Object Detection
        ↓
Bounding Box + Classification
        ↓
Acoustic Evidence Validation
        ↓
Final Confidence Score
```

The detection model identifies acoustic patterns such as:

- Shipwreck
- Pipeline
- Cylinder
- Ghost Net

Acoustic validation checks whether a candidate has evidence consistent with an actual object:

- Target return intensity
- Acoustic shadow presence
- Shadow-to-return alignment
- Geometric consistency
- Local contrast consistency

### Funnel 2 — Where is the object?

```text
Navigation / Ping Metadata
        +
Detected Target Relative Position
        ↓
Heading Correction
        ↓
Signed North/South + East/West Offset
        ↓
Global Latitude / Longitude
```

Geolocation is a deterministic calculation using survey navigation data and sonar-relative target position. It is **not** a separate trained AI model.

---

## Frontend Screens

### 1. Upload

Upload:

- Side-Scan Sonar image (`.jpg`, `.jpeg`, `.png`, `.tif`, `.tiff`)
- Navigation / position metadata (`.csv`, `.xlsx`, `.json`)

Both inputs are required before starting the demo analysis.

### 2. Processing / Preprocessing

The preprocessing workflow contains:

1. Input validation
2. Speckle / noise reduction
3. Contrast normalization
4. Resolution / scale normalization
5. Motion / artifact handling

Click **Start Preprocessing** to run the simulated frontend progress flow.

### 3. Detection & Acoustic Validation

Displays:

- Sonar target bounding boxes
- Target classification
- Detection confidence
- Estimated target dimensions
- Acoustic evidence validation
- Confirmed and rejected candidates

### 4. Geolocation

Uses:

```text
Vessel / Sonar GPS Position
+
Signed Target Relative Offset
↓
Global Target Position
```

Signed offsets support all directions:

```text
+North = North
-North = South

+East = East
-East = West
```

The workflow also demonstrates heading correction before converting sonar-relative offsets into global coordinates.

### 5. Automated Anomaly Report

Displays detected targets with:

- Target ID
- Classification
- Confidence
- Priority
- Latitude
- Longitude
- Estimated length
- Estimated width

The report can be downloaded as CSV or JSON.

---

## Run Locally

Make sure Node.js is installed.

Open PowerShell inside this folder and run:

```powershell
node serve.js
```

Then open:

```text
http://localhost:8080
```

Keep the PowerShell window open while using the prototype.

---

## Project Files

```text
blutrace-frontend/
├── index.html      # UI screens and content
├── styles.css      # Dark marine / teal visual design
├── app.js          # Prototype interactions, state, progress flows, downloads
├── serve.js        # Lightweight local Node.js server
└── README.md       # Project documentation
```

---

## Demo Notes

- Analysis, detection, classification, validation, and geolocation values are currently mock/demo data.
- Uploaded files are retained in browser application state during the active session.
- No real ML inference is performed in this frontend version.
- The UI is structured so it can later connect to a Python backend for preprocessing, model inference, navigation parsing, and report generation.

---

## Team / Product

**BLUTRACE AI**  
Smart India Hackathon — SIH26057  
Ministry of Earth Sciences (MoES)  
National Institute of Ocean Technology (NIOT)
