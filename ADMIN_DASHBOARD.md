# لوحة تحكم Souf 360 — /admin

## ما تمت إضافته
- `middleware.ts` — يحمي مسارات `/admin/*` ويحدّث جلسة Supabase تلقائياً.
- `app/admin/page.jsx` — صفحة تسجيل الدخول.
- `app/admin/(app)/layout.jsx` — تحقق من الجلسة + الشريط الجانبي (لا يغيّر عناوين الروابط).
- `app/admin/(app)/dashboard/page.jsx` — الشاشة الرئيسية: حالة النظام، وضع الصيانة، اختصارات.
- `app/admin/(app)/add-place/page.jsx` — نموذج إضافة معلم (إحداثيات ذكية + صور).
- `app/admin/(app)/users/page.jsx` — إدارة المشرفين وصلاحياتهم.
- `app/api/admin/*` — مسارات API التي تُنفَّذ بمفتاح service_role (إنشاء/حذف مشرفين، إضافة معالم).
- `components/admin/*` — مكونات اللوحة (Sidebar, CoordinatesField, ImageUploader, PermissionsEditor...).
- `supabase/admin_schema.sql` — كل جداول وسياسات RLS المطلوبة.

لم يتم تعديل أي ملف يخص الواجهة الأمامية للموقع (`app/page.tsx`, `components/map`...).

## خطوات التشغيل

1. **تثبيت الحزمة الجديدة**:
   ```bash
   npm install
   ```
   (تمت إضافة `@supabase/ssr` إلى `package.json`).

2. **متغيرات البيئة** — انسخ `.env.example` إلى `.env.local` واملأ القيم من
   لوحة Supabase (Settings > API):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (سرّي — سيرفر فقط)

3. **قاعدة البيانات** — نفّذ محتوى `supabase/admin_schema.sql` كاملاً في
   Supabase SQL Editor. ينشئ جدولي `site_settings` و`admin_profiles`،
   يضيف الأعمدة الناقصة لجدول `places`، وينشئ Storage bucket باسم `images`
   مع سياسات RLS.

4. **إنشاء أول حساب مدير**:
   - Supabase Dashboard → Authentication → Users → Add user (بريد + كلمة مرور).
   - انسخ الـ UUID الخاص به، ثم نفّذ في SQL Editor:
     ```sql
     insert into public.admin_profiles (id, email, full_name, role, permissions)
     values ('<UUID>', '<البريد الإلكتروني>', 'المدير العام', 'admin',
             '{"add_place": true, "manage_users": true, "maintenance": true}');
     ```

5. شغّل المشروع وادخل إلى `/admin` بحساب المدير.

## ملاحظات
- المدير فقط يمكنه إضافة/حذف/تعديل صلاحيات المشرفين (`manage_users` محجوزة
  للمدير دائماً ولا يمكن منحها لمشرف).
- صلاحيات المشرف الحالية: `add_place` (إضافة معالم) و`maintenance` (التحكم
  بوضع الصيانة). يمكن توسيعها لاحقاً بإضافة مفاتيح جديدة في
  `components/admin/PermissionsEditor.jsx` وجداول الصلاحيات في السيرفر.
- حقل الإحداثيات في `add-place` يدعم 3 طرق (يدوي / رابط Google Maps /
  Plus Code) وترك تعليق `TODO` داخل `CoordinatesField.jsx` لميزة مستقبلية:
  اختيار الموقع بالنقر على خريطة تفاعلية.
- رفع الصور يدعم السحب والإفلات، اختيار من المعرض، والتقاط مباشر بالكاميرا
  عبر خاصية HTML5 `capture` (تعمل تلقائياً على متصفحات الهواتف).
