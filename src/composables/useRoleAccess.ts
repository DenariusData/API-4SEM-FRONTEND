import { useRoleStore } from '@/modules/login/store/roleStore'

export function useRoleAccess() {
  const roleStore = useRoleStore()

  const canAccessAlerts = () => roleStore.hasAgenteAccess
  const canAccessDashboards = () => roleStore.hasGestorAccess
  const canAccessProtocols = () => roleStore.hasGestorAccess
  const canAccessPersons = () => roleStore.isAdmin
  const canAccessIndicators = () => true 
  const canAccessHome = () => true
  
  const canManageUsers = () => roleStore.isAdmin
  const canManageProtocols = () => roleStore.hasGestorAccess
  const canCreateAlerts = () => roleStore.hasGestorAccess
  const canViewReports = () => roleStore.hasAgenteAccess

  return {
    canAccessAlerts,
    canAccessDashboards,
    canAccessProtocols,
    canAccessPersons,
    canAccessIndicators,
    canAccessHome,
    
    canManageUsers,
    canManageProtocols,
    canCreateAlerts,
    canViewReports,
    
    isAuthenticated: roleStore.isAuthenticated,
    isAdmin: roleStore.isAdmin,
    isGestor: roleStore.isGestor,
    isAgente: roleStore.isAgente,
    isPublic: roleStore.isPublic,
    hasAgenteAccess: roleStore.hasAgenteAccess,
    hasGestorAccess: roleStore.hasGestorAccess,
  }
}
