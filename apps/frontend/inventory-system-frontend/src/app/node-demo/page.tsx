'use client'

import React, { useState, useEffect } from 'react'
import NodeList from '../components/node/NodeList'
import NodeData from '@repo/node-api/src/nodeData'
import { createDummyNodes, findNodeById } from '../data/dummy-data'

const NodeDemoPage: React.FC = () => {
  const [dummyNodes, setDummyNodes] = useState<NodeData[]>([])

  // Initialize dummy nodes
  useEffect(() => {
    if (dummyNodes.length === 0) {
      setDummyNodes(createDummyNodes())
    }
  }, [dummyNodes.length])

  const handleNodeSubmit = (nodeData: { name: string; description: string; parentNodeID?: string }) => {
    const newNode = new NodeData({
      id: `node-${Math.random().toString(36).substr(2, 9)}`,
      name: nodeData.name,
      description: nodeData.description,
    })

    if (nodeData.parentNodeID) {
      const parentNode = findNodeById(dummyNodes, nodeData.parentNodeID)
      if (parentNode) {
        parentNode.addChild(newNode)
        setDummyNodes([...dummyNodes]) // Trigger re-render
      }
    } else {
      setDummyNodes([...dummyNodes, newNode])
    }
  }

  return (
    <div className="p-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Node Navigation</h2>
        {dummyNodes.length > 0 && <NodeList rootNodes={dummyNodes} onNodeCreate={handleNodeSubmit} />}
      </div>
    </div>
  )
}

export default NodeDemoPage
