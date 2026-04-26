from src.skills.analysis.posthog.clickhouse.client.connection import NodeRole
from src.skills.analysis.posthog.clickhouse.client.migration_tools import run_sql_with_exceptions
from src.skills.analysis.posthog.clickhouse.query_log_archive import ADD_EXCEPTION_NAME_SQL

operations = [
    run_sql_with_exceptions(
        ADD_EXCEPTION_NAME_SQL,
        node_roles=[NodeRole.DATA],
        sharded=False,
        is_alter_on_replicated_table=True,
    ),
]
