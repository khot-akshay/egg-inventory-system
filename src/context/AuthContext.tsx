// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType, UserDataType } from './types'
import axiosInstance from 'src/services/axios'
import { signOut } from 'src/utils/encodeid'
import Cookies from 'js-cookie'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  handleSignIn: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = Cookies.get('accessToken')
      const storedUserData = localStorage.getItem('userData')

      // If we have stored user data, use it first
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData)
          setUser(userData)
        } catch (e) {
          localStorage.removeItem('userData')
        }
      }

      if (storedToken) {
        setLoading(true)
        await axiosInstance
          .get(authConfig.meEndpoint, {
            headers: {
              Authorization: storedToken
            }
          })
          .then((response: any) => {
            setLoading(false)
            const userData = response.data.data
            if (userData) {
              const role = userData.roles?.[0]?.slug || 'admin'
              const fullUserData = { ...userData, role }
              setUser(fullUserData)
              window.localStorage.setItem('userData', JSON.stringify(fullUserData))
            }
          })
          .catch((e) => {
            setLoading(false)
            signOut()
            setUser(null)

          })
      } else {
        setLoading(false)
        setUser(null)
        localStorage.removeItem('userData');

      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    axiosInstance
      .post(authConfig.loginEndpoint, params)
      .then((response: any) => {

        response = response.data

        window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)

        const returnUrl = router.query.returnUrl
        const userData = response.data.user
        window.localStorage.setItem('userData', JSON.stringify(userData))
        setUser(userData)

        // setUser({ ...response.data.data?.user,...response.data.data?.is_super_admin, permission:response?.data?.data?.permission })

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        setLoading(false)
        router.replace(redirectURL as string)
      })

      .catch(err => {

        if (errorCallback) errorCallback(err)
      })
  }


  const handleSignIn = (userData: any, token: string, redirectUrl: string, rememberMe: boolean, role: string) => {
    rememberMe ? Cookies.set(authConfig.storageTokenKeyName, token, { expires: 7 }) : Cookies.set(authConfig.storageTokenKeyName, token);
    window.localStorage.setItem(authConfig.storageTokenKeyName, token)
    const returnUrl = redirectUrl ?? router?.query.returnUrl
    setUser({ ...userData, role })
    window.localStorage.setItem('userData', JSON.stringify({ ...userData, role }))
    setLoading(false)
    router.replace(returnUrl as string)
  }
  const handleLogout = () => {
    signOut()
    setUser(null)
  }

  const handleRegister = (params: RegisterParams, errorCallback?: ErrCallbackType) => {
    axios
      .post(authConfig.registerEndpoint, params)
      .then(res => {
        if (res.data.error) {
          if (errorCallback) errorCallback(res.data.error)
        } else {
          handleLogin({ email: params.email, password: params.password })
        }
      })
      .catch((err: { [key: string]: string }) => (errorCallback ? errorCallback(err) : null))
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    handleSignIn: handleSignIn
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
