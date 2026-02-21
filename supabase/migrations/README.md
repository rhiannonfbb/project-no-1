# Supabase Migrations

SQL migration files for this project. Each file is prefixed with a UTC timestamp
so migrations run in chronological order.

## Applying migrations

### Option A — Supabase Dashboard (quickest for solo dev)

1. Open the Supabase Dashboard for this project.
2. Go to **SQL Editor**.
3. Copy the contents of each `.sql` file (in filename order) and run them.

### Option B — Supabase CLI

```bash
# Install CLI once
npm install -g supabase

# Link to your project (requires project ref from dashboard URL)
supabase link --project-ref <your-project-ref>

# Push all pending migrations
supabase db push
```

## Migration history

| File | Feature | Description |
|------|---------|-------------|
| `20260221000001_create_profiles.sql` | PROJ-1 | Creates `profiles` table with RLS and trigger to auto-create on signup |
