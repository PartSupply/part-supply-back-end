import { Controller, Get, InternalServerErrorException, Query } from '@nestjs/common';
import { VindecoderService } from '../service/vindecoder.service';
import { ResponseType } from '../../utilities/responseType';
import { VehicleDetail } from '../models/vehicledetail.dto';

@Controller('vin-decoder')
export class VindecoderController {
    constructor(private vinDecoderService: VindecoderService) {}

    @Get()
    public async getVehicleDetails(@Query() query): Promise<ResponseType<any>> {
        if (!query.vinNumber || query.vinNumber === '') {
            throw new InternalServerErrorException('vinNumber not provided');
        }
        const response = await this.vinDecoderService.getVehicleDetails(query.vinNumber);
        const vehicleDetail = {
            year: response.data.specifications.year,
            make: response.data.specifications.make,
            model: response.data.specifications.model,
        } as VehicleDetail;
        return Promise.resolve({
            data: {
                vehicleDetail,
            },
        });
    }
}
