from typing import cast

from src.skills.analysis.posthog.schema import (
    ExternalDataSourceType as SchemaExternalDataSourceType,
    SourceConfig,
)

from src.skills.analysis.posthog.temporal.data_imports.sources.common.base import FieldType, SimpleSource
from src.skills.analysis.posthog.temporal.data_imports.sources.common.registry import SourceRegistry
from src.skills.analysis.posthog.temporal.data_imports.sources.generated_configs import RecurlySourceConfig

from products.data_warehouse.backend.types import ExternalDataSourceType


@SourceRegistry.register
class RecurlySource(SimpleSource[RecurlySourceConfig]):
    @property
    def source_type(self) -> ExternalDataSourceType:
        return ExternalDataSourceType.RECURLY

    @property
    def get_source_config(self) -> SourceConfig:
        return SourceConfig(
            name=SchemaExternalDataSourceType.RECURLY,
            label="Recurly",
            iconPath="/static/services/recurly.png",
            fields=cast(list[FieldType], []),
            unreleasedSource=True,
        )
