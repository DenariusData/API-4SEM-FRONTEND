import api from '@/utils/servicesUtils.ts'
import type { PersonRequest, PersonResponse } from "../protocols/personProtocols";

export async function getPersons(page: number, size: number) {
  return await api.get('/persons', {
    params: { page, size }
  });
}

export async function getPersonById(id: number) {
  return await api.get<PersonResponse>(`/persons/${id}`);
}

export async function createPerson(data: PersonRequest) {
  return await api.post<PersonResponse>(`/persons`, data);
}

export async function updatePerson(id: number, data: PersonRequest) {
  return await api.put<PersonResponse>(`/persons/${id}`, data);
}

export async function deletePerson(id: number) {
 return await api.delete(`/persons/${id}`);
}
