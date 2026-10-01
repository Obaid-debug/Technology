/* ------------------------------------------------------------
   Shared database connection (Supabase).
   Leave both values empty to run in local mode: changes are then kept
   only in this browser. To share data between users, create a Supabase
   project, run supabase/setup.sql in its SQL editor, and paste the
   project URL and the "anon public" key from Project Settings > API.
   The anon key is designed to be public; access is controlled by the
   row-level security policies in setup.sql.
   ------------------------------------------------------------ */
window.PORTAL_CONFIG = {
  supabaseUrl: '',      // e.g. 'https://abcdefghijkl.supabase.co'
  supabaseAnonKey: ''   // e.g. 'eyJhbGciOi...'
};
