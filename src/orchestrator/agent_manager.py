import json
import os
from typing import Dict, Any

class AgentManager:
    def __init__(self, roles_path: str):
        with open(roles_path, 'r') as f:
            self.roles = json.load(f)['roles']
        self.active_agents = {}
        self.shared_context = {}

    def deploy_agent(self, role_name: str) -> Dict[str, Any]:
        if role_name not in self.roles:
            raise ValueError(f"Role {role_name} not found.")
        
        role_config = self.roles[role_name]
        print(f"[AgentManager] Deploying agent with role: {role_name}")
        
        agent_instance = {
            "role": role_name,
            "config": role_config,
            "state": "IDLE"
        }
        self.active_agents[role_name] = agent_instance
        return agent_instance

    def update_shared_context(self, key: str, value: Any):
        print(f"[AgentManager] Updating shared context: {key}")
        self.shared_context[key] = value

    def get_context(self) -> Dict[str, Any]:
        return self.shared_context

    def broadcast_task(self, task: str):
        print(f"[AgentManager] Broadcasting task to all active agents: {task}")
        for role, agent in self.active_agents.items():
            agent['state'] = f"PROCESSING: {task}"

if __name__ == "__main__":
    manager = AgentManager('roles.json')
    manager.deploy_agent("Architect")
    manager.deploy_agent("Security_Auditor")
    manager.update_shared_context("project_status", "Refactoring Phase")
    manager.broadcast_task("Audit src/interface/web for vulnerabilities")
