import { Prisma, PrismaClient } from '@prisma/client'
import { FastifyBaseLogger } from 'fastify'

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

interface NodeServiceProps {
  logger: FastifyBaseLogger
  prisma: PrismaClient
}

interface NodeData {
  node_id: string
  parent_id?: string
  data: any
}

interface CreateNodeProps {
  parent_id?: string
  data: any
}

interface MoveNodeProps {
  node_id: string
  new_parent_id?: string
}

interface SearchNodesProps {
  searchTerm: string
  take?: number
  skip?: number
}

export class NodeService {
  logger: FastifyBaseLogger
  prisma: PrismaClient

  constructor({ logger, prisma }: NodeServiceProps) {
    this.logger = logger
    this.prisma = prisma
  }

  async getNode(node_id: string) {
    this.logger.info({ node_id }, 'getNode')
    return this.prisma.node.findFirst({
      where: { node_id },
      include: {
        children: true,
      },
    })
  }

  async getAllNodes() {
    return this.prisma.node.findMany({
      include: {
        children: true,
      },
    })
  }

  async createNode(props: CreateNodeProps) {
    this.logger.info({ props }, 'createNode')
    return this.prisma.node.create({
      data: {
        parent_id: props.parent_id,
        data: props.data,
      },
    })
  }

  async moveNode(props: MoveNodeProps) {
    this.logger.info({ props }, 'moveNode')
    const { node_id, new_parent_id } = props

    return this.prisma.node.update({
      where: { node_id },
      data: { parent_id: new_parent_id },
    })
  }

  async editNode(node_id: string, data: any) {
    this.logger.info({ node_id, data }, 'editNode')
    return this.prisma.node.update({
      where: { node_id },
      data: { data },
    })
  }

  async deleteNode(node_id: string) {
    this.logger.info({ node_id }, 'deleteNode')
    try {
      await this.prisma.node.delete({
        where: { node_id },
      })
      return true
    } catch (error) {
      this.logger.error(error, 'Failed to delete node')
      return false
    }
  }

  async searchNodes(props: SearchNodesProps) {
    this.logger.info({ props }, 'searchNodes')
    return this.prisma.node.findMany({
      where: {
        data: {
          path: 'data',
          string_contains: props.searchTerm,
        },
      },
      take: props.take,
      skip: props.skip,
      include: {
        children: true,
      },
    })
  }
}
