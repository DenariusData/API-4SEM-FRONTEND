<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getPersons, deletePerson } from "../services/personService";
import type { PersonResponse } from "../protocols/personProtocols";

const persons = ref<PersonResponse[]>([]);
const loading = ref(true);

async function loadData() {
  loading.value = true;
  const data = await getPersons(0, 50);
  persons.value = data.content;
  loading.value = false;
}

async function remove(id: number) {
  await deletePerson(id);
  await loadData();
}

onMounted(loadData);
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">Usuários</h1>

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
              <button class="btn-edit">Editar</button>
              <button class="btn-delete" @click="remove(p.id)">Excluir</button>
            </td>
          </tr>
        </tbody>

      </table>
    </div>
  </div>
</template>

<style scoped>
/* Container geral */
.page-container {
  padding: 24px;
}

/* Título */
.page-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* Wrapper da tabela */
.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #d1d1d1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Tabela */
.custom-table {
  width: 100%;
  border-collapse: collapse;
}

/* Cabeçalho */
.custom-table thead {
  background-color: #f3f3f3;
}

.custom-table th {
  padding: 12px;
  text-align: left;
  font-weight: bold;
  border-bottom: 2px solid #d9d9d9;
  text-transform: uppercase;
  font-size: 14px;
}

.actions-col {
  text-align: center;
}

/* Linhas */
.custom-table td {
  padding: 10px;
  border-bottom: 1px solid #e5e5e5;
}

/* Hover */
.custom-table tbody tr:hover {
  background-color: #fafafa;
}

/* Coluna de ações */
.actions {
  text-align: center;
}

/* Botões */
.btn-edit,
.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.btn-edit {
  color: #1976d2;
}

.btn-edit:hover {
  text-decoration: underline;
}

.btn-delete {
  color: #d32f2f;
}

.btn-delete:hover {
  text-decoration: underline;
}
</style>
