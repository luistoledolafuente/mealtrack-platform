CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_prevent_update_delete
BEFORE UPDATE OR DELETE ON "audit_logs"
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_log_mutation();
