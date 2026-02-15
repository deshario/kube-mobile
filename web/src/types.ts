export interface Context {
  id: string
  name: string
  namespace: string
}

export interface Pod {
  name: string
  namespace: string
  status: string
}

export type View = 'contexts' | 'namespaces' | 'pods' | 'logs'
