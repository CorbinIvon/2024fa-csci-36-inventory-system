'use client'
import React, { useState, useEffect } from 'react'
import SearchBar from './search/SearchBar'
import FilterOptions from './search/FilterOptions'
import ConfirmationDialog from './utility/ConfirmationDialog'
import ThemePicker from './utility/ThemePicker'
import NodeList from './node/NodeList'
import NodeCard from './node/NodeCard'
import NodeCreationForm from './node/NodeCreationForm'
import NodeDescriptionModal from './node/NodeDescriptionModal'
import UserProfile from './user/UserProfile'
import IconButton, { IconButtonSize, IconButtonType } from './ui/IconButton'
import * as mui from '@mui/icons-material'
import NodeData from '@repo/node-api/src/nodeData'
import { createDummyNodes, createDemoNode, findNodeById } from '../data/dummy-data'

const Page: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDemoNodeModalOpen, setIsDemoNodeModalOpen] = useState(false)
  const [dummyNodes, setDummyNodes] = useState<NodeData[]>([])
  const [selectedDemoNode, setSelectedDemoNode] = useState<NodeData | null>(null)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const demoNode = createDemoNode()

  // Initialize states
  useEffect(() => {
    setIsHydrated(true)
    // Initialize dummy nodes only once when component mounts
    if (dummyNodes.length === 0) {
      setDummyNodes(createDummyNodes())
    }
  }, [dummyNodes.length])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    console.log('Search term:', term)
  }

  const handleClear = () => {
    setSearchTerm('')
    console.log('Search cleared')
  }

  const handleSelect = (option: string) => {
    setSelectedOption(option)
    console.log('Selected option:', option)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const handleProfileClick = () => {
    console.log('Profile clicked')
    // You can add more functionality here, like opening a menu
  }

  const getAllNodes = (nodes: NodeData[]): NodeData[] => {
    let allNodes: NodeData[] = []
    nodes.forEach((node) => {
      allNodes.push(node)
      allNodes = allNodes.concat(getAllNodes(node.getChildren()))
    })
    return allNodes
  }

  const handleNodeSubmit = (nodeData: { name: string; description: string; parentNodeID?: string }) => {
    const newNode = new NodeData({
      id: `node-${Math.random().toString(36).substr(2, 9)}`,
      name: nodeData.name,
      description: nodeData.description,
    })

    if (nodeData.parentNodeID) {
      // Find parent node and add new node as child
      const parentNode = findNodeById(dummyNodes, nodeData.parentNodeID)
      if (parentNode) {
        parentNode.addChild(newNode)
        setDummyNodes([...dummyNodes]) // Trigger re-render
      }
    } else {
      // Add as root node
      setDummyNodes([...dummyNodes, newNode])
    }
  }

  if (!isHydrated) {
    return null
  }

  return (
    <div className="pl-5 pt-5">
      <div className="flex">
        <div className="spinner" />
        <ThemePicker />
      </div>

      <h1>Component Demonstrations</h1>

      <h2>&gt;&gt;&gt; components/ui/</h2>
      <h4>IconButton.tsx</h4>
      <div className="flex gap-4 items-center">
        <IconButton icon={mui.Add} size={IconButtonSize.LARGE} onClick={() => console.log('Add clicked')} />
        <IconButton icon={mui.Home} onClick={() => console.log('Home clicked')} />
        <IconButton
          icon={mui.Settings}
          size={IconButtonSize.SMALL}
          type={IconButtonType.SECONDARY}
          onClick={() => console.log('Settings clicked')}
        />
        <IconButton icon={mui.ArrowBack} disabled onClick={() => console.log('Back clicked')} />
      </div>

      <h2>&gt;&gt;&gt; components/user/</h2>
      <h4>UserProfile.tsx</h4>
      <div className="space-y-2">
        <UserProfile
          name="John Doe"
          onClick={handleProfileClick}
          // Optionally add imageUrl prop with actual image path
        />
        <p className="text-sm text-gray-600">Click the avatar to trigger the profile action</p>
      </div>

      <h2>&gt;&gt;&gt; components/node/</h2>
      <div className="space-y-8 mb-8">
        <div>
          <h4>NodeCard.tsx</h4>
          <div className="max-w-sm">
            <NodeCard
              node={demoNode}
              onView={() => setIsDemoNodeModalOpen(true)}
              onEdit={() => console.log('Edit clicked')}
            />
            <NodeDescriptionModal
              isOpen={isDemoNodeModalOpen}
              onClose={() => setIsDemoNodeModalOpen(false)}
              node={demoNode}
            />
          </div>
        </div>

        <div>
          <h4>NodeCreationForm.tsx</h4>
          <NodeCreationForm
            onSubmit={handleNodeSubmit}
            parentNodes={getAllNodes(dummyNodes).map((node) => ({ id: node.id, name: node.name || '' }))}
          />
        </div>

        <div>
          <h4>NodeDescriptionModal.tsx</h4>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => {
              setSelectedDemoNode(dummyNodes[0] || null)
              setIsDemoModalOpen(true)
            }}
          >
            Open Demo Modal
          </button>
          {selectedDemoNode && (
            <NodeDescriptionModal
              isOpen={isDemoModalOpen}
              onClose={() => setIsDemoModalOpen(false)}
              node={selectedDemoNode}
            />
          )}
        </div>

        <div>
          <h4>NodeList.tsx</h4>
          <div className="border p-4 rounded">
            {dummyNodes.length > 0 && <NodeList rootNodes={dummyNodes} onNodeCreate={handleNodeSubmit} />}
          </div>
        </div>
      </div>

      <h2>&gt;&gt;&gt; components/search/</h2>
      <h4>SearchBar.tsx</h4>
      <SearchBar searchTerm={searchTerm} onSearch={handleSearch} onClear={handleClear} nodes={dummyNodes} />
      <h4>FilterOptions.tsx</h4>
      <FilterOptions
        options={['Option 1', 'Option 2', 'Option 3']}
        selectedOption={selectedOption}
        onSelect={handleSelect}
      />

      <h2>&gt;&gt;&gt; components/utility/</h2>
      <h4>ConfirmationDialog.tsx</h4>
      <button onClick={() => setIsDialogOpen(true)}>Click Me!</button>
      <ConfirmationDialog
        open={isDialogOpen}
        title="You Clicked a button!"
        onClose={handleCloseDialog}
        buttons={[
          { label: 'Ok', onClick: handleCloseDialog },
          { label: 'Awesome!', onClick: handleCloseDialog },
        ]}
      >
        Congrats! You clicked a button! You really did it! What did you expect to happen?
      </ConfirmationDialog>
    </div>
  )
}

export default Page
