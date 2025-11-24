<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPersons, deletePerson } from '../services/personService'
import AddEditPersonModal from '../components/AddEditPersonModal.vue'
import PersonDeleteModal from '../components/PersonDeleteModal.vue'
import AddPagination from '@/shared/pagination/AddPagination.vue'
import type { PersonResponse } from '../protocols/personProtocols'

const persons = ref<PersonResponse[]>([])
const loading = ref(true)

const page = ref(0)
const size = ref(10)
const totalPages = ref(0)

const showAddEditModal = ref(false)
const isEdit = ref(false)
const showDeleteModal = ref(false)
const editingPerson = ref<PersonResponse | null>(null)
const userToDelete = ref<number | null>(null)

async function loadData() {
  loading.value = true

  const response = await getPersons(page.value, size.value)

  persons.value = response.data.content
  totalPages.value = response.data.totalPages

  loading.value = false
}

function openCreateModal() {
  editingPerson.value = null
  isEdit.value = false
  showAddEditModal.value = true
}

function openEditModal(person: PersonResponse) {
  editingPerson.value = person
  isEdit.value = true
  showAddEditModal.value = true
}

function openDeleteModal(id: number) {
  userToDelete.value = id
  showDeleteModal.value = true
}

async function handleConfirmDelete(id: number) {
  await deletePerson(id)
  await loadData()
}

function handleSaved() {
  loadData()
}

function goToFirst() {
  if (page.value !== 0) {
    page.value = 0
    loadData()
  }
}

function nextPage() {
  if (page.value < totalPages.value - 1) {
    page.value++
    loadData()
  }
}

function previousPage() {
  if (page.value > 0) {
    page.value--
    loadData()
  }
}

function goToLast() {
  if (page.value !== totalPages.value - 1) {
    page.value = totalPages.value - 1
    loadData()
  }
}

onMounted(loadData)
</script>

<template>
  <div class="persons-view">
    <div class="page-header">
      <h1>Gerenciamento de Usuários</h1>
      <p>Gerencie os usuários do sistema</p>
    </div>

    <div class="content-container">
      <div class="panel-header">
        <div>
          <h2>Usuários</h2>
          <p>Lista de todos os usuários cadastrados no sistema</p>
        </div>
        <button @click="openCreateModal" class="btn btn-primary">
          <span class="btn-icon">+</span>
          Adicionar Usuário
        </button>
      </div>

      <div v-if="persons.length === 0 && !loading" class="empty-state">
        <span class="empty-icon">👤</span>
        <p>Nenhum usuário cadastrado</p>
        <button @click="openCreateModal" class="btn-link">Criar primeiro usuário</button>
      </div>

      <div v-else-if="!loading" class="items-list">
        <div v-for="person in persons" :key="person.id" class="item-card">
          <div class="item-content">
            <div class="item-main">
              <div class="item-header-row">
                <h3>{{ person.name }}</h3>
                <span class="badge badge-success">{{ person.role }}</span>
              </div>
              <p class="item-info"><strong>Email:</strong> {{ person.email }}</p>
              <p class="item-info" v-if="person.regions && person.regions.length > 0">
                <strong>Regiões:</strong>
                <span v-for="(region, i) in person.regions" :key="region.id">
                  {{ region.name }}<span v-if="i < person.regions.length - 1">, </span>
                </span>
              </p>
            </div>
            <div class="item-actions">
              <button @click="openEditModal(person)" class="btn-icon-only" title="Editar">✎</button>
              <button @click="openDeleteModal(person.id)" class="btn-icon-only btn-danger" title="Excluir">🗑</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <p>Carregando usuários...</p>
      </div>

      <AddPagination
        v-if="persons.length > 0"
        :page="page"
        :total-pages="totalPages"
        @go-first="goToFirst"
        @go-prev="previousPage"
        @go-next="nextPage"
        @go-last="goToLast"
      />
    </div>

    <AddEditPersonModal v-model="showAddEditModal" :is-edit="isEdit" :person="editingPerson" @saved="handleSaved" />

    <PersonDeleteModal v-model="showDeleteModal" :user-id="userToDelete" @confirm="handleConfirmDelete" />
  </div>
</template>

<style lang="scss" scoped>
.persons-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;

  h1 {
    font-size: 2.5rem;
    color: #4d4d4d;
    margin-bottom: 8px;
    background: linear-gradient(135deg, #222121 0%, #5a5b5a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }

  p {
    font-size: 1.1rem;
    color: #6b7280;
    margin: 0;
  }
}

.content-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 20px;

  h2 {
    font-size: 1.5rem;
    color: #1f2937;
    margin: 0 0 4px 0;
    font-weight: 600;
  }

  p {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &-primary {
    background: linear-gradient(135deg, #00c853 0%, #00963e 100%);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 150, 62, 0.3);
    }
  }

  &-icon {
    font-size: 1.2rem;
  }

  &-link {
    background: none;
    border: none;
    color: #00963e;
    cursor: pointer;
    font-weight: 500;
    padding: 4px 8px;
    font-size: 0.95rem;

    &:hover {
      text-decoration: underline;
    }
  }

  &-icon-only {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: #6b7280;
    font-size: 1.1rem;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }

    &.btn-danger:hover {
      background: #fef2f2;
      color: #991b1b;
    }
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;

  .empty-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 16px;
  }

  p {
    color: #6b7280;
    margin: 8px 0;
  }
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;

  p {
    margin: 0;
  }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }

  .item-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .item-main {
    flex: 1;
  }

  .item-header-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  h3 {
    font-size: 1.15rem;
    color: #1f2937;
    margin: 0;
    font-weight: 600;
  }

  .item-info {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 6px 0;

    strong {
      color: #374151;
    }
  }

  .item-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;

  &-success {
    background: #dcfce7;
    color: #166534;
  }
}

@media (max-width: 768px) {
  .persons-view {
    padding: 12px;
    gap: 24px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-card .item-content {
    flex-direction: column;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
