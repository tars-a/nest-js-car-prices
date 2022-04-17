import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { plainToInstance } from "class-transformer";

interface IClass {
  new (...args: any[]): {};
}

const project = (data: any, dto: IClass) => {
  return plainToInstance(dto, data, {
    excludeExtraneousValues: true,
  });
}

export const Serialize = (dto: IClass): MethodDecorator & ClassDecorator => {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor (private dto: IClass) {}

  intercept (_context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: any) => project(data, this.dto))
    );
  }
}