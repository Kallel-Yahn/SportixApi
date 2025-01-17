import { IsNotEmpty, IsString } from "class-validator"

export class CloseTimeBody {
    @IsNotEmpty()
    @IsString()
    hour: string

    @IsNotEmpty()
    @IsString()
    date: string

    @IsNotEmpty()
    @IsString()
    fk_court: string
}
