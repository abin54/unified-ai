from typing import cast

from src.skills.analysis.posthog.schema import (
    ExternalDataSourceType as SchemaExternalDataSourceType,
    SourceConfig,
)

from src.skills.analysis.posthog.temporal.data_imports.sources.common.base import FieldType, SimpleSource
from src.skills.analysis.posthog.temporal.data_imports.sources.common.registry import SourceRegistry
from src.skills.analysis.posthog.temporal.data_imports.sources.generated_configs import PendoSourceConfig

from products.data_warehouse.backend.types import ExternalDataSourceType


@SourceRegistry.register
class PendoSource(SimpleSource[PendoSourceConfig]):
    @property
    def source_type(self) -> ExternalDataSourceType:
        return ExternalDataSourceType.PENDO

    @property
    def get_source_config(self) -> SourceConfig:
        return SourceConfig(
            name=SchemaExternalDataSourceType.PENDO,
            label="Pendo",
            iconPath="/static/services/pendo.png",
            fields=cast(list[FieldType], []),
            unreleasedSource=True,
        )
