import { HttpModule, Module } from '@nestjs/common';
import { VindecoderController } from './controller/vindecoder.controller';
import { VindecoderService } from './service/vindecoder.service';

@Module({
    controllers: [VindecoderController],
    imports: [HttpModule],
    providers: [VindecoderService],
    exports: [VindecoderService],
})
export class VindecoderModule {}
