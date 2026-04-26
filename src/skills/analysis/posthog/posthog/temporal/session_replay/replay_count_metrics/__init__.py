from src.skills.analysis.posthog.temporal.session_replay.replay_count_metrics.activities import collect_replay_count_metrics
from src.skills.analysis.posthog.temporal.session_replay.replay_count_metrics.workflows import ReplayCountMetricsWorkflow

WORKFLOWS = [
    ReplayCountMetricsWorkflow,
]

ACTIVITIES = [collect_replay_count_metrics]
