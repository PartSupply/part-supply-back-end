import { HttpService, Injectable } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class VindecoderService {
    constructor(private httpService: HttpService) {}

    public async getVehicleDetails(vinNumber: string): Promise<any> {
        // https://vin-decoder7.p.rapidapi.com/vin?vin=JN8AS5MTXBW565232
        const config = {
            headers: {
                'x-rapidapi-key': 'd6110475d9msh44a7d3aa9f4f36dp1ace69jsneb8463f67236',
                'x-rapidapi-host': 'vin-decoder7.p.rapidapi.com',
            },
            params: {
                vin: vinNumber,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };

        return await this.httpService.get('https://vin-decoder7.p.rapidapi.com/vin', config).toPromise();
    }
}
