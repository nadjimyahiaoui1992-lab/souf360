-- =========================================================
-- Souf 360 — Admin Dashboard schema
-- شغّل هذا الملف كاملاً مرة واحدة في Supabase SQL Editor
-- =========================================================

-- 1) جدول الإعدادات العامة (وضع الصيانة)
create table if not exists public.site_settings (
  id int primary key default 1,
  maintenance_mode boolean not null default false,
  maintenance_message text default '',
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into public.site_settings (id, maintenance_mode, maintenance_message)
values (1, false, '')
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_select_all" on public.site_settings;
create policy "site_settings_select_all"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings_update_admin" on public.site_settings;
create policy "site_settings_update_admin"
  on public.site_settings for update
  using (
    exists (
      select 1 from public.admin_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- 2) جدول ملفات المدراء/المشرفين
-- role: 'admin' (صلاحيات كاملة) | 'supervisor' (صلاحيات محدودة يمنحها المدير)
-- permissions: مثال {"add_place": true, "manage_users": false, "maintenance": false}
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'supervisor' check (role in ('admin', 'supervisor')),
  permissions jsonb not null default '{"add_place": true, "manage_users": false, "maintenance": false}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;

drop policy if exists "admin_profiles_select_own_or_admin" on public.admin_profiles;
create policy "admin_profiles_select_own_or_admin"
  on public.admin_profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.admin_profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- الكتابة (إضافة/تعديل/حذف المشرفين) تتم فقط عبر الخادم بمفتاح
-- service_role (راجع app/api/admin/supervisors) لذلك لا حاجة لسياسات insert/update/delete هنا.

-- 3) تأكد أن جدول "places" يحوي الأعمدة التي تستخدمها لوحة التحكم
alter table public.places add column if not exists category text;
alter table public.places add column if not exists description text;
alter table public.places add column if not exists municipality text;
alter table public.places add column if not exists district text;
alter table public.places add column if not exists lat double precision;
alter table public.places add column if not exists lng double precision;
alter table public.places add column if not exists map_link text;
alter table public.places add column if not exists image_url text;
alter table public.places add column if not exists phone text;
alter table public.places add column if not exists website text;
alter table public.places add column if not exists opening_hours text;
alter table public.places add column if not exists facebook text;
alter table public.places add column if not exists instagram text;
alter table public.places add column if not exists rating numeric default 4.5;
alter table public.places add column if not exists created_by uuid references auth.users(id);
alter table public.places add column if not exists created_at timestamptz default now();

alter table public.places enable row level security;

drop policy if exists "places_select_all" on public.places;
create policy "places_select_all"
  on public.places for select
  using (true);

drop policy if exists "places_insert_staff" on public.places;
create policy "places_insert_staff"
  on public.places for insert
  with check (
    exists (
      select 1 from public.admin_profiles p
      where p.id = auth.uid()
        and (p.role = 'admin' or (p.permissions->>'add_place')::boolean = true)
    )
  );

-- 4) حاوية تخزين الصور (Storage bucket)
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "images_public_read" on storage.objects;
create policy "images_public_read"
  on storage.objects for select
  using (bucket_id = 'images');

drop policy if exists "images_staff_upload" on storage.objects;
create policy "images_staff_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'images'
    and exists (
      select 1 from public.admin_profiles p
      where p.id = auth.uid()
        and (p.role = 'admin' or (p.permissions->>'add_place')::boolean = true)
    )
  );

-- =========================================================
-- ملاحظة مهمّة: يجب إنشاء أول حساب "مدير" يدوياً بعد تشغيل هذا الملف:
-- 1. أنشئ مستخدماً من Supabase Authentication > Users > Add user
-- 2. نفّذ:
--    insert into public.admin_profiles (id, email, full_name, role, permissions)
--    values ('<UUID المستخدم>', '<البريد الإلكتروني>', 'المدير العام', 'admin',
--            '{"add_place": true, "manage_users": true, "maintenance": true}');
-- =========================================================
