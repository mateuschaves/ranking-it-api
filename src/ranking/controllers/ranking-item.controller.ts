import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { GetUser } from '../../user/decorators/get-current-user.decorator';
import CreateRankingItemDto from '../dto/create-ranking-item.dto';
import { RankingItemService } from '../services/ranking-item.service';
import UpdateRankingItemDto from '../dto/update-ranking-item.dto';

@ApiTags('Ranking Items')
@ApiBearerAuth('JWT-auth')
@Controller('rankings')
@UseGuards(AuthGuard('jwt'))
export class RankingItemController {
  constructor(private readonly rankingItemService: RankingItemService) {}

  @Post(':rankingId/items')
  @ApiOperation({ summary: 'Create a new item for a ranking' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiBody({
    description: 'Payload to create a ranking item',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Restaurante XPTO' },
        description: { type: 'string', example: 'Descrição do item' },
        photos: {
          type: 'array',
          items: { type: 'string', example: 'file-id-123' },
          description: 'Optional array of uploaded file IDs to attach as photos',
        },
        link: { type: 'string', example: 'https://example.com' },
        latitude: { type: 'string', example: '-23.5505' },
        longitude: { type: 'string', example: '-46.6333' },
      },
      required: ['name'],
      example: {
        name: 'Restaurante XPTO',
        description: 'Descrição do item',
        photos: ['file-id-123', 'file-id-456'],
        link: 'https://example.com',
        latitude: '-23.5505',
        longitude: '-46.6333',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Item created successfully',
    schema: {
      properties: {
        id: { type: 'string', example: 'item-123' },
        name: { type: 'string', example: 'Restaurante XPTO' },
        description: { type: 'string', example: 'Descrição do item' },
        photo: { type: 'string', example: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/photo.jpg' },
        latitude: { type: 'number', example: -23.5505 },
        longitude: { type: 'number', example: -46.6333 },
        link: { type: 'string', example: 'https://example.com' },
        rankingId: { type: 'string', example: 'ranking-123' },
        createdById: { type: 'string', example: 'user-123' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-07-01T12:00:00.000Z' },
      },
      example: {
        id: 'item-123',
        name: 'Restaurante XPTO',
        description: 'Descrição do item',
        photo: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/photo.jpg',
        latitude: -23.5505,
        longitude: -46.6333,
        link: 'https://example.com',
        rankingId: 'ranking-123',
        createdById: 'user-123',
        createdAt: '2024-07-01T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    schema: { example: { message: 'Erro de validação' } },
  })
  async createRankingItem(
    @Param('rankingId') rankingId: string,
    @Body() createRankingItemDto: CreateRankingItemDto,
    @GetUser() userId: string,
  ) {
    Logger.log('Request', {
      rankingId,
      createRankingItemDto,
      userId,
    });

    Logger.log('Creating ranking item', RankingItemController.name);
    createRankingItemDto.createdById = userId;
    createRankingItemDto.rankingId = rankingId;

    return await this.rankingItemService.createRankingItem(
      createRankingItemDto,
    );
  }

  @Get(':rankingId/items')
  @ApiOperation({ summary: 'Get all items for a specific ranking' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiResponse({
    status: 200,
    description: 'Ranking items retrieved successfully',
    schema: {
      type: 'array',
      items: {
        properties: {
          id: { type: 'string', example: 'item-123' },
          name: { type: 'string', example: 'Restaurante XPTO' },
          description: { type: 'string', example: 'Descrição do item' },
          photo: { type: 'string', example: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/photo.jpg' },
          latitude: { type: 'number', example: -23.5505 },
          longitude: { type: 'number', example: -46.6333 },
          link: { type: 'string', example: 'https://example.com' },
          createdAt: { type: 'string', format: 'date-time', example: '2024-07-01T12:00:00.000Z' },
          createdByUser: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'user-123' },
              name: { type: 'string', example: 'John Doe' },
              avatar: {
                type: 'object',
                properties: {
                  url: { type: 'string', example: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg' },
                },
              },
            },
          },
          rankingItemUserPhoto: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'photo-123' },
                photoId: { type: 'string', example: 'file-123' },
                userId: { type: 'string', example: 'user-123' },
                createdAt: { type: 'string', format: 'date-time', example: '2024-07-01T12:00:00.000Z' },
                photo: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', example: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/photo.jpg' },
                  },
                },
              },
            },
          },
        },
      },
      example: [
        {
          id: 'item-123',
          name: 'Restaurante XPTO',
          description: 'Descrição do item',
          photo: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/photo.jpg',
          latitude: -23.5505,
          longitude: -46.6333,
          link: 'https://example.com',
          createdAt: '2024-07-01T12:00:00.000Z',
          createdByUser: {
            id: 'user-123',
            name: 'John Doe',
            avatar: {
              url: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/avatar.jpg',
            },
          },
          rankingItemUserPhoto: [
            {
              id: 'photo-123',
              photoId: 'file-123',
              userId: 'user-123',
              createdAt: '2024-07-01T12:00:00.000Z',
              photo: {
                url: 'http://ranking-attachments.s3.us-east-1.amazonaws.com/photo.jpg',
              },
            },
          ],
        },
      ],
    },
  })
  async getRankingItems(
    @Param('rankingId') rankingId: string,
    @GetUser() userId: string,
  ) {
    Logger.log('Request', {
      rankingId,
      userId,
    });

    Logger.log('Getting ranking items', RankingItemController.name);
    return await this.rankingItemService.getRankingItems(rankingId, userId);
  }

