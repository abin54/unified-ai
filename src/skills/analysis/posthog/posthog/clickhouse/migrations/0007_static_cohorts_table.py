from src.skills.analysis.posthog.clickhouse.client.migration_tools import run_sql_with_exceptions
from src.skills.analysis.posthog.models.person.sql import PERSON_STATIC_COHORT_TABLE_SQL

operations = [run_sql_with_exceptions(PERSON_STATIC_COHORT_TABLE_SQL())]
