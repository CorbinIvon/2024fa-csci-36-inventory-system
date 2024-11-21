// app/page.tsx
'use client'
import { useState } from 'react'
import { Layout, Tree, Input, Card, Descriptions, Tag, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { createDummyNodes } from './data/dummy-data'
import type { DataNode } from 'antd/es/tree'
import NodeData from '@repo/node-api/src/nodeData'

const { Header, Sider, Content } = Layout
const { Search } = Input
const { Title } = Typography

const convertToTreeData = (node: NodeData): DataNode => ({
  key: node.id,
  title: node.name || 'Unnamed',
  children: node.getChildren().map(convertToTreeData),
})

export default function Home() {
  const [nodes] = useState(() => createDummyNodes())
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [, setSearchText] = useState('')

  const treeData = nodes.map(convertToTreeData)

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-6 flex items-center">
        <Search
          placeholder="Search nodes..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          className="max-w-md"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Header>

      <Layout>
        <Sider width={300} className="bg-white p-4">
          <Tree
            treeData={treeData}
            onSelect={(_, { node }) => {
              const found = nodes[0]?.findNodeByName(node.title as string) || null
              setSelectedNode(found)
            }}
            showLine
            showIcon
          />
        </Sider>

        <Content className="p-6 bg-white m-4 rounded">
          {selectedNode ? (
            <>
              <Card title={selectedNode.name || 'Unnamed Node'}>
                <Descriptions bordered>
                  <Descriptions.Item label="ID">{selectedNode.id}</Descriptions.Item>
                  <Descriptions.Item label="Quantity">{selectedNode.quantity}</Descriptions.Item>
                  <Descriptions.Item label="Created">{selectedNode.createdAt.toLocaleDateString()}</Descriptions.Item>
                  <Descriptions.Item label="Tags">
                    {selectedNode.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Title level={4} className="mt-6 mb-4">
                Child Nodes
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedNode.getChildren().map((child) => (
                  <Card
                    key={child.id}
                    title={child.name}
                    extra={<Tag color="blue">{child.quantity}</Tag>}
                    hoverable
                    onClick={() => setSelectedNode(child)}
                  >
                    <p>{child.description}</p>
                    <div className="mt-2">
                      {child.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <Title level={3}>Select a node to view details</Title>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  )
}