  @Delete(':rankingId/items/:rankingItemId')
  @ApiOperation({ summary: 'Delete a ranking item' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiParam({ name: 'rankingItemId', description: 'ID of the item to delete' })
  @ApiResponse({
    status: 200,
    description: 'Item deleted successfully',
    schema: { example: { message: 'Item deleted successfully' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found',
    schema: { example: { message: 'Item not found' } },
  })
  async deleteRankingItem(
    @Param('rankingId') rankingId: string,
    @Param('rankingItemId') rankingItemId: string,
    @GetUser() userId: string,
  ) {
    Logger.log('Request', {
      rankingId,
      rankingItemId,
      userId,
    });

    Logger.log('Deleting ranking item', RankingItemController.name);
    await this.rankingItemService.deleteRankingItem(rankingItemId, userId);
  }

  @Patch(':rankingId/items/:rankingItemId')
  @ApiOperation({ summary: 'Update a ranking item' })
  @ApiParam({ name: 'rankingId', description: 'ID of the ranking' })
  @ApiParam({ name: 'rankingItemId', description: 'ID of the item to update' })
  @ApiBody({
    description: 'Fields to update in a ranking item',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Novo nome do item' },
        description: { type: 'string', example: 'Nova descrição' },
        photos: {
          type: 'array',
          items: { type: 'string', example: 'file-id-123' },
          description: 'Lista de IDs de fotos (opcional)',
        },
        link: { type: 'string', example: 'https://example.com' },
        latitude: { type: 'string', example: '-23.5505' },
        longitude: { type: 'string', example: '-46.6333' },
      },
      example: {
        name: 'Novo nome do item',
        description: 'Nova descrição',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Item updated successfully',
    schema: {
      properties: {
        id: { type: 'string', example: 'item-123' },
        name: { type: 'string', example: 'Novo nome do item' },
        description: { type: 'string', example: 'Nova descrição' },
        link: { type: 'string', example: 'https://example.com' },
        latitude: { type: 'number', example: -23.5505 },
        longitude: { type: 'number', example: -46.6333 },
        rankingId: { type: 'string', example: 'ranking-123' },
        createdById: { type: 'string', example: 'user-123' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async updateRankingItem(
    @Param('rankingId') rankingId: string,
    @Param('rankingItemId') rankingItemId: string,
    @Body() updateDto: UpdateRankingItemDto,
    @GetUser() userId: string,
  ) {
    Logger.log('Request', {
      rankingId,
      rankingItemId,
      updateDto,
      userId,
    });

    Logger.log('Updating ranking item', RankingItemController.name);
    return await this.rankingItemService.updateRankingItem(
      rankingId,
      rankingItemId,
      userId,
      updateDto,
    );
  }
}
