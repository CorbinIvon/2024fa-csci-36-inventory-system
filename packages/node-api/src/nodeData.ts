class NodeData {
  private parent: NodeData | null = null
  private children: NodeData[] = []
  public id: string
  public name: string | null
  public description: string | null
  public quantity: number
  public tags: string[]
  public createdAt: Date
  public updatedAt: Date
  public imageUrl: string | null
  public data: Record<string, any>

  constructor({
    id,
    name = null,
    description = null,
    quantity = 1,
    tags = [],
    createdAt = new Date(),
    updatedAt = new Date(),
    imageUrl = null,
    data = {},
  }: {
    id: string
    name?: string | null
    description?: string | null
    quantity?: number
    tags?: string[]
    createdAt?: Date
    updatedAt?: Date
    imageUrl?: string | null
    data?: Record<string, any>
  }) {
    this.id = id
    this.name = name
    this.description = description
    this.quantity = quantity
    this.tags = tags
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.imageUrl = imageUrl
    this.data = data
  }

  setParent(nodeRef: NodeData | null): void {
    if (this.parent) {
      this.parent.removeChild(this)
    }
    this.parent = nodeRef
    if (nodeRef) {
      nodeRef.addChild(this)
    }
  }

  removeParent(): void {
    if (this.parent) {
      this.parent.removeChild(this)
      this.parent = null
    }
  }

  setChildren(...nodes: NodeData[]): void {
    this.children.forEach((child) => child.removeParent())
    this.children = nodes
    nodes.forEach((node) => node.setParent(this))
  }

  removeChildren(...nodes: NodeData[]): void {
    nodes.forEach((node) => {
      const index = this.children.indexOf(node)
      if (index > -1) {
        this.children.splice(index, 1)
        node.removeParent()
      }
    })
  }

  addChild(node: NodeData): void {
    if (!this.children.includes(node)) {
      this.children.push(node)
      node.setParent(this)
    }
  }

  removeChild(node: NodeData): void {
    const index = this.children.indexOf(node)
    if (index > -1) {
      this.children.splice(index, 1)
      node.removeParent()
    }
  }

  getChildren(): NodeData[] {
    return this.children
  }

  getParent(): NodeData | null {
    return this.parent
  }

  getPath(): string {
    const parts: string[] = [this.name || 'Unnamed Node']
    let current = this.parent
    while (current) {
      parts.unshift(current.name || 'Unnamed Node')
      current = current.parent
    }
    return parts.join(' / ')
  }

  findNodeByName(name: string): NodeData | null {
    if (this.name === name) return this
    for (const child of this.children) {
      const found = child.findNodeByName(name)
      if (found) return found
    }
    return null
  }

  filterByTag(tag: string): NodeData[] {
    let results: NodeData[] = []
    if (this.tags.includes(tag)) {
      results.push(this)
    }
    for (const child of this.children) {
      results = results.concat(child.filterByTag(tag))
    }
    return results
  }

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      quantity: this.quantity,
      tags: this.tags,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      data: this.data,
      imageUrl: this.imageUrl,
      children: this.children.map((child) => child.toJson()),
    }
  }

  static fromJson(json: any): NodeData {
    const node = new NodeData({
      id: json.id,
      name: json.name,
      description: json.description,
      quantity: json.quantity,
      tags: json.tags,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
      data: json.data || {},
      imageUrl: json.imageUrl,
    })
    if (json.children) {
      const children = json.children.map((childJson: any) => NodeData.fromJson(childJson))
      node.setChildren(...children)
    }
    return node
  }
}

export default NodeData
