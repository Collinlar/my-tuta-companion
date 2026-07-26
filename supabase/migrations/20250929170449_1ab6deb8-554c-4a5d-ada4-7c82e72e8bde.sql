-- Drop all existing tables in correct order to avoid foreign key constraints

-- Drop tables that reference other tables first
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS tenant_users CASCADE;
DROP TABLE IF EXISTS impersonation_logs CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Drop any remaining functions that might be orphaned
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.add_admin_by_email(text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_tenant_for_business() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;