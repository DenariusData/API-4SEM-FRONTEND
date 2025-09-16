<template>

    
        <v-dialog
          transition="dialog-top-transition"
          width="auto"

        :model-value = "true"
        >
          <template v-slot:default="{ isActive }">
            <v-card>
              <v-toolbar title="Opening from the Top"></v-toolbar>

              <v-card-text class="text-h2 pa-12">
                Hello world!
              </v-card-text>

              <v-card-actions class="justify-end">
                <v-btn
                  text="Close"
                  @click="closePopup"
                ></v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>
</template>

    <script lang="ts" setup>
    import { ref } from 'vue'

    const emit = defineEmits<{
        (e: 'close'): void
    }>()
    const closePopup = () => {
        emit("close")
    }
    </script>

    