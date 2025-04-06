import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateLutadorDto {
  @ApiProperty({ description: 'Nome do lutador' })
  @IsNotEmpty()
  @IsString()
  nome: string;

  @ApiProperty({ description: 'País de origem do lutador' })
  @IsNotEmpty()
  @IsString()
  pais: string;

  @ApiProperty({ description: 'Sexo do lutador (Masculino/Feminino)' })
  @IsNotEmpty()
  @IsString()
  sexo: string;

  @ApiPropertyOptional({ description: 'Altura do lutador em metros', default: 1.80 })
  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(2.5)
  altura?: number;

  @ApiPropertyOptional({ description: 'Apelido do lutador' })
  @IsOptional()
  @IsString()
  apelido?: string;
} 