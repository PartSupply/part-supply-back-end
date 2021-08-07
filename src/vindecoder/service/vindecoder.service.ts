import { HttpService, Injectable } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class VindecoderService {
    constructor(private httpService: HttpService) {}

    public async getVehicleDetails(vinNumber: string): Promise<any> {
        // https://vin-decoder7.p.rapidapi.com/vin?vin=JN8AS5MTXBW565232
        const config = {
            headers: {
                'x-rapidapi-key': `${process.env.VIN_DECODER_API_KEY}`,
                'x-rapidapi-host': 'vin-decoder7.p.rapidapi.com',
            },
            params: {
                vin: vinNumber,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        };

        const response = await this.httpService.get(`${process.env.VIN_DECODER_API_URL}/vin`, config).toPromise();
        return response;
    }
}
