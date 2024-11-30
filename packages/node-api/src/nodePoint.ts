export interface NodePointData {
  id?: number
  parent?: number
  title: string
  description?: string
  data?: any
  version?: number
  deleted?: boolean
}

export class NodePoint {
  id?: number
  parent?: number
  title: string
  description: string
  data: any
  version: number
  deleted: boolean
  children: NodePoint[]

  constructor(data: NodePointData) {
    this.id = data.id
    this.parent = data.parent
    this.title = data.title
    this.description = data.description || ''
    this.data = data.data || {}
    this.version = data.version || 1
    this.deleted = data.deleted || false
    this.children = []
  }

  addChild(child: NodePoint): void {
    this.children.push(child)
  }

  removeChild(childId: number): void {
    this.children = this.children.filter((child) => child.id !== childId)
  }

  update(data: Partial<NodePointData>): void {
    Object.assign(this, data)
  }
}
