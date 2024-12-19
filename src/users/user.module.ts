@Module({
    imports: [
        TypeOrmModule.forFeature([User, BasicInfo, HealthInfo]),
        LogModule
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {} 