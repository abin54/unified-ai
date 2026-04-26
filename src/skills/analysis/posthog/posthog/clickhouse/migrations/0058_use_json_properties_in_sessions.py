from src.skills.analysis.posthog.clickhouse.client.migration_tools import run_sql_with_exceptions
from src.skills.analysis.posthog.models.sessions.sql import SESSION_TABLE_UPDATE_SQL

operations = [
    run_sql_with_exceptions(SESSION_TABLE_UPDATE_SQL()),
]
