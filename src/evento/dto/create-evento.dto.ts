import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventoDto {
  @ApiProperty({ description: 'Nome do evento' })
  @IsNotEmpty()
  @IsString()
  nome: string;

  @ApiPropertyOptional({ description: 'Data do evento' })
  @IsOptional()
  @IsDateString()
  data?: string;

  @ApiPropertyOptional({ description: 'Local do evento' })
  @IsOptional()
  @IsString()
  local?: string;

  @ApiPropertyOptional({ description: 'País onde o evento ocorreu' })
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiPropertyOptional({ description: 'Status de finalização do evento', default: false })
  @IsOptional()
  @IsBoolean()
  finalizado?: boolean;

  @ApiPropertyOptional({ description: 'Público total presente no evento' })
  @IsOptional()
  @IsNumber()
  publicoTotal?: number;

  @ApiPropertyOptional({ description: 'Valor arrecadado com o evento em USD' })
  @IsOptional()
  @IsNumber()
  arrecadacao?: number;

  @ApiPropertyOptional({ description: 'Número de vendas de pay-per-view' })
  @IsOptional()
  @IsNumber()
  payPerView?: number;

  @ApiPropertyOptional({ description: 'Lutas do evento' })
  @IsOptional()
  @IsArray()
  lutas?: any[];
} 