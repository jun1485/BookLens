export const hasValue = (value?: string | null): value is string => {
  return Boolean(value && value.trim().length > 0);
};

interface EnvOptions {
  fallback?: string;
  required?: boolean;
}

const getEnvVar = (key: string, options: EnvOptions = {}): string => {
  const { fallback = "", required = true } = options;
  const value = process.env[key];

  if (hasValue(value)) {
    return value.trim();
  }

  if (required) {
    console.warn(`[env] 환경 변수 ${key}가 설정되지 않았습니다.`);
  }

  return fallback;
};

export const env = {
  tmdbApiKey: getEnvVar("TMDB_API_KEY"),
  naverClientId: getEnvVar("NAVER_CLIENT_ID", { required: false }),
  naverClientSecret: getEnvVar("NAVER_CLIENT_SECRET", { required: false }),
  supabaseUrl: getEnvVar("SUPABASE_URL", { required: false }),
  supabaseKey: getEnvVar("SUPABASE_KEY", { required: false }),
};
