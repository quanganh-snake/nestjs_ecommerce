import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ImageValidationSizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const oneKb = 1000;
    console.log('value.size < oneKb: ', value.size < oneKb);

    return value.size < oneKb;
  }
}
