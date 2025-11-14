import { useRoleStore } from '@/modules/login/store/roleStore'

export function useRoleAccess() {
  const roleStore = useRoleStore()

  const canAccessAlerts = () => roleStore.hasAgenteAccess
  const canAccessDashboards = () => roleStore.hasGestorAccess
  const canAccessProtocols = () => roleStore.hasGestorAccess
  const canAccessPersons = () => roleStore.isAdmin
  const canAccessIndicators = () => true // Public access
  const canAccessHome = () => true // Public access

  const canManageUsers = () => roleStore.isAdmin
  const canManageProtocols = () => roleStore.hasGestorAccess
  const canCreateAlerts = () => roleStore.hasGestorAccess
  const canViewReports = () => roleStore.hasAgenteAccess

  return {
    // Route access
    canAccessAlerts,
    canAccessDashboards,
    canAccessProtocols,
    canAccessPersons,
    canAccessIndicators,
    canAccessHome,
    
    // Feature access
    canManageUsers,
    canManageProtocols,
    canCreateAlerts,
    canViewReports,
    
    // Direct store access
    isAuthenticated: roleStore.isAuthenticated,
    isAdmin: roleStore.isAdmin,
    isGestor: roleStore.isGestor,
    isAgente: roleStore.isAgente,
    isPublic: roleStore.isPublic,
    hasAgenteAccess: roleStore.hasAgenteAccess,
    hasGestorAccess: roleStore.hasGestorAccess,
  }
}
