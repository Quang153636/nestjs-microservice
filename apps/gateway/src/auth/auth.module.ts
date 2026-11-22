import { Module } from "@nestjs/common";
import { UserModule } from "../users/user.module";
import { AuthService } from "./auth.service";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth-guard";
import { AuthController } from "./auth.controller";

@Module({
    imports: [
        UserModule
    ],
    providers: [
        AuthService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard
        }
    ],
    controllers: [AuthController],
    exports: [AuthService]
})

export class AuthMoude { }