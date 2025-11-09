export interface Region {
  id: number;
  name: string;
}

export interface PersonRequest {
  name: string;
  whatsapp: string;
  email: string;
  password: string;
  role: string;
  regions: Region[];
}

export interface PersonResponse {
  id: number;
  name: string;
  whatsapp: string;
  email: string;
  role: string;
  createdAt: string;
  regions: Region[];
}
