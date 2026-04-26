from src.skills.analysis.posthog.clickhouse.client.migration_tools import run_sql_with_exceptions
from src.skills.analysis.posthog.settings import CLICKHOUSE_CLUSTER

operations = [
    run_sql_with_exceptions(
        f"ALTER TABLE sharded_events ON CLUSTER '{CLICKHOUSE_CLUSTER}' MODIFY COLUMN properties VARCHAR CODEC(ZSTD(3))"
    )
]
