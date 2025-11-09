import api from '@/utils/servicesUtils.ts'
import type { PersonRequest, PersonResponse } from "../protocols/personProtocols";

export async function getPersons(page: number, size: number) {
  const response = await api.get(`/persons`, {
    params: { page, size }
  });
  return response.data;
}

export async function getPersonById(id: number) {
  const response = await api.get<PersonResponse>(`/persons/${id}`);
  return response.data;
}

export async function createPerson(data: PersonRequest) {
  const response = await api.post<PersonResponse>(`/persons`, data);
  return response.data;
}

export async function updatePerson(id: number, data: PersonRequest) {
  const response = await api.put<PersonResponse>(`/persons/${id}`, data);
  return response.data;
}

export async function deletePerson(id: number) {
  await api.delete(`/persons/${id}`);
}
