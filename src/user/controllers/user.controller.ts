import {Body, Controller, Post} from '@nestjs/common';
import {UserService} from "../services/user.service";
import SignUpDto from "../dto/SignUpDto";

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}


    @Post('/signup')
    async signup(@Body() CreateAccountDto: SignUpDto) {
        return this.userService.createAccount(CreateAccountDto);
    }

    @Post('/signin')
    async signin(@Body() { email, password }) {
        return this.userService.login(email, password);
    }
}
