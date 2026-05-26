export type ErrCallbackType = (err: { [key: string]: string }) => void

export type LoginParams = {
  email: string
  password: string
  rememberMe?: boolean
}

export type RegisterParams = {
  email: string
  username: string
  password: string
}

export type UserDataType = {
  id: number
  role: string
  email: string
  fullName: string
  username: string
  password: string
  avatar?: string | null
  // Backend-provided RBAC fields
  is_super_admin?: boolean
  permission?: { id?: number; display_name?: string; permission_name: string; parent_id?: number | null }[]
  // New fields from login API response
  uuid?: string
  name?: string
  phone?: string | null
  shop_id?: number
  supplier_id?: number | null
  is_active?: boolean
  roles?: { id: number; slug: string; name: string; permissions: any[] }[]
  permissions?: string[]
  shop?: {
    id: number
    uuid: string
    code: string
    name: string
    city: string
    phone?: string | null
    is_active: boolean
    egg_price_range?: {
      min?: number | null
      max?: number | null
      unit: string
    }
  }
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  register: (params: RegisterParams, errorCallback?: ErrCallbackType) => void
  handleSignIn: (userData:any,token:string,redirectUrl:string, rememberMe:boolean, role:string) => void
}
