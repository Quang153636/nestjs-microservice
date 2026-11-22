import { CanActivate, ExecutionContext, ForbiddenException, Get, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/user.services";
import { Observable } from "rxjs";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { REQUIRED_ROLE_KEY } from "./admin.decorator";


@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
        private readonly userService: UsersService
    ) { }


    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        if (isPublic) {
            return true
        }
        const req = context.switchToHttp().getRequest() as any;
        const authorization = req.headers['authorization'];
        if(!authorization || typeof authorization !==  'string'){
            throw new UnauthorizedException('Missing authrization header')
        }

        const token = authorization.startsWith('Bearer') ? 
        authorization.slice('Bearer'.length).trim() : ''
        if(!token){
            throw new UnauthorizedException('Missing token')
        }

        //verify
        const identifyAuthUser = await this.authService.verifyAndBuildContext(token);
        const dbUser = await this.userService.upsertAuthUser({
            clerkUserId: identifyAuthUser.clerkUserId,
            email: identifyAuthUser.email,
            name: identifyAuthUser.name
        })
        const user = {
            ...identifyAuthUser,
            role: dbUser.role,
        }
        req.user = user;
        const requiredRole = this.reflector.getAllAndOverride<string>(REQUIRED_ROLE_KEY, [
            context.getHandler(),
            context.getClass()
        ])
        if(requiredRole === 'admin' && user.role !== 'admin'){
            throw new ForbiddenException('Admin access required.')
        }
        return true
    }
}