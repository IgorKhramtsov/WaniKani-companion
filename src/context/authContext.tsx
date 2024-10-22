import React from 'react'
import { useSecureStoreState } from '../hooks/useSecureStore'
import { IS_DEV } from '../constants/helpers'

const AuthContext = React.createContext<{
  signIn: (apiKey: string) => void
  signOut: () => void
  apiKey: string | null
  isLoading: boolean
}>({
  signIn: () => null,
  signOut: () => null,
  apiKey: null,
  isLoading: false,
})

// This hook can be used to access the user info.
export function useSession() {
  const value = React.useContext(AuthContext)
  if (IS_DEV) {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />')
    }
  }

  return value
}

export function SessionProvider(props: React.PropsWithChildren) {
  const [[isLoading, apiKey], setApiKey] = useSecureStoreState('api_key')

  return (
    <AuthContext.Provider
      value={{
        signIn: (apiKey: string) => {
          setApiKey(apiKey)
        },
        signOut: () => {
          setApiKey(null)
        },
        apiKey: apiKey,
        isLoading,
      }}>
      {props.children}
    </AuthContext.Provider>
  )
}
