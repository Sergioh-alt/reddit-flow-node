<div align="center">
  <br />
  <h1 align="center">⌬ REDDIT-FLOW-NODE (RFN)</h1>
  <p align="center">
    <strong>A Node-Based AI Orchestrator & Prompt Optimizer for Reddit</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-00f5ff?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Backend-FastAPI-39ff14?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/AI-LiteLLM-bf00ff?style=for-the-badge" alt="AI Agent" />
  </p>
</div>

<br />

## Synopsis

**Reddit-Flow-Node (RFN)** is a professional, visual automation platform designed to construct, refine, and orchestrate Reddit content workflows using a "Digital Exoskeleton" HUD. 

Built heavily around an **Agent-Critic AI architecture**, RFN acts as a prompt optimization forge: it takes raw ideas, passes them through internal conversational AI iterations to structurally improve them, and publishes highly optimized content—always under human supervision.

## Key Features

- **Visual Node Orchestration**: Build your publishing pipelines like Lego blocks using a dynamic canvas powered by `React Flow`. Connect Reddit Sources ➞ AI Refiners ➞ Human Gatekeepers ➞ automated Publishers.
-  **Multi-Agent Prompt Refinement**: Instead of blind generation, RFN runs prompts through iterative refinement cycles (Agent A proposes, Critic B dissects, Synthesis creates the final blueprint) ensuring high-quality outputs.
-  **Human-in-the-Loop Constraint**: A mandatory Human Approval node guarantees maximum safety by preventing runaway AI publishing.
-  **Digital Exoskeleton Interface**: A rich, HUD-style aesthetic with scan-lines, neon highlights (Cyan, Green, Orange, Purple colorspaces), and real-time backend latency emulation.
-  **Mock Mode Ready**: Prototype pipelines safely using a deterministic offline testing mode avoiding Reddit API rate limits during development.

---

## System Architecture

The ecosystem is divided into two distinct services:
```text
RFN/
├── backend/                  # FastAPI + LiteLLM + PRAW
│   ├── core/
│   │   ├── agent_refiner.py  # Multi-turn LLM reasoning
│   │   ├── reddit_client.py  # Native PRAW API interactions
│   │   └── mock_reddit.py    # Offline environment emulator
│   └── main.py
└── frontend/                 # React 18 + Vite + TailwindCSS
    ├── src/components/       
    │   ├── FlowCanvas.jsx    # React Flow instance & Edge paths
    │   └── Sidebar.jsx       # Node palette Drag & Drop
    └── App.jsx               # Cyber-HUD layout wrapper
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm/yarn
- (Optional) Reddit Developer API Credentials
- (Optional) OpenAI / Anthropic API Key

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up your virtual environment & install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Initialize the development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### Frontend Setup (Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Launch the visual Exoskeleton HUD:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:5173`.

---

##  Mock Mode

If you do not have Reddit API keys yet, RFN ships with a state-of-the-art **Mock Adapter**. Out of the box, the system behaves as if deeply connected to Reddit, simulating endpoints, metadata, fake delays, and JSON responses to let you build AI orchestration pipelines offline seamlessly.

Inside your `.env`, ensure:
```env
USE_MOCK_REDDIT=true
```

## License

[MIT License](LICENSE)
