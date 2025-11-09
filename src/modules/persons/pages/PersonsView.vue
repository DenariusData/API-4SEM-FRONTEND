<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getPersons, deletePerson } from "../services/personService";
import PersonModal from "../components/PersonModal.vue";
import PersonEditModal from "../components/PersonEditModal.vue";
import PersonDeleteModal from "../components/PersonDeleteModal.vue";
import type { PersonResponse } from "../protocols/personProtocols";

const persons = ref<PersonResponse[]>([]);
const loading = ref(true);

const page = ref(0);
const size = ref(10);
const totalPages = ref(0);

const showModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const editingPerson = ref<PersonResponse | null>(null);
const userToDelete = ref<number | null>(null);

async function loadData() {
  loading.value = true;

  const data = await getPersons(page.value, size.value);

  persons.value = data.content;
  totalPages.value = data.totalPages;

  loading.value = false;
}

function openCreateModal() {
  editingPerson.value = null;
  showModal.value = true;
}

function openEditModal(person: PersonResponse) {
  editingPerson.value = person;
  showEditModal.value = true;
}

function openDeleteModal(id: number) {
  userToDelete.value = id;
  showDeleteModal.value = true;
}

async function handleConfirmDelete(id: number) {
  await deletePerson(id);
  await loadData();
}

function handleSaved() {
  loadData();
}

function goToFirst() {
  if (page.value !== 0) {
    page.value = 0;
    loadData();
  }
}

function nextPage() {
  if (page.value < totalPages.value - 1) {
    page.value++;
    loadData();
  }
}

function previousPage() {
  if (page.value > 0) {
    page.value--;
    loadData();
  }
}

function goToLast() {
  if (page.value !== totalPages.value - 1) {
    page.value = totalPages.value - 1;
    loadData();
  }
}

onMounted(loadData);
</script>

<template>
  <div class="page-container">
    <div class="header">
      <h1 class="page-title">Usuários</h1>

      <button class="btn-add" @click="openCreateModal">
        ➕ Adicionar usuário
      </button>
    </div>

    <div class="table-wrapper">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Perfil</th>
            <th class="actions-col">Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="p in persons" :key="p.id">
            <td>{{ p.name }}</td>
            <td>{{ p.email }}</td>
            <td>{{ p.role }}</td>

            <td class="actions">
              <v-icon class="edit-icon" title="Editar" @click="openEditModal(p)">
                mdi-pencil
              </v-icon>

              <v-icon class="delete-icon" title="Excluir" @click="openDeleteModal(p.id)">
                mdi-delete
              </v-icon>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button @click="goToFirst" :disabled="page === 0">«</button>
      <button @click="previousPage" :disabled="page === 0">‹</button>

      <span>Página {{ page + 1 }} de {{ totalPages }}</span>

      <button @click="nextPage" :disabled="page >= totalPages - 1">›</button>
      <button @click="goToLast" :disabled="page >= totalPages - 1">»</button>
    </div>

    <PersonModal v-model="showModal" :editing-person="editingPerson" @saved="handleSaved" />
    <PersonEditModal v-model="showEditModal" :person="editingPerson" @saved="handleSaved" />
    <PersonDeleteModal v-model="showDeleteModal" :user-id="userToDelete" @confirm="handleConfirmDelete" />
  </div>
</template>

<style scoped>
.page-container {
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
}

.btn-add {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-add:hover {
  background-color: #1565c0;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #d1d1d1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table th {
  padding: 12px;
  background: #f3f3f3;
  text-align: left;
  border-bottom: 2px solid #d9d9d9;
  text-transform: uppercase;
  font-size: 14px;
}

.custom-table td {
  padding: 10px;
  border-bottom: 1px solid #e5e5e5;
}

.actions {
  text-align: center;
}

.edit-icon,
.delete-icon {
  cursor: pointer;
  font-size: 20px;
  margin: 0 6px;
  transition: 0.2s;
  color: #444;
}

.edit-icon:hover {
  color: #000;
  transform: scale(1.1);
}

.delete-icon:hover {
  color: #d32f2f;
  transform: scale(1.1);
}

.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
}

.pagination button {
  border: 1px solid #ccc;
  background: white;
  padding: 6px 10px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:hover:not(:disabled) {
  background: #f0f0f0;
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

.pagination span {
  font-size: 14px;
  margin: 0 6px;
}
</style>
