-- chat_messages 테이블 생성
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 실시간 기능을 위한 publication 생성
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- chat_messages 테이블을 실시간 기능에 추가
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_chat_messages_discussion_id ON public.chat_messages(discussion_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- RLS(Row Level Security) 설정
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 메시지를 읽고 쓸 수 있도록 정책 설정
CREATE POLICY "Anyone can read chat messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert chat messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (true);