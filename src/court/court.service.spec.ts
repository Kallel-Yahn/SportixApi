import { Test, TestingModule } from '@nestjs/testing';
import { CourtService } from './court.service';
import { PrismaService } from '../database/prisma.service';
import { UserLogin } from 'src/user/entities/user.entity';


const ExpectedCourt = {
    id: 'mockCourtId',
    name: 'Mock Court',
    road: 'Mock Road',
    neighborhood: 'Mock Neighborhood',
    city: 'Mock City',
    number: '123',
    reference: 'Mock Reference',
    fk_user: 'mockUserId'
};


describe('CourtService', () => {
    let service: CourtService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CourtService,
                {
                    provide: PrismaService,
                    useValue: {
                        court: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                        },
                        operatingDay: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                        },
                        time: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                        },
                        reservation: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                        },
                        freeGame: {
                            findMany: jest.fn(),
                        },
                        closure: {
                            findMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<CourtService>(CourtService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new court', async () => {
            const mockCourt = {
                id: 'mockCourtId',
                name: 'Mock Court',
                road: 'Mock Road',
                neighborhood: 'Mock Neighborhood',
                city: 'Mock City',
                number: '123',
                reference: 'Mock Reference',
            };


            const mockUser = { id: 'mockUserId' };

            // Mocka a função court.create para retornar o ExpectedCourt
            jest.spyOn(prismaService.court, 'create').mockResolvedValue({
                ...mockCourt,
                fk_user: 'mockUserId',
            });

            const result = await service.create(mockCourt, mockUser);


            expect(result).toEqual({ court: ExpectedCourt });
        });

        it('should throw an error if court creation fails', async () => {
            const mockCourt = {
                name: 'Mock Court',
                road: 'Mock Road',
                neighborhood: 'Mock Neighborhood',
                city: 'Mock City',
                number: '123',
                reference: 'Mock Reference',
            };
            const mockUser = { id: 'mockUserId' };

            // Mocka a função court.create para lançar um erro
            jest.spyOn(prismaService.court, 'create').mockRejectedValue(new Error());

            await expect(service.create(mockCourt, mockUser)).rejects.toThrowError();
        });
    });

    describe('getUserCourts', () => {
        it('should return user courts', async () => {
            const mockUser: UserLogin = {
                id: 'mockUserId',
                email: 'mock@example.com',
                password: 'password',
                name: 'Mock User',
                cpf: '12345678900',
                phoneNumber: "88997974132",
                court: []
            };
            const mockCourts = [
                {
                    id: 'court1',
                    name: 'Court 1',
                    road: 'Road 1',
                    city: 'City 1',
                    number: '1',
                    reference: 'Reference 1',
                    neighborhood: 'Neighborhood 1',
                    fk_user: 'mockUserId',
                },
                {
                    id: 'court2',
                    name: 'Court 2',
                    road: 'Road 2',
                    city: 'City 2',
                    number: '2',
                    reference: 'Reference 2',
                    neighborhood: 'Neighborhood 2',
                    fk_user: 'mockUserId',
                },
            ];

            // Mocka a função court.findMany para retornar os courts do usuário mockado
            jest.spyOn(prismaService.court, 'findMany').mockResolvedValue(mockCourts);

            const result = await service.getUserCourts(mockUser);

            expect(prismaService.court.findMany).toHaveBeenCalledWith({
                where: { fk_user: 'mockUserId' },
            });
            expect(result).toEqual(mockCourts);
        });

        it('should return empty array if user has no courts', async () => {
            const mockUser: UserLogin = {
                id: 'mockUserId',
                email: 'mock@example.com',
                password: 'password',
                name: 'Mock User',
                cpf: '12345678900',
                phoneNumber: "88997974132",
                court: []
            };

            // Mocka a função court.findMany para retornar um array vazio
            jest.spyOn(prismaService.court, 'findMany').mockResolvedValue([]);

            const result = await service.getUserCourts(mockUser);

            expect(prismaService.court.findMany).toHaveBeenCalledWith({
                where: { fk_user: 'mockUserId' },
            });
            expect(result).toEqual([]);
        });
    })

    describe('getCourtInfo', () => {
        it('should return court information', async () => {
            const mockOperatingDay = [
                {
                    id: 'operatingDayId',
                    day: 'Monday', // Adicionando o campo 'day'
                    fk_court: 'courtId', // Adicionando o campo 'fk_court'
                    Times: [
                        { id: 'timeId1', hour: '08:00' },
                        { id: 'timeId2', hour: '09:00' },
                        { id: 'timeId3', hour: '10:00' }
                    ]
                }
            ];

            const mockReservation = [
                { id: 'reservationId', hour: '08:00', fk_user: 'userId', fk_court: 'courtId', date: '2024-04-21' }
            ];

            const mockFreeGame = [
                { id: 'freeGameId', hour: '09:00', fk_court: 'courtId', date: '2024-04-21' }
            ];

            const mockClosure = [
                { id: 'closureId', hour: '10:00', fk_court: 'courtId', date: '2024-04-21' }
            ];

            jest.spyOn(prismaService.operatingDay, 'findMany').mockResolvedValue(mockOperatingDay);
            jest.spyOn(prismaService.freeGame, 'findMany').mockResolvedValue(mockFreeGame);
            jest.spyOn(prismaService.reservation, 'findMany').mockResolvedValue(mockReservation);
            jest.spyOn(prismaService.closure, 'findMany').mockResolvedValue(mockClosure);

            const courtInfo = await service.getCourtInfo('courtId', '2024-04-21');

            expect(prismaService.operatingDay.findMany).toHaveBeenCalledWith({
                where: { fk_court: 'courtId', day: 'Friday' },
                include: { Times: true },
            });
            expect(prismaService.reservation.findMany).toHaveBeenCalledWith({
                where: { fk_court: 'courtId', date: '2024-04-21', hour: '08:00' },
            });
            expect(prismaService.freeGame.findMany).toHaveBeenCalledWith({
                where: { fk_court: 'courtId', date: '2024-04-21', hour: '08:00' },
            });
            expect(prismaService.closure.findMany).toHaveBeenCalledWith({
                where: { fk_court: 'courtId', date: '2024-04-21', hour: '08:00' },
            });

            console.log(courtInfo)

            expect(courtInfo).toEqual([
                { id: 'timeId1', hour: '08:00', status: 'Reservado' },
                { id: 'timeId2', hour: '09:00', status: 'Reservado' },
                { id: 'timeId3', hour: '10:00', status: 'Reservado' },
            ]);
        });
    });

    // Adicione testes para as outras funções aqui

});
