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
import Node from '@repo/node-api/src/node'
import UserProfile from './user/UserProfile'
import IconButton, { IconButtonSize, IconButtonType } from './ui/IconButton'
import * as mui from '@mui/icons-material'

const Page: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDemoNodeModalOpen, setIsDemoNodeModalOpen] = useState(false)
  const [dummyNodes, setDummyNodes] = useState<Node[]>([])

  // Create a single demo node for NodeCard demonstration
  const demoNode = new Node({
    id: 'demo-1',
    name: 'Demo Node',
    description: 'This is a demonstration of the NodeCard component',
    parentNodeID: null,
  })

  // Move createDummyNodes outside component to avoid recreation on each render
  const createDummyNodes = () => {
    // Create root node
    const rootNode = new Node({
      id: '1',
      name: 'Root Node',
      description: 'This is the root node of our system',
      parentNodeID: null,
    })

    // Create department nodes
    const deptA = new Node({
      id: '2',
      name: 'Department A',
      description: 'First department',
      parentNodeID: '1',
    })

    const deptB = new Node({
      id: '3',
      name: 'Department B',
      description: 'Second department',
      parentNodeID: '1',
    })

    // Create team nodes for Department A
    const teamA1 = new Node({
      id: '4',
      name: 'Team A1',
      description: 'First team in Department A',
      parentNodeID: '2',
    })

    const teamA2 = new Node({
      id: '5',
      name: 'Team A2',
      description: 'Second team in Department A',
      parentNodeID: '2',
    })

    // Create team node for Department B
    const teamB1 = new Node({
      id: '6',
      name: 'Team B1',
      description: 'First team in Department B',
      parentNodeID: '3',
    })

    // Set up hierarchy
    deptA.setChildren(teamA1, teamA2)
    deptB.setChildren(teamB1)
    rootNode.setChildren(deptA, deptB)

    return [rootNode]
  }

  // Helper function to find a node by ID in the tree
  const findNodeById = (nodes: Node[], id: string): Node | null => {
    for (const node of nodes) {
      if (node.value.id === id) return node
      const found = findNodeById(node.getChildren(), id)
      if (found) return found
    }
    return null
  }

  // Generate unique ID for new nodes
  const generateNodeId = () => {
    return `node-${Math.random().toString(36).substr(2, 9)}`
  }

  const handleNodeSubmit = (data: { name: string; description: string; parentNodeID?: string }) => {
    const newNode = new Node({
      id: generateNodeId(),
      name: data.name,
      description: data.description,
      parentNodeID: data.parentNodeID || null,
    })

    if (data.parentNodeID) {
      // Find parent node and add new node as child
      const parentNode = findNodeById(dummyNodes, data.parentNodeID)
      if (parentNode) {
        parentNode.addChild(newNode)
        setDummyNodes([...dummyNodes]) // Trigger re-render
      }
    } else {
      // Add as root node
      setDummyNodes([...dummyNodes, newNode])
    }
  }

  // Get all available nodes for parent selection
  const getAllNodes = (nodes: Node[]): Array<{ id: string; name: string }> => {
    let result: Array<{ id: string; name: string }> = []
    nodes.forEach((node) => {
      result.push({ id: node.value.id, name: node.value.name })
      result = result.concat(getAllNodes(node.getChildren()))
    })
    return result
  }

  const [selectedDemoNode, setSelectedDemoNode] = useState<null | any>(null)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)

  // Initialize states
  useEffect(() => {
    setIsHydrated(true)
    // Initialize dummy nodes only once when component mounts
    if (dummyNodes.length === 0) {
      setDummyNodes(createDummyNodes())
    }
  }, []) // Empty dependency array ensures this runs only once

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
          <NodeCreationForm onSubmit={handleNodeSubmit} parentNodes={getAllNodes(dummyNodes)} />
        </div>

        <div>
          <h4>NodeDescriptionModal.tsx</h4>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => {
              setSelectedDemoNode(dummyNodes[0])
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
          <div className="border p-4 rounded">{dummyNodes.length > 0 && <NodeList rootNodes={dummyNodes} />}</div>
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
