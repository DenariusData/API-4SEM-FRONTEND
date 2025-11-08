interface DecodedToken {
  sub: string
  email: string
  permission: string
  iat: number
  exp: number
}

export const parseJwt = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Erro ao decodificar token:', error)
    return null
  }
}
