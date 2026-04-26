from typing import cast

from src.skills.analysis.posthog.schema import (
    ExternalDataSourceType as SchemaExternalDataSourceType,
    SourceConfig,
)

from src.skills.analysis.posthog.temporal.data_imports.sources.common.base import FieldType, SimpleSource
from src.skills.analysis.posthog.temporal.data_imports.sources.common.registry import SourceRegistry
from src.skills.analysis.posthog.temporal.data_imports.sources.generated_configs import ShortcutSourceConfig

from products.data_warehouse.backend.types import ExternalDataSourceType


@SourceRegistry.register
class ShortcutSource(SimpleSource[ShortcutSourceConfig]):
    @property
    def source_type(self) -> ExternalDataSourceType:
        return ExternalDataSourceType.SHORTCUT

    @property
    def get_source_config(self) -> SourceConfig:
        return SourceConfig(
            name=SchemaExternalDataSourceType.SHORTCUT,
            label="Shortcut",
            iconPath="/static/services/shortcut.png",
            fields=cast(list[FieldType], []),
            unreleasedSource=True,
        )
