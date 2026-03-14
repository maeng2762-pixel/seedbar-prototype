import { createClient } from '@supabase/supabase-js';

// TODO: 환경 변수(.env)에서 실제 URL과 Key를 가져와야 합니다.
// 지금은 화면이 안 나오는 문제를 해결하기 위해 더미 값을 세팅합니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
