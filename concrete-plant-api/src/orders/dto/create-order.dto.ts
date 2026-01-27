import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNumber()
  @IsNotEmpty({ message: '配方ID不能为空' })
  recipeId: number;

  @IsNumber()
  @Min(0, { message: '方量必须大于0' })
  volume: number;

  @IsNumber()
  @Min(0, { message: '单价必须大于等于0' })
  unitPrice: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty({ message: '订单编号不能为空' })
  orderNo: string;

  @IsNumber()
  @IsNotEmpty({ message: '站点ID不能为空' })
  siteId: number;

  @IsString()
  @IsNotEmpty({ message: '客户名称不能为空' })
  customerName: string;

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsNotEmpty({ message: '工程名称不能为空' })
  projectName: string;

  @IsString()
  @IsNotEmpty({ message: '施工地址不能为空' })
  constructionSite: string;

  @IsDateString({}, { message: '要求交货时间格式不正确' })
  @IsNotEmpty({ message: '要求交货时间不能为空' })
  requiredDeliveryTime: string;

  @IsNumber()
  @Min(0, { message: '总方量必须大于0' })
  totalVolume: number;

  @IsNumber()
  @Min(0, { message: '总金额必须大于等于0' })
  totalAmount: number;

  @IsEnum(['pending', 'confirmed', 'in_production', 'completed', 'cancelled'], {
    message: '订单状态不正确',
  })
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsOptional()
  items?: CreateOrderItemDto[];
}
