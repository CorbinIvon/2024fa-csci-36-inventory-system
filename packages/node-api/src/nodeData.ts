class NodeData {
  private parent: NodeData | null = null
  private children: NodeData[] = []
  public id: string
  public name: string | null
  public description: string | null
  public data: Record<string, any>

  constructor({
    id,
    name = null,
    description = null,
    data = {},
  }: {
    id: string
    name?: string | null
    description?: string | null
    data?: Record<string, any>
  }) {
    this.id = id
    this.name = name
    this.description = description
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

  toJson(): any {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      data: this.data,
      children: this.children.map((child) => child.toJson()),
    }
  }

  static fromJson(json: any): NodeData {
    const node = new NodeData({
      id: json.id,
      name: json.name,
      description: json.description,
      data: json.data || {},
    })
    if (json.children) {
      const children = json.children.map((childJson: any) => NodeData.fromJson(childJson))
      node.setChildren(...children)
    }
    return node
  }
}

export default NodeData
