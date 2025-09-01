// src/types.ts
export type Bar = {
  id: string;
  ext_id?: string | null;
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  closed?: boolean | null;
  tchin_7d?: number | null;
  tchin_30d?: number | null;
  tchin_90d?: number | null;
};

export type Profile = {
  id: string;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  birthdate?: string | null;
  created_at?: string;
};

export type Affiliation = {
  user_id: string;
  bar_id: string;
  started_at: string;
};
