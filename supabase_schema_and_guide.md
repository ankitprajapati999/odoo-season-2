# TransitOps Developer Guide & Database Schema

This document is the **single source of truth** for the TransitOps project. Every team member and every AI coding agent (Antigravity) **must follow this document exactly**.

The project uses:
- React (Vite)
- Tailwind CSS v4
- Clerk Authentication
- Supabase PostgreSQL
- Row Level Security (RLS)

---

# 🚨 IMPORTANT RULES FOR AI AGENTS

The database architecture has already been designed and finalized. **Treat it as production-ready.** The backend database is **NOT** to be redesigned during development. Frontend code must adapt to the database. **The database must never adapt to frontend code.**

## Database Rules (STRICT)
Never:
- Create new tables
- Drop tables
- Rename tables
- Rename columns
- Add/remove columns
- Change foreign keys
- Modify triggers
- Modify PostgreSQL functions
- Modify RLS policies
- Disable RLS
- Generate SQL migrations
- Change check constraints or business rules

*If a feature appears to require a database change: **STOP and ask the project owner.***

---

## 1. Database Schema Setup Script

Run the following SQL in **Supabase → Database → SQL Editor** to initialize the database:

```sql
-- Helper to retrieve the Clerk User ID from the session JWT
CREATE OR REPLACE FUNCTION public.current_user_id() 
RETURNS text 
LANGUAGE sql 
STABLE 
SECURITY DEFINER
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true)::json->>'sub', ''),
    null
  );
$$;

-- Helper to retrieve the user's role from the public.profiles table
CREATE OR REPLACE FUNCTION public.current_user_role() 
RETURNS text 
LANGUAGE plpgsql 
STABLE 
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = public.current_user_id();
  RETURN user_role;
END;
$$;

-- Profiles Table (Maps Clerk users to roles)
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY, -- Clerk User ID (e.g. 'user_...')
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vehicles Table
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    max_load_capacity NUMERIC NOT NULL CHECK (max_load_capacity > 0),
    odometer NUMERIC NOT NULL DEFAULT 0 CHECK (odometer >= 0),
    acquisition_cost NUMERIC NOT NULL CHECK (acquisition_cost >= 0),
    status TEXT NOT NULL CHECK (status IN ('Available', 'On Trip', 'In Shop', 'Retired')) DEFAULT 'Available',
    region TEXT NOT NULL DEFAULT 'Global',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Drivers Table
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    license_category TEXT NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number TEXT NOT NULL,
    safety_score NUMERIC NOT NULL DEFAULT 100 CHECK (safety_score >= 0 AND safety_score <= 100),
    status TEXT NOT NULL CHECK (status IN ('Available', 'On Trip', 'Off Duty', 'Suspended')) DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trips Table
CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
    cargo_weight NUMERIC NOT NULL CHECK (cargo_weight > 0),
    planned_distance NUMERIC NOT NULL CHECK (planned_distance > 0),
    status TEXT NOT NULL CHECK (status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')) DEFAULT 'Draft',
    actual_distance NUMERIC CHECK (actual_distance >= 0),
    fuel_consumed_liters NUMERIC CHECK (fuel_consumed_liters >= 0),
    created_by TEXT NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Maintenance Logs Table
CREATE TABLE public.maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    cost NUMERIC NOT NULL CHECK (cost >= 0),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE CHECK (end_date >= start_date),
    status TEXT NOT NULL CHECK (status IN ('Active', 'Closed')) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fuel Logs Table
CREATE TABLE public.fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    liters NUMERIC NOT NULL CHECK (liters > 0),
    cost NUMERIC NOT NULL CHECK (cost >= 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Expenses Table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    type TEXT NOT NULL CHECK (type IN ('Tolls', 'Maintenance', 'Fuel', 'Permit', 'Other')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger Function for Trips
CREATE OR REPLACE FUNCTION public.handle_trip_status_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_capacity NUMERIC;
    v_status TEXT;
    d_expiry DATE;
    d_status TEXT;
BEGIN
    SELECT max_load_capacity, status INTO v_capacity, v_status FROM public.vehicles WHERE id = NEW.vehicle_id;
    SELECT license_expiry_date, status INTO d_expiry, d_status FROM public.drivers WHERE id = NEW.driver_id;

    IF NEW.cargo_weight > v_capacity THEN
        RAISE EXCEPTION 'Cargo weight (%) exceeds vehicle maximum capacity (%)', NEW.cargo_weight, v_capacity;
    END IF;

    IF d_expiry < CURRENT_DATE THEN
        RAISE EXCEPTION 'Cannot dispatch trip: Driver license has expired (%)', d_expiry;
    END IF;

    IF d_status = 'Suspended' THEN
        RAISE EXCEPTION 'Cannot dispatch trip: Driver is currently Suspended';
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'Dispatched' THEN
            IF v_status <> 'Available' THEN
                RAISE EXCEPTION 'Vehicle is not Available (Current status: %)', v_status;
            END IF;
            IF d_status <> 'Available' THEN
                RAISE EXCEPTION 'Driver is not Available (Current status: %)', d_status;
            END IF;

            UPDATE public.vehicles SET status = 'On Trip' WHERE id = NEW.vehicle_id;
            UPDATE public.drivers SET status = 'On Trip' WHERE id = NEW.driver_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF (NEW.vehicle_id <> OLD.vehicle_id AND v_status = 'On Trip') THEN
            RAISE EXCEPTION 'Assigned vehicle is already On Trip';
        END IF;
        IF (NEW.driver_id <> OLD.driver_id AND d_status = 'On Trip') THEN
            RAISE EXCEPTION 'Assigned driver is already On Trip';
        END IF;

        IF NEW.status = 'Dispatched' AND OLD.status = 'Draft' THEN
            IF v_status <> 'Available' THEN
                RAISE EXCEPTION 'Vehicle is not Available (Current status: %)', v_status;
            END IF;
            IF d_status <> 'Available' THEN
                RAISE EXCEPTION 'Driver is not Available (Current status: %)', d_status;
            END IF;

            UPDATE public.vehicles SET status = 'On Trip' WHERE id = NEW.vehicle_id;
            UPDATE public.drivers SET status = 'On Trip' WHERE id = NEW.driver_id;
        END IF;

        IF NEW.status = 'Completed' AND OLD.status = 'Dispatched' THEN
            UPDATE public.vehicles 
            SET status = 'Available', 
                odometer = odometer + COALESCE(NEW.actual_distance, NEW.planned_distance, 0)
            WHERE id = NEW.vehicle_id;
            
            UPDATE public.drivers SET status = 'Available' WHERE id = NEW.driver_id;

            IF NEW.fuel_consumed_liters IS NOT NULL AND NEW.fuel_consumed_liters > 0 THEN
                INSERT INTO public.fuel_logs (vehicle_id, liters, cost, date)
                VALUES (NEW.vehicle_id, NEW.fuel_consumed_liters, 0, CURRENT_DATE);
            END IF;
        END IF;

        IF NEW.status = 'Cancelled' AND OLD.status = 'Dispatched' THEN
            UPDATE public.vehicles SET status = 'Available' WHERE id = NEW.vehicle_id;
            UPDATE public.drivers SET status = 'Available' WHERE id = NEW.driver_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trip_status_change_trigger
BEFORE INSERT OR UPDATE ON public.trips
FOR EACH ROW EXECUTE FUNCTION public.handle_trip_status_changes();

-- Trigger Function for Maintenance
CREATE OR REPLACE FUNCTION public.handle_maintenance_status_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.status = 'Active' AND (TG_OP = 'INSERT' OR OLD.status <> 'Active') THEN
        UPDATE public.vehicles SET status = 'In Shop' WHERE id = NEW.vehicle_id;
    END IF;

    IF NEW.status = 'Closed' AND OLD.status = 'Active' THEN
        UPDATE public.vehicles 
        SET status = CASE WHEN status = 'Retired' THEN 'Retired' ELSE 'Available' END
        WHERE id = NEW.vehicle_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER maintenance_status_change_trigger
BEFORE INSERT OR UPDATE ON public.maintenance_logs
FOR EACH ROW EXECUTE FUNCTION public.handle_maintenance_status_changes();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Read Profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert Self Profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.current_user_id() = id);
CREATE POLICY "Update Self Profile Name" ON public.profiles FOR UPDATE TO authenticated 
    USING (public.current_user_id() = id) 
    WITH CHECK (public.current_user_id() = id AND role = (SELECT role FROM public.profiles WHERE id = public.current_user_id()));
CREATE POLICY "Admin Modify Profiles" ON public.profiles FOR ALL TO authenticated USING (public.current_user_role() = 'Fleet Manager');

CREATE POLICY "Read Vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Fleet Manager Modify Vehicles" ON public.vehicles FOR ALL TO authenticated USING (public.current_user_role() = 'Fleet Manager');

CREATE POLICY "Read Drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Fleet Manager Modify Drivers" ON public.drivers FOR ALL TO authenticated USING (public.current_user_role() = 'Fleet Manager');
CREATE POLICY "Safety Officer Modify Drivers" ON public.drivers FOR UPDATE TO authenticated 
    USING (public.current_user_role() = 'Safety Officer')
    WITH CHECK (public.current_user_role() = 'Safety Officer');

CREATE POLICY "Read Trips" ON public.trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Drivers and Managers Can Insert Trips" ON public.trips FOR INSERT TO authenticated WITH CHECK (public.current_user_role() IN ('Fleet Manager', 'Driver'));
CREATE POLICY "Drivers and Managers Can Update Trips" ON public.trips FOR UPDATE TO authenticated 
    USING (public.current_user_role() IN ('Fleet Manager', 'Driver'))
    WITH CHECK (public.current_user_role() IN ('Fleet Manager', 'Driver'));
CREATE POLICY "Fleet Manager Delete Trips" ON public.trips FOR DELETE TO authenticated USING (public.current_user_role() = 'Fleet Manager');

CREATE POLICY "Read Maintenance Logs" ON public.maintenance_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Fleet Manager Modify Maintenance" ON public.maintenance_logs FOR ALL TO authenticated USING (public.current_user_role() = 'Fleet Manager');

CREATE POLICY "Read Fuel Logs" ON public.fuel_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Financial Analyst and Fleet Manager Modify Fuel Logs" ON public.fuel_logs FOR ALL TO authenticated USING (public.current_user_role() IN ('Fleet Manager', 'Financial Analyst'));

CREATE POLICY "Read Expenses" ON public.expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Financial Analyst and Fleet Manager Modify Expenses" ON public.expenses FOR ALL TO authenticated USING (public.current_user_role() IN ('Fleet Manager', 'Financial Analyst'));
```

