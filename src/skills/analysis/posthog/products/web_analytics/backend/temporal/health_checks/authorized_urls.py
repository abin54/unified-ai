from django.db.models import Q

from src.skills.analysis.posthog.dags.common.owners import JobOwners
from src.skills.analysis.posthog.models.health_issue import HealthIssue
from src.skills.analysis.posthog.models.team import Team
from src.skills.analysis.posthog.temporal.health_checks.detectors import DEFAULT_EXECUTION_POLICY
from src.skills.analysis.posthog.temporal.health_checks.framework import HealthCheck
from src.skills.analysis.posthog.temporal.health_checks.models import HealthCheckResult


class AuthorizedUrlsCheck(HealthCheck):
    name = "authorized_urls"
    kind = "authorized_urls"
    owner = JobOwners.TEAM_WEB_ANALYTICS
    policy = DEFAULT_EXECUTION_POLICY
    schedule = "15 8 * * *"
    active_since_days = 30

    def detect(self, team_ids: list[int]) -> dict[int, list[HealthCheckResult]]:
        teams_missing_urls = (
            Team.objects.filter(
                id__in=team_ids,
            )
            .filter(Q(app_urls=[]) | Q(app_urls__isnull=True))
            .values_list("id", flat=True)
        )

        issues: dict[int, list[HealthCheckResult]] = {}
        for team_id in teams_missing_urls:
            issues[team_id] = [
                HealthCheckResult(
                    severity=HealthIssue.Severity.WARNING,
                    payload={"reason": "No authorized URLs configured. Some filters won't work correctly."},
                    hash_keys=[],
                )
            ]

        return issues
