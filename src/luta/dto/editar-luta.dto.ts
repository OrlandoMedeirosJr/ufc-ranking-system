import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class EditarLutaDto {
  @ApiProperty({ description: 'Categoria da luta' })
  @IsString()
  @IsNotEmpty()
  categoria: string;

  @ApiPropertyOptional({ description: 'Se a luta é disputa de título', default: false })
  @IsOptional()
  @IsBoolean()
  disputaTitulo?: boolean;

  @ApiPropertyOptional({ description: 'Resultado da luta: lutadorA, lutadorB, empate ou nocontest' })
  @IsOptional()
  @IsString()
  vencedor?: 'lutadorA' | 'lutadorB' | 'empate' | 'nocontest';

  @ApiPropertyOptional({ description: 'Método de vitória (ex: Nocaute, Finalização, Decisão Unânime)' })
  @IsOptional()
  @IsString()
  metodo?: string;

  @ApiPropertyOptional({ description: 'Número do round em que a luta terminou' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  round?: number;

  @ApiPropertyOptional({ description: 'Tempo do round em que a luta terminou (formato MM:SS)' })
  @IsOptional()
  @IsString()
  tempo?: string;

  @ApiPropertyOptional({ description: 'Se a luta recebeu bônus de Luta da Noite' })
  @IsOptional()
  @IsBoolean()
  bonusLuta?: boolean;

  @ApiPropertyOptional({ description: 'Se a luta recebeu bônus de Performance da Noite' })
  @IsOptional()
  @IsBoolean()
  bonusPerformance?: boolean;
} 