from typing import cast

from src.skills.analysis.posthog.schema import (
    ExternalDataSourceType as SchemaExternalDataSourceType,
    SourceConfig,
)

from src.skills.analysis.posthog.temporal.data_imports.sources.common.base import FieldType, SimpleSource
from src.skills.analysis.posthog.temporal.data_imports.sources.common.registry import SourceRegistry
from src.skills.analysis.posthog.temporal.data_imports.sources.generated_configs import FirebaseSourceConfig

from products.data_warehouse.backend.types import ExternalDataSourceType


@SourceRegistry.register
class FirebaseSource(SimpleSource[FirebaseSourceConfig]):
    @property
    def source_type(self) -> ExternalDataSourceType:
        return ExternalDataSourceType.FIREBASE

    @property
    def get_source_config(self) -> SourceConfig:
        return SourceConfig(
            name=SchemaExternalDataSourceType.FIREBASE,
            label="Firebase",
            iconPath="/static/services/firebase.png",
            fields=cast(list[FieldType], []),
            unreleasedSource=True,
        )
