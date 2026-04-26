# Antigravity Unified AI

A sovereign, polyglot AI assistant combining autonomous coding, ML engineering, security research, and advanced memory.

## 🏗️ Architecture

```text
unified-ai/
├── src/
│   ├── orchestrator/      # Brain logic (Cline-based)
│   ├── memory/            # RAG & Semantic Search (claude-context + RAG-Anything)
│   ├── skills/            # Domain toolkits (Hackingtool + ml-intern)
│   ├── interface/         # Web & VS Code interfaces
│   └── shared/            # Shared context and utilities
├── docs/                  # Knowledge base (aie-book)
└── agent_config.md        # System governance & protocols
```

## 🚀 Getting Started

### Prerequisites
*   Python 3.11+
*   Node.js 20+
*   `uv` (for Python dependency management)
*   `pnpm` (for Node dependency management)

### Installation
1.  **Python Setup**:
    ```bash
    uv sync
    ```
2.  **Node Setup**:
    ```bash
    pnpm install
    ```

### Configuration
Create a `.env` file in the root with your API keys:
```env
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
HF_TOKEN=your_key
GITHUB_TOKEN=your_key
MILVUS_ADDRESS=your_zilliz_endpoint
MILVUS_TOKEN=your_zilliz_token
```

## 📜 Governance
Refer to [agent_config.md](agent_config.md) for detailed operational protocols and skill domain definitions.