---

## 2. Shared Integration Guidelines

### **Database is the Source of Truth**
All status transitions and validation logic are handled directly in PostgreSQL:
- Vehicle & Driver Availability status mapping.
- Cargo Capacity check rules.
- Driver License expiry checks and Suspended driver blocks.
- Transition lifecycle paths (`Draft` $\rightarrow$ `Dispatched` $\rightarrow$ `Completed` $\rightarrow$ `Cancelled`).
- Maintenance mode vehicle status adjustments (`In Shop` $\leftrightarrow$ `Available`).
- Auto-generation of logs (e.g. Fuel Log updates when completing a trip).

Frontend components must **never** duplicate or manually override these rules.

### **Authentication**
- Clerk is the only authentication provider.
- `profiles.id` stores the Clerk User ID.
- On first login, upsert the profile: `id`, `email`, `full_name`, and `role`.

### **Supabase & Database Service Rules**
Never create another Supabase client instance. Always obtain the authenticated instance using:
```javascript
import { useSupabase } from "@/auth/supabase";
const supabase = useSupabase();
```
Never perform inline database queries (e.g. `supabase.from(...)` inside components). Always call the centralized database helpers from **[src/services/database.js](file:///e:/Hackathon/OdooS2/odoo-season-2/src/services/database.js)**:
- `database.list(client, table, options)`
- `database.getById(client, table, id, idColumn)`
- `database.create(client, table, data)`
- `database.update(client, table, id, updates, idColumn)`
- `database.deleteRecord(client, table, id, idColumn)`

### **Frontend Responsibilities**
- Collect form input and perform basic client validation.
- Call central database helpers.
- Present success or error messages.
- Render responsive dashboards and custom reports.

### **Roles (RBAC)**
- **Fleet Manager**
- **Driver**
- **Safety Officer**
- **Financial Analyst**

---

## 3. Required Pages & Features
- **Login / Signup**: Unified entry screen with role selection during registration.
- **Dashboard**: Displays KPIs (Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization %).
- **Vehicles Registry**: CRUD for vehicles (Registration # validation, type, max weight capacity, current status).
- **Drivers Management**: Profile dashboard (Name, license #, expiry dates, safety scores, status tracking).
- **Trip Management**: Form mapping cargo limits, distance, custom trip workflow statuses.
- **Maintenance Logs**: Registration of vehicle incidents and active repair tracking.
- **Fuel Logs**: Refueling entries mapping volume, costs, and dates.
- **Expenses**: Operational expenses registry (tolls, permits, etc.).
- **Reports & Analytics**: Charts representing fleet efficiency, costs, and ROI.
- **Settings**: Basic profile settings and role details.

---

# Final Principle
> The PostgreSQL database is the single source of truth.
> Frontend adapts to the database.
> The database never adapts to the frontend.
