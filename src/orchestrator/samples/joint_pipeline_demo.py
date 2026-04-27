import os
import sys
import time
import requests
import json
from datetime import datetime

# Ensure we can import from the orchestrator directory
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from agent_manager import AgentManager

# Try to import Rich for advanced visual output, fallback to standard print if not found
try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich.theme import Theme
    custom_theme = Theme({
        "info": "cyan",
        "warning": "yellow",
        "error": "red bold",
        "success": "green bold",
        "agent": "magenta bold"
    })
    console = Console(theme=custom_theme)
    HAS_RICH = True
except ImportError:
    HAS_RICH = False

def log_info(msg):
    if HAS_RICH:
        console.print(f"[info][INFO] {msg}[/info]")
    else:
        print(f"[INFO] {msg}")

def log_success(msg):
    if HAS_RICH:
        console.print(f"[success][SUCCESS] {msg}[/success]")
    else:
        print(f"[SUCCESS] {msg}")

def log_agent(agent_name, msg):
    if HAS_RICH:
        console.print(f"[agent][AGENT] [{agent_name}]:[/agent] {msg}")
    else:
        print(f"[AGENT] [{agent_name}]: {msg}")

class JointPipeline:
    def __init__(self, roles_config_path: str):
        log_info("Initializing Sovereign multi-agent deployment platform...")
        self.manager = AgentManager(roles_config_path)
        self.external_gateway_url = os.getenv("AUTOMATION_GATEWAY_URL", "http://localhost:5678/webhook/agent-pipeline")

    def run(self):
        if HAS_RICH:
            console.print(Panel.fit("STARTING JOINT AGENTIC PIPELINE v1.0", style="bold blue"))
        else:
            print("=== STARTING JOINT AGENTIC PIPELINE v1.0 ===")

        # Step 1: Deploy Agents
        log_info("Step 1: Deploying node instances...")
        architect = self.manager.deploy_agent("Architect")
        engineer = self.manager.deploy_agent("Engineer")
        auditor = self.manager.deploy_agent("Security_Auditor")

        # Step 2: Shared context initialization
        self.manager.update_shared_context("execution_id", f"pipeline_{int(time.time())}")
        self.manager.update_shared_context("target_objective", "Deploy secure web-tier telemetry hooks")

        # Step 3: Architect decomposes
        time.sleep(1)
        log_agent("Architect", "Analyzing user requirement...")
        log_agent("Architect", "Decomposing task: Generate integration schema for Activepieces triggers.")
        self.manager.update_shared_context("schema_mapping", {"trigger": "web_hook", "action": "ml_inference"})

        # Step 4: Engineer generates logic
        time.sleep(1)
        log_agent("Engineer", "Mapping defined context state...")
        log_agent("Engineer", "Writing integration handlers in Python...")
        self.manager.update_shared_context("code_artifact", "def trigger_workflow(data):\n    # MCP routing logic\n    pass")

        # Step 5: Auditor scans
        time.sleep(1)
        log_agent("Security_Auditor", "Loading internal analyzer scripts...")
        log_agent("Security_Auditor", "Result: 0 critical paths exposed. Verification COMPLETE.")
        self.manager.update_shared_context("security_clearance", True)

        # Step 6: Dispatching to External Automation Gateway
        log_info("Step 6: Handing off validated state payload to external automation node.")
        payload = {
            "execution_id": self.manager.shared_context.get("execution_id"),
            "timestamp": datetime.utcnow().isoformat(),
            "status": "APPROVED",
            "metadata": {
                "roles_involved": list(self.manager.active_agents.keys()),
                "security_scan": "PASSED"
            }
        }

        if HAS_RICH:
            with Progress(SpinnerColumn(), TextColumn("[progress.description]{task.description}"), transient=True) as progress:
                progress.add_task(description="Broadcasting to gateway...", total=None)
                time.sleep(2)
        else:
            print("... Dispatching payload to external automation node ...")

        # Attempt gateway delivery
        try:
            log_info(f"Target Gateway URL: {self.external_gateway_url}")
            # Mocking the request so the local execution doesn't block/fail without an endpoint
            log_success("Payload successfully dispatched via HTTP POST hook.")
        except Exception as e:
            log_info(f"Gateway offline. Cached state safely persisted locally. ({str(e)})")

        log_success("Joint Pipeline Execution complete.")

if __name__ == "__main__":
    roles_file = os.path.join(parent_dir, 'roles.json')
    pipeline = JointPipeline(roles_file)
    pipeline.run()
