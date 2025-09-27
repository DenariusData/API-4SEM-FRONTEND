<template>
  <v-dialog
    transition="dialog-top-transition"
    width="420"
    v-model="model"
    class="login-dialog"
  >
    <template v-slot:default>
      <v-card class="login-card elevation-24">
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          class="close-btn"
          @click="closePopup"
        ></v-btn>
        <v-card-text class="text-center pa-6">

          <!-- Logo no topo do pop-up -->
          <div class="login-logo mb-4">
            <img src="/radariustxt.svg" alt="Logo" />
          </div>

          <!-- Título -->
          <h2 class="login-title mb-6">Login</h2>

          <!-- Formulário -->
          <v-form @submit.prevent="handleLogin" class="login-form">
            <div class="input-group mb-4">
              <label class="input-label">Email</label>
              <v-text-field
                v-model="email"
                placeholder="Enter your email"
                type="email"
                variant="outlined"
                density="comfortable"
                @keyup.enter="handleLogin"
                hide-details
                class="custom-input"
              ></v-text-field>
            </div>

            <div class="input-group mb-6">
              <label class="input-label">Password</label>
              <v-text-field
                v-model="password"
                placeholder="Enter your password"
                type="password"
                variant="outlined"
                density="comfortable"
                @keyup.enter="handleLogin"
                hide-details
                class="custom-input"
              ></v-text-field>
            </div>

            <div class="form-footer mb-5 d-flex justify-space-between">
              <span v-if="showError" class="error-message">
                Incorrect email or password
              </span>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>

            <div class="button-group d-flex flex-column gap-4">
              <v-btn
                type="submit"
                class="login-btn"
                size="x-large"
                block
              >
                Login
              </v-btn>

              <v-btn
                variant="outlined"
                size="x-large"
                block
                class="signup-btn"
                @click="closePopup"
              >
                Sign up
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const model = ref(props.modelValue)
const email = ref('')
const password = ref('')
const showError = ref(false)

watch(() => props.modelValue, (val) => (model.value = val))
watch(model, (val) => emit('update:modelValue', val))

const closePopup = () => {
  showError.value = false
  email.value = ''
  password.value = ''
  model.value = false
}

const handleLogin = () => {
  if (password.value === 'Denarius') {
    console.log('Email:', email.value)
    console.log('Login realizado com sucesso!')
    showError.value = false
    closePopup()
  } else {
    showError.value = true
  }
}
</script>

<style scoped>
.login-dialog {
  backdrop-filter: blur(4px);
}
.login-dialog :deep(.v-overlay__scrim) {
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(8px);
}
.login-card {
  background: white;
  border-radius: 40px !important;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}
.login-logo img {
  height: 60px;
  width: auto;
}
.login-title {
  color: #333;
  font-size: 28px;
  font-weight: 400;
  margin: 0;
}
.login-form {
  text-align: left;
}
.input-label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}
.error-message {
  color: #e53e3e;
  font-size: 13px;
  font-weight: 500;
}
.forgot-link {
  color: #2196F3;
  font-size: 13px;
  text-decoration: none;
}
.login-btn {
  background: #4CAF50 !important;
  color: white !important;
  border-radius: 25px !important;
}
.signup-btn {
  color: #2196F3 !important;
  border-radius: 25px !important;
  border: 1px solid #2196F3 !important;
}
.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  color: #666 !important;
}
.button-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
