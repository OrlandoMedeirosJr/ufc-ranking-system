import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateLutaDto {
  @ApiProperty({ description: 'Nome do primeiro lutador' })
  @IsNotEmpty()
  @IsString()
  lutador1: string;

  @ApiProperty({ description: 'Nome do segundo lutador' })
  @IsNotEmpty()
  @IsString()
  lutador2: string;

  @ApiProperty({ description: 'Categoria da luta' })
  @IsString()
  @IsNotEmpty()
  categoria: string;

  @ApiPropertyOptional({ description: 'Resultado da luta (V1, V2, Empate, NC)' })
  @IsOptional()
  @IsString()
  resultado?: 'V1' | 'V2' | 'Empate' | 'NC';

  @ApiPropertyOptional({ description: 'Tipo/método da vitória (Nocaute, Finalização, Decisão Unânime, etc)' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ description: 'Round em que a luta terminou' })
  @IsOptional()
  @IsString()
  round?: string;

  @ApiPropertyOptional({ description: 'Se a luta é disputa de título', default: false })
  @IsOptional()
  @IsBoolean()
  titulo?: boolean;

  @ApiPropertyOptional({ description: 'Bônus recebido (Performance da Noite, Luta da Noite, Nenhum)' })
  @IsOptional()
  @IsString()
  bonus?: string;
} 