/* ------------------------------------------------------------
   Shared database connection (Supabase).
   OPTIONAL. Leave both values empty to use the data files in GitHub
   (data/services.js and the encrypted data/staff-data.js); see README.
   To use Supabase instead, create a project, run supabase/setup.sql and
   supabase/people.sql, and paste the project URL and the "anon public"
   key from Project Settings > API.
   The anon key is designed to be public; access is controlled by the
   row-level security policies in setup.sql.
   ------------------------------------------------------------ */
window.PORTAL_CONFIG = {
  supabaseUrl: '',      // e.g. 'https://abcdefghijkl.supabase.co'
  supabaseAnonKey: ''   // e.g. 'eyJhbGciOi...'
};
