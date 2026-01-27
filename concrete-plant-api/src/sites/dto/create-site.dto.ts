import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';

export class CreateSiteDto {
  @IsNotEmpty({ message: '站点代码不能为空' })
  @IsString({ message: '站点代码必须是字符串' })
  code: string;

  @IsNotEmpty({ message: '站点名称不能为空' })
  @IsString({ message: '站点名称必须是字符串' })
  name: string;

  @IsNotEmpty({ message: '站点类型不能为空' })
  @IsEnum(['production', 'distribution', 'mixed'], {
    message: '站点类型必须是 production, distribution 或 mixed',
  })
  type: string;

  @IsNotEmpty({ message: '地址不能为空' })
  @IsString({ message: '地址必须是字符串' })
  address: string;

  @IsOptional()
  @IsString({ message: '联系人必须是字符串' })
  contactPerson?: string;

  @IsOptional()
  @IsString({ message: '联系电话必须是字符串' })
  contactPhone?: string;

  @IsOptional()
  @IsNumber({}, { message: '负责人ID必须是数字' })
  managerId?: number;

  @IsOptional()
  @IsNumber({}, { message: '纬度必须是数字' })
  @Min(-90, { message: '纬度必须在-90到90之间' })
  @Max(90, { message: '纬度必须在-90到90之间' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: '经度必须是数字' })
  @Min(-180, { message: '经度必须在-180到180之间' })
  @Max(180, { message: '经度必须在-180到180之间' })
  longitude?: number;

  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remarks?: string;
}
