import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'prop' })
export class propPipe implements PipeTransform {
  transform(obj: {}, key: string): string {
    return obj && obj.hasOwnProperty(key) ? obj[key] : null;
  }
}