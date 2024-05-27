import { IsEmail , IsString, IsOptional } from "class-validator"


export class UpdaetUserDto{
    @IsEmail()
    @IsOptional()
    email: string

    @IsString()
    @IsOptional()
    passowrd: string

}