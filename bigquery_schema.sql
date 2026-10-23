-- ============================================================================
-- EcoPulse: BigQuery Analytical DDL & Telemetry Schemas
-- Partitioned and clustered for cost-effective querying and high performance
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS `ecopulse_analytics`
OPTIONS (
  location = 'us-central1',
  description = 'EcoPulse Autonomous Multi-Agent Food Rescue Telemetry and Impact Warehouse'
);

-- ----------------------------------------------------------------------------
-- 1. Impact Metrics Table: Partitioned by date, clustered by food_category & ngo_id
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecopulse_analytics.impact_metrics` (
  impact_id STRING NOT NULL OPTIONS(description="Unique UUID for impact ledger entry"),
  donation_id STRING NOT NULL OPTIONS(description="Foreign key to donation record"),
  timestamp TIMESTAMP NOT NULL OPTIONS(description="Time of successful delivery/rescue"),
  food_category STRING OPTIONS(description="Food category e.g. Cooked Meals, Bakery, Produce, Dairy"),
  quantity_kg FLOAT64 NOT NULL OPTIONS(description="Weight of rescued edible food in kilograms"),
  meals_saved INT64 NOT NULL OPTIONS(description="Calculated meals provided (standard 0.42kg/meal)"),
  co2e_avoided_kg FLOAT64 NOT NULL OPTIONS(description="Carbon dioxide equivalent emissions prevented (kg CO2e)"),
  water_saved_liters FLOAT64 OPTIONS(description="Virtual water footprint spared (liters)"),
  economic_value_usd FLOAT64 NOT NULL OPTIONS(description="Monetary value of rescued food ($)"),
  ngo_id STRING NOT NULL OPTIONS(description="Receiving NGO organization identifier"),
  donor_id STRING NOT NULL OPTIONS(description="Donating establishment identifier"),
  delivery_duration_minutes FLOAT64 OPTIONS(description="Transit elapsed time from pickup to delivery"),
  cold_chain_maintained BOOL OPTIONS(description="Flag confirming temperature thresholds remained safe")
)
PARTITION BY DATE(timestamp)
CLUSTER BY food_category, ngo_id
OPTIONS (
  description = "Aggregated environmental and social impact metrics from verified rescue dispatches"
);

-- ----------------------------------------------------------------------------
-- 2. Agent Reasoning & Action Audit Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecopulse_analytics.agent_audit_logs` (
  log_id STRING NOT NULL,
  donation_id STRING,
  timestamp TIMESTAMP NOT NULL,
  agent_name STRING NOT NULL, -- IntakeAgent, SafetyAgent, MatchingAgent, ImpactAgent, Orchestrator
  model_used STRING,          -- gemini-1.5-flash, gemini-1.5-pro, fallback-rules
  action_type STRING NOT NULL,
  prompt_tokens INT64,
  completion_tokens INT64,
  latency_ms FLOAT64,
  confidence_score FLOAT64,
  tools_called ARRAY<STRUCT<
    tool_name STRING,
    call_args JSON,
    execution_status STRING,
    tool_latency_ms FLOAT64
  >>,
  safety_decision STRING,     -- ACCEPT, REJECT, NEEDS_HUMAN_REVIEW
  reasoning_summary STRING,
  security_sanitized BOOL,
  sha256_hash STRING NOT NULL,
  prev_log_hash STRING
)
PARTITION BY DATE(timestamp)
CLUSTER BY agent_name, safety_decision
OPTIONS (
  description = "Immutable multi-agent trace logs and cryptographic audit trail"
);

-- ----------------------------------------------------------------------------
-- 3. Security Events & Attack Attempts Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ecopulse_analytics.security_events` (
  event_id STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  event_type STRING NOT NULL, -- PROMPT_INJECTION_DETECTED, RBAC_VIOLATION, RATE_LIMIT_EXCEEDED, APPCHECK_FAILED
  client_ip_hash STRING NOT NULL,
  user_uid STRING,
  user_role STRING,
  endpoint STRING NOT NULL,
  threat_score FLOAT64,
  quarantined_payload STRING,
  action_taken STRING NOT NULL -- BLOCKED, FLAGGED, RATE_LIMITED
)
PARTITION BY DATE(timestamp)
CLUSTER BY event_type;

-- ----------------------------------------------------------------------------
-- 4. Analytical View: Real-Time Live Environmental Impact KPI Summary
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW `ecopulse_analytics.v_realtime_kpis` AS
SELECT
  COUNT(DISTINCT donation_id) AS total_rescues,
  SUM(quantity_kg) AS total_kg_diverted,
  SUM(meals_saved) AS total_meals_served,
  ROUND(SUM(co2e_avoided_kg), 2) AS total_co2e_kg_averted,
  ROUND(SUM(economic_value_usd), 2) AS total_usd_saved,
  AVG(delivery_duration_minutes) AS avg_delivery_minutes,
  SAFE_DIVIDE(COUNTIF(cold_chain_maintained = TRUE), COUNT(*)) * 100 AS cold_chain_compliance_pct
FROM `ecopulse_analytics.impact_metrics`;
