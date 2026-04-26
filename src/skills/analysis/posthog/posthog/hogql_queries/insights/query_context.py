from abc import ABC
from datetime import datetime
from typing import Optional, Protocol

from src.skills.analysis.posthog.schema import HogQLQueryModifiers

from src.skills.analysis.posthog.hogql.constants import LimitContext
from src.skills.analysis.posthog.hogql.context import HogQLContext
from src.skills.analysis.posthog.hogql.modifiers import create_default_modifiers_for_team
from src.skills.analysis.posthog.hogql.timings import HogQLTimings

from src.skills.analysis.posthog.models.team.team import Team
from src.skills.analysis.posthog.types import InsightQueryNode


class QueryContext(ABC):
    query: InsightQueryNode
    team: Team
    timings: HogQLTimings
    modifiers: HogQLQueryModifiers
    limit_context: LimitContext
    hogql_context: HogQLContext
    now: datetime

    def __init__(
        self,
        query: InsightQueryNode,
        team: Team,
        timings: Optional[HogQLTimings] = None,
        modifiers: Optional[HogQLQueryModifiers] = None,
        limit_context: Optional[LimitContext] = None,
        now: Optional[datetime] = None,
    ):
        self.query = query
        self.team = team
        self.timings = timings or HogQLTimings()
        self.limit_context = limit_context or LimitContext.QUERY
        self.modifiers = create_default_modifiers_for_team(team, modifiers)
        self.hogql_context = HogQLContext(
            team_id=self.team.pk,
            enable_select_queries=True,
            timings=self.timings,
            modifiers=self.modifiers,
        )
        self.now = now or datetime.now()


class QueryContextProtocol(Protocol):
    context: QueryContext
