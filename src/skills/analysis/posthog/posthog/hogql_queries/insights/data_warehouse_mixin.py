from src.skills.analysis.posthog.schema import ActionsNode, DataWarehouseNode, EventsNode, GroupNode

from src.skills.analysis.posthog.hogql import ast

from src.skills.analysis.posthog.models.filters.mixins.utils import cached_property


class DataWarehouseInsightQueryMixin:
    series: EventsNode | ActionsNode | DataWarehouseNode | GroupNode

    @cached_property
    def _table_expr(self) -> ast.Field:
        if isinstance(self.series, DataWarehouseNode):
            return ast.Field(chain=[self.series.table_name])

        return ast.Field(chain=["events"])
