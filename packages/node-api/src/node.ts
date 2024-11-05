class Node {
  private parent: Node | null = null
  private children: Node[] = []

  constructor(public value: any) {}

  setParent(nodeRef: Node | null): void {
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

  setChildren(...nodes: Node[]): void {
    this.children.forEach((child) => child.removeParent())
    this.children = nodes
    nodes.forEach((node) => node.setParent(this))
  }

  removeChildren(...nodes: Node[]): void {
    nodes.forEach((node) => {
      const index = this.children.indexOf(node)
      if (index > -1) {
        this.children.splice(index, 1)
        node.removeParent()
      }
    })
  }

  addChild(node: Node): void {
    if (!this.children.includes(node)) {
      this.children.push(node)
      node.setParent(this)
    }
  }

  removeChild(node: Node): void {
    const index = this.children.indexOf(node)
    if (index > -1) {
      this.children.splice(index, 1)
      node.removeParent()
    }
  }

  getChildren(): Node[] {
    return this.children
  }

  getParent(): Node | null {
    return this.parent
  }

  toJson(): any {
    return {
      value: this.value,
      children: this.children.map((child) => child.toJson()),
    }
  }

  static fromJson(json: any): Node {
    const node = new Node(json.value)
    if (json.children) {
      const children = json.children.map((childJson: any) => Node.fromJson(childJson))
      node.setChildren(...children)
    }
    return node
  }
}

export default Node
